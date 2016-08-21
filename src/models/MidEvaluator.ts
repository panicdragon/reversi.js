
module Reversi {

  class EdgeParam {
    public stable = 0; // 確定石の個数
    public wing = 0; // ウイングの個数
    public mountain = 0; // 山の個数
    public Cmove = 0; // 危険なC打ちの個数

    public add(src: EdgeParam): EdgeParam {
      this.stable += src.stable;
      this.wing += src.wing;
      this.mountain += src.mountain;
      this.Cmove += src.Cmove;

      return this;
    }

    // 代入演算子の代わり
    public set(e:EdgeParam):void {
      this.stable = e.stable;
      this.wing = e.wing;
      this.mountain = e.mountain;
      this.Cmove = e.Cmove;
    }
  }

  class CornerParam {
    public corner = 0; // 隅にある石の個数
    public Xmove = 0;  // 危険なX打ちの個数
  }

  class EdgeStat {
    private data: EdgeParam[] = [];

    constructor(
      ) {
      for (var i: number = 0; i < 3; i++) {
        this.data[i] = new EdgeParam();
      }
    }

    public add(e: EdgeStat): void {
      for (var i: number = 0; i < 3; i++) {
        this.data[i].add(e.data[i]);
      }
    }

    public get(color: number): EdgeParam {
      return this.data[color + 1];
    }
  }

  class CornerStat {
    private data: CornerParam[] = [];

    constructor(
      ) {
      for (var i: number = 0; i < 3; i++) {
        this.data[i] = new CornerParam();
      }
    }

    public get(color: number): CornerParam {
      return this.data[color + 1];
    }
  }

  // 重み係数を規定する構造体
  class Weight {
    public mobility_w: number;
    public liberty_w: number;
    public stable_w: number;
    public wing_w: number;
    public Xmove_w: number;
    public Cmove_w: number;
  }


  var evalEdge = (line: number[], color: number): EdgeParam => {
    var edgeparam: EdgeParam = new EdgeParam();
    var x: number;

    //
    // ウイング等のカウント
    //
    if (line[0] == Disc.EMPTY && line[7] == Disc.EMPTY) {
      x = 2;
      while (x <= 5) {
        if (line[x] != color) break;
        x++;
      }

      // 少なくともブロックができている
      if (x == 6) {
        if (line[1] == color && line[6] == Disc.EMPTY)
          edgeparam.wing = 1;
        else if (line[1] == Disc.EMPTY && line[6] == color)
          edgeparam.wing = 1;
        else if (line[1] == color && line[6] == color)
          edgeparam.mountain = 1;
      } else {
        // それ以外の場合に、隅に隣接する位置に置いていたら
        if (line[1] == color) {
          edgeparam.Cmove++;
        }
        if (line[6] == color) {
          edgeparam.Cmove++;
        }
      }
    }

    //
    // 確定石のカウント
    //
    // 左から右方向に走査
    for (x = 0; x < 8; x++) {
      if (line[x] != color) break;
      edgeparam.stable++;
    }

    if (edgeparam.stable < 8) {
      // 右からの走査も必要
      for (x = 7; x > 0; x--) {
        if (line[x] != color) break;
        edgeparam.stable++;
      }
    }
    return edgeparam;
  };


  var evalCorner = (board:Board): CornerStat => {
    var cornerstat: CornerStat = new CornerStat();

    cornerstat.get(Disc.BLACK).corner = 0;
    cornerstat.get(Disc.BLACK).Xmove = 0;
    cornerstat.get(Disc.WHITE).corner = 0;
    cornerstat.get(Disc.WHITE).Xmove = 0;

    var p: Point = new Point();

    // 左上
    p.x = 1;
    p.y = 1;
    cornerstat.get(board.getColor(p)).corner++;
    if (board.getColor(p) == Disc.EMPTY) {
      p.x = 2;
      p.y = 2;
      cornerstat.get(board.getColor(p)).Xmove++;
    }

    // 左下
    p.y = 8;
    cornerstat.get(board.getColor(p)).corner++;
    if (board.getColor(p) == Disc.EMPTY) {
      p.x = 2;
      p.y = 7;
      cornerstat.get(board.getColor(p)).Xmove++;
    }

    // 右下
    p.x = 8;
    p.y = 8;
    cornerstat.get(board.getColor(p)).corner++;
    if (board.getColor(p) == Disc.EMPTY) {
      p.x = 7;
      p.y = 7;
      cornerstat.get(board.getColor(p)).Xmove++;
    }

    // 右上
    p.x = 8;
    p.y = 1;
    cornerstat.get(board.getColor(p)).corner++;
    if (board.getColor(p) == Disc.EMPTY) {
      p.x = 7;
      p.y = 7;
      cornerstat.get(board.getColor(p)).Xmove++;
    }
    return cornerstat;
  };


  var idxTop = (board: Board): number => {
    var index: number = 0;

    var m: number = 1;
    var p: Point = new Point(0, 1);
    for (var i: number = Board.BOARD_SIZE; i > 0; i--) {
      p.x = i;
      index += m * (board.getColor(p) + 1);
      m *= 3;
    }

    return index;
  };


  var idxBottom = (board: Board): number => {
    var index: number = 0;

    var m: number = 1;
    var p: Point = new Point(0, 8);
    for (var i: number = Board.BOARD_SIZE; i > 0; i--) {
      p.x = i;
      index += m * (board.getColor(p) + 1);
      m *= 3;
    }

    return index;
  };

  var idxRight = (board: Board): number => {
    var index: number = 0;

    var m: number = 1;
    var p: Point = new Point(8, 0);
    for (var i: number = Board.BOARD_SIZE; i > 0; i--) {
      p.y = i;
      index += m * (board.getColor(p) + 1);
      m *= 3;
    }

    return index;
  };

  var idxLeft = (board: Board): number => {
    var index: number = 0;

    var m: number = 1;
    var p: Point = new Point(1, 0);
    for (var i: number = Board.BOARD_SIZE; i > 0; i--) {
      p.y = i;
      index += m * (board.getColor(p) + 1);
      m *= 3;
    }

    return index;
  };


  export class MidEvaluator implements Evaluator {
    private EvalWeight: Weight;

    private static TABLE_SIZE: number = 6561; // 3^8
    //private static EdgeTable: EdgeStat[] = new EdgeStat[this.TABLE_SIZE];
    private static EdgeTable: EdgeStat = new EdgeStat();
    private static TableInit: boolean = false;

    constructor() {
      if (!MidEvaluator.TableInit) {
        // 初回起動時にテーブルを生成
        //var line: number[] = new Number[Board.BOARD_SIZE];
        var line: number[] = [];
        this.generateEdge(line, 0);

        MidEvaluator.TableInit = true;
      }

      // 重み係数の設定（全局面共通）
      this.EvalWeight = new Weight();

      this.EvalWeight.mobility_w = 67;
      this.EvalWeight.liberty_w = -13;
      this.EvalWeight.stable_w = 101;
      this.EvalWeight.wing_w = -308;
      this.EvalWeight.Xmove_w = -449;
      this.EvalWeight.Cmove_w = -552;
    }

    public evaluate(board: Board): number {
      var edgestat: EdgeStat;
      var cornerstat: CornerStat;
      var result: number;

      //
      // 辺の評価
      //
      edgestat = MidEvaluator.EdgeTable[idxTop(board)];
      edgestat.add(MidEvaluator.EdgeTable[idxBottom(board)]);
      edgestat.add(MidEvaluator.EdgeTable[idxRight(board)]);
      edgestat.add(MidEvaluator.EdgeTable[idxLeft(board)]);

      //
      // 隅の評価
      //
      cornerstat = evalCorner(board);

      // 確定石に関して、隅の石を2回数えてしまっているので補正。
      edgestat.get(Disc.BLACK).stable -= cornerstat.get(Disc.BLACK).corner;
      edgestat.get(Disc.WHITE).stable -= cornerstat.get(Disc.WHITE).corner;

      //
      // パラメータの線形結合
      //
      result =
        edgestat.get(Disc.BLACK).stable * this.EvalWeight.stable_w
        - edgestat.get(Disc.WHITE).stable * this.EvalWeight.stable_w
        + edgestat.get(Disc.BLACK).wing * this.EvalWeight.wing_w
        - edgestat.get(Disc.WHITE).wing * this.EvalWeight.wing_w
        + cornerstat.get(Disc.BLACK).Xmove * this.EvalWeight.Xmove_w
        - cornerstat.get(Disc.WHITE).Xmove * this.EvalWeight.Xmove_w
        + edgestat.get(Disc.BLACK).Cmove * this.EvalWeight.Cmove_w
        - edgestat.get(Disc.WHITE).Cmove * this.EvalWeight.Cmove_w
      ;

      // 開放度・着手可能手数の評価
      if (this.EvalWeight.liberty_w != 0) {
        var liberty: ColorStorage = this.countLiberty(board);
        result += liberty.get(Disc.BLACK) * this.EvalWeight.liberty_w;
        result -= liberty.get(Disc.WHITE) * this.EvalWeight.liberty_w;
      }

      // 現在の手番の色についてのみ、着手可能手数を数える
      result +=
        board.getCurrentColor()
        * board.getMovablePos().length
        * this.EvalWeight.mobility_w;

      return board.getCurrentColor() * result;
    }

    private generateEdge(edge: number[], count: number): void {
      if (count == Board.BOARD_SIZE) {
        //
        // このパターンは完成したので、局面のカウント
        //
        var stat:EdgeStat = new EdgeStat();

        stat.get(Disc.BLACK).set(evalEdge(edge, Disc.BLACK));
        stat.get(Disc.WHITE).set(evalEdge(edge, Disc.WHITE));

        MidEvaluator.EdgeTable[this.idxLine(edge)] = stat;

        return;
      }

      // 再帰的にすべてのパターンを網羅
      edge[count] = Disc.EMPTY;
      this.generateEdge(edge, count + 1);

      edge[count] = Disc.BLACK;
      this.generateEdge(edge, count + 1);

      edge[count] = Disc.WHITE;
      this.generateEdge(edge, count + 1);

      return;
    }

    private countLiberty(board: Board): ColorStorage {
      var liberty: ColorStorage = new ColorStorage();

      liberty.set(Disc.BLACK, 0);
      liberty.set(Disc.WHITE, 0);
      liberty.set(Disc.EMPTY, 0);

      var p:Point = new Point();

      for (var x: number = 1; x <= Board.BOARD_SIZE; x++) {
        p.x = x;
        for (var y: number = 1; y <= Board.BOARD_SIZE; y++) {
          p.y = y;
          var l: number = liberty.get(board.getColor(p));
          l += board.getLiberty(p);
          liberty.set(board.getColor(p), l);
        }
      }

      return liberty;
    }

    private idxLine(l: number[]): number {
      return 3 * (3 * (3 * (3 * (3 * (3 * (3 * (l[0] + 1) + l[1] + 1) + l[2] + 1) + l[3] + 1) + l[4] + 1) + l[5] + 1) + l[6] + 1) + l[7] + 1;
    }

  }

}
