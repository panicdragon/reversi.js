var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Reversi;
(function (Reversi) {
    var Utility = (function () {
        function Utility(option) {
            this.option = option;
            this.support = {
                touch: ('ontouchstart' in window)
            };
            this.vendor = {
                defaultEvent: 'click',
                transitionend: this.whichTransitionEvent(),
                animationend: this.whichAnimationEvent(),
                prefix: this.whichPrefix(),
                transform: this.whichTransform()
            };
            if (this.support.touch) {
                this.vendor.defaultEvent = 'touchend';
            }
        }
        Utility.prototype.whichPrefix = function () {
            return (/webkit/i).test(navigator.appVersion) ? '-webkit-' : (/firefox/i).test(navigator.userAgent) ? '-moz-' :
                (/trident/i).test(navigator.userAgent) ? '-ms-' : 'opera' in window ? '-o-' : '';
        };
        Utility.prototype.whichTransform = function () {
            var t, el = document.createElement('fakeelement');
            var transform = {
                'transform': 'transform',
                'OTransform': 'OTransform',
                'MozTransform': 'MozTransform',
                'webkitTransform': 'webkitTransform'
            };
            for (t in transform) {
                if (el.style[t] !== undefined) {
                    return transform[t];
                }
            }
        };
        Utility.prototype.whichAnimationEvent = function () {
            var t, el = document.createElement('fakeelement');
            var animations = {
                'animation': 'animationend',
                'OAnimation': 'oAnimationEnd',
                'MozAnimation': 'animationend',
                'WebkitAnimation': 'webkitAnimationEnd'
            };
            for (t in animations) {
                if (el.style[t] !== undefined) {
                    return animations[t];
                }
            }
        };
        Utility.prototype.whichTransitionEvent = function () {
            var t, el = document.createElement('fakeelement');
            var transitions = {
                'transition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'MozTransition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            };
            for (t in transitions) {
                if (el.style[t] !== undefined) {
                    return transitions[t];
                }
            }
        };
        return Utility;
    }());
    Reversi.Utility = Utility;
})(Reversi || (Reversi = {}));
var Reversi;
(function (Reversi) {
    var NUMBER_STRINGS = '1234567890';
    var ALPHABET_STRINGS = 'abcdefgh';
    var Point = (function () {
        function Point() {
            var point = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                point[_i - 0] = arguments[_i];
            }
            if (typeof point[0] === 'string') {
                if (point[0].length < 2) {
                    throw new Error('The argument must be Reversi style coordinates!');
                }
                else {
                    this.x = this.alphabetToNumber(point[0].charAt(0));
                    this.y = parseInt(point[0].charAt(1), 10);
                }
            }
            else {
                this.x = point[0];
                this.y = point[1];
            }
        }
        Point.prototype.point = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Point.prototype.alphabetToNumber = function (str) {
            var i, il = ALPHABET_STRINGS.length, re;
            for (i = 0; i < il; i++) {
                re = new RegExp(ALPHABET_STRINGS[i], 'g');
                str = str.replace(re, NUMBER_STRINGS[i]);
            }
            return parseInt(str, 10);
        };
        Point.prototype.numberToAlphabet = function (str) {
            var i, il = NUMBER_STRINGS.length, re;
            str += '';
            for (i = 0; i < il; i++) {
                re = new RegExp(NUMBER_STRINGS[i], 'g');
                str = str.replace(re, ALPHABET_STRINGS[i]);
            }
            return str;
        };
        Point.prototype.equals = function (p) {
            if (this.x != p.x)
                return false;
            if (this.y != p.y)
                return false;
            return true;
        };
        return Point;
    }());
    Reversi.Point = Point;
})(Reversi || (Reversi = {}));
var Reversi;
(function (Reversi) {
    var Disc = (function (_super) {
        __extends(Disc, _super);
        function Disc(x, y, color) {
            if (x !== void 0) {
                _super.call(this, x, y);
                this.color = color;
            }
            else {
                this.disc(0, 0, Disc.EMPTY);
            }
        }
        Disc.prototype.disc = function (x, y, color) {
            this.point(x, y);
            this.color = color;
        };
        Disc.BLACK = 1;
        Disc.EMPTY = 0;
        Disc.WHITE = -1;
        Disc.WALL = 2;
        return Disc;
    }(Reversi.Point));
    Reversi.Disc = Disc;
})(Reversi || (Reversi = {}));
var Reversi;
(function (Reversi) {
    var ColorStorage = (function () {
        function ColorStorage() {
            this.data = new Array(3);
        }
        ColorStorage.prototype.get = function (color) {
            return this.data[color + 1];
        };
        ColorStorage.prototype.set = function (color, value) {
            this.data[color + 1] = value;
        };
        return ColorStorage;
    }());
    Reversi.ColorStorage = ColorStorage;
})(Reversi || (Reversi = {}));
var e = eval, global = e('this');
'use strict';
var Reversi;
(function (Reversi) {
    var Board = (function () {
        function Board() {
            this.RawBoard = this.getDimensionArray();
            this.UpdateLog = [];
            this.MovablePos = [];
            this.MovableDir = this.getMovableDirArray();
            this.Discs = new Reversi.ColorStorage();
            for (var i = 0; i <= Board.MAX_TURNS + 1; i++) {
                this.MovablePos[i] = new Array();
            }
            this.init();
        }
        Board.prototype.getDimensionArray = function () {
            var arr = new Array(Board.BOARD_SIZE + 2);
            for (var i = 0; i < Board.BOARD_SIZE + 2; i++) {
                arr[i] = new Array(Board.BOARD_SIZE + 2);
            }
            return arr;
        };
        Board.prototype.getMovableDirArray = function () {
            var arr = new Array(Board.MAX_TURNS + 1);
            for (var i = 0; i < arr.length; i++) {
                arr[i] = new Array(Board.BOARD_SIZE + 2);
                for (var n = 0; n < Board.BOARD_SIZE + 2; n++) {
                    arr[i][n] = new Array(Board.BOARD_SIZE + 2);
                }
            }
            return arr;
        };
        Board.prototype.init = function () {
            for (var x = 1; x <= Board.BOARD_SIZE; x++) {
                for (var y = 1; y <= Board.BOARD_SIZE; y++) {
                    this.RawBoard[x][y] = Reversi.Disc.EMPTY;
                }
            }
            for (var y = 0; y < Board.BOARD_SIZE + 2; y++) {
                this.RawBoard[0][y] = Reversi.Disc.WALL;
                this.RawBoard[Board.BOARD_SIZE + 1][y] = Reversi.Disc.WALL;
            }
            for (var x = 0; x < Board.BOARD_SIZE + 2; x++) {
                this.RawBoard[x][0] = Reversi.Disc.WALL;
                this.RawBoard[x][Board.BOARD_SIZE + 1] = Reversi.Disc.WALL;
            }
            this.RawBoard[4][4] = Reversi.Disc.WHITE;
            this.RawBoard[5][5] = Reversi.Disc.WHITE;
            this.RawBoard[4][5] = Reversi.Disc.BLACK;
            this.RawBoard[5][4] = Reversi.Disc.BLACK;
            this.Discs.set(Reversi.Disc.BLACK, 2);
            this.Discs.set(Reversi.Disc.WHITE, 2);
            this.Discs.set(Reversi.Disc.EMPTY, Board.BOARD_SIZE * Board.BOARD_SIZE - 4);
            this.Turns = 0;
            this.CurrentColor = Reversi.Disc.BLACK;
            this.initMovable();
        };
        Board.prototype.move = function (point) {
            if (point.x <= 0 || point.x > Board.BOARD_SIZE)
                return false;
            if (point.y <= 0 || point.y > Board.BOARD_SIZE)
                return false;
            if (this.MovableDir[this.Turns][point.x][point.y] == Board.NONE)
                return false;
            this.flipDiscs(point);
            this.Turns++;
            this.CurrentColor = -this.CurrentColor;
            this.initMovable();
            return true;
        };
        Board.prototype.undo = function () {
            if (this.Turns == 0)
                return false;
            this.CurrentColor = -this.CurrentColor;
            var update = this.UpdateLog.pop();
            if (update.length == 0) {
                this.MovablePos[this.Turns] = [];
                for (var x = 1; x <= Board.BOARD_SIZE; x++) {
                    for (var y = 1; y <= Board.BOARD_SIZE; y++) {
                        this.MovableDir[this.Turns][x][y] = Board.NONE;
                    }
                }
            }
            else {
                this.Turns--;
                var p = update[0];
                this.RawBoard[p.x][p.y] = Reversi.Disc.EMPTY;
                for (var i = 1; i < update.length; i++) {
                    p = update[i];
                    this.RawBoard[p.x][p.y] = -this.CurrentColor;
                }
                var discdiff = update.length;
                this.Discs.set(this.CurrentColor, this.Discs.get(this.CurrentColor) - discdiff);
                this.Discs.set(-this.CurrentColor, this.Discs.get(-this.CurrentColor) + (discdiff - 1));
                this.Discs.set(Reversi.Disc.EMPTY, this.Discs.get(Reversi.Disc.EMPTY) + 1);
            }
            return true;
        };
        Board.prototype.pass = function () {
            if (this.MovablePos[this.Turns].length != 0)
                return false;
            if (this.isGameOver())
                return false;
            this.CurrentColor = -this.CurrentColor;
            this.UpdateLog.push(new Array());
            this.initMovable();
            return true;
        };
        Board.prototype.getColor = function (point) {
            return this.RawBoard[point.x][point.y];
        };
        Board.prototype.getCurrentColor = function () {
            return this.CurrentColor;
        };
        Board.prototype.getTurns = function () {
            return this.Turns;
        };
        Board.prototype.isGameOver = function () {
            if (this.Turns == Board.MAX_TURNS)
                return true;
            if (this.MovablePos[this.Turns].length != 0)
                return false;
            var disc = new Reversi.Disc();
            disc.color = -this.CurrentColor;
            for (var x = 1; x <= Board.BOARD_SIZE; x++) {
                disc.x = x;
                for (var y = 1; y <= Board.BOARD_SIZE; y++) {
                    disc.y = y;
                    if (this.checkMobility(disc) != Board.NONE)
                        return false;
                }
            }
            return true;
        };
        Board.prototype.countDisc = function (color) {
            return this.Discs.get(color);
        };
        Board.prototype.getMovablePos = function () {
            return this.MovablePos[this.Turns];
        };
        Board.prototype.getHistory = function () {
            var history = [];
            for (var i = 0; i < this.UpdateLog.length; i++) {
                var update = this.UpdateLog[i];
                if (update.length == 0)
                    continue;
                history.push(update[0]);
            }
            return history;
        };
        Board.prototype.getUpdate = function () {
            if (this.UpdateLog.length == 0) {
                return new Array();
            }
            else {
                return this.UpdateLog[this.UpdateLog.length - 1];
            }
        };
        Board.prototype.getLiberty = function (p) {
            return 0;
        };
        Board.prototype.checkMobility = function (disc) {
            if (this.RawBoard[disc.x][disc.y] != Reversi.Disc.EMPTY)
                return Board.NONE;
            var x, y;
            var dir = Board.NONE;
            if (this.RawBoard[disc.x][disc.y - 1] == -disc.color) {
                x = disc.x;
                y = disc.y - 2;
                while (this.RawBoard[x][y] == -disc.color) {
                    y--;
                }
                if (this.RawBoard[x][y] == disc.color) {
                    dir |= Board.UPPER;
                }
            }
            if (this.RawBoard[disc.x][disc.y + 1] == -disc.color) {
                x = disc.x;
                y = disc.y + 2;
                while (this.RawBoard[x][y] == -disc.color) {
                    y++;
                }
                if (this.RawBoard[x][y] == disc.color) {
                    dir |= Board.LOWER;
                }
            }
            if (this.RawBoard[disc.x - 1][disc.y] == -disc.color) {
                x = disc.x - 2;
                y = disc.y;
                while (this.RawBoard[x][y] == -disc.color) {
                    x--;
                }
                if (this.RawBoard[x][y] == disc.color) {
                    dir |= Board.LEFT;
                }
            }
            if (this.RawBoard[disc.x + 1][disc.y] == -disc.color) {
                x = disc.x + 2;
                y = disc.y;
                while (this.RawBoard[x][y] == -disc.color) {
                    x++;
                }
                if (this.RawBoard[x][y] == disc.color) {
                    dir |= Board.RIGHT;
                }
            }
            if (this.RawBoard[disc.x + 1][disc.y - 1] == -disc.color) {
                x = disc.x + 2;
                y = disc.y - 2;
                while (this.RawBoard[x][y] == -disc.color) {
                    x++;
                    y--;
                }
                if (this.RawBoard[x][y] == disc.color) {
                    dir |= Board.UPPER_RIGHT;
                }
            }
            if (this.RawBoard[disc.x - 1][disc.y - 1] == -disc.color) {
                x = disc.x - 2;
                y = disc.y - 2;
                while (this.RawBoard[x][y] == -disc.color) {
                    x--;
                    y--;
                }
                if (this.RawBoard[x][y] == disc.color) {
                    dir |= Board.UPPER_LEFT;
                }
            }
            if (this.RawBoard[disc.x - 1][disc.y + 1] == -disc.color) {
                x = disc.x - 2;
                y = disc.y + 2;
                while (this.RawBoard[x][y] == -disc.color) {
                    x--;
                    y++;
                }
                if (this.RawBoard[x][y] == disc.color) {
                    dir |= Board.LOWER_LEFT;
                }
            }
            if (this.RawBoard[disc.x + 1][disc.y + 1] == -disc.color) {
                x = disc.x + 2;
                y = disc.y + 2;
                while (this.RawBoard[x][y] == -disc.color) {
                    x++;
                    y++;
                }
                if (this.RawBoard[x][y] == disc.color) {
                    dir |= Board.LOWER_RIGHT;
                }
            }
            return dir;
        };
        Board.prototype.initMovable = function () {
            var disc, dir;
            this.MovablePos[this.Turns] = [];
            for (var x = 1; x <= Board.BOARD_SIZE; x++) {
                for (var y = 1; y <= Board.BOARD_SIZE; y++) {
                    disc = new Reversi.Disc(x, y, this.CurrentColor);
                    dir = this.checkMobility(disc);
                    if (dir != Board.NONE) {
                        this.MovablePos[this.Turns].push(disc);
                    }
                    this.MovableDir[this.Turns][x][y] = dir;
                }
            }
        };
        Board.prototype.flipDiscs = function (point) {
            var x, y;
            var dir = this.MovableDir[this.Turns][point.x][point.y];
            var update = [];
            this.RawBoard[point.x][point.y] = this.CurrentColor;
            update.push(new Reversi.Disc(point.x, point.y, this.CurrentColor));
            if ((dir & Board.UPPER) != Board.NONE) {
                y = point.y;
                while (this.RawBoard[point.x][--y] != this.CurrentColor) {
                    this.RawBoard[point.x][y] = this.CurrentColor;
                    update.push(new Reversi.Disc(point.x, y, this.CurrentColor));
                }
            }
            if ((dir & Board.LOWER) != Board.NONE) {
                y = point.y;
                while (this.RawBoard[point.x][++y] != this.CurrentColor) {
                    this.RawBoard[point.x][y] = this.CurrentColor;
                    update.push(new Reversi.Disc(point.x, y, this.CurrentColor));
                }
            }
            if ((dir & Board.LEFT) != Board.NONE) {
                x = point.x;
                while (this.RawBoard[--x][point.y] != this.CurrentColor) {
                    this.RawBoard[x][point.y] = this.CurrentColor;
                    update.push(new Reversi.Disc(x, point.y, this.CurrentColor));
                }
            }
            if ((dir & Board.RIGHT) != Board.NONE) {
                x = point.x;
                while (this.RawBoard[++x][point.y] != this.CurrentColor) {
                    this.RawBoard[x][point.y] = this.CurrentColor;
                    update.push(new Reversi.Disc(x, point.y, this.CurrentColor));
                }
            }
            if ((dir & Board.UPPER_RIGHT) != Board.NONE) {
                x = point.x;
                y = point.y;
                while (this.RawBoard[++x][--y] != this.CurrentColor) {
                    this.RawBoard[x][y] = this.CurrentColor;
                    update.push(new Reversi.Disc(x, y, this.CurrentColor));
                }
            }
            if ((dir & Board.UPPER_LEFT) != Board.NONE) {
                x = point.x;
                y = point.y;
                while (this.RawBoard[--x][--y] != this.CurrentColor) {
                    this.RawBoard[x][y] = this.CurrentColor;
                    update.push(new Reversi.Disc(x, y, this.CurrentColor));
                }
            }
            if ((dir & Board.LOWER_LEFT) != Board.NONE) {
                x = point.x;
                y = point.y;
                while (this.RawBoard[--x][++y] != this.CurrentColor) {
                    this.RawBoard[x][y] = this.CurrentColor;
                    update.push(new Reversi.Disc(x, y, this.CurrentColor));
                }
            }
            if ((dir & Board.LOWER_RIGHT) != Board.NONE) {
                x = point.x;
                y = point.y;
                while (this.RawBoard[++x][++y] != this.CurrentColor) {
                    this.RawBoard[x][y] = this.CurrentColor;
                    update.push(new Reversi.Disc(x, y, this.CurrentColor));
                }
            }
            var discdiff = update.length;
            this.Discs.set(this.CurrentColor, this.Discs.get(this.CurrentColor) + discdiff);
            this.Discs.set(-this.CurrentColor, this.Discs.get(-this.CurrentColor) - (discdiff - 1));
            this.Discs.set(Reversi.Disc.EMPTY, this.Discs.get(Reversi.Disc.EMPTY) - 1);
            this.UpdateLog.push(update);
        };
        Board.BOARD_SIZE = 8;
        Board.MAX_TURNS = 60;
        Board.NONE = 0;
        Board.UPPER = 1;
        Board.UPPER_LEFT = 2;
        Board.LEFT = 4;
        Board.LOWER_LEFT = 8;
        Board.LOWER = 16;
        Board.LOWER_RIGHT = 32;
        Board.RIGHT = 64;
        Board.UPPER_RIGHT = 128;
        return Board;
    }());
    Reversi.Board = Board;
})(Reversi || (Reversi = {}));
var Reversi;
(function (Reversi) {
    var AI = (function () {
        function AI() {
            this.presearch_depth = 3;
            this.normal_depth = 15;
            this.wld_depth = 15;
            this.perfect_depth = 13;
        }
        return AI;
    }());
    Reversi.AI = AI;
    var Move = (function (_super) {
        __extends(Move, _super);
        function Move() {
            var move = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                move[_i - 0] = arguments[_i];
            }
            _super.call(this);
            this.eval_num = 0;
            if (move) {
                this.move(move[0], move[1], move[2]);
            }
            else {
                _super.call(this, 0, 0);
            }
        }
        Move.prototype.move = function (x, y, e) {
            this.point(x, y);
            this.eval_num = e;
        };
        return Move;
    }(Reversi.Point));
    Reversi.Move = Move;
    var AlphaBetaAI = (function (_super) {
        __extends(AlphaBetaAI, _super);
        function AlphaBetaAI() {
            _super.apply(this, arguments);
        }
        AlphaBetaAI.prototype.move = function (board) {
            var book = new Reversi.BookManager();
            var movables = book.find(board);
            console.log('movables', movables);
            if (movables.length == 0) {
                board.pass();
                console.log('pass');
                return board;
            }
            if (movables.length == 1) {
                board.move(movables[0]);
                console.log('即座に打って返る');
                return board;
            }
            var limit;
            this.Eval = new Reversi.MidEvaluator();
            this.sort(board, movables, this.presearch_depth);
            if (Reversi.Board.MAX_TURNS - board.getTurns() <= this.wld_depth) {
                limit = Number.MAX_VALUE;
                if (Reversi.Board.MAX_TURNS - board.getTurns() <= this.perfect_depth) {
                    this.Eval = new Reversi.PerfectEvaluator();
                }
                else {
                    this.Eval = new Reversi.WLDEvaluator();
                }
            }
            else {
                limit = this.normal_depth;
            }
            var eval_num, eval_max = Number.MIN_VALUE;
            var p = movables[0];
            board.move(p);
            return board;
        };
        AlphaBetaAI.prototype.alphabeta = function (board, limit, alpha, beta) {
            if (board.isGameOver() || limit == 0) {
                return this.evaluate(board);
            }
            var pos = board.getMovablePos();
            var eval_num;
            if (pos.length == 0) {
                board.pass();
                eval_num = -this.alphabeta(board, limit, -beta, -alpha);
                board.undo();
                return eval_num;
            }
            for (var i = 0; i < pos.length; i++) {
                board.move(pos[i]);
                eval_num = -this.alphabeta(board, limit - 1, -beta, -alpha);
                board.undo();
                alpha = Math.max(alpha, eval_num);
                if (alpha >= beta) {
                    return alpha;
                }
            }
            return alpha;
        };
        AlphaBetaAI.prototype.sort = function (board, movables, limit) {
            var moves = [];
            for (var i = 0; i < movables.length; i++) {
                var eval_num;
                var p = movables[i];
                board.move(p);
                eval_num = -this.alphabeta(board, limit - 1, -Number.MAX_VALUE, Number.MAX_VALUE);
                board.undo();
                var move = new Move(p.x, p.y, eval_num);
                moves.push(move);
            }
            var begin, current;
            for (begin = 0; begin < moves.length - 1; begin++) {
                for (current = 1; current < moves.length; current++) {
                    var b = moves[begin];
                    var c = moves[current];
                    if (b.eval_num < c.eval_num) {
                        moves[begin] = c;
                        moves[current] = b;
                    }
                }
            }
            movables = [];
            for (var i = 0; i < moves.length; i++) {
                movables.push(moves[i]);
            }
            return;
        };
        AlphaBetaAI.prototype.evaluate = function (board) {
            return 0;
        };
        return AlphaBetaAI;
    }(AI));
    Reversi.AlphaBetaAI = AlphaBetaAI;
})(Reversi || (Reversi = {}));
var Reversi;
(function (Reversi) {
    var CoordinatesTransformer = (function () {
        function CoordinatesTransformer(first) {
            this.Rotate = 0;
            this.Mirror = false;
            if (first.equals(new Reversi.Point("d3"))) {
                this.Rotate = 1;
                this.Mirror = true;
            }
            else if (first.equals(new Reversi.Point("c4"))) {
                this.Rotate = 2;
            }
            else if (first.equals(new Reversi.Point("e6"))) {
                this.Rotate = -1;
                this.Mirror = true;
            }
        }
        CoordinatesTransformer.prototype.normalize = function (p) {
            var newp = this.rotatePoint(p, this.Rotate);
            if (this.Mirror) {
                newp = this.mirrorPoint(newp);
            }
            return newp;
        };
        CoordinatesTransformer.prototype.denormalize = function (p) {
            var newp = new Reversi.Point(p.x, p.y);
            if (this.Mirror) {
                newp = this.mirrorPoint(newp);
            }
            newp = this.rotatePoint(newp, -this.Rotate);
            return newp;
        };
        CoordinatesTransformer.prototype.rotatePoint = function (old_point, rotate) {
            rotate %= 4;
            if (rotate < 0)
                rotate += 4;
            var new_point = new Reversi.Point();
            switch (rotate) {
                case 1:
                    new_point.x = old_point.y;
                    new_point.y = Reversi.Board.BOARD_SIZE - old_point.x + 1;
                    break;
                case 2:
                    new_point.x = Reversi.Board.BOARD_SIZE - old_point.x + 1;
                    new_point.y = Reversi.Board.BOARD_SIZE - old_point.y + 1;
                    break;
                case 3:
                    new_point.x = Reversi.Board.BOARD_SIZE - old_point.y + 1;
                    new_point.y = old_point.x;
                    break;
                default:
                    new_point.x = old_point.x;
                    new_point.y = old_point.y;
                    break;
            }
            return new_point;
        };
        CoordinatesTransformer.prototype.mirrorPoint = function (point) {
            var new_point = new Reversi.Point();
            new_point.x = Reversi.Board.BOARD_SIZE - point.x + 1;
            new_point.y = point.y;
            return new_point;
        };
        return CoordinatesTransformer;
    }());
    Reversi.CoordinatesTransformer = CoordinatesTransformer;
    var Node = (function () {
        function Node() {
            this.child = null;
            this.sibling = null;
            this.eval = 0;
            this.point = new Reversi.Point();
        }
        return Node;
    }());
    Reversi.Node = Node;
    var BookManager = (function () {
        function BookManager() {
            this.Root = null;
            this.Root = new Node();
            this.Root.point = new Reversi.Point("f5");
            try {
                for (var i = 0; i < BookManager.BOOK_FILE_DATA.length; i++) {
                    var strings = BookManager.BOOK_FILE_DATA[i];
                    var book = [];
                    for (var n = 0; n < strings.length; n += 2) {
                        var p = null;
                        try {
                            p = new Reversi.Point(strings.substring(n));
                        }
                        catch (e) {
                            break;
                        }
                        book.push(p);
                    }
                    this.add(book);
                }
            }
            catch (e) { }
        }
        BookManager.prototype.find = function (board) {
            var node = this.Root;
            var history = board.getHistory();
            if (history.length == 0) {
                return board.getMovablePos();
            }
            var first = history[0];
            var transformer = new CoordinatesTransformer(first);
            var normalized = [];
            for (var i = 0; i < history.length; i++) {
                var p = history[i];
                p = transformer.normalize(p);
                normalized.push(p);
            }
            for (var i = 1; i < normalized.length; i++) {
                var p = normalized[i];
                node = node.child;
                while (node != null) {
                    if (node.point.equals(p))
                        break;
                    node = node.sibling;
                }
                if (node == null) {
                    return board.getMovablePos();
                }
            }
            if (node.child == null) {
                return board.getMovablePos();
            }
            var next_move = this.getNextMove(node);
            console.log('next_move1:', next_move);
            next_move = transformer.denormalize(next_move);
            console.log('next_move2:', next_move);
            var v = [];
            v.push(next_move);
            console.log('v:', v);
            return v;
        };
        BookManager.prototype.getNextMove = function (node) {
            var candidates = [];
            for (var p = node.child; p != null; p = p.sibling) {
                candidates.push(p.point);
            }
            console.log('candidates：', candidates);
            var index = Math.floor(Math.random() * candidates.length);
            var point = candidates[index];
            return new Reversi.Point(point.x, point.y);
        };
        BookManager.prototype.add = function (book) {
            var node = this.Root;
            for (var i = 1; i < book.length; i++) {
                var p = book[i];
                if (node.child == null) {
                    node.child = new Node();
                    node = node.child;
                    node.point.x = p.x;
                    node.point.y = p.y;
                }
                else {
                    node = node.child;
                    while (true) {
                        if (node.point.equals(p))
                            break;
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
        };
        BookManager.BOOK_FILE_DATA = [
            'f5f6e6f4e3d3f3c5c4e2',
            'f5f6e6f4e3d6g4d3c3f2',
            'f5d6c4g5c6d3e6d7f6c7',
            'f5d6c5f4e3c6d3f6e6d7e7c7c4b4'
        ];
        return BookManager;
    }());
    Reversi.BookManager = BookManager;
})(Reversi || (Reversi = {}));
var Reversi;
(function (Reversi) {
    var ConsoleBoard = (function (_super) {
        __extends(ConsoleBoard, _super);
        function ConsoleBoard() {
            _super.apply(this, arguments);
        }
        ConsoleBoard.prototype.print = function () {
            console.log("  a b c d e f g h ");
            for (var y = 1; y <= 8; y++) {
                process.stdout.write(y + " ");
                for (var x = 1; x <= 8; x++) {
                    switch (this.getColor(new Reversi.Point(x, y))) {
                        case Reversi.Disc.BLACK:
                            process.stdout.write("● ");
                            break;
                        case Reversi.Disc.WHITE:
                            process.stdout.write("◯ ");
                            break;
                        default:
                            process.stdout.write("  ");
                            break;
                    }
                }
                process.stdout.write('\n');
            }
        };
        return ConsoleBoard;
    }(Reversi.Board));
    Reversi.ConsoleBoard = ConsoleBoard;
})(Reversi || (Reversi = {}));
var Reversi;
(function (Reversi) {
    var PerfectEvaluator = (function () {
        function PerfectEvaluator() {
        }
        PerfectEvaluator.prototype.evaluate = function (board) {
            var discdiff = board.getCurrentColor() * (board.countDisc(Reversi.Disc.BLACK) - board.countDisc(Reversi.Disc.WHITE));
            return discdiff;
        };
        return PerfectEvaluator;
    }());
    Reversi.PerfectEvaluator = PerfectEvaluator;
    var WLDEvaluator = (function () {
        function WLDEvaluator() {
            this.WIN = 1;
            this.DRAW = 0;
            this.LOSE = -1;
        }
        WLDEvaluator.prototype.evaluate = function (board) {
            var discdiff = board.getCurrentColor() * (board.countDisc(Reversi.Disc.BLACK) - board.countDisc(Reversi.Disc.WHITE));
            if (discdiff > 0) {
                return this.WIN;
            }
            else if (discdiff < 0) {
                return this.LOSE;
            }
            else {
                return this.DRAW;
            }
        };
        return WLDEvaluator;
    }());
    Reversi.WLDEvaluator = WLDEvaluator;
})(Reversi || (Reversi = {}));
var Reversi;
(function (Reversi) {
    var EdgeParam = (function () {
        function EdgeParam() {
            this.stable = 0;
            this.wing = 0;
            this.mountain = 0;
            this.Cmove = 0;
        }
        EdgeParam.prototype.add = function (src) {
            this.stable += src.stable;
            this.wing += src.wing;
            this.mountain += src.mountain;
            this.Cmove += src.Cmove;
            return this;
        };
        EdgeParam.prototype.set = function (e) {
            this.stable = e.stable;
            this.wing = e.wing;
            this.mountain = e.mountain;
            this.Cmove = e.Cmove;
        };
        return EdgeParam;
    }());
    var CornerParam = (function () {
        function CornerParam() {
            this.corner = 0;
            this.Xmove = 0;
        }
        return CornerParam;
    }());
    var EdgeStat = (function () {
        function EdgeStat() {
            this.data = [];
            for (var i = 0; i < 3; i++) {
                this.data[i] = new EdgeParam();
            }
        }
        EdgeStat.prototype.add = function (e) {
            for (var i = 0; i < 3; i++) {
                this.data[i].add(e.data[i]);
            }
        };
        EdgeStat.prototype.get = function (color) {
            return this.data[color + 1];
        };
        return EdgeStat;
    }());
    var CornerStat = (function () {
        function CornerStat() {
            this.data = [];
            for (var i = 0; i < 3; i++) {
                this.data[i] = new CornerParam();
            }
        }
        CornerStat.prototype.get = function (color) {
            return this.data[color + 1];
        };
        return CornerStat;
    }());
    var Weight = (function () {
        function Weight() {
        }
        return Weight;
    }());
    var evalEdge = function (line, color) {
        var edgeparam = new EdgeParam();
        var x;
        if (line[0] == Reversi.Disc.EMPTY && line[7] == Reversi.Disc.EMPTY) {
            x = 2;
            while (x <= 5) {
                if (line[x] != color)
                    break;
                x++;
            }
            if (x == 6) {
                if (line[1] == color && line[6] == Reversi.Disc.EMPTY)
                    edgeparam.wing = 1;
                else if (line[1] == Reversi.Disc.EMPTY && line[6] == color)
                    edgeparam.wing = 1;
                else if (line[1] == color && line[6] == color)
                    edgeparam.mountain = 1;
            }
            else {
                if (line[1] == color) {
                    edgeparam.Cmove++;
                }
                if (line[6] == color) {
                    edgeparam.Cmove++;
                }
            }
        }
        for (x = 0; x < 8; x++) {
            if (line[x] != color)
                break;
            edgeparam.stable++;
        }
        if (edgeparam.stable < 8) {
            for (x = 7; x > 0; x--) {
                if (line[x] != color)
                    break;
                edgeparam.stable++;
            }
        }
        return edgeparam;
    };
    var evalCorner = function (board) {
        var cornerstat = new CornerStat();
        cornerstat.get(Reversi.Disc.BLACK).corner = 0;
        cornerstat.get(Reversi.Disc.BLACK).Xmove = 0;
        cornerstat.get(Reversi.Disc.WHITE).corner = 0;
        cornerstat.get(Reversi.Disc.WHITE).Xmove = 0;
        var p = new Reversi.Point();
        p.x = 1;
        p.y = 1;
        cornerstat.get(board.getColor(p)).corner++;
        if (board.getColor(p) == Reversi.Disc.EMPTY) {
            p.x = 2;
            p.y = 2;
            cornerstat.get(board.getColor(p)).Xmove++;
        }
        p.y = 8;
        cornerstat.get(board.getColor(p)).corner++;
        if (board.getColor(p) == Reversi.Disc.EMPTY) {
            p.x = 2;
            p.y = 7;
            cornerstat.get(board.getColor(p)).Xmove++;
        }
        p.x = 8;
        p.y = 8;
        cornerstat.get(board.getColor(p)).corner++;
        if (board.getColor(p) == Reversi.Disc.EMPTY) {
            p.x = 7;
            p.y = 7;
            cornerstat.get(board.getColor(p)).Xmove++;
        }
        p.x = 8;
        p.y = 1;
        cornerstat.get(board.getColor(p)).corner++;
        if (board.getColor(p) == Reversi.Disc.EMPTY) {
            p.x = 7;
            p.y = 7;
            cornerstat.get(board.getColor(p)).Xmove++;
        }
        return cornerstat;
    };
    var idxTop = function (board) {
        var index = 0;
        var m = 1;
        var p = new Reversi.Point(0, 1);
        for (var i = Reversi.Board.BOARD_SIZE; i > 0; i--) {
            p.x = i;
            index += m * (board.getColor(p) + 1);
            m *= 3;
        }
        return index;
    };
    var idxBottom = function (board) {
        var index = 0;
        var m = 1;
        var p = new Reversi.Point(0, 8);
        for (var i = Reversi.Board.BOARD_SIZE; i > 0; i--) {
            p.x = i;
            index += m * (board.getColor(p) + 1);
            m *= 3;
        }
        return index;
    };
    var idxRight = function (board) {
        var index = 0;
        var m = 1;
        var p = new Reversi.Point(8, 0);
        for (var i = Reversi.Board.BOARD_SIZE; i > 0; i--) {
            p.y = i;
            index += m * (board.getColor(p) + 1);
            m *= 3;
        }
        return index;
    };
    var idxLeft = function (board) {
        var index = 0;
        var m = 1;
        var p = new Reversi.Point(1, 0);
        for (var i = Reversi.Board.BOARD_SIZE; i > 0; i--) {
            p.y = i;
            index += m * (board.getColor(p) + 1);
            m *= 3;
        }
        return index;
    };
    var MidEvaluator = (function () {
        function MidEvaluator() {
            if (!MidEvaluator.TableInit) {
                var line = [];
                this.generateEdge(line, 0);
                MidEvaluator.TableInit = true;
            }
            this.EvalWeight = new Weight();
            this.EvalWeight.mobility_w = 67;
            this.EvalWeight.liberty_w = -13;
            this.EvalWeight.stable_w = 101;
            this.EvalWeight.wing_w = -308;
            this.EvalWeight.Xmove_w = -449;
            this.EvalWeight.Cmove_w = -552;
        }
        MidEvaluator.prototype.evaluate = function (board) {
            var edgestat;
            var cornerstat;
            var result;
            edgestat = MidEvaluator.EdgeTable[idxTop(board)];
            edgestat.add(MidEvaluator.EdgeTable[idxBottom(board)]);
            edgestat.add(MidEvaluator.EdgeTable[idxRight(board)]);
            edgestat.add(MidEvaluator.EdgeTable[idxLeft(board)]);
            cornerstat = evalCorner(board);
            edgestat.get(Reversi.Disc.BLACK).stable -= cornerstat.get(Reversi.Disc.BLACK).corner;
            edgestat.get(Reversi.Disc.WHITE).stable -= cornerstat.get(Reversi.Disc.WHITE).corner;
            result =
                edgestat.get(Reversi.Disc.BLACK).stable * this.EvalWeight.stable_w
                    - edgestat.get(Reversi.Disc.WHITE).stable * this.EvalWeight.stable_w
                    + edgestat.get(Reversi.Disc.BLACK).wing * this.EvalWeight.wing_w
                    - edgestat.get(Reversi.Disc.WHITE).wing * this.EvalWeight.wing_w
                    + cornerstat.get(Reversi.Disc.BLACK).Xmove * this.EvalWeight.Xmove_w
                    - cornerstat.get(Reversi.Disc.WHITE).Xmove * this.EvalWeight.Xmove_w
                    + edgestat.get(Reversi.Disc.BLACK).Cmove * this.EvalWeight.Cmove_w
                    - edgestat.get(Reversi.Disc.WHITE).Cmove * this.EvalWeight.Cmove_w;
            if (this.EvalWeight.liberty_w != 0) {
                var liberty = this.countLiberty(board);
                result += liberty.get(Reversi.Disc.BLACK) * this.EvalWeight.liberty_w;
                result -= liberty.get(Reversi.Disc.WHITE) * this.EvalWeight.liberty_w;
            }
            result +=
                board.getCurrentColor()
                    * board.getMovablePos().length
                    * this.EvalWeight.mobility_w;
            return board.getCurrentColor() * result;
        };
        MidEvaluator.prototype.generateEdge = function (edge, count) {
            if (count == Reversi.Board.BOARD_SIZE) {
                var stat = new EdgeStat();
                stat.get(Reversi.Disc.BLACK).set(evalEdge(edge, Reversi.Disc.BLACK));
                stat.get(Reversi.Disc.WHITE).set(evalEdge(edge, Reversi.Disc.WHITE));
                MidEvaluator.EdgeTable[this.idxLine(edge)] = stat;
                return;
            }
            edge[count] = Reversi.Disc.EMPTY;
            this.generateEdge(edge, count + 1);
            edge[count] = Reversi.Disc.BLACK;
            this.generateEdge(edge, count + 1);
            edge[count] = Reversi.Disc.WHITE;
            this.generateEdge(edge, count + 1);
            return;
        };
        MidEvaluator.prototype.countLiberty = function (board) {
            var liberty = new Reversi.ColorStorage();
            liberty.set(Reversi.Disc.BLACK, 0);
            liberty.set(Reversi.Disc.WHITE, 0);
            liberty.set(Reversi.Disc.EMPTY, 0);
            var p = new Reversi.Point();
            for (var x = 1; x <= Reversi.Board.BOARD_SIZE; x++) {
                p.x = x;
                for (var y = 1; y <= Reversi.Board.BOARD_SIZE; y++) {
                    p.y = y;
                    var l = liberty.get(board.getColor(p));
                    l += board.getLiberty(p);
                    liberty.set(board.getColor(p), l);
                }
            }
            return liberty;
        };
        MidEvaluator.prototype.idxLine = function (l) {
            return 3 * (3 * (3 * (3 * (3 * (3 * (3 * (l[0] + 1) + l[1] + 1) + l[2] + 1) + l[3] + 1) + l[4] + 1) + l[5] + 1) + l[6] + 1) + l[7] + 1;
        };
        MidEvaluator.TABLE_SIZE = 6561;
        MidEvaluator.EdgeTable = new EdgeStat();
        MidEvaluator.TableInit = false;
        return MidEvaluator;
    }());
    Reversi.MidEvaluator = MidEvaluator;
})(Reversi || (Reversi = {}));
var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var Reversi;
(function (Reversi) {
    var HumanPlayer = (function () {
        function HumanPlayer() {
        }
        HumanPlayer.prototype.onTurn = function (board) {
            if (board.isGameOver()) {
                console.log("ゲームオーバー");
                return;
            }
            if (board.getMovablePos().length == 0) {
                process.stdout.write("あなたはパスです。");
                board.pass();
                return;
            }
            console.log('color', board.getCurrentColor());
            process.stdout.write("手を\"f5\"のように入力、もしくは(u:取り消し/x:終了)を入力してください：");
        };
        HumanPlayer.prototype.onType = function (board, line) {
            var p;
            if (line == "p") {
                if (!board.pass()) {
                    console.log("パスできません！");
                }
                return;
            }
            if (line == "u") {
                reversiGame.undo();
                return;
            }
            try {
                p = new Reversi.Point(line);
            }
            catch (e) {
                console.log("リバーシ形式の手を入力してください！");
                return;
            }
            if (board.move(p) == false) {
                console.log("そこには置けません！");
                return;
            }
            reversiGame.tarnChange(board);
            return;
        };
        return HumanPlayer;
    }());
    var AIPlayer = (function () {
        function AIPlayer() {
            this.Ai = null;
            this.Ai = new Reversi.AlphaBetaAI();
        }
        AIPlayer.prototype.onTurn = function (board) {
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
            }
        };
        AIPlayer.prototype.onType = function (board, line) {
        };
        return AIPlayer;
    }());
    var ReversiGame = (function () {
        function ReversiGame() {
            this.board = new Reversi.ConsoleBoard();
            this.current_player = 0;
            this.player = [];
            this.reverse = false;
        }
        ReversiGame.prototype.main = function (args) {
            if (args && args === "-r") {
                this.reverse = true;
            }
            if (this.reverse) {
                this.player[0] = new AIPlayer();
                this.player[1] = new HumanPlayer();
            }
            else {
                this.player[0] = new HumanPlayer();
                this.player[1] = new AIPlayer();
            }
            this.board.print();
            this.player[this.current_player].onTurn(this.board);
        };
        ReversiGame.prototype.tarnChange = function (board) {
            this.board = board;
            console.log('getMovablePos', board.getMovablePos());
            this.board.print();
            this.changePlayer();
            this.player[this.current_player].onTurn(board);
        };
        ReversiGame.prototype.gameOver = function () {
            process.stdout.write("ゲーム終了");
            console.log("黒石" + this.board.countDisc(Reversi.Disc.BLACK) + " ");
            process.stdout.write("白石" + this.board.countDisc(Reversi.Disc.WHITE));
        };
        ReversiGame.prototype.undo = function () {
            this.board.undo();
            this.board.undo();
            this.board.print();
            this.player[this.current_player].onTurn(this.board);
        };
        ReversiGame.prototype.changePlayer = function () {
            this.current_player = ++this.current_player % 2;
        };
        ReversiGame.prototype.onType = function (line) {
            if (this.reverse) {
                this.player[1].onType(this.board, line);
            }
            else {
                this.player[0].onType(this.board, line);
            }
        };
        ReversiGame.prototype.outputNextStep = function () {
            this.changePlayer();
            this.outputPrams();
            this.board.print();
            this.player[this.current_player].onTurn(this.board);
        };
        ReversiGame.prototype.outputPrams = function () {
            var currentDisc = this.board.getCurrentColor() == -1 ? "◯" : "●";
            process.stdout.write('\n');
            process.stdout.write("黒石" + this.board.countDisc(Reversi.Disc.BLACK) + " ");
            process.stdout.write("白石" + this.board.countDisc(Reversi.Disc.WHITE) + " ");
            console.log("空マス" + this.board.countDisc(Reversi.Disc.EMPTY));
            console.log("ターン：" + this.board.getTurns());
            console.log("現在の手順：" + currentDisc);
            process.stdout.write('\n');
        };
        return ReversiGame;
    }());
    var reversiGame = new ReversiGame();
    if (process.argv.length > 2) {
        reversiGame.main(process.argv[2]);
    }
    else {
        reversiGame.main();
    }
    reader.on('line', function (line) {
        reversiGame.onType(line);
    });
})(Reversi || (Reversi = {}));
var Reversi;
(function (Reversi) {
    var RippleController = (function () {
        function RippleController(util) {
            this.util = util;
            this.clickParam = {
                x: 0,
                y: 0
            };
        }
        RippleController.prototype.setClickEvent = function (callback) {
            var that = this;
            document.addEventListener(this.util.vendor.defaultEvent, function (e) {
                var target = e.target;
                if (target.nodeName === 'A' || target.nodeName === 'INPUT') {
                    return;
                }
                if (e.pageX || e.pageX) {
                    that.clickParam = {
                        x: e.pageX,
                        y: e.pageY
                    };
                }
                if (e.touches !== void 0) {
                    var touch = e.changedTouches[0];
                    that.clickParam = {
                        x: touch.pageX,
                        y: touch.pageY
                    };
                }
                callback(that.clickParam);
            }, false);
        };
        return RippleController;
    }());
    Reversi.RippleController = RippleController;
})(Reversi || (Reversi = {}));
