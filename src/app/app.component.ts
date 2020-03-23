import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import * as Hammer from "hammerjs";
import { CdkDragDrop, CdkDragEnd, CdkDragEnter, CdkDragExit, CdkDragMove, CdkDragRelease, CdkDragStart } from '@angular/cdk/drag-drop';
import { DragMoved } from './components/space/space.component';

export type Coord = number & (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7);

export type BlackPiece = 'bb' | 'bk' | 'bn' | 'bp' | 'bq' | 'br';
export type WhitePiece = 'wb' | 'wk' | 'wn' | 'wp' | 'wq' | 'wr';

export type Piece = BlackPiece | WhitePiece;

export interface Space {
    index: number;
    x: number;//Coord;
    y: number;//Coord;
    piece?: string;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
    title = 'chess';

    @ViewChild('box', { static: false }) private box: ElementRef;

    // poor choice here, but to keep it simple
    // setting up a few vars to keep track of things.
    // at issue is these values need to be encapsulated
    // in some scope other than global.
    lastPosX:number = 0;
    lastPosY:number = 0;
    isDragging: boolean = false;

    rows: Space[][];

    activeSpace: Space;

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

        for (let i = 0; i < 8; i++) {
            this.rows[6][i].piece = 'wp';
        }

        this.rows[7][0].piece = 'wr';
        this.rows[7][1].piece = 'wn';
        this.rows[7][2].piece = 'wb';
        this.rows[7][3].piece = 'wq';

        this.rows[7][4].piece = 'wk';
        this.rows[7][5].piece = 'wb';
        this.rows[7][6].piece = 'wn';
        this.rows[7][7].piece = 'wr';


        this.rows[0][0].piece = 'br';
        this.rows[0][1].piece = 'bn';
        this.rows[0][2].piece = 'bb';
        this.rows[0][3].piece = 'bq';

        this.rows[0][4].piece = 'bk';
        this.rows[0][5].piece = 'bb';
        this.rows[0][6].piece = 'bn';
        this.rows[0][7].piece = 'br';


        for (let i = 0; i < 8; i++) {
            this.rows[1][i].piece = 'bp';
        }
 
    }

    ngAfterViewInit() {
    }

    x: number;
    y: number;
    width: number;

    piece: string;

    public cdkDragMoved(dragMovedEvent: DragMoved): void {
        const event = dragMovedEvent.cdkDragMove;

        console.log('cdkDragMoved');
        console.log(event);

        const width = event.source.element.nativeElement.offsetWidth;

        const overlayWidth = width * 1.75;

        this.x = event.pointerPosition.x - overlayWidth / 2;
        this.y = event.pointerPosition.y - overlayWidth - width / 2 - 8;
        this.width = overlayWidth;

        this.piece = dragMovedEvent.space.piece;

        // if (event.pointerPosition && typeof this.xDelta === 'undefined') {
        //     const clientRect = event.source.element.nativeElement.getBoundingClientRect();

        //     const xDelta = event.pointerPosition.x - clientRect.left - width / 2;
        //     const yDelta = event.pointerPosition.y - clientRect.top - width / 2;

        //     this.xDelta = xDelta || 0;
        //     this.yDelta = yDelta || 0;
        // }

        // this.updateHoverSpace(dragMovedEvent);

        // return this.dragMoved.emit(dragMovedEvent);
    }
}
