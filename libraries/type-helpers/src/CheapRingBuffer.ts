export class CheapRingBuffer<T> extends Array<T> {
  constructor(readonly maxLength: number) {
    super();
  }
  override push(value: T) {
    if (this.length == this.maxLength) {
      super.shift();
    }
    return super.push(value);
  }
}
