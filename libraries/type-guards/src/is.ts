export function isArray(value: any): value is Array<any> {
    return Array.isArray(value);
}
export function isDefined<T>(p: T | undefined): p is T | null {
    return p !== undefined;
}

export function hasValue<T>(p: T | null | undefined): p is T {
    return isDefined(p) && p !== null;
}



export function isFunction(value: any): value is (...args: any[]) => any {
    return typeof (value) === 'function';
}

export function isPromise(value: any): value is PromiseLike<any> {
    return value instanceof Promise;
}
export function isPromiseLike(value: any): value is PromiseLike<any> {
    return isPromise(value) ||
        getTypeName(value).includes('Promise') ||
        isFunction(value?.then);

}


export function isUrl(url: any): url is URL {
    return url instanceof URL;
}

function getTypeName(obj: any): string {
    return obj?.[Symbol.toStringTag]
        ?? Object.prototype.toString.call(obj).replace(/^\[object (.+)]$/, '$1')
        ?? obj?.constructor?.name;
}

export function _isIterator(value: any): value is Iterator<any> {
    return getTypeName(value).includes('Iterator') || isFunction(value?.next);
}
export function isIterator(value: any): value is IterableIterator<any> {
    return isIterable(value) && _isIterator(value);
}
export function isAsyncIterator(value: any): value is AsyncIterableIterator<any> {
    return isAsyncIterable(value) && _isIterator(value);
}

export function isIterable(value: any): value is Iterable<any> {
    return Symbol.iterator in value;
}
export function isAsyncIterable(value: any): value is AsyncIterable<any> {
    return Symbol.asyncIterator in value;
}

const genExamp = function* () { };
const asyncGenExamp = async function* () { };

export const GeneratorFunction = genExamp.constructor as GeneratorFunction;
export const AsyncGeneratorFunction = asyncGenExamp.constructor as AsyncGeneratorFunction;

const asyncGeneratorProto = getProtoSquared(asyncGenExamp);
const generatorProto = getProtoSquared(genExamp);

export function isGeneratorFunction(value: any): value is GeneratorFunction {
    return value instanceof GeneratorFunction;
}
export function isGenerator(value: any): value is Generator<any, any, any> {
    return getProtoSquared(value) == generatorProto;
}

export function isAsyncGeneratorFunction(value: any): value is AsyncGeneratorFunction {
    return value instanceof AsyncGeneratorFunction;
}
export function isAsyncGenerator(value: any): value is AsyncGenerator<any, any, any> {
    return getProtoSquared(value) === asyncGeneratorProto;
}
function getProtoSquared(obj: any) {
    try {
        return Reflect.getPrototypeOf(Reflect.getPrototypeOf(obj));
    } catch {
        return undefined;
    }
}
