import { BoardHistory, BoardManager } from '@app/types/board';
import { BoardPosition, Coords, GetBoardManagerFunc, GetBoardPositionFunc } from '@app/types/boardPosition';

export type PieceColor = 'white' | 'black';
export type PieceType = 'bishop' | 'king' | 'knight' | 'pawn' | 'queen' | 'rook';
export type PromotePieceType = 'bishop' | 'knight' | 'queen' | 'rook';

export interface PieceInit {
    position: BoardPosition;
    color: PieceColor;
    pieceType: PieceType;
    boardManager: BoardManager;
}

export class Piece implements Coords {
    public color: PieceColor;
    public pieceType: PieceType;

    public x: number;
    public y: number;

    public active: boolean;

    public left: string;
    public top: string;

    public dragging: boolean;
    public touchDragging: boolean;

    public disableAnimations: boolean;

    public readonly getBoardManager: GetBoardManagerFunc;
    public getPosition: GetBoardPositionFunc;

    public moveCount: number;

    constructor(pieceInit: PieceInit) {
        this.getBoardManager = () => {
            return pieceInit.boardManager;
        };

        // Note that these values are only temporary since Position's set method for piece will update piece
        this.x = pieceInit.position.x;
        this.y = pieceInit.position.y;
        
        this.getPosition = () => {
            return pieceInit.position;
        };

        pieceInit.position.piece = this;
        // End Note that these values are only temporary since Position's set method for piece will update piece

        this.color = pieceInit.color;
        this.pieceType = pieceInit.pieceType;

        this.active = true;

        this.moveCount = 0;

        this.left = "0";
        this.top = "0";

        // Update styles based on pieceInit
        this.resetBoardPositionStyles();

        this.dragging = false;
        this.touchDragging = false;
        this.disableAnimations = false;
    }

    public setPosition(boardPosition: BoardPosition): void {
        // Position's set piece method will handle updating this instance
        boardPosition.piece = this;
    }

    public resetBoardPositionStyles() {
        this.setBoardPositionStyles(this.x, this.y);
    }
    
    public setBoardPositionStyles(x: number, y: number) {
        const boardPositionStyles = this.getBoardManager().getBoardPositionStyles(x, y);

        this.left = boardPositionStyles.left;
        this.top = boardPositionStyles.top;
    }
    
    private getPositionIfAvailable(relativeX: number, relativeY: number): BoardPosition | undefined {
        const position = this.getBoardManager().getPosition(this.x + relativeX, this.y + relativeY);

        if (!position) {
            return;
        }

        if (!position.piece) {
            if (this.pieceType === 'pawn') {
                if (relativeX === 0) {
                    return position;
                }

                return;
            }

            return position;
        }

        if (position.piece.color !== this.color) {
            if (this.pieceType === 'pawn') {
                if (relativeX !== 0) {
                    return position;
                }

                return;
            }

            return position;
        }

        return;
    }

    public getAvailableMoves(considerCheck: boolean, checkCasting: boolean): BoardPosition[] {
        let _positions: BoardPosition[] = [];

        if (this.pieceType === 'pawn') {
            _positions = this.getAvailablePawnMoves();
        } else if (this.pieceType === 'knight') {
            _positions = this.getKnightMoveToSpaces();
        } else if (this.pieceType === 'bishop') {
            _positions = this.getBishopMoveToSpaces();
        } else if (this.pieceType === 'rook') {
            _positions = this.getRookMoveToSpaces();
        } else if (this.pieceType === 'queen') {
            _positions = this.getBishopMoveToSpaces();
            _positions.push(...this.getRookMoveToSpaces());
        } else if (this.pieceType === 'king') {
            _positions = this.getKingMoveToSpaces(checkCasting);
        }

        if (!considerCheck) {
            return _positions;
        }

        const positions: BoardPosition[] = [];

        for (const _position of _positions) {
            if (this.checkIfMoveLeadsToCheck(_position)) {
                continue;
            }

            positions.push(_position);
        }

        return positions;
    }

    // TODO: Handle checking for EnPassante
    public checkEnPassante(relativeX: number): boolean {
        if (this.pieceType !== 'pawn') {
            return false;
        }

        // En Passante
        const _position = this.getBoardManager().getPosition(this.x + relativeX, this.y);

        const enemyColor = this.color === 'white' ? 'black' : 'white';
        if (_position && _position.piece && _position.piece.moveCount === 1 && _position.piece.pieceType === 'pawn' && _position.piece.color === enemyColor) {
            return true;
        }

        return false;
    }

    public getAvailablePawnMoves(): BoardPosition[] {
        const positions: BoardPosition[] = [];

        // -1 for white, 1 for black
        const isWhiteMultiplier = this.color === 'white' ? -1 : 1;

        const position1 = this.getPositionIfAvailable(0, isWhiteMultiplier);

        if (position1) {
            positions.push(position1);
            if (this.moveCount === 0) {
                const position2 = this.getPositionIfAvailable(0, 2 * isWhiteMultiplier);

                if (position2) {
                    positions.push(position2);
                }
            }
        }

        const position3 = this.getPositionIfAvailable(-1, isWhiteMultiplier);

        if (position3) {
            positions.push(position3);
        } else {
            if (this.checkEnPassante(-1)) {
                const __position3 = this.getBoardManager().getPosition(this.x - 1, this.y + isWhiteMultiplier);
                if (__position3) {
                    positions.push(__position3); 
                }
            }
        }

        const position4 = this.getPositionIfAvailable(1, isWhiteMultiplier);

        if (position4) {
            positions.push(position4);
        } else {
            if (this.checkEnPassante(1)) {
                const __position4 = this.getBoardManager().getPosition(this.x + 1, this.y + isWhiteMultiplier);
                if (__position4) {
                    positions.push(__position4); 
                }
            }
        }

        return positions;
    }

    public getKnightMoveToSpaces(): BoardPosition[] {
        const positions: BoardPosition[] = [];

        const position1 = this.getPositionIfAvailable(1, 2);

        if (position1) {
            positions.push(position1);
        }
        const position2 = this.getPositionIfAvailable(-1, 2);

        if (position2) {
            positions.push(position2);
        }

        const position3 = this.getPositionIfAvailable(2, 1);

        if (position3) {
            positions.push(position3);
        }

        const position4 = this.getPositionIfAvailable(-2, 1);

        if (position4) {
            positions.push(position4);
        }

        const position5 = this.getPositionIfAvailable(1, -2);

        if (position5) {
            positions.push(position5);
        }
        const position6 = this.getPositionIfAvailable(-1, -2);

        if (position6) {
            positions.push(position6);
        }

        const position7 = this.getPositionIfAvailable(2, -1);

        if (position7) {
            positions.push(position7);
        }

        const position8 = this.getPositionIfAvailable(-2, -1);

        if (position8) {
            positions.push(position8);
        }

        return positions;
    }
    
    public getBishopMoveToSpaces(): BoardPosition[] {
        const positions: BoardPosition[] = [];

        for (let i = 1; i < 8; i++) {
            const position = this.getPositionIfAvailable(i, i);

            if (!position) {
                break;
            }

            positions.push(position);
            
            if (position.piece) {
                break;
            }
        }

        for (let j = 1; j < 8; j++) {
            const position = this.getPositionIfAvailable(-j, j);

            if (!position) {
                break;
            }

            positions.push(position);
            
            if (position.piece) {
                break;
            }
        }

        for (let k = 1; k < 8; k++) {
            const position = this.getPositionIfAvailable(-k, -k);

            if (!position) {
                break;
            }

            positions.push(position);
            
            if (position.piece) {
                break;
            }
        }

        for (let m = 1; m < 8; m++) {
            const position = this.getPositionIfAvailable(m, -m);

            if (!position) {
                break;
            }

            positions.push(position);
            
            if (position.piece) {
                break;
            }
        }

        return positions;
    }

    public getRookMoveToSpaces(): BoardPosition[] {
        const positions: BoardPosition[] = [];

        for (let i = 1; i < 8; i++) {
            const position = this.getPositionIfAvailable(i, 0);

            if (!position) {
                break;
            }

            positions.push(position);
            
            if (position.piece) {
                break;
            }
        }

        for (let j = 1; j < 8; j++) {
            const position = this.getPositionIfAvailable(-j, 0);

            if (!position) {
                break;
            }

            positions.push(position);

            if (position.piece) {
                break;
            }
        }

        for (let k = 1; k < 8; k++) {
            const position = this.getPositionIfAvailable(0, k);

            if (!position) {
                break;
            }

            positions.push(position);
            
            if (position.piece) {
                break;
            }
        }

        for (let m = 1; m < 8; m++) {
            const position = this.getPositionIfAvailable(0, -m);

            if (!position) {
                break;
            }

            positions.push(position);
            
            if (position.piece) {
                break;
            }
        }

        return positions;
    }

    public getKingMoveToSpaces(checkCasting: boolean): BoardPosition[] {
        const positions: BoardPosition[] = [];

        const position1 = this.getPositionIfAvailable(1, 0);

        if (position1) {
            positions.push(position1);
        }
        const position2 = this.getPositionIfAvailable(1, 1);

        if (position2) {
            positions.push(position2);
        }

        const position3 = this.getPositionIfAvailable(1, -1);

        if (position3) {
            positions.push(position3);
        }

        const position4 = this.getPositionIfAvailable(0, 1);

        if (position4) {
            positions.push(position4);
        }

        const position5 = this.getPositionIfAvailable(0, -1);

        if (position5) {
            positions.push(position5);
        }
        const position6 = this.getPositionIfAvailable(-1, 0);

        if (position6) {
            positions.push(position6);
        }

        const position7 = this.getPositionIfAvailable(-1, 1);

        if (position7) {
            positions.push(position7);
        }

        const position8 = this.getPositionIfAvailable(-1, -1);

        if (position8) {
            positions.push(position8);
        }

        // Required for performance (and prevents crashes)
        if (checkCasting) {
            // Check for casting
            if (this.canPerformKingSideCastle()) {
                const kingSideCastlePosition = this.getBoardManager().getPosition(this.x + 2, this.y);
                const kingSideCastlePositionRook = this.getBoardManager().getPosition(this.x + 3, this.y);

                if (kingSideCastlePosition) {
                    positions.push(kingSideCastlePosition);
                }
                if (kingSideCastlePositionRook) {
                    positions.push(kingSideCastlePositionRook);
                }
            }
            // console.log("END canPerformKingSideCastle()");

            if (this.canPerformQueenSideCastle()) {
                const kingSideCastlePosition2 = this.getBoardManager().getPosition(this.x - 2, this.y);
                const kingSideCastlePositionRook2 = this.getBoardManager().getPosition(this.x - 4, this.y);

                if (kingSideCastlePosition2) {
                    positions.push(kingSideCastlePosition2);
                }
                if (kingSideCastlePositionRook2) {
                    positions.push(kingSideCastlePositionRook2);
                }
            }
            // console.log("END canPerformQueenSideCastle()");
        }

        return positions;
    }
    
    public canPerformKingSideCastle(): boolean {
        // console.log('canPerformKingSideCastle');
        if (this.moveCount || this.x !== 4) {
            return false;
        }

        if (this.color === 'white') {
            if (this.y !== 7) {
                return false;
            }
        } else {
            if (this.y !== 0) {
                return false;
            }
        }

        const position1 = this.getBoardManager().getPosition(this.x + 1, this.y);
        const position2 = this.getBoardManager().getPosition(this.x + 2, this.y);
        const rockPosition = this.getBoardManager().getPosition(this.x + 3, this.y);

        if (!position1 || !position2 || !rockPosition) {
            return false;
        }

        if (position1.piece || position2.piece) {
            return false;
        }

        if (rockPosition.piece?.pieceType === 'rook' && rockPosition.piece?.moveCount === 0 && rockPosition.piece?.color === this.color) {
            if (this.getBoardManager().kingIsThreatened(this.color)) {
                return false;
            }

            const enemyColor = this.color === 'black' ? 'white' : 'black';

            if (this.getBoardManager().positionIsThreatened(enemyColor, position1)) {
                return false;
            }

            if (this.getBoardManager().positionIsThreatened(enemyColor, position2)) {
                return false;
            }

            return true;
        }

        return false;
    }

    public canPerformQueenSideCastle(): boolean {
        // console.log('canPerformQueenSideCastle');

        if (this.moveCount || this.x !== 4) {
            return false;
        }

        if (this.color === 'white') {
            if (this.y !== 7) {
                return false;
            }
        } else {
            if (this.y !== 0) {
                return false;
            }
        }

        const position1 = this.getBoardManager().getPosition(this.x - 1, this.y);
        const position2 = this.getBoardManager().getPosition(this.x - 2, this.y);
        const position3 = this.getBoardManager().getPosition(this.x - 3, this.y);
        const rockPosition = this.getBoardManager().getPosition(this.x - 4, this.y);

        if (!position1 || !position2 || !position3 || !rockPosition) {
            return false;
        }

        if (position1.piece || position2.piece || position3.piece) {
            return false;
        }

        if (rockPosition.piece?.pieceType === 'rook' && rockPosition.piece?.moveCount === 0 && rockPosition.piece?.color === this.color) {
            if (this.getBoardManager().kingIsThreatened(this.color)) {
                return false;
            }

            const enemyColor = this.color === 'black' ? 'white' : 'black';

            if (this.getBoardManager().positionIsThreatened(enemyColor, position1)) {
                return false;
            }

            if (this.getBoardManager().positionIsThreatened(enemyColor, position2)) {
                return false;
            }
            
            if (this.getBoardManager().positionIsThreatened(enemyColor, position3)) {
                return false;
            }

            return true;
        }

        return false;
    }
    
    public canMoveToPosition(position: BoardPosition): boolean {
        const availableMoves = this.getAvailableMoves(true, true);

        for (const move of availableMoves) {
            if (move === position) {
                return true;
            }
        }

        return false;
    }

    public getNotationName(): string {
        if (this.pieceType === 'pawn') {
            return '';
        }
        
        if (this.pieceType === 'rook') {
            return 'R';
        }

        if (this.pieceType === 'knight') {
            return 'N';
        }
        
        if (this.pieceType === 'bishop') {
            return 'B';
        }
        
        if (this.pieceType === 'queen') {
            return 'Q';
        }

        if (this.pieceType === 'king') {
            return 'K';
        }
        
        throw {
            message: "Unknown notationName for piece",
            piece: this,
        }
    }

    public getHorizontalNotation(): string {
        const horizontalNotationlabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return horizontalNotationlabels[this.x];
    }
    
    public getVerticalNotation(): number {
        const verticalNotationlabels = [8, 7, 6, 5, 4, 3, 2, 1];
        return verticalNotationlabels[this.y];
    }

    public getNotationPosition(): string {
        const pieceName = this.getNotationName();
        const vLabel = this.getVerticalNotation();
        const hLabel = this.getHorizontalNotation();
        
        return pieceName + hLabel + vLabel;
    }

    public checkIfMoveLeadsToCheck(newPosition: BoardPosition): boolean {
        // Temporarily move piece to newPosition
        const oldPosition = this.getPosition();

        if (!oldPosition) {
            throw {
                message: "Unexpected missing oldPosition",
                oldPosition: oldPosition,
                this: this,
                newPosition: newPosition,
            };
        }

        const otherPiece = newPosition.piece;
        this.setPosition(newPosition);

        // Capture
        if (otherPiece) {
            otherPiece.active = false;
        }
        
        const boardHistory: BoardHistory = {
            moveNotation: 'TEMP',
            movingPiece: this,
            capturedPiece: otherPiece,
            oldPosition: oldPosition,
            newPosition: newPosition,
        };

        this.moveCount += 1;

        if (this.pieceType === 'pawn') {
            if (this.color === 'white' && oldPosition.y - newPosition.y === 2) {
                boardHistory.pawnMovedTwoSpaces = true;
            } else if (this.color === 'black' && newPosition.y - oldPosition.y === 2) {
                boardHistory.pawnMovedTwoSpaces = true;
            }
        }

        this.getBoardManager().pushMoveHistroy(boardHistory, false);

        const kingIsThreatened = this.getBoardManager().kingIsThreatened(this.color);

        // Move piece to back to oldPosition
        this.getBoardManager().popMoveHistroy(false);

        return kingIsThreatened;
    }

    private _moveToQueenSideCastlePosition(newPosition: BoardPosition, updateUI: boolean): BoardHistory | undefined {
        const oldPosition = this.getPosition();

        if (!oldPosition) {
            throw {
                message: "piece doesn't have oldPosition",
                this: this,
            };
        }

        if (this.pieceType === 'king') {
            // Queen side castle
            if (this.moveCount === 0) {
                if (newPosition.x === 7 || newPosition.x === 6) {
                    const castleToPosition = this.getBoardManager().getPosition(6, this.y);
                    const queenRookPosition = this.getBoardManager().getPosition(7, this.y);

                    if (!castleToPosition) {
                        throw {
                            message: "Unexpected missing castleToPosition",
                            piece: this,
                            newPosition: newPosition,
                            castleToPosition: castleToPosition,
                        };
                    }
                    
                    if (!queenRookPosition || !queenRookPosition.piece) {
                        throw {
                            message: "Unexpected missing queenRookPosition",
                            piece: this,
                            newPosition: newPosition,
                            queenRookPosition: queenRookPosition,
                        };
                    }

                    const queenRook = queenRookPosition.piece;
                    
                    const boardHistory: BoardHistory = {
                        moveNotation: 'O-O',
                        movingPiece: this,
                        capturedPiece: undefined,
                        oldPosition: oldPosition,
                        newPosition: castleToPosition,
                        castle: {
                            rook: queenRook,
                            oldRookPosition: queenRookPosition,
                        },
                    };

                    this.setPosition(castleToPosition);

                    const newKingRookPosition = this.getBoardManager().getPosition(5, this.y);
                    
                    if (!newKingRookPosition) {
                        throw {
                            message: "Unexpected missing newKingRookPosition",
                            newKingRookPosition: newKingRookPosition,
                            boardHistory: boardHistory,
                        };
                    }

                    queenRook.setPosition(newKingRookPosition);

                    if (updateUI) {
                        queenRook.resetBoardPositionStyles();
                    }

                    return boardHistory;
                }

                if (newPosition.x === 0 || newPosition.x === 2) {
                    const castleToPosition = this.getBoardManager().getPosition(2, this.y);
                    const queenRookPosition = this.getBoardManager().getPosition(0, this.y);

                    if (!castleToPosition) {
                        throw {
                            message: "Unexpected missing castleToPosition",
                            piece: this,
                            newPosition: newPosition,
                            castleToPosition: castleToPosition,
                        };
                    }
                    
                    if (!queenRookPosition || !queenRookPosition.piece) {
                        throw {
                            message: "Unexpected missing queenRookPosition",
                            piece: this,
                            newPosition: newPosition,
                            queenRookPosition: queenRookPosition,
                        };
                    }

                    const queenRook = queenRookPosition.piece;
                    
                    const boardHistory: BoardHistory = {
                        moveNotation: 'O-O-O',
                        movingPiece: this,
                        capturedPiece: undefined,
                        oldPosition: oldPosition,
                        newPosition: castleToPosition,
                        castle: {
                            rook: queenRook,
                            oldRookPosition: queenRookPosition,
                        },
                    };

                    this.setPosition(castleToPosition);

                    const newQueenRookPosition = this.getBoardManager().getPosition(3, this.y);
                    
                    if (!newQueenRookPosition) {
                        throw {
                            message: "Unexpected missing newQueenRookPosition",
                            newQueenRookPosition: newQueenRookPosition,
                            boardHistory: boardHistory,
                        };
                    }

                    queenRook.setPosition(newQueenRookPosition);

                    if (updateUI) {
                        queenRook.resetBoardPositionStyles();
                    }

                    return boardHistory;
                }
            }
        }

        return undefined;
    }

    // public promotePiece(piece: Piece, pieceType: PieceType, newPosition: BoardPosition) {

    // }

    public moveToPosition(newPosition: BoardPosition, updateUI: boolean, promotePieceType?: PromotePieceType): BoardHistory | undefined {
        if (!this.canMoveToPosition(newPosition)) {
            return;
        }

        const oldPosition = this.getPosition();

        if (!oldPosition) {
            throw {
                message: "piece doesn't have oldPosition",
                this: this,
            };
        }

        let boardHistory: BoardHistory | undefined = undefined;

        // Castling
        boardHistory = this._moveToQueenSideCastlePosition(newPosition, updateUI);

        let enPassanteData: undefined | {pawn: Piece, oldPawnPosition: BoardPosition} = undefined;

        // This move is a general move (not Casting)
        if (!boardHistory) {
            let moveNotation = this.getNotationName();// this.getNotationPosition();

            // Disambiguating moves (two or more identical pieces can move to the same square)
            // 1. Check horizontal notation
            // 2. Check vertical notation
            // 3. Check both
            const pieces = this.getBoardManager().pieces;
            let filteredPieces: Piece[] = [];

            for (const piece of pieces) {
                if (piece === this) {
                    continue;
                }

                if (!piece.active || piece.color !== this.color || piece.pieceType !== this.pieceType) {
                    continue;
                }
                
                const availableMoves = piece.getAvailableMoves(true, true);

                if (!availableMoves.includes(newPosition)) {
                    continue;
                }
                
                filteredPieces.push(piece);
            }
            // console.log(filteredPieces);

            // 1. Check horizontal notation
            if (filteredPieces.length) {
                let found = false;
                const h = this.getHorizontalNotation();
                for (const piece of filteredPieces) {
                    if (h === piece.getHorizontalNotation()) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    moveNotation += h;

                    filteredPieces = [];
                }
            }

            // 2. Check vertical notation
            if (filteredPieces.length) {
                let found = false;
                const v = this.getVerticalNotation();
                for (const piece of filteredPieces) {
                    if (v === piece.getVerticalNotation()) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    moveNotation += v;

                    filteredPieces = [];
                }
            }

            // 3. Check both
            if (filteredPieces.length) {
                let found = false;
                const v = this.getVerticalNotation();
                const h = this.getHorizontalNotation();
                for (const piece of filteredPieces) {
                    if (h === piece.getHorizontalNotation() && v === piece.getVerticalNotation()) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    moveNotation += h + v;
                    filteredPieces = [];
                }
            }
            
            const capturedPiece = newPosition.piece;

            this.setPosition(newPosition);

            // Capture
            if (capturedPiece) {
                capturedPiece.active = false;

                if (!moveNotation) {
                    moveNotation = oldPosition.getHorizontalNotation();
                }
                moveNotation += 'x';
            } else {
                // Check En Passante
                if (this.pieceType === 'pawn') {
                    this.setPosition(oldPosition);

                    if (newPosition.x === oldPosition.x - 1 && this.checkEnPassante(-1)) {
                        const _enPassantePosition = this.getBoardManager().getPosition(oldPosition.x - 1, oldPosition.y);
                        
                        if (!_enPassantePosition) {
                            throw {
                                message: "Unexpected missing _enPassantePosition",
                            };
                        }
    
                        const _enPassantePawn = _enPassantePosition.piece;
    
                        if (!_enPassantePawn) {
                            throw {
                                message: "Unexpected missing / invalid _enPassantePawn",
                                _enPassantePawn: _enPassantePawn,
                            };
                        }
    
                        _enPassantePawn.active = false;
    
                        if (!moveNotation) {
                            moveNotation = oldPosition.getHorizontalNotation();
                        }
                        moveNotation += 'x';
    
                        enPassanteData = {
                            pawn: _enPassantePawn,
                            oldPawnPosition: _enPassantePosition,
                        };
                    } else if (newPosition.x === oldPosition.x + 1 && this.checkEnPassante(1)) {
                        const _enPassantePosition = this.getBoardManager().getPosition(oldPosition.x + 1, oldPosition.y);
                        
                        if (!_enPassantePosition) {
                            throw {
                                message: "Unexpected missing _enPassantePosition",
                            };
                        }
    
                        const _enPassantePawn = _enPassantePosition.piece;
    
                        if (!_enPassantePawn) {
                            throw {
                                message: "Unexpected missing / invalid _enPassantePawn",
                                _enPassantePawn: _enPassantePawn,
                            };
                        }
    
                        _enPassantePawn.active = false;
    
                        if (!moveNotation) {
                            moveNotation = oldPosition.getHorizontalNotation();
                        }
                        moveNotation += 'x';
    
                        enPassanteData = {
                            pawn: _enPassantePawn,
                            oldPawnPosition: _enPassantePosition,
                        };
                    }

                    this.setPosition(newPosition);
                }
            }

            moveNotation += newPosition.getHorizontalNotation() + newPosition.getVerticalNotation();

            let promotePieceData: {
                pieceType: PromotePieceType;
            } | undefined = undefined;

            // Pawn promotion
            if (this.color === 'white' && newPosition.y === 0 || this.color === 'black' && newPosition.y === 7) {
                if (!promotePieceType) {
                    throw {
                        message: "Unexpected missing promotePieceType",
                        promotePieceType: promotePieceType,
                        piece: this,
                    };
                }
                
                this.pieceType = promotePieceType;
                moveNotation += '=' + this.getNotationName();

                promotePieceData = {
                    pieceType: promotePieceType
                };
            }

            // Check
            const putsEnemyInCheck = this.getBoardManager().kingIsThreatened(this.color === 'white' ? 'black' : 'white');

            if (putsEnemyInCheck) {
                const pieces = this.getBoardManager().pieces;

                let foundAvailableEnemyMove = false;
                for (const piece of pieces) {
                    if (!piece.active || piece.color === this.color) {
                        continue;
                    }

                    const availableMoves = piece.getAvailableMoves(true, false);

                    if (!availableMoves.length) {
                        continue;
                    }
                }

                if (foundAvailableEnemyMove) {
                    moveNotation += '+';
                } else {
                    // Checkmate
                    moveNotation += '#';
                }
            }

            boardHistory = {
                moveNotation: moveNotation,
                movingPiece: this,
                capturedPiece: capturedPiece,
                oldPosition: oldPosition,
                newPosition: newPosition,
            };

            if (this.pieceType === 'pawn') {
                if (this.color === 'white' && oldPosition.y - newPosition.y === 2) {
                    boardHistory.pawnMovedTwoSpaces = true;
                } else if (this.color === 'black' && newPosition.y - oldPosition.y === 2) {
                    boardHistory.pawnMovedTwoSpaces = true;
                }
            }

            if (enPassanteData) {
                boardHistory.enPassante = enPassanteData;
            }
            
            if (promotePieceData) {
                boardHistory.promote = promotePieceData;
            }
        }
        
        if (updateUI) {
            this.resetBoardPositionStyles();

            this.getBoardManager().activePosition = undefined;

            this.getBoardManager().hideMovementDots();
        }

        this.moveCount += 1;

        return this.getBoardManager().pushMoveHistroy(boardHistory, updateUI);
    }
}
