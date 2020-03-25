import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SpaceComponent } from './components/space/space.component';
import { DraggableSpaceComponent } from './components/draggableSpace/draggableSpace.component';
import { Piece, PieceName } from './components/board/board.component';

export type Coord = number & (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7);
export type BoardOrientation = 'normal' | 'flipped';

export class Board {
    rows: Space[][];
    pieces: Piece[];

    boardOrientation: BoardOrientation;

    constructor(boardOrientation?: BoardOrientation, pieces?: Piece[], rows?: Space[][]) {
        this.rows = rows || this._getCleanRows();
        this.pieces = pieces || [];

        this.boardOrientation = boardOrientation || 'normal';
    }

    public movePiece(piece: Piece, x: number, y: number): void {
        piece.x = x;
        piece.y = y;

        const boardPosition = this.getBoardPosition(x, y);

        piece.left = boardPosition.left;
        piece.top = boardPosition.top;
    }

    public flipBoardOrientation(): void {
        if (this.boardOrientation === 'flipped') {
            this.setBoardOrientation('normal');
        } else {
            this.setBoardOrientation('flipped');
        }
    }

    public setBoardOrientation(boardOrientation: BoardOrientation): void {
        this.boardOrientation = boardOrientation;

        for (const piece of this.pieces) {
            const boardPosition = this.getBoardPosition(piece.x, piece.y);

            piece.left = boardPosition.left;
            piece.top = boardPosition.top;
        }
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
        const rows: Space[][] = [];

        for (let _y = 0; _y < 8; _y++) {
            rows.push([]);

            for (let _x = 0; _x < 8; _x++) {
                rows[_y].push({
                    index: _x * 8 + _y,
                    x: _x,
                    y: _y,
                });
            }
        }

        return rows;
    }

    private _getInitalizedBoard(): Piece[] {
        const pieces = [];

        for (let i = 0; i < 8; i++) {
            pieces.push(this.getPiece('wp', i, 6));
        }

        pieces.push(this.getPiece('wr', 0, 7));
        pieces.push(this.getPiece('wn', 1, 7));
        pieces.push(this.getPiece('wb', 2, 7));
        pieces.push(this.getPiece('wq', 3, 7));

        pieces.push(this.getPiece('wk', 4, 7));
        pieces.push(this.getPiece('wb', 5, 7));
        pieces.push(this.getPiece('wn', 6, 7));
        pieces.push(this.getPiece('wr', 7, 7));


        pieces.push(this.getPiece('br', 0, 0));
        pieces.push(this.getPiece('bn', 1, 0));
        pieces.push(this.getPiece('bb', 2, 0));
        pieces.push(this.getPiece('bq', 3, 0));

        pieces.push(this.getPiece('bk', 4, 0));
        pieces.push(this.getPiece('bb', 5, 0));
        pieces.push(this.getPiece('bn', 6, 0));
        pieces.push(this.getPiece('br', 7, 0));


        for (let i = 0; i < 8; i++) {
            pieces.push(this.getPiece('bp', i, 1));
        }

        return pieces;
    }

    public initializeBoard(): void {
        this.pieces = this._getInitalizedBoard();
    }

    public getPiece(pieceName: PieceName, x: number, y: number): Piece {
        const boardPosition = this.getBoardPosition(x, y);

        const piece: Piece = {
            dragging: false,
            touchDragging: false,
            x: x,
            y: y,
            left: boardPosition.left,
            top: boardPosition.top,
            pieceName: pieceName,
        };

        return piece;
    }
}

export interface Space {
    index: number;
    x: number;//Coord;
    y: number;//Coord;
    spaceComponent?: SpaceComponent;
    draggableSpaceComponent?: DraggableSpaceComponent;
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
        this.board = new Board('flipped');
        this.board.initializeBoard();
    }

    ngAfterViewInit() {
    }
}
