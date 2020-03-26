import { Coords, Space, GetBoardManagerFunc, GetPositionFunc } from './space';
import { BoardPosition, BoardHistory } from './board';

export type PieceColor = 'white' | 'black';
export type PieceType = 'bishop' | 'king' | 'knight' | 'pawn' | 'queen' | 'rook';

export type GetSpaceFunc = () => Space;

export interface PieceInit extends Coords {
    color: PieceColor;
    pieceType: PieceType;
    getBoard: GetBoardManagerFunc;
}

export class Piece implements Coords {
    color: PieceColor;
    pieceType: PieceType;

    x: number;
    y: number;

    active: boolean;

    left: string;
    top: string;

    dragging: boolean;
    touchDragging: boolean;

    disableAnimations: boolean;

    getBoardManager: GetBoardManagerFunc;
    getPosition: GetPositionFunc;
    getSpace: GetSpaceFunc;

    constructor(pieceInit: PieceInit) {
        this.getBoardManager = () => {
            return pieceInit.getBoard();
        };

        this.getPosition = () => {
            const _position = this.getBoardManager().getPosition(pieceInit.x, pieceInit.y);
            if (!_position) {
                throw {
                    message: "Unexpected _position",
                    x: pieceInit.x,
                    y: pieceInit.y,
                };
            }

            return _position;
        }

        this.getPosition().piece = this;

        this.getSpace = () => {
            return this.getPosition().space;
        };

        const space = this.getSpace();

        if (space.piece) {
            throw {
                message: "Unxpected space already has piece",
                space: space,
                piece: this,
            };
        }
        
        this.getSpace().piece = this;

        const boardPositionStyles = this.getBoardManager().getBoardPositionStyles(pieceInit.x, pieceInit.y);

        this.color = pieceInit.color;
        this.pieceType = pieceInit.pieceType;

        this.x = pieceInit.x;
        this.y = pieceInit.y;

        this.active = true;

        this.left = boardPositionStyles.left;
        this.top = boardPositionStyles.top;

        this.dragging = false;
        this.touchDragging = false;
        this.disableAnimations = false;
    }

    public setPosition(boardPosition: BoardPosition): void {
        const oldPosition = this.getPosition();

        if (oldPosition.piece === this) {
            oldPosition.piece = undefined;
        }

        if (oldPosition.space.piece === this) {
            oldPosition.space.piece = undefined;
        }

        this.x = boardPosition.space.x;
        this.y = boardPosition.space.y;

        this.getPosition = () => {
            return boardPosition;
        }

        boardPosition.piece = this;
        boardPosition.space.piece = this;

        const boardPositionStyles = this.getBoardManager().getBoardPositionStyles(boardPosition.space.x, boardPosition.space.y);

        this.left = boardPositionStyles.left;
        this.top = boardPositionStyles.top;
    }

    public resetBoardPositionStyles() {
        const boardPositionStyles = this.getBoardManager().getBoardPositionStyles(this.x, this.y);

        this.left = boardPositionStyles.left;
        this.top = boardPositionStyles.top;
    }
    
    private getPositionIfAvailable(relativeX: number, relativeY: number): BoardPosition | undefined {
        const position = this.getBoardManager().getPosition(this.x + relativeX, this.y + relativeY);

        if (!position) {
            return;
        }

        console.log(position);

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

    public getAvailableMoves(): BoardPosition[] {
        let positions: BoardPosition[] = [];

        if (this.pieceType === 'pawn') {
            positions = this.getAvailablePawnMoves();
        } else if (this.pieceType === 'knight') {
            positions = this.getKnightMoveToSpaces();
        } else if (this.pieceType === 'bishop') {
            positions = this.getBishopMoveToSpaces();
        } else if (this.pieceType === 'rook') {
            positions = this.getRookMoveToSpaces();
        } else if (this.pieceType === 'queen') {
            positions = this.getBishopMoveToSpaces();
            positions.push(...this.getRookMoveToSpaces());
        } else if (this.pieceType === 'king') {
            positions = this.getKingMoveToSpaces();
        }

        return positions;
    }

    // TODO: Handle checking for EnPassant
    public checkEnPassant() {
        // // En passant
        // if (this.pieceType === 'pawn' && relativeX !== 0) {
        //     if (this.color === 'white' && this.y === 3 && this.getBoardManager().history[this.getBoardManager().history.length - 1].black?.pawnMovedTwoSpaces) {
        //         const twoMovedPosition = this.getBoardManager().getPosition(this.x + relativeX, this.y);
        //         const twoMovedPosition2 = this.getBoardManager().history[this.getBoardManager().history.length - 1].black?.newPosition;
        //         console.log(twoMovedPosition, twoMovedPosition2);
                
        //         if (twoMovedPosition === twoMovedPosition2) {
        //             return position;
        //         }
        //     } else if (this.color === 'black' && this.y === 4 && this.getBoardManager().history[this.getBoardManager().history.length - 1].white.pawnMovedTwoSpaces) {
        //         const twoMovedPosition = this.getBoardManager().getPosition(this.x + relativeX, this.y);
                
        //         if (twoMovedPosition && twoMovedPosition.piece && twoMovedPosition.piece.color === 'white' && twoMovedPosition.piece.pieceType === 'pawn') {
        //             return position;
        //         }
        //     }
        // }
    }

    public getAvailablePawnMoves(): BoardPosition[] {
        const positions: BoardPosition[] = [];

        // -1 for white, 1 for black
        const isWhiteMultiplier = this.color === 'white' ? -1 : 1;

        const position1 = this.getPositionIfAvailable(0, isWhiteMultiplier);

        if (position1) {
            positions.push(position1);
            if (this.y === 6 && this.color === 'white' || this.y === 1 && this.color === 'black') {
                const position2 = this.getPositionIfAvailable(0, 2 * isWhiteMultiplier);

                if (position2) {
                    positions.push(position2);
                }
            }
        }

        const position3 = this.getPositionIfAvailable(-1, isWhiteMultiplier);

        if (position3) {
            positions.push(position3);
        }

        const position4 = this.getPositionIfAvailable(1, isWhiteMultiplier);

        if (position4) {
            positions.push(position4);
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

    public getKingMoveToSpaces(): BoardPosition[] {
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

        // TODO: Check for casting

        return positions;
    }
    
    canMoveToPosition(position: BoardPosition): boolean {
        const availableMoves = this.getAvailableMoves();

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
            return 'N';
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

    public moveToPosition(newPosition: BoardPosition): BoardHistory | undefined {
        if (this.canMoveToPosition(newPosition)) {
            const oldPosition = this.getPosition();

            const otherPiece = newPosition.piece;
            this.setPosition(newPosition);
            let moveNotation = '';

            moveNotation += this.getNotationPosition();

            // Capture
            if (otherPiece) {
                otherPiece.active = false;

                if (this.pieceType === 'pawn') {
                    moveNotation = `${oldPosition.space.getHorizontalNotation()}x${moveNotation}`;
                } else {
                    moveNotation = moveNotation.slice(0, 1) + 'x' + moveNotation.slice(1);
                }
            }

            // Disambiguating moves (two or more identical pieces can move to the same square)
            // TODO

            // Pawn promotion
            // TODO
            // moveNotation += '/Q';

            // Castling
            // TODO

            // Check
            const putsEnemyInCheck = this.getBoardManager().kingIsInCheck(this.color === 'white' ? 'black' : 'white');

            if (putsEnemyInCheck) {
                moveNotation += '+';
            }

            // Checkmate
            // TODO
            // moveNotation += '#';

            const boardHistory: BoardHistory = {
                moveNotation: moveNotation,
                movingPiece: this,
                capturedPiece: otherPiece,
                oldPosition: oldPosition,
                newPosition: newPosition,
            };

            if (this.pieceType === 'pawn') {
                if (this.color === 'white' && oldPosition.space.y - newPosition.space.y === 2) {
                    boardHistory.pawnMovedTwoSpaces = true;
                } else if (this.color === 'black' && newPosition.space.y - oldPosition.space.y === 2) {
                    boardHistory.pawnMovedTwoSpaces = true;
                }
            }

            if (this.color === 'white') {
                this.getBoardManager().history.push({
                    'white': boardHistory
                });
                this.getBoardManager().turn = 'black';
            } else {
                this.getBoardManager().history[this.getBoardManager().history.length - 1].black = boardHistory;
                this.getBoardManager().turn = 'white';
            }

            console.log(moveNotation, boardHistory);

            return boardHistory;
        }

        return;
    }
}
