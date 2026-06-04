import { ProxyBase } from "@rhombus-toolkit/proxy-base";

class Fallback extends ProxyBase {
    realMethod(): string {
        return 'real';
    }

    protected override _get(_target: object, property: PropertyKey, _receiver: unknown): unknown {
        return `missing:${String(property)}`;
    }

    protected override _set(_target: object, _property: PropertyKey, _value: unknown, _receiver: unknown): boolean {
        return true;
    }

    protected override _has(_target: object, _property: PropertyKey): boolean {
        return false;
    }
}

const f = new Fallback();

const a: boolean = f instanceof Fallback;
const b: boolean = f instanceof ProxyBase;

const m: string = f.realMethod();
