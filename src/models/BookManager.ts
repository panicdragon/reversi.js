module Reversi {
  export class CoordinatesTransformer {
    private Rotate: number = 0;
    private Mirror: boolean = false;

    constructor(first: Point) {
      if (first.equals(new Point("d3"))) {
        this.Rotate = 1;
        this.Mirror = true;
      } else if (first.equals(new Point("c4"))) {
        this.Rotate = 2;
      } else if (first.equals(new Point("e6"))) {
        this.Rotate = -1;
        this.Mirror = true;
      }
    }

    // 座標をf5を開始点とする座標系に正規化する
    public normalize(p: Point): Point {
      var newp: Point = this.rotatePoint(p, this.Rotate);

      if (this.Mirror) {
        newp = this.mirrorPoint(newp);
      }

      return newp;
    }

    // f5を開始点とする座標を本来の座標に戻す
    public denormalize(p: Point): Point {
      var newp: Point = new Point(p.x, p.y);

      if (this.Mirror) {
        newp = this.mirrorPoint(newp);
      }

      newp = this.rotatePoint(newp, -this.Rotate);

      return newp;
    }

    private rotatePoint(old_point: Point, rotate: number): Point {
      rotate %= 4;

      if (rotate < 0) rotate += 4;

      var new_point: Point = new Point();

      switch (rotate) {
        case 1:
          new_point.x = old_point.y;
          new_point.y = Board.BOARD_SIZE - old_point.x + 1;
          break;
        case 2:
          new_point.x = Board.BOARD_SIZE - old_point.x + 1;
          new_point.y = Board.BOARD_SIZE - old_point.y + 1;
          break;
        case 3:
          new_point.x = Board.BOARD_SIZE - old_point.y + 1;
          new_point.y = old_point.x;
          break;
        default: // 0
          new_point.x = old_point.x;
          new_point.y = old_point.y;
          break;
      }

      return new_point;
    }

    private mirrorPoint(point: Point): Point {
      var new_point: Point = new Point();

      new_point.x = Board.BOARD_SIZE - point.x + 1;
      new_point.y = point.y;

      return new_point;
    }
  }

  export class Node {
    public child: Node = null;
    public sibling: Node = null;
    public eval: number = 0;
    public point: Point = new Point();
  }


  export class BookManager {
    // 定石データ
    private static BOOK_FILE_DATA = [
      'f5f6e6f4e3d3f3c5c4e2',
      'f5f6e6f4e3d6g4d3c3f2',
      'f5d6c4g5c6d3e6d7f6c7',
      'f5d6c5f4e3c6d3f6e6d7e7c7c4b4'
    ];

    private Root: Node = null;

    constructor() {
      this.Root = new Node();
      this.Root.point = new Point("f5");

      try {
        for (var i: number = 0; i < BookManager.BOOK_FILE_DATA.length; i++) {
          var strings: string = BookManager.BOOK_FILE_DATA[i];
          var book = [];

          for(var n: number = 0; n < strings.length; n += 2) {
            var p: Point = null;

            try {
              p = new Point(strings.substring(n));
            } catch(e) {
              break;
            }

            book.push(p);
          }

          this.add(book);
        }
      } catch(e) {}
    }

    public find(board: Board) {
      var node: Node = this.Root;
      var history = board.getHistory();

      if (history.length == 0) {
        return board.getMovablePos();
      }

      // この辺おかしいので要確認
      var first: Point = history[0];
      var transformer: CoordinatesTransformer = new CoordinatesTransformer(first);

      // 座標を変換してf5から始まるようにする
      var normalized = [];
      for (var i: number = 0; i < history.length; i++) {
        var p: Point = history[i];
        p = transformer.normalize(p);

        normalized.push(p);
      }

      // 現在までの棋譜リストと定石の対応を取る
      for (var i: number = 1; i < normalized.length; i++) {
        var p: Point = normalized[i];

        node = node.child;
        while (node != null) {
          if (node.point.equals(p)) break;

          node = node.sibling;
        }

        if (node == null) {
          // 定石と外れている
          return board.getMovablePos();
        }
      }

      // 履歴と定石が一致していた場合
      if (node.child == null) {
        return board.getMovablePos();
      }

      var next_move: Point = this.getNextMove(node);

      console.log('next_move1:', next_move);

      // 座標を元の形に変換する
      next_move = transformer.denormalize(next_move);

      console.log('next_move2:', next_move);

      var v = [];
      v.push(next_move);

      console.log('v:', v);

      return v;
    }

    private getNextMove(node: Node): Point {
      var candidates = [];

      //console.log('node', node);

      for (var p: Node = node.child; p != null; p = p.sibling) {
        candidates.push(p.point);
      }

      console.log('candidates：', candidates);

      var index: number = Math.floor(Math.random() * candidates.length);
      var point: Point = candidates[index];

      return new Point(point.x, point.y);
    }

    private add(book: Point[]): void {
      var node: Node = this.Root;

      for (var i: number = 1; i < book.length; i++) {
        var p: Point = book[i];

        if (node.child == null) {
          // 新しい定石手
          node.child = new Node();
          node = node.child;
          node.point.x = p.x;
          node.point.y = p.y;
        } else {
          // 兄弟ノードの探索に移る
          node = node.child;

          while (true) {
            // すでにこの手はデータベース中にあり、その枝を見つけた
            if (node.point.equals(p)) break;

            // 定石木の新しい枝
            if (node.sibling == null) {
              node.sibling = new Node();
              node = node.sibling;
              node.point.x = p.x;
              node.point.y = p.y;

              break;
            }
            node = node.sibling;
          }
        }
      }
    }
  }
}

