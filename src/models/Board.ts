var e = eval, global: NodeJS.Global = e('this');

'use strict';
module Reversi {

  export class Board {
    public static BOARD_SIZE: number =  8;
    public static MAX_TURNS: number  = 60;

    private static NONE: number        =   0;
    private static UPPER: number       =   1;
    private static UPPER_LEFT: number  =   2;
    private static LEFT: number        =   4;
    private static LOWER_LEFT: number  =   8;
    private static LOWER: number       =  16;
    private static LOWER_RIGHT: number =  32;
    private static RIGHT: number       =  64;
    private static UPPER_RIGHT: number = 128;

    private RawBoard: number[][] = this.getDimensionArray();
    private Turns: number;
    private CurrentColor: number;
    private UpdateLog: any = [];

    private MovablePos: any[] = [];
    private MovableDir: number[][][] = this.getMovableDirArray();

    private Discs: ColorStorage = new ColorStorage();

    constructor(
      ) {
      for(var i = 0; i <= Board.MAX_TURNS + 1; i++) {
        this.MovablePos[i] = new Array();
      }
      this.init();
    }

    public getDimensionArray(): number[][] {
      var arr = new Array(Board.BOARD_SIZE + 2);
      for(var i = 0; i < Board.BOARD_SIZE + 2; i++) {
        arr[i] = new Array(Board.BOARD_SIZE + 2);
      }
      return arr;
    }

    public getMovableDirArray(): number[][][] {
      var arr = new Array(Board.MAX_TURNS + 1);
      for(var i = 0; i < arr.length; i++) {
        arr[i] = new Array(Board.BOARD_SIZE + 2);
        for(var n = 0; n < Board.BOARD_SIZE + 2; n++) {
          arr[i][n] = new Array(Board.BOARD_SIZE + 2);
        }
      }
      return arr;
    }

    public init(): void {
      // 全マスを空きマスに設定
      for(var x = 1; x <= Board.BOARD_SIZE; x++) {
        for(var y = 1; y <= Board.BOARD_SIZE; y++) {
          this.RawBoard[x][y] = Disc.EMPTY;
        }
      }

      // 壁の設定
      for(var y = 0; y < Board.BOARD_SIZE + 2; y++) {
        this.RawBoard[0][y] = Disc.WALL;
        this.RawBoard[Board.BOARD_SIZE + 1][y] = Disc.WALL;
      }

      for(var x = 0; x < Board.BOARD_SIZE + 2; x++) {
        this.RawBoard[x][0] = Disc.WALL;
        this.RawBoard[x][Board.BOARD_SIZE + 1] = Disc.WALL;
      }

      // 初期配置
      this.RawBoard[4][4] = Disc.WHITE;
      this.RawBoard[5][5] = Disc.WHITE;
      this.RawBoard[4][5] = Disc.BLACK;
      this.RawBoard[5][4] = Disc.BLACK;

      // 石数の初期設定
      this.Discs.set(Disc.BLACK, 2);
      this.Discs.set(Disc.WHITE, 2);
      this.Discs.set(Disc.EMPTY, Board.BOARD_SIZE * Board.BOARD_SIZE - 4);

      this.Turns = 0; // 手数は0から数える
      this.CurrentColor = Disc.BLACK; // 先手は黒

      this.initMovable();
    }

    public move(point: Point): boolean {
      if(point.x <= 0 || point.x > Board.BOARD_SIZE) return false;
      if(point.y <= 0 || point.y > Board.BOARD_SIZE) return false;

      if(this.MovableDir[this.Turns][point.x][point.y] == Board.NONE) return false;

      this.flipDiscs(point);

      this.Turns++;
      this.CurrentColor = -this.CurrentColor;

      this.initMovable();

      return true;
    }

    public undo(): boolean {
      // ゲーム開始地点ならもう戻れない
      if(this.Turns == 0) return false;

      this.CurrentColor = -this.CurrentColor;

      var update = this.UpdateLog.pop();

      // 前回がパスかどうかの場合分け
      if(update.length == 0) {
        // 前回がパス
        // MovablePosとMovableDirを再構築
        this.MovablePos[this.Turns] = [];

        for(var x = 1; x <= Board.BOARD_SIZE; x++) {
          for(var y = 1; y <= Board.BOARD_SIZE; y++) {
            this.MovableDir[this.Turns][x][y] = Board.NONE;
          }
        }
      } else {
        // 前回がパスではない

        this.Turns--;

        // 石を元に戻す
        var p: Point = update[0];
        this.RawBoard[p.x][p.y] = Disc.EMPTY;
        for(var i = 1; i < update.length; i++) {
          p = update[i];
          this.RawBoard[p.x][p.y] = -this.CurrentColor;
        }

        // 石数の更新
        var discdiff: number = update.length;
        this.Discs.set(this.CurrentColor, this.Discs.get(this.CurrentColor) - discdiff);
        this.Discs.set(-this.CurrentColor, this.Discs.get(-this.CurrentColor) + (discdiff - 1));
        this.Discs.set(Disc.EMPTY, this.Discs.get(Disc.EMPTY) + 1);
      }

      return true;
    }

    public pass(): boolean {
      // 打つ手があるなら、パスはできない
      if(this.MovablePos[this.Turns].length != 0) return false;

      // ゲームが終了しているなら、パスはできない
      if(this.isGameOver()) return false;

      this.CurrentColor = -this.CurrentColor;

      this.UpdateLog.push(new Array());

      this.initMovable();

      return true;

    }

    public getColor(point: Point): number {
      return this.RawBoard[point.x][point.y];
    }

    public getCurrentColor(): number {
      return this.CurrentColor;
    }

    public getTurns(): number {
      return this.Turns;
    }

    public isGameOver(): boolean {
      // 60手に達していたらゲーム終了
      if(this.Turns == Board.MAX_TURNS) return true;

      // 打つ手があるならゲーム終了ではない
      if(this.MovablePos[this.Turns].length != 0) return false;

      //	現在の手番と逆の色が打てるかどうか調べる
      var disc: Disc = new Disc();
      disc.color = -this.CurrentColor;
      for(var x = 1; x <= Board.BOARD_SIZE; x++) {
        disc.x = x;
        for(var y = 1; y <= Board.BOARD_SIZE; y++) {
          disc.y = y;
          // 打てる箇所が1つでもあればゲーム終了ではない
          if(this.checkMobility(disc) != Board.NONE) return false;
        }
      }

      return true;
    }

    public countDisc(color: number): number {
      return this.Discs.get(color);
    }

    public getMovablePos(): Disc[] {
      return this.MovablePos[this.Turns];
    }

    public getHistory() {
      var history: any = [];

      for(var i = 0; i < this.UpdateLog.length; i++) {
        var update = this.UpdateLog[i];
        if(update.length == 0) continue;
        history.push(update[0]);
      }

      return history;
    }

    public getUpdate() {
      if(this.UpdateLog.length == 0) {
        return new Array();
      } else {
        return this.UpdateLog[this.UpdateLog.length - 1];
      }
    }

    public getLiberty(p: Point) {
      return 0;
    }

    private checkMobility(disc: Disc): number {
      // すでに石があったら置けない
      if(this.RawBoard[disc.x][disc.y] != Disc.EMPTY) return Board.NONE;

      var x: number, y: number;
      var dir: number = Board.NONE;

      // 上
      if(this.RawBoard[disc.x][disc.y - 1] == -disc.color) {
        x = disc.x;
        y = disc.y - 2;
        while(this.RawBoard[x][y] == -disc.color) { y--; }
        if(this.RawBoard[x][y] == disc.color) {
          dir |= Board.UPPER;
        }
      }

      // 下
      if(this.RawBoard[disc.x][disc.y + 1] == -disc.color) {
        x = disc.x;
        y = disc.y + 2;
        while(this.RawBoard[x][y] == -disc.color) { y++; }
        if(this.RawBoard[x][y] == disc.color) {
          dir |= Board.LOWER;
        }
      }

      // 左
      if(this.RawBoard[disc.x - 1][disc.y] == -disc.color) {
        x = disc.x - 2;
        y = disc.y;
        while(this.RawBoard[x][y] == -disc.color) { x--; }
        if(this.RawBoard[x][y] == disc.color) {
          dir |= Board.LEFT;
        }
      }

      // 右
      if(this.RawBoard[disc.x + 1][disc.y] == -disc.color) {
        x = disc.x + 2;
        y = disc.y;
        while(this.RawBoard[x][y] == -disc.color) { x++; }
        if(this.RawBoard[x][y] == disc.color) {
          dir |= Board.RIGHT;
        }
      }

      // 右上
      if(this.RawBoard[disc.x + 1][disc.y - 1] == -disc.color) {
        x = disc.x + 2;
        y = disc.y - 2;
        while(this.RawBoard[x][y] == -disc.color) { x++; y--; }
        if(this.RawBoard[x][y] == disc.color) {
          dir |= Board.UPPER_RIGHT;
        }
      }

      // 左上
      if(this.RawBoard[disc.x - 1][disc.y - 1] == -disc.color) {
        x = disc.x - 2;
        y = disc.y - 2;
        while(this.RawBoard[x][y] == -disc.color) { x--; y--; }
        if(this.RawBoard[x][y] == disc.color) {
          dir |= Board.UPPER_LEFT;
        }
      }

      // 左下
      if(this.RawBoard[disc.x - 1][disc.y + 1] == -disc.color) {
        x = disc.x - 2;
        y = disc.y + 2;
        while(this.RawBoard[x][y] == -disc.color) { x--; y++; }
        if(this.RawBoard[x][y] == disc.color) {
          dir |= Board.LOWER_LEFT;
        }
      }

      // 右下
      if(this.RawBoard[disc.x + 1][disc.y + 1] == -disc.color) {
        x = disc.x + 2;
        y = disc.y + 2;
        while(this.RawBoard[x][y] == -disc.color) { x++; y++; }
        if(this.RawBoard[x][y] == disc.color) {
          dir |= Board.LOWER_RIGHT;
        }
      }
      return dir;
    }

    private initMovable() {
      var disc: Disc,
          dir: number;

      this.MovablePos[this.Turns] = [];

      for(var x = 1; x <= Board.BOARD_SIZE; x++) {
        for(var y = 1; y <= Board.BOARD_SIZE; y++) {
          disc = new Disc(x, y, this.CurrentColor);
          dir = this.checkMobility(disc);
          if(dir != Board.NONE) {
            // 置ける
            this.MovablePos[this.Turns].push(disc);
          }
          this.MovableDir[this.Turns][x][y] = dir;
        }
      }
    }

    private flipDiscs(point: Point) {
      var x: number, y: number;
      var dir: number = this.MovableDir[this.Turns][point.x][point.y];

      var update = [];

      this.RawBoard[point.x][point.y] = this.CurrentColor;
      update.push(new Disc(point.x, point.y, this.CurrentColor));

      // 上
      if((dir & Board.UPPER) != Board.NONE) {
        y = point.y;
        while(this.RawBoard[point.x][--y] != this.CurrentColor) {
          this.RawBoard[point.x][y] = this.CurrentColor;
          update.push(new Disc(point.x, y, this.CurrentColor));
        }
      }

      // 下
      if((dir & Board.LOWER) != Board.NONE) {
        y = point.y;
        while(this.RawBoard[point.x][++y] != this.CurrentColor) {
          this.RawBoard[point.x][y] = this.CurrentColor;
          update.push(new Disc(point.x, y, this.CurrentColor));
        }
      }

      // 左
      if((dir & Board.LEFT) != Board.NONE) {
        x = point.x;
        while(this.RawBoard[--x][point.y] != this.CurrentColor) {
          this.RawBoard[x][point.y] = this.CurrentColor;
          update.push(new Disc(x, point.y, this.CurrentColor));
        }
      }

      // 右
      if((dir & Board.RIGHT) != Board.NONE) {
        x = point.x;
        while(this.RawBoard[++x][point.y] != this.CurrentColor) {
          this.RawBoard[x][point.y] = this.CurrentColor;
          update.push(new Disc(x, point.y, this.CurrentColor));
        }
      }

      // 右上
      if((dir & Board.UPPER_RIGHT) != Board.NONE) {
        x = point.x;
        y = point.y;
        while(this.RawBoard[++x][--y] != this.CurrentColor) {
          this.RawBoard[x][y] = this.CurrentColor;
          update.push(new Disc(x, y, this.CurrentColor));
        }
      }

      // 左上
      if((dir & Board.UPPER_LEFT) != Board.NONE) {
        x = point.x;
        y = point.y;
        while(this.RawBoard[--x][--y] != this.CurrentColor) {
          this.RawBoard[x][y] = this.CurrentColor;
          update.push(new Disc(x, y, this.CurrentColor));
        }
      }

      // 左下
      if((dir & Board.LOWER_LEFT) != Board.NONE) {
        x = point.x;
        y = point.y;
        while(this.RawBoard[--x][++y] != this.CurrentColor) {
          this.RawBoard[x][y] = this.CurrentColor;
          update.push(new Disc(x, y, this.CurrentColor));
        }
      }

      // 右下
      if((dir & Board.LOWER_RIGHT) != Board.NONE) {
        x = point.x;
        y = point.y;
        while(this.RawBoard[++x][++y] != this.CurrentColor) {
          this.RawBoard[x][y] = this.CurrentColor;
          update.push(new Disc(x, y, this.CurrentColor));
        }
      }

      // 石の数を更新
      var discdiff: number = update.length;

      this.Discs.set(this.CurrentColor, this.Discs.get(this.CurrentColor) + discdiff);
      this.Discs.set(-this.CurrentColor, this.Discs.get(-this.CurrentColor) - (discdiff - 1));
      this.Discs.set(Disc.EMPTY, this.Discs.get(Disc.EMPTY) - 1);

      this.UpdateLog.push(update);
    }
  }
}
