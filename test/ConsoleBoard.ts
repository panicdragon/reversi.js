/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../src/interfaces/reversi.d.ts' />
/// <reference path='../src/models/Point.ts' />
/// <reference path='../src/models/Disc.ts' />
/// <reference path='../src/models/ColorStorage.ts' />
/// <reference path='../src/models/Board.ts' />

module ReversiTest {
  import Board = Reversi.Board;
  import Point = Reversi.Point;
  import Disc = Reversi.Disc;

  export class ConsoleBoardTest extends Board {

    public print() {
      console.log("  a b c d e f g h ");
      for (var y: number = 1; y <= 8; y++) {
        process.stdout.write(y + " ");
        for (var x: number = 1; x <= 8; x++ ) {
          switch (this.getColor(new Point(x, y))) {
            case Disc.BLACK:
              process.stdout.write("● ");
              break;
            case Disc.WHITE:
              process.stdout.write("◯ ");
              break;
            default:
              process.stdout.write("  ");
              break;
          }
        }
        process.stdout.write('\n');
      }
    }
  }

}