import { describe, expect, it } from 'bun:test';
import { URL } from './Url';

describe('URL', () => {
  it('is the platform URL', () => {
    expect(URL).toBe(globalThis.URL);
  });

  it('parses an absolute url into its parts', () => {
    const url = new URL('https://user:pw@example.com:8443/a/b?q=1#top');

    expect(url.protocol).toBe('https:');
    expect(url.username).toBe('user');
    expect(url.password).toBe('pw');
    expect(url.hostname).toBe('example.com');
    expect(url.port).toBe('8443');
    expect(url.host).toBe('example.com:8443');
    expect(url.origin).toBe('https://example.com:8443');
    expect(url.pathname).toBe('/a/b');
    expect(url.search).toBe('?q=1');
    expect(url.hash).toBe('#top');
    expect(url.searchParams.get('q')).toBe('1');
  });

  it('resolves a relative url against the given base', () => {
    expect(new URL('../c', 'https://example.com/a/b/').href).toBe('https://example.com/a/c');
  });

  it('serializes to its href from toString and toJSON alike', () => {
    const url = new URL('https://example.com/x');

    expect(url.toString()).toBe('https://example.com/x');
    expect(url.toJSON()).toBe('https://example.com/x');
  });

  it('throws on an unparseable url', () => {
    expect(() => new URL('not a url')).toThrow();
  });
});
