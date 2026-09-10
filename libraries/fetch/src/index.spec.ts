import { ProgressEvent } from '@rhombus-toolkit/platform';
import { Func } from '@rhombus-toolkit/types';
import { describe, expect, it } from 'bun:test';
import { nativeFetch, wrapResponse } from './index';
function chunkedResponse(chunks: number): { response: Response; release: () => void; } {
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const body = new ReadableStream<Uint8Array>({ async start(controller) {
    controller.enqueue(new Uint8Array(4));
    await gate;
    for (let i = 1; i < chunks; i++) {
      controller.enqueue(new Uint8Array(4));
    }
    controller.close();
  } });
  const response = new Response(body, { headers: { 'content-length': String(chunks * 4) } });
  return { response, release };
}

function eventNames(wrapped: ReturnType<typeof wrapResponse>): string[] {
  const names: string[] = [];
  for (const name of ['progress', 'complete', 'cancelled'] as const) {
    wrapped.progress.addEventListener(name, () => names.push(name));
  }
  return names;
}

/** A response whose body is the given chunks, all enqueued up front, with the given headers. */
function responseOf(chunks: Iterable<Uint8Array>, headers: Record<string, string>, init?: ResponseInit): Response {
  const body = new ReadableStream<Uint8Array>({ start(controller) {
    for (const chunk of chunks) {
      controller.enqueue(chunk);
    }
    controller.close();
  } });
  return new Response(body, { ...init, headers });
}

interface Progress {
  type: string;
  loaded: number;
  total: number;
  lengthComputable: boolean;
}

/** Every progress/complete/cancelled event the wrapper emits, in order, reduced to its fields. */
function progressLog(wrapped: ReturnType<typeof wrapResponse>): Progress[] {
  const log: Progress[] = [];
  const record: Func<[ProgressEvent], void> = ({ type, loaded, total, lengthComputable }) => {
    log.push({ type, loaded, total, lengthComputable });
  };
  for (const name of ['progress', 'complete', 'cancelled'] as const) {
    wrapped.progress.addEventListener(name, record);
  }
  return log;
}

describe('wrapResponse', () => {
  it('reports progress then complete on a full read', async () => {
    const { response, release } = chunkedResponse(3);
    const wrapped = wrapResponse(response);
    const names = eventNames(wrapped);
    release();

    await wrapped.arrayBuffer();

    expect(names).toEqual(['progress', 'progress', 'progress', 'progress', 'complete']);
  });

  it('reports cancelled and never complete after cancel()', async () => {
    const { response } = chunkedResponse(3);
    const wrapped = wrapResponse(response);
    const names = eventNames(wrapped);
    const reader = wrapped.body!.getReader();
    await reader.read();

    await wrapped.cancel();
    await reader.closed;

    expect(names).toEqual(['progress', 'cancelled']);
  });

  describe('rejecting a response it cannot track', () => {
    it('throws when the response has no body', () => {
      const response = new Response(null, { headers: { 'content-length': '0' } });

      expect(() => wrapResponse(response)).toThrow('ReadableStream not yet supported in this browser.');
    });

    it('throws the status and status text of a non-ok response', () => {
      const response = responseOf([], { 'content-length': '0' }, { status: 404, statusText: 'Not Found' });

      expect(() => wrapResponse(response)).toThrow('404 Not Found');
    });

    it('throws when neither size header is present', () => {
      expect(() => wrapResponse(responseOf([], {}))).toThrow('Response size header unavailable');
    });

    it('throws when content-encoding is set and only content-length is present', () => {
      const response = responseOf([], { 'content-encoding': 'gzip', 'content-length': '12' });

      expect(() => wrapResponse(response)).toThrow('Response size header unavailable');
    });
  });

  describe('sizing the download', () => {
    it('takes the total from content-length when there is no content-encoding', async () => {
      const wrapped = wrapResponse(responseOf([new Uint8Array(4)], { 'content-length': '4', 'x-file-size': '99' }));
      const log = progressLog(wrapped);

      await wrapped.arrayBuffer();

      expect(log.at(-1)).toEqual({ type: 'complete', loaded: 4, total: 4, lengthComputable: true });
    });

    it('takes the total from x-file-size when content-encoding is set', async () => {
      const wrapped = wrapResponse(
        responseOf([new Uint8Array(4)], { 'content-encoding': 'gzip', 'content-length': '99', 'x-file-size': '4' }),
      );
      const log = progressLog(wrapped);

      await wrapped.arrayBuffer();

      expect(log.at(-1)).toEqual({ type: 'complete', loaded: 4, total: 4, lengthComputable: true });
    });
  });

  describe('accounting per event', () => {
    it('accumulates loaded chunk by chunk, then reports a final progress and complete at total', async () => {
      const chunks = [new Uint8Array(4), new Uint8Array(6), new Uint8Array(2)];
      const wrapped = wrapResponse(responseOf(chunks, { 'content-length': '12' }));
      const log = progressLog(wrapped);

      await wrapped.arrayBuffer();

      expect(log).toEqual([{ type: 'progress', loaded: 4, total: 12, lengthComputable: true }, { type: 'progress',
        loaded: 10, total: 12, lengthComputable: true }, { type: 'progress', loaded: 12, total: 12,
        lengthComputable: true }, { type: 'progress', loaded: 12, total: 12, lengthComputable: true }, {
        type: 'complete',
        loaded: 12,
        total: 12,
        lengthComputable: true,
      }]);
    });

    it('reports a zero-length body as one non-computable progress then complete', async () => {
      const wrapped = wrapResponse(responseOf([], { 'content-length': '0' }));
      const log = progressLog(wrapped);

      await wrapped.arrayBuffer();

      expect(log).toEqual([{ type: 'progress', loaded: 0, total: 0, lengthComputable: false }, { type: 'complete',
        loaded: 0, total: 0, lengthComputable: false }]);
    });

    it('brings loaded up to the declared total on complete when the body was shorter', async () => {
      const wrapped = wrapResponse(responseOf([new Uint8Array(4)], { 'content-length': '10' }));
      const log = progressLog(wrapped);

      await wrapped.arrayBuffer();

      expect(log.map(({ loaded }) => loaded)).toEqual([4, 10, 10]);
    });

    it('carries the loaded so far on the cancelled event', async () => {
      const { response } = chunkedResponse(3);
      const wrapped = wrapResponse(response);
      const log = progressLog(wrapped);
      const reader = wrapped.body!.getReader();
      await reader.read();

      await wrapped.cancel();

      expect(log.at(-1)).toEqual({ type: 'cancelled', loaded: 4, total: 12, lengthComputable: true });
    });

    it('emits ProgressEvent instances', async () => {
      const wrapped = wrapResponse(responseOf([], { 'content-length': '0' }));
      const events: Event[] = [];
      wrapped.progress.addEventListener('complete', (event) => events.push(event));

      await wrapped.arrayBuffer();

      expect(events[0]).toBeInstanceOf(ProgressEvent);
    });

    it('counts a chunk before handing it on to the consumer', async () => {
      const wrapped = wrapResponse(responseOf([new Uint8Array(4)], { 'content-length': '4' }));
      const log = progressLog(wrapped);

      await wrapped.body!.getReader().read();

      expect(log[0]).toEqual({ type: 'progress', loaded: 4, total: 4, lengthComputable: true });
    });
  });

  describe('the wrapped response', () => {
    it('delivers the original bytes unchanged', async () => {
      const wrapped = wrapResponse(
        responseOf([new TextEncoder().encode('hello '), new TextEncoder().encode('world')], { 'content-length': '11' }),
      );

      expect(await wrapped.text()).toBe('hello world');
    });

    it('keeps the status, status text and headers of the original', () => {
      const wrapped = wrapResponse(
        responseOf([], { 'content-length': '0', 'x-custom': 'kept' }, { status: 201, statusText: 'Created' }),
      );

      expect(wrapped.status).toBe(201);
      expect(wrapped.statusText).toBe('Created');
      expect(wrapped.headers.get('x-custom')).toBe('kept');
      expect(wrapped.headers.get('content-length')).toBe('0');
    });

    it('is a different Response object from the original', () => {
      const response = responseOf([], { 'content-length': '0' });

      expect(wrapResponse(response)).not.toBe(response);
    });

    it('cancel() cancels the original body', async () => {
      let cancelled = false;
      const body = new ReadableStream<Uint8Array>({ start(controller) {
        controller.enqueue(new Uint8Array(4));
      }, cancel() {
        cancelled = true;
      } });
      const wrapped = wrapResponse(new Response(body, { headers: { 'content-length': '8' } }));
      await wrapped.body!.getReader().read();

      await wrapped.cancel();

      expect(cancelled).toBe(true);
    });

    it('propagates a body error to the consumer without a complete event', async () => {
      const failure = new Error('boom');
      let pulls = 0;
      const body = new ReadableStream<Uint8Array>({ pull(controller) {
        if (pulls++) {
          controller.error(failure);
          return;
        }
        controller.enqueue(new Uint8Array(4));
      } });
      const wrapped = wrapResponse(new Response(body, { headers: { 'content-length': '8' } }));
      const log = progressLog(wrapped);
      const reader = wrapped.body!.getReader();
      await reader.read();

      await expect(reader.read()).rejects.toBe(failure);
      await expect(reader.closed).rejects.toBe(failure);

      expect(log.map(({ type }) => type)).toEqual(['progress']);
    });
  });
});

describe('nativeFetch', () => {
  it('is the platform fetch', () => {
    expect(nativeFetch).toBe(globalThis.fetch);
  });
});
