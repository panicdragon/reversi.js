module Reversi {
  export class ColorStorage {
    private data: number[] = new Array(3);

    public get(color: number) {
      return this.data[color + 1];
    }

    public set(color: number, value: number) {
      this.data[color + 1] = value;
    }
  }
}
