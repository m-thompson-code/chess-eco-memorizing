import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import * as Hammer from "hammerjs";
import { CdkDragDrop, CdkDragEnd, CdkDragEnter, CdkDragExit, CdkDragMove, CdkDragRelease, CdkDragStart } from '@angular/cdk/drag-drop';
import { DragMoved, SpaceComponent } from './components/space/space.component';
import { DraggableSpaceComponent } from './components/draggableSpace/draggableSpace.component';
import { Piece, PieceName } from './components/board/board.component';

export type Coord = number & (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7);

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

    // @ViewChild('box', { static: false }) private box: ElementRef;

    // poor choice here, but to keep it simple
    // setting up a few vars to keep track of things.
    // at issue is these values need to be encapsulated
    // in some scope other than global.
    lastPosX:number = 0;
    lastPosY:number = 0;
    isDragging: boolean = false;

    rows: Space[][];

    activeSpace: Space;
    pieces: Piece[];

    constructor() {
        
    }

    ngOnInit() {
        this.rows = [];

        for (let _y = 0; _y < 8; _y++) {
            this.rows.push([]);

            for (let _x = 0; _x < 8; _x++) {
                this.rows[_y].push({
                    index: _x * 8 + _y,
                    x: _x,
                    y: _y,
                });
            }
        }

        this.pieces = [];

        for (let i = 0; i < 8; i++) {
            this.pieces.push(this.getPiece('wp', i, 6));
        }

        this.pieces.push(this.getPiece('wr', 0, 7));
        this.pieces.push(this.getPiece('wn', 1, 7));
        this.pieces.push(this.getPiece('wb', 2, 7));
        this.pieces.push(this.getPiece('wq', 3, 7));

        this.pieces.push(this.getPiece('wk', 4, 7));
        this.pieces.push(this.getPiece('wb', 5, 7));
        this.pieces.push(this.getPiece('wn', 6, 7));
        this.pieces.push(this.getPiece('wr', 7, 7));


        this.pieces.push(this.getPiece('br', 0, 0));
        this.pieces.push(this.getPiece('bn', 1, 0));
        this.pieces.push(this.getPiece('bb', 2, 0));
        this.pieces.push(this.getPiece('bq', 3, 0));

        this.pieces.push(this.getPiece('bk', 4, 0));
        this.pieces.push(this.getPiece('bb', 5, 0));
        this.pieces.push(this.getPiece('bn', 6, 0));
        this.pieces.push(this.getPiece('br', 7, 0));


        for (let i = 0; i < 8; i++) {
            this.pieces.push(this.getPiece('bp', i, 1));
        }
    }

    getPiece(pieceName: PieceName, x: number, y: number): Piece {
        const piece: Piece = {
            dragging: false,
            touchDragging: false,
            x: x,
            y: y,
            left: `${x * 12.5}%`,
            top: `${y * 12.5}%`,
            pieceName: pieceName,
        };

        return piece;
    }

    ngAfterViewInit() {
    }
}
