var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var ReversiTest;
(function (ReversiTest) {
    var Board = Reversi.Board;
    var Point = Reversi.Point;
    var Disc = Reversi.Disc;
    var ConsoleBoardTest = (function (_super) {
        __extends(ConsoleBoardTest, _super);
        function ConsoleBoardTest() {
            _super.apply(this, arguments);
        }
        ConsoleBoardTest.prototype.print = function () {
            console.log("  a b c d e f g h ");
            for (var y = 1; y <= 8; y++) {
                process.stdout.write(y + " ");
                for (var x = 1; x <= 8; x++) {
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
        };
        return ConsoleBoardTest;
    }(Board));
    ReversiTest.ConsoleBoardTest = ConsoleBoardTest;
})(ReversiTest || (ReversiTest = {}));
var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var ReversiTest;
(function (ReversiTest) {
    var Point = Reversi.Point;
    var Disc = Reversi.Disc;
    var BoardTest = (function () {
        function BoardTest() {
            this.board = new ReversiTest.ConsoleBoardTest();
            this.outputPrams();
            this.board.print();
            process.stdout.write("手を入力してください: ");
        }
        BoardTest.prototype.main = function (args) {
            var inStr = args;
            var p;
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
            }
            catch (e) {
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
        };
        BoardTest.prototype.outputNextStep = function () {
            this.outputPrams();
            this.board.print();
            process.stdout.write("手を入力してください: ");
        };
        BoardTest.prototype.outputPrams = function () {
            var currentDisc = this.board.getCurrentColor() == -1 ? "◯" : "●";
            process.stdout.write('\n');
            process.stdout.write("黒石" + this.board.countDisc(Disc.BLACK) + " ");
            process.stdout.write("白石" + this.board.countDisc(Disc.WHITE) + " ");
            console.log("空マス" + this.board.countDisc(Disc.EMPTY));
            console.log("ターン：" + this.board.getTurns());
            console.log("現在の手順：" + currentDisc);
            process.stdout.write('\n');
        };
        return BoardTest;
    }());
    var boardTest = new BoardTest();
    reader.on('line', function (line) {
        boardTest.main(line);
    });
    reader.on('close', function () {
    });
})(ReversiTest || (ReversiTest = {}));
