import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SpaceComponent } from './components/space/space.component';
import { DraggableSpaceComponent } from './components/draggableSpace/draggableSpace.component';

export type Coord = number & (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7);

export type BoardOrientation = 'normal' | 'flipped';

export type PieceType = 'bishop' | 'king' | 'knight' | 'pawn' | 'queen' | 'rook';

export type PieceColor = 'white' | 'black';

export interface Piece {
    color: PieceColor;
    pieceType: PieceType;

    active: boolean;

    x: number;
    y: number;
    left: string;
    top: string;

    dragging: boolean;
    touchDragging: boolean;

    disableAnimations: boolean;
}

export class Board {
    spaces: Space[][];
    pieces: Piece[];
    pieceMap: {
        piece?: (Piece | undefined);
        x: number;
        y: number;
    }[][];

    boardOrientation: BoardOrientation;

    constructor(boardOrientation?: BoardOrientation, pieces?: Piece[], spaces?: Space[][]) {
        this.spaces = spaces || this._getCleanRows();
        this.pieces = [];
        this.pieceMap = [];

        this._initEmptyPieces();

        if (pieces) {
            for (const piece of pieces) {
                this.pushPiece(piece.color, piece.pieceType, piece.x, piece.y);
            }
        }

        this.boardOrientation = boardOrientation || 'normal';
    }

    private _initEmptyPieces() {
        this.pieces = [];
        this.pieceMap = [];

        for (let _y = 0; _y < 8; _y++) {
            this.pieceMap.push([]);

            for (let _x = 0; _x < 8; _x++) {
                this.pieceMap[_y].push({
                    piece: undefined,
                    x: _x,
                    y: _y,
                });
            }
        }
    }

    private isAvailableSpaceForPiece(piece: Piece, x: number, y: number): Space | undefined {
        const check = this.checkSpaceFromPiece(piece, x, y);
        console.log(check);

        // const _x = piece.x + x;
        // const _y = piece.y + y;

        if (!check.space) {
            console.log(check.space);
            return undefined;
        }

        if (!check.piece) {
            if (piece.pieceType === 'pawn') {
                if (x === 0) {
                    return check.space;
                }

                return undefined;
            }
            return check.space;
        }

        if (check.piece.color !== piece.color) {
            if (piece.pieceType === 'pawn') {
                if (x !== 0) {
                    return check.space;
                }

                return undefined;
            }

            return check.space;
        }

        return undefined;
    }

    public getPawnMoveToSpaces(piece: Piece): Space[] {
        const spaces: Space[] = [];

        // -1 for white, 1 for black
        const isWhiteMultiplier = piece.color === 'white' ? -1 : 1;

        const space1 = this.isAvailableSpaceForPiece(piece, 0, isWhiteMultiplier);

        if (space1) {
            spaces.push(space1);
            if (piece.y === 6 && piece.color === 'white' || piece.y === 1 && piece.color === 'black') {
                const space2 = this.isAvailableSpaceForPiece(piece, 0, 2 * isWhiteMultiplier);

                if (space2) {
                    spaces.push(space2);
                }
            }
        }

        const space3 = this.isAvailableSpaceForPiece(piece, -1, isWhiteMultiplier);

        if (space3) {
            spaces.push(space3);
        }

        const space4 = this.isAvailableSpaceForPiece(piece, 1, isWhiteMultiplier);

        if (space4) {
            spaces.push(space4);
        }

        return spaces;
    }

    public getKnightMoveToSpaces(piece: Piece): Space[] {
        const spaces: Space[] = [];

        const space1 = this.isAvailableSpaceForPiece(piece, 1, 2);

        if (space1) {
            spaces.push(space1);
        }
        const space2 = this.isAvailableSpaceForPiece(piece, -1, 2);

        if (space2) {
            spaces.push(space2);
        }

        const space3 = this.isAvailableSpaceForPiece(piece, 2, 1);

        if (space3) {
            spaces.push(space3);
        }

        const space4 = this.isAvailableSpaceForPiece(piece, -2, 1);

        if (space4) {
            spaces.push(space4);
        }

        const space5 = this.isAvailableSpaceForPiece(piece, 1, -2);

        if (space5) {
            spaces.push(space5);
        }
        const space6 = this.isAvailableSpaceForPiece(piece, -1, -2);

        if (space6) {
            spaces.push(space6);
        }

        const space7 = this.isAvailableSpaceForPiece(piece, 2, -1);

        if (space7) {
            spaces.push(space7);
        }

        const space8 = this.isAvailableSpaceForPiece(piece, -2, -1);

        if (space8) {
            spaces.push(space8);
        }

        return spaces;
    }

    public getMoveToSpaces(piece: Piece, configureUI: boolean): Space[] {
        let spaces: Space[] = [];

        if (piece) {
            if (piece.pieceType === 'pawn') {
                spaces = this.getPawnMoveToSpaces(piece);
            }

            if (piece.pieceType === 'knight') {
                spaces = this.getKnightMoveToSpaces(piece);
            }
        }

        if (configureUI) {
            this.hideMovementDots();

            for (const space of spaces) {
                space.showDot = true;
            }

            console.log(spaces);
        }

        return spaces;
    }

    public hideMovementDots(): void {
        for (const row of this.spaces) {
            for (const space of row) {
                space.showDot = false;
            }
        }
    }

    public checkSpaceFromPiece(piece: Piece, x: number, y: number): {piece?: Piece, space?: Space} {
        const _x = piece.x + x;
        const _y = piece.y + y;

        return this.checkSpace(_x, _y);
    }

    public checkSpace(x: number, y: number): {piece?: Piece, space?: Space} {
        if (x < 0 || y < 0 || x > 7 || y > 7) {
            return {
                piece: undefined,
                space: undefined,
            };
        }

        return {
            piece: this.pieceMap[y][x].piece,
            space: this.spaces[y][x],
        };
    }

    public pushPiece(color: PieceColor, pieceType: PieceType, x: number, y: number): Piece {
        const _piece: Piece | undefined = this.checkSpace(x, y).piece;

        if (_piece) {
            throw {
                message: 'Piece already exists on this space',
                x: x,
                y: y,
                _piece: _piece,
            };
        }

        const boardPosition = this.getBoardPosition(x, y);

        const piece: Piece = {
            color: color,
            pieceType: pieceType,

            active: true,
            
            x: x,
            y: y,
            left: boardPosition.left,
            top: boardPosition.top,

            dragging: false,
            touchDragging: false,
            
            disableAnimations: false,
        };

        this.pieces.push(piece);
        this.pieceMap[y][x].piece = piece;
        return piece;
    }

    public movePiece(piece: Piece, x: number, y: number): void {
        this.pieceMap[piece.y][piece.x].piece = undefined;
        this.pieceMap[y][x].piece = piece;

        piece.x = x;
        piece.y = y;

        const boardPosition = this.getBoardPosition(x, y);

        piece.left = boardPosition.left;
        piece.top = boardPosition.top;
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
            const boardPosition = this.getBoardPosition(piece.x, piece.y);

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

    private getBoardPosition(x: number, y: number): {left: string, top: string} {
        let left = "0";
        let top = "0";

        if (this.boardOrientation === 'normal') {
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

    private _getCleanRows(): Space[][] {
        const spaces: Space[][] = [];

        for (let _y = 0; _y < 8; _y++) {
            spaces.push([]);

            for (let _x = 0; _x < 8; _x++) {
                spaces[_y].push({
                    index: _x * 8 + _y,
                    x: _x,
                    y: _y,
                    showDot: false,
                });
            }
        }

        return spaces;
    }

    public initializeBoard(): void {
        this._initEmptyPieces();

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
}

export interface Space {
    index: number;
    x: number;//Coord;
    y: number;//Coord;
    spaceComponent?: SpaceComponent;
    draggableSpaceComponent?: DraggableSpaceComponent;
    showDot: boolean;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
    title = 'chess';

    board?: Board;

    constructor() {
        
    }

    ngOnInit() {
        this.board = new Board();
        this.board.initializeBoard();
    }

    ngAfterViewInit() {
    }
}
