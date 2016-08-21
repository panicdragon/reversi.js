module Reversi {
  var NUMBER_STRINGS = '1234567890';
  var ALPHABET_STRINGS = 'abcdefgh';

  export class Point {
    public x: number;
    public y: number;

    constructor(
      ...point
      ) {
      if (typeof point[0] === 'string') {
        if(point[0].length < 2) {
          throw new Error('The argument must be Reversi style coordinates!');
        } else {
          this.x = this.alphabetToNumber(point[0].charAt(0));
          this.y = parseInt(point[0].charAt(1), 10);
        }
      } else {
        this.x = point[0];
        this.y = point[1];
      }
    }

    public point(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    private alphabetToNumber(str: string): number {
      var i: number,
        il: number = ALPHABET_STRINGS.length,
        re;
      for (i = 0; i < il; i++) {
        re = new RegExp(ALPHABET_STRINGS[i], 'g');
        str = str.replace(re, NUMBER_STRINGS[i]);
      }
      return parseInt(str, 10);
    }

    private numberToAlphabet(str): string {
      var i: number,
          il: number = NUMBER_STRINGS.length,
          re;
      str += '';
      for (i = 0; i < il; i++) {
        re = new RegExp(NUMBER_STRINGS[i], 'g');
        str = str.replace(re, ALPHABET_STRINGS[i]);
      }
      return str;
    }

    public equals(p: Point): boolean {
      if(this.x != p.x) return false;

      if(this.y != p.y) return false;

      return true;
    }

  }
}