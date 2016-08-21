module Reversi {
  export interface Evaluator {
    evaluate(board: Board): number;
  }

  export class PerfectEvaluator implements Evaluator {
    public evaluate(board: Board): number {
      var discdiff: number = board.getCurrentColor() * (board.countDisc(Disc.BLACK) - board.countDisc(Disc.WHITE));

      return discdiff;
    }
  }

  export class WLDEvaluator implements Evaluator {
    public WIN: number = 1;
    public DRAW: number = 0;
    public LOSE: number = -1;

    public evaluate(board: Board): number {
      var discdiff: number = board.getCurrentColor() * (board.countDisc(Disc.BLACK) - board.countDisc(Disc.WHITE));

      if (discdiff > 0) {
        return this.WIN;
      } else if (discdiff < 0) {
        return this.LOSE;
      } else {
        return this.DRAW;
      }
    }
  }
}