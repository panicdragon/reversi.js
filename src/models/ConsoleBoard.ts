module Reversi {

  export class ConsoleBoard extends Board {

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