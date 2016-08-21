module Reversi {

  export class Disc extends Point {
    public static BLACK: number = 1;
    public static EMPTY: number = 0;
    public static WHITE: number = -1;
    public static WALL: number = 2;

    public color: number;

    constructor(
      x?: number,
      y?: number,
      color?: number
    ) {
      if (x !== void 0) {
        super(x, y);
        this.color = color;
      } else {
        this.disc(0, 0, Disc.EMPTY);
      }
    }

    public disc(x: number, y: number, color: number) {
      this.point(x, y);
      this.color = color;
    }

  }
  
}