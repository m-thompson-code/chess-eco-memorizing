import { Space } from './space';
import { Piece, PieceColor, PieceType, PieceInit } from './piece';

export type BoardOrientation = 'normal' | 'flipped';

export interface BoardHistory {
    pawnMovedTwoSpaces?: boolean;
    moveNotation: string;
    movingPiece: Piece;
    capturedPiece?: Piece;
    oldPosition: BoardPosition;
    newPosition: BoardPosition;
}

export interface BoardPositionStyles {
    left: string;
    top: string;
}

export interface BoardPosition {
    space: Space;
    piece?: Piece;
}

export type Board = {
    [y: number] : {
        [x: number] : BoardPosition;
    }
} & BoardPosition[][];

export class BoardManager {
    board: Board;

    pieces: Piece[];

    boardOrientation: BoardOrientation;

    history: {
        'white' : BoardHistory;
        'black'? : BoardHistory;
    }[];

    turn: PieceColor;

    showingDotsFor?: Piece;

    constructor(boardOrientation?: BoardOrientation, board?: Board) {
        this.boardOrientation = boardOrientation || 'normal';

        this.board = this._getInitalizedBoard();
        this.pieces = [];

        this.history = [];

        this.turn = 'white';

        this.setStartingPieces();
    }

    public hideMovementDots(): void {
        if (!this.showingDotsFor) {
            return;
        }

        for (const row of this.board) {
            for (const position of row) {
                position.space.showDot = false;
            }
        }

        this.showingDotsFor = undefined;
    }

    // TODO: Handle showing bit dot for En passant
    public showMovementDots(piece: Piece): void {
        if (this.showingDotsFor === piece) {
            return;
        }

        const moves: BoardPosition[] = piece.getAvailableMoves();

        this.hideMovementDots();

        for (const position of moves) {
            position.space.showDot = true;
        }

        this.showingDotsFor = piece;
    }

    public getPosition(x: number, y: number): BoardPosition | undefined {
        if (x < 0 || y < 0 || x > 7 || y > 7) {
            return;
        }

        return this.board[y][x];
    }

    public pushPiece(color: PieceColor, pieceType: PieceType, x: number, y: number): Piece {
        const _position: BoardPosition | undefined = this.getPosition(x, y);

        if (!_position) {
            throw {
                message: `Position doesn't exist`,
                x: x,
                y: y,
                _position: _position,
                color: color,
                pieceType: pieceType,
            };
        }

        if (_position.piece) {
            throw {
                message: 'Piece already exists on this position',
                x: x,
                y: y,
                _position: _position,
                color: color,
                pieceType: pieceType,
            };
        }

        const pieceInit: PieceInit = {
            x: x,
            y: y,
            color: color,
            pieceType: pieceType,
            getBoard: () => {
                return this;
            },
        };

        const piece: Piece = new Piece(pieceInit);

        this.pieces.push(piece);
        return piece;
    }

    public setPiecePosition(piece: Piece, x: number, y: number): void {
        const position = this.getPosition(x, y);

        if (!position) {
            throw {
                message: "Unexpected missing position",
                piece: piece,
                x: x,
                y: y,
                position: position,
            };
        }

        return piece.setPosition(position);
    }

    public flipBoardOrientation(disableAnimations?: boolean): void {
        if (this.boardOrientation === 'flipped') {
            this.setBoardOrientation('normal', disableAnimations);
        } else {
            this.setBoardOrientation('flipped', disableAnimations);
        }
    }

    public setBoardOrientation(boardOrientation: BoardOrientation, disableAnimations?: boolean): void {
        this.boardOrientation = boardOrientation;

        for (const piece of this.pieces) {
            const boardPosition = this.getBoardPositionStyles(piece.x, piece.y);

            piece.left = boardPosition.left;
            piece.top = boardPosition.top;

            piece.disableAnimations = disableAnimations || false;
        }

        setTimeout(() => {
            for (const piece of this.pieces) {
                piece.disableAnimations = false;
            }
        }, 0);
    }

    static getBoardPositionStyles(boardOrientation: BoardOrientation, x: number, y: number): BoardPositionStyles {
        let left = "0";
        let top = "0";

        if (boardOrientation === 'normal') {
            left = `${x * 12.5}%`;
            top = `${y * 12.5}%`;
        } else {
            left = `${(7 - x) * 12.5}%`;
            top = `${(7 - y) * 12.5}%`;
        }

        return {
            left: left,
            top: top,
        }
    }

    public getBoardPositionStyles(x: number, y: number): BoardPositionStyles {
        return BoardManager.getBoardPositionStyles(this.boardOrientation, x, y);
    }

    private _getInitalizedBoard(): Board {
        const board: Board = [];

        for (let _y = 0; _y < 8; _y++) {
            board.push([]);

            for (let _x = 0; _x < 8; _x++) {
                const space: Space = new Space({
                    x:_x, 
                    y:_y,
                    getBoard: () => {
                        return this;
                    },
                });

                board[_y].push({
                    space: space,
                });
            }
        }

        return board;
    }

    public setStartingPieces(): void {
        if (this.pieces && this.pieces.length) {
            throw {
                message: "Unexpected pieces already defined and set",
            }
        }

        for (let i = 0; i < 8; i++) {
            this.pushPiece('white', 'pawn', i, 6);
        }

        for (let i = 0; i < 8; i++) {
            this.pushPiece('black', 'pawn', i, 1);
        }

        this.pushPiece('white', 'rook', 0, 7);
        this.pushPiece('white', 'knight', 1, 7);
        this.pushPiece('white', 'bishop', 2, 7);
        this.pushPiece('white', 'queen', 3, 7);

        this.pushPiece('white', 'bishop', 5, 7);
        this.pushPiece('white', 'knight', 6, 7);
        this.pushPiece('white', 'rook', 7, 7);

        this.pushPiece('black', 'rook', 0, 0);
        this.pushPiece('black', 'knight', 1, 0);
        this.pushPiece('black', 'bishop', 2, 0);
        this.pushPiece('black', 'queen', 3, 0);

        this.pushPiece('black', 'bishop', 5, 0);
        this.pushPiece('black', 'knight', 6, 0);
        this.pushPiece('black', 'rook', 7, 0);

        this.pushPiece('white', 'king', 4, 7);
        this.pushPiece('black', 'king', 4, 0);
    }
    
    public kingIsInCheck(color: PieceColor): boolean {
        for (let piece of this.pieces) {
            if (piece.color === color) {
                continue;
            }

            const availableMoves: BoardPosition[] = piece.getAvailableMoves();

            for (const move of availableMoves) {
                if (move.piece && move.piece.pieceType === 'king') {
                    return true;
                }
            }
        }

        return false;
    }
}
