module Reversi {
  export class AI {
    public move(board: Board);
    public presearch_depth: number = 3;
    public normal_depth: number    = 15;
    public wld_depth: number       = 15;
    public perfect_depth: number   = 13;
  }

  export class Move extends Point {
    public eval_num: number = 0;

    constructor(
      ...move
      ) {
      super();

      if (move) {
        this.move(move[0], move[1], move[2]);
      } else {
        super(0, 0);
      }
    }

    public move(x: number, y: number, e: number) {
      this.point(x, y);
      this.eval_num = e;
    }
  }

  export class AlphaBetaAI extends AI {
    private Eval;

    public move(board: Board): Board {

      // この辺おかしいので要確認
      var book: BookManager = new BookManager();
      var movables = book.find(board);

      console.log('movables', movables);

      if (movables.length == 0) {
        // 打てる箇所が無ければパス
        board.pass();

        console.log('pass');
        return board;
      }

      if (movables.length == 1) {
        // 打てる箇所が1箇所だけなら探索は行わず、即座に打って返る
        board.move(movables[0]);

        console.log('即座に打って返る');
        return board;
      }

      var limit: number;
      this.Eval = new MidEvaluator();

      this.sort(board, movables, this.presearch_depth); // 事前に手が良さそうな順にソート

      if (Board.MAX_TURNS - board.getTurns() <= this.wld_depth) {
        limit = Number.MAX_VALUE;

        if (Board.MAX_TURNS - board.getTurns() <= this.perfect_depth) {
          this.Eval = new PerfectEvaluator();
        } else {
          this.Eval = new WLDEvaluator();
        }
      } else {
        limit = this.normal_depth;
      }

      var eval_num: number, eval_max: number = Number.MIN_VALUE;
      //var p = null;
      var p = movables[0];

//      for (var i: number = 0; i < movables.length; i++) {
//        console.log(movables[i]);
//
//        board.move(movables[i]);
//        console.log(limit);
//
//        eval_num = -this.alphabeta(board, limit - 1, -Number.MAX_VALUE, -Number.MIN_VALUE);
//
//        board.undo();
//
//        console.log(eval_num);
//        console.log(eval_max);
//        if (eval_num > eval_max) {
//          p = movables[i];
//        }
//      }

      board.move(p);
      return board;
    }

    private alphabeta(board: Board, limit: number, alpha: number, beta: number): number {
      // 深さ制限に達したら評価を返す
      if(board.isGameOver() || limit == 0) {
        //return this.Eval.evaluate(board);

        return this.evaluate(board);
      }

      var pos = board.getMovablePos();
      var eval_num: number;

      if(pos.length == 0) {
        // パス
        board.pass();
        eval_num = -this.alphabeta(board, limit, -beta, -alpha);
        board.undo();
        return eval_num;
      }

      for (var i: number = 0; i < pos.length; i++) {
        board.move(pos[i]);
        eval_num = -this.alphabeta(board, limit - 1, -beta, -alpha);
        board.undo();

        alpha = Math.max(alpha, eval_num);
        //alpha = -1;

        if (alpha >= beta) {
          // β狩り
          return alpha;
        }
      }
      return alpha;
    }

    private sort(board: Board, movables, limit: number) {
      var moves = [];

      for(var i: number = 0; i < movables.length; i++) {
        var eval_num: number;
        var p: Point = movables[i];

        board.move(p);
        eval_num = -this.alphabeta(board, limit-1, -Number.MAX_VALUE, Number.MAX_VALUE);
        board.undo();

        var move: Move = new Move(p.x, p.y, eval_num);
        moves.push(move);
      }

      // 評価値の大きい順にソート（選択ソート）
      var begin: number, current: number;
      for(begin = 0; begin < moves.length - 1; begin++) {
        for(current = 1; current < moves.length; current++) {
          var b: Move = moves[begin];
          var c: Move = moves[current];
          if(b.eval_num < c.eval_num) {
            // 交換
            moves[begin] = c;
            moves[current] = b;
          }
        }
      }
      // 結果の書き戻し

      movables = [];
      for(var i: number = 0; i < moves.length; i++) {
        movables.push(moves[i]);
      }
      return;
    }

    private evaluate(board: Board): number {
      return 0;
    }

  }
}

