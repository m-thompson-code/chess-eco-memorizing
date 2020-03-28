import { Piece, PieceColor, PieceType, PieceInit, PromotePieceType } from './piece';
import { BoardPosition } from '@app/types/boardPosition';

export type BoardOrientation = 'normal' | 'flipped';

export interface BoardHistory {
    pawnMovedTwoSpaces?: boolean;
    moveNotation: string;
    movingPiece: Piece;
    capturedPiece?: Piece;
    oldPosition: BoardPosition;
    newPosition: BoardPosition;
    castle?: {
        rook: Piece;
        oldRookPosition: BoardPosition;
    };
    enPassante?: {
        pawn: Piece;
        oldPawnPosition: BoardPosition;
    };
    promote?: {
        pieceType: PromotePieceType;
    };
}

export interface BoardPositionStyles {
    left: string;
    top: string;
}

export type Board = {
    [y: number] : {
        [x: number] : BoardPosition;
    }
} & BoardPosition[][];

export class BoardManager {
    public board: Board;
    public pieces: Piece[];

    public activePosition?: BoardPosition;

    public movedToPosition?: BoardPosition;
    public movedFromPosition?: BoardPosition;

    public history: {
        'white' : BoardHistory;
        'black'? : BoardHistory;
    }[];
    
    public turnCount: number;

    public turn: PieceColor;

    public blackKingIsInCheck: boolean;
    public whiteKingIsInCheck: boolean;

    public boardOrientation: BoardOrientation;
    public showingDotsFor?: Piece;

    constructor(boardOrientation?: BoardOrientation) {
        this.boardOrientation = boardOrientation || 'normal';

        this.board = this._getInitalizedBoard();
        this.pieces = [];

        this.history = [];
        this.turnCount = 0;

        this.turn = 'white';

        this.blackKingIsInCheck = false;
        this.whiteKingIsInCheck = false;

        this.setStartingPieces();
    }

    public hideMovementDots(): void {
        if (!this.showingDotsFor) {
            return;
        }

        for (const row of this.board) {
            for (const position of row) {
                position.showDot = false;
                position.showBigDot = false;
            }
        }

        this.showingDotsFor = undefined;
    }

    // TODO: Handle showing bit dot for En passant
    public showMovementDots(piece: Piece): void {
        if (this.showingDotsFor === piece) {
            return;
        }

        const moves: BoardPosition[] = piece.getAvailableMoves(true, true);

        this.hideMovementDots();

        for (const position of moves) {
            position.showDot = true;
        }

        // Handle En Passante
        if (piece.checkEnPassante(-1)) {
            const leftPosition = this.getPosition(piece.x - 1, piece.y + (piece.color === 'white' ? -1 : 1));
            if (leftPosition) {
                leftPosition.showBigDot = true;
            }
        }
        if (piece.checkEnPassante(1)) {
            const rightPosition = this.getPosition(piece.x + 1, piece.y + (piece.color === 'white' ? -1 : 1));
            if (rightPosition) {
                rightPosition.showBigDot = true;
            }
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
        const position: BoardPosition | undefined = this.getPosition(x, y);

        if (!position) {
            throw {
                message: `Position doesn't exist`,
                x: x,
                y: y,
                position: position,
                color: color,
                pieceType: pieceType,
            };
        }

        if (position.piece) {
            throw {
                message: 'Piece already exists on this position',
                x: x,
                y: y,
                position: position,
                color: color,
                pieceType: pieceType,
            };
        }

        const pieceInit: PieceInit = {
            position: position,
            color: color,
            pieceType: pieceType,
            boardManager: this,
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
                const position: BoardPosition = new BoardPosition({
                    x:_x, 
                    y:_y,
                    getBoard: () => {
                        return this;
                    },
                });

                board[_y].push(position);
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

    public kingIsThreatened(kingColor: PieceColor): boolean {
        for (let piece of this.pieces) {
            if (piece.color === kingColor) {
                continue;
            }

            if (!piece.active) {
                continue;
            }

            const availableMoves: BoardPosition[] = piece.getAvailableMoves(false, false);

            for (const move of availableMoves) {
                if (move.piece && move.piece.pieceType === 'king') {
                    return true;
                }
            }
        }

        return false;
    }
    
    public positionIsThreatened(enemyColor: PieceColor, position: BoardPosition): boolean {
        for (let piece of this.pieces) {
            if (piece.color !== enemyColor) {
                continue;
            }
            
            if (!piece.active) {
                continue;
            }

            const availableMoves: BoardPosition[] = piece.getAvailableMoves(false, false);

            for (const move of availableMoves) {
                if (move === position) {
                    return true;
                }
            }
        }

        return false;
    }

    public popMoveHistroy(updateUI: boolean): BoardHistory | undefined {
        if (!this.turnCount) {
            return;
        }

        let boardHistory: BoardHistory | undefined = undefined;

        const whiteMove: boolean = this.turn === 'white';//!(this.turnCount % 2);//this.color === 'white';

        if (whiteMove) {
            boardHistory = this.history[this.history.length - 1].black;
            this.history[this.history.length - 1].black = undefined;

            this.turn = 'black';
            this.blackKingIsInCheck = this.kingIsThreatened('black');
        } else {
            boardHistory = this.history.pop()?.white;

            this.turn = 'white';
            this.whiteKingIsInCheck = this.kingIsThreatened('white');
        }

        // console.log(boardHistory);

        if (boardHistory) {
            const _capturedPiece = boardHistory.capturedPiece;

            if (_capturedPiece) {
                _capturedPiece.setPosition(boardHistory.newPosition);
                _capturedPiece.active = true;
            }

            // Handling undoing a castling
            const _rookPiece = boardHistory.castle?.rook;
            const _oldRookPosition = boardHistory.castle?.oldRookPosition;

            if (_rookPiece && _oldRookPosition) {
                _rookPiece.setPosition(_oldRookPosition);
            }

            // Handling undoing an en passante
            const _pawnPiece = boardHistory.enPassante?.pawn;
            const _oldPawnPosition = boardHistory.enPassante?.oldPawnPosition;
            if (_pawnPiece && _oldPawnPosition) {
                _pawnPiece.setPosition(_oldPawnPosition);
                _pawnPiece.active = true;
            }

            const _movingPiece = boardHistory.movingPiece;
            _movingPiece.setPosition(boardHistory.oldPosition);

            if (boardHistory.promote) {
                _movingPiece.pieceType = 'pawn';
            }

            _movingPiece.moveCount -= 1;
        }

        this.turnCount -= 1;

        // UI
        if (updateUI) {
            if (whiteMove) {
                this.movedFromPosition = this.history[this.history.length - 1]?.white.oldPosition;
                this.movedToPosition = this.history[this.history.length - 1]?.white.newPosition;
            } else {
                this.movedFromPosition = this.history[this.history.length - 1]?.black?.oldPosition;
                this.movedToPosition = this.history[this.history.length - 1]?.black?.newPosition;
            }
    
            if (boardHistory) {
                if (boardHistory.capturedPiece) {
                    boardHistory.capturedPiece.resetBoardPositionStyles();
                }

                // Handling undoing a castling
                const _rookPiece = boardHistory.castle?.rook;
                if (_rookPiece) {
                    _rookPiece.resetBoardPositionStyles();
                }

                boardHistory.movingPiece.resetBoardPositionStyles();
            }
            
            this.activePosition = undefined;

            this.hideMovementDots();
        }
        // End UI
        
        return boardHistory;
    }

    public pushMoveHistroy(boardHistory: BoardHistory, updateUI: boolean): BoardHistory {
        const whiteMove: boolean = this.turn === 'white';//!(this.turnCount % 2);//this.color === 'white';

        if (whiteMove) {
            this.history.push({
                'white': boardHistory
            });
            this.turn = 'black';
            this.blackKingIsInCheck = this.kingIsThreatened('black');
        } else {
            this.history[this.history.length - 1].black = boardHistory;
            this.turn = 'white';
            this.whiteKingIsInCheck = this.kingIsThreatened('white');
        }

        // console.log(boardHistory);

        this.turnCount += 1;

        if (updateUI) {
            this.movedFromPosition = boardHistory.oldPosition;
            this.movedToPosition = boardHistory.newPosition;
        }

        return boardHistory;
    }

    public moveUsingNotation(notation: string): BoardHistory | undefined {
        let boardHistory: BoardHistory | undefined = undefined;

        if (notation === 'O-O') {
            if (this.turn === 'white') {
                const position = this.getPosition(4, 7);

                const piece = position?.piece;

                if (piece && piece.pieceType === 'king') {
                    const newPosition = this.getPosition(6, 7);

                    if (newPosition) {
                        boardHistory = piece.moveToPosition(newPosition, true);
                    }
                }
            } else {
                const position = this.getPosition(4, 0);

                const piece = position?.piece;

                if (piece && piece.pieceType === 'king') {
                    const newPosition = this.getPosition(6, 0);

                    if (newPosition) {
                        boardHistory = piece.moveToPosition(newPosition, true);
                    }
                }
            }
        }

        if (notation === 'O-O-O') {
            if (this.turn === 'white') {
                const position = this.getPosition(4, 7);

                const piece = position?.piece;

                if (piece && piece.pieceType === 'king') {
                    const newPosition = this.getPosition(1, 7);

                    if (newPosition) {
                        boardHistory = piece.moveToPosition(newPosition, true);
                    }
                }
            } else {
                const position = this.getPosition(4, 0);

                const piece = position?.piece;

                if (piece && piece.pieceType === 'king') {
                    const newPosition = this.getPosition(1, 0);

                    if (newPosition) {
                        boardHistory = piece.moveToPosition(newPosition, true);
                    }
                }
            }
        } else {
            const firstLetter = notation.substring(0, 1);
            let movementNotation = "";
    
            const pieceType = this.getPieceTypeFromNotationLetter(firstLetter);
    
            let filteredPieces = [];
    
            let _notation = notation;
    
            if (_notation.charAt(_notation.length - 1) === '+' || _notation.charAt(_notation.length - 1) === '#') {
                _notation = _notation.substring(0, _notation.length - 1);
            }
            
            movementNotation = _notation.substring(_notation.length - 2, _notation.length);

            const moveToPosition = this.getPositionByNotation(movementNotation);

            if (!moveToPosition) {
                throw {
                    message: "Unexpected moveToPosition",
                    moveToPosition: moveToPosition,
                    notation: notation,
                    _notation: _notation,
                }
            }

            for (const piece of this.pieces) {
                if (!piece.active || piece.color !== this.turn || piece.pieceType !== pieceType) {
                    continue;
                }

                const availableMoves = piece.getAvailableMoves(true, true);

                if (!availableMoves.includes(moveToPosition)) {
                    continue;
                }

                filteredPieces.push(piece);
            }

            if (filteredPieces.length > 1) {
                const _filteredPieces: Piece[] = [];

                for (const piece of filteredPieces) {
                    const h = piece.getHorizontalNotation();
                    let letters = piece.getNotationName();

                    if (letters !== h) {
                        letters += h;
                    }

                    console.log(letters, _notation);

                    if (_notation.startsWith(letters)) {
                        _filteredPieces.push(piece);
                    }
                }

                console.log(_filteredPieces);

                if (_filteredPieces.length === 1) {
                    filteredPieces = _filteredPieces;
                }
            }

            if (filteredPieces.length > 1) {
                const _filteredPieces: Piece[] = [];

                for (const piece of filteredPieces) {
                    const v = piece.getVerticalNotation();
                    let letters = piece.getNotationName() + v;

                    console.log(letters, _notation);

                    if (_notation.startsWith(letters)) {
                        _filteredPieces.push(piece);
                    }
                }

                console.log(_filteredPieces);


                if (_filteredPieces.length === 1) {
                    filteredPieces = _filteredPieces;
                }
            }
            
            if (filteredPieces.length > 1) {
                const _filteredPieces: Piece[] = [];

                for (const piece of filteredPieces) {
                    let letters = piece.getNotationPosition();

                    console.log(letters, _notation);

                    if (_notation.startsWith(letters)) {
                        _filteredPieces.push(piece);
                    }
                }

                console.log(_filteredPieces);

                if (_filteredPieces.length === 1) {
                    filteredPieces = _filteredPieces;
                }
            }

            if (filteredPieces.length === 1) {
                boardHistory = filteredPieces[0].moveToPosition(moveToPosition, true);

                if (boardHistory?.moveNotation !== notation) {
                    console.error("Mismatch notations", boardHistory?.moveNotation, notation);
                    if (boardHistory) {
                        this.popMoveHistroy(true);
                    }
                    return;
                }

                return filteredPieces[0].moveToPosition(moveToPosition, true);
            }
    
            throw {
                message: "Nope",
                filteredPieces: filteredPieces,
                pieceType: pieceType,
                movementNotation: movementNotation,
                firstLetter: firstLetter,
                moveToPosition: moveToPosition,
            };
        }

        if (!boardHistory) {
            console.error("moveUsingNotation is invalid", notation);
        }

        return;
    }

    getPositionByNotation(letters: string): BoardPosition | undefined {
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

        const hMap: {[h: string]: number} = {
            a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7,
        };
        const vMap: {[v: string]: number} = {
            '1': 7, '2': 6, '3': 5, '4': 4, '5': 3, '6': 2, '7': 1, '8': 0,
        };

        const hLetter = letters.charAt(0);
        const vLetter = letters.charAt(1);

        const x = hMap[hLetter];
        const y = vMap[vLetter];

        if (typeof x === 'undefined' || typeof y === 'undefined') {
            throw {
                message: "Invalid letters",
                letters: letters,
            };
        }

        return this.getPosition(x, y);
    }

    public getPieceTypeFromNotationLetter(letter: string): PieceType {
        if (letter === 'R') {
            return 'rook';
        }

        if (letter === 'N') {
            return 'knight';
        }
        
        if (letter === 'B') {
            return 'bishop';
        }
        
        if (letter === 'Q') {
            return 'queen';
        }

        if (letter === 'K') {
            return 'king';
        }

        if (['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].includes(letter)) {
            return 'pawn';
        }

        throw {
            message: "Unexpected letter",
        };
    }
}
