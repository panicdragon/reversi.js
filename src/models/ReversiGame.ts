var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

module Reversi {
  interface Player {
    onTurn(board: Board);
    onType(board: Board, line: string);
  }

  class HumanPlayer implements Player {
    public onTurn(board: Board): void {
      if (board.isGameOver()) {
        console.log("ゲームオーバー");
        return;
      }

      if (board.getMovablePos().length == 0) {
        // パス
        process.stdout.write("あなたはパスです。");
        board.pass();
        return;
      }

      console.log('color', board.getCurrentColor());

      process.stdout.write("手を\"f5\"のように入力、もしくは(u:取り消し/x:終了)を入力してください：");
    }

    public onType(board: Board, line: string): void {
      var p: Point;

      if (line == "p") {
        if (!board.pass()) {
          console.log("パスできません！");
        }
        //this.outputNextStep();
        return;
      }

      if (line == "u") {
        reversiGame.undo();
        //board.undo();
        //this.outputNextStep();
        return;
      }

      try {
        p = new Point(line);
      } catch (e) {
        console.log("リバーシ形式の手を入力してください！");
        //this.outputNextStep();
        return;
      }

      if (board.move(p) == false) {
        console.log("そこには置けません！");
        return;
      }

      reversiGame.tarnChange(board);
      return;
    }

  }

  class AIPlayer implements Player {
    private Ai: AlphaBetaAI = null;

    constructor() {
      this.Ai = new AlphaBetaAI();
    }

    public onTurn(board: Board): void {
      if (board.isGameOver()) {
        console.log("ゲームオーバー");
        return;
      }

      console.log('color', board.getCurrentColor());

      process.stdout.write("コンピューターが思考中...");

      var afterBoard = this.Ai.move(board);

      console.log("完了");

      reversiGame.tarnChange(afterBoard);

      if (afterBoard.isGameOver()) {
        //throw new GameOverException();
      }
    }

    public onType(board: Board, line: string): void {
    }
  }

  class ReversiGame {
    private board: ConsoleBoard = new ConsoleBoard();
    private current_player: number = 0;
    private player: Player[] = [];
    private reverse: boolean = false;

    public main(args?: string): void {
      if (args && args === "-r") {
        // コマンドラインオプション -r が与えられるとコンピューター先手にする
        this.reverse = true;
      }

      // 先手・後手の設定
      if (this.reverse) {
        this.player[0] = new AIPlayer();
        this.player[1] = new HumanPlayer();
      } else {
        this.player[0] = new HumanPlayer();
        this.player[1] = new AIPlayer();
      }

      this.board.print();

      this.player[this.current_player].onTurn(this.board);
    }

    public tarnChange(board): void {
      this.board = board;

      //console.log(board.getCurrentColor() == -1 ? "◯" : "●");
      console.log('getMovablePos', board.getMovablePos());

      this.board.print();
      this.changePlayer();
      this.player[this.current_player].onTurn(board);
    }

    public gameOver(): void {
      process.stdout.write("ゲーム終了");
      console.log("黒石" + this.board.countDisc(Disc.BLACK) + " ");
      process.stdout.write("白石" + this.board.countDisc(Disc.WHITE));
    }

    public undo(): void {
      this.board.undo();
      this.board.undo();
      this.board.print();
      this.player[this.current_player].onTurn(this.board);
    }

    public changePlayer(): void {
      this.current_player = ++this.current_player % 2;
    }

    public onType(line): void {
      if (this.reverse) {
        this.player[1].onType(this.board, line);
      } else {
        this.player[0].onType(this.board, line);
      }
    }

    public outputNextStep(): void {
      this.changePlayer();
      this.outputPrams();
      this.board.print();
      this.player[this.current_player].onTurn(this.board);
    }

    public outputPrams(): void {
      var currentDisc = this.board.getCurrentColor() == -1 ? "◯" : "●";

      process.stdout.write('\n');
      process.stdout.write("黒石" + this.board.countDisc(Disc.BLACK) + " ");
      process.stdout.write("白石" + this.board.countDisc(Disc.WHITE) + " ");
      console.log("空マス" + this.board.countDisc(Disc.EMPTY));
      console.log("ターン：" + this.board.getTurns());
      console.log("現在の手順：" + currentDisc);
      process.stdout.write('\n');
    }

  }


  var reversiGame = new ReversiGame();

  // 引数チェック
  if (process.argv.length > 2) {
    reversiGame.main(process.argv[2]);
  } else {
    reversiGame.main();
  }

  reader.on('line', function (line) {
    reversiGame.onType(line);
  });

//  reader.on('close', function () {
//    //do something
//  });
}

