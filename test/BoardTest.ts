/// <reference path='ConsoleBoard.ts' />

var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

module ReversiTest {
  import Board = Reversi.Board;
  import Point = Reversi.Point;
  import Disc = Reversi.Disc;

  class BoardTest {
    private board: ConsoleBoardTest = new ConsoleBoardTest();

    constructor() {
      this.outputPrams();
      this.board.print();
      process.stdout.write("手を入力してください: ");
    }

    public main(args): void {
      var inStr: string = args;
      var p: Point;

      if (inStr == "p") {
        if (!this.board.pass()) {
          console.log("パスできません！");
        }
        this.outputNextStep();
        return;
      }

      if (inStr == "u") {
        this.board.undo();
        this.outputNextStep();
        return;
      }

      try {
        p = new Point(inStr);
      } catch (e) {
        console.log("リバーシ形式の手を入力してください！");
        this.outputNextStep();
        return;
      }

      if (this.board.move(p) == false) {
        console.log("そこには置けません！");
      }

      if (this.board.isGameOver()) {
        console.log("----------------ゲーム終了----------------");
        return;
      }

      this.outputNextStep();
      return;
    }

    public outputNextStep(): void {
      this.outputPrams();
      this.board.print();
      process.stdout.write("手を入力してください: ");
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

  var boardTest = new BoardTest();

  reader.on('line', function (line) {
    boardTest.main(line);
  });

  reader.on('close', function () {
    //do something
  });

}
