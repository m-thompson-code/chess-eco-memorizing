import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Space } from 'src/app/app.component';
import { DragMoved, DragStarted, DragEnded, HoverElement } from '../space/space.component';

export interface Piece {
    dragging: boolean;
    touchDragging: boolean;
    x: number;
    y: number;
    left: string;
    top: string;
    width?: string;
    pieceName: PieceName;
}

export type BlackPieceName = 'bb' | 'bk' | 'bn' | 'bp' | 'bq' | 'br';
export type WhitePieceName = 'wb' | 'wk' | 'wn' | 'wp' | 'wq' | 'wr';

export type PieceName = BlackPieceName | WhitePieceName;

export interface Coord {
    x: number;
    y: number;
}

@Component({
    selector: 'moo-board',
    templateUrl: './board.template.html',
    styleUrls: ['./board.style.scss']
})
export class BoardComponent implements OnInit {
    @Input() public rows: Space[][];

    @Output() public dragStarted: EventEmitter<DragStarted<HoverElement>> = new EventEmitter;
    @Output() public dragMoved: EventEmitter<DragMoved<HoverElement>> = new EventEmitter;
    @Output() public dragEnded: EventEmitter<DragEnded<HoverElement>> = new EventEmitter;
        
    public yDelta?: number;
    public xDelta?: number;

    public hoverX: number = 0;
    public hoverY: number = 0;

    public movedToSpace?: Space;
    public hoverStartFromSpace?: Space;
    public hoverSpace?: Space;

    @Input() public pieces: Piece[];
    public draggingPiece: Piece;

    public dragging: boolean;
    public touchDragging: boolean;

    public pointerPosition: Coord = {
        x: 0,
        y: 0,
    };

    constructor() {

    }

    public ngOnInit() {
        this.pointerPosition = {
            x: 0, y: 0
        };
    }

    dropPiece(piece: Piece, coords: Coord): void {
        if (piece) {
            piece.dragging = false;
            piece.touchDragging = false;
    
            piece.left = `${coords.x * 12.5}%`;
            piece.top = `${coords.y * 12.5}%`;
    
            this.draggingPiece = undefined;
        }
    }

    dragPiece(piece: Piece, dragMovedEvent: DragMoved): void {
        // TODO: check other pieces and drop them
        const width = dragMovedEvent.cdkDragMove.source.element.nativeElement.offsetWidth;

        if (dragMovedEvent.cdkDragMove.event.type === 'touchmove') {
            piece.touchDragging = true;

            const pointerOffsetY = dragMovedEvent.space.y * width + dragMovedEvent.cdkDragMove.distance.y + this.yDelta;
            const pointerOffsetX = dragMovedEvent.space.x * width + dragMovedEvent.cdkDragMove.distance.x + this.xDelta;

            const top = pointerOffsetY - width /2;
            const left = pointerOffsetX - width / 2;

            piece.top = `${top}px`;
            piece.left = `${left}px`;
        } else {
            const spaceOffsetY = dragMovedEvent.space.y * width + dragMovedEvent.cdkDragMove.distance.y;
            const spaceOffsetX = dragMovedEvent.space.x * width + dragMovedEvent.cdkDragMove.distance.x;

            const top = spaceOffsetY;
            const left = spaceOffsetX;

            piece.top = `${top}px`;
            piece.left = `${left}px`;
        }

        piece.dragging = true;        
    }

    public updateHoverSpace(dragMovedEvent: DragMoved): void {
        const event = dragMovedEvent.cdkDragMove;

        const width = event.source.element.nativeElement.offsetWidth;

        dragMovedEvent.cdkDragMove.source.element.nativeElement.offsetWidth

        console.log(dragMovedEvent);

        let _x = this.hoverStartFromSpace.x;
        let _y = this.hoverStartFromSpace.y;

        if (dragMovedEvent.cdkDragMove.event.type === 'touchmove') {
            _x += Math.round((event.distance.x + this.xDelta - width / 2) / width);
            _y += Math.round((event.distance.y + this.yDelta - width / 2) / width);
        } else {
            _x += Math.round(event.distance.x / width);
            _y += Math.round(event.distance.y / width);
        }

        if (_x < 0) {
            _x = 0;
        } else if (_x > 7) {
            _x = 7;
        }

        if (_y < 0) {
            _y = 0;
        } else if (_y > 7) {
            _y = 7;
        }

        this.hoverX = _x;
        this.hoverY = _y;

        this.hoverSpace = this.rows[_y][_x];
    }

    public cdkDragStarted(dragStartedEvent: DragStarted): void {
        const event = dragStartedEvent.cdkDragStart;

        // console.log('cdkDragStarted');
        // console.log(event);

        event.source.element.nativeElement.classList.add('active');

        this.hoverStartFromSpace = dragStartedEvent.space;

        this.hoverSpace = undefined;
        this.movedToSpace = undefined;

        return this.dragStarted.emit(dragStartedEvent);
    }

    public cdkDragMoved(dragMovedEvent: DragMoved): void {
        const event = dragMovedEvent.cdkDragMove;

        // console.log('cdkDragMoved');
        // console.log(event);

        // const width = event.source.element.nativeElement.offsetWidth;

        if (event.pointerPosition && typeof this.xDelta === 'undefined') {
            const clientRect = event.source.element.nativeElement.getBoundingClientRect();

            const xDelta = event.pointerPosition.x - clientRect.left;
            const yDelta = event.pointerPosition.y - clientRect.top;

            this.xDelta = xDelta || 0;
            this.yDelta = yDelta || 0;
        }

        this.updateHoverSpace(dragMovedEvent);

        this.dragging = true;
        if (dragMovedEvent.cdkDragMove.event.type === 'touchmove') {
            this.touchDragging = true;
        }

        this.pointerPosition = event.pointerPosition;

        for (let piece of this.pieces) {
            this.draggingPiece = piece;
            if (piece.x === dragMovedEvent.space.x && piece.y === dragMovedEvent.space.y) {
                this.dragPiece(piece, dragMovedEvent);

                return this.dragMoved.emit(dragMovedEvent);
            }
        }
    }
    
    public cdkDragEnded(dragEndedEvent: DragEnded): void {
        this.dragging = false;
        this.touchDragging = false;

        const event = dragEndedEvent.cdkDragEnd;

        const width = event.source.element.nativeElement.offsetWidth;

        // console.log('cdkDragEnded');
        // console.log(event, event.distance.x, event.distance.y);

        this.movedToSpace = this.hoverSpace;
        this.hoverSpace = undefined;

        event.source.element.nativeElement.classList.remove('active');

        this.dropPiece(this.draggingPiece, this.movedToSpace);

        event.source.reset();

        this.xDelta = undefined;
        this.yDelta = undefined;

        return this.dragEnded.emit(dragEndedEvent);
    }
}
