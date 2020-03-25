import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Space, Board, Piece } from 'src/app/app.component';
import { DragMoved, DragStarted, DragEnded, HoverElement } from '../space/space.component';

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
    @Input() public board?: Board;

    @Output() public dragStarted: EventEmitter<DragStarted<HoverElement>> = new EventEmitter;
    @Output() public dragMoved: EventEmitter<DragMoved<HoverElement>> = new EventEmitter;
    @Output() public dragEnded: EventEmitter<DragEnded<HoverElement>> = new EventEmitter;
        
    public yDelta?: number;
    public xDelta?: number;

    public hoverX: number = 0;
    public hoverY: number = 0;

    public activeSpace?: Space;

    public movedToSpace?: Space;
    public movedFromSpace?: Space;

    public hoverStartFromSpace?: Space;
    public hoverSpace?: Space;

    public draggingPiece?: Piece;

    public dragging: boolean;
    public touchDragging: boolean;

    public pointerPosition: Coord = {
        x: 0,
        y: 0,
    };

    constructor() {
        this.dragging = false;
        this.touchDragging = false;
    }

    public ngOnInit() {
        this.pointerPosition = {
            x: 0, y: 0
        };
    }

    dropPiece(piece: Piece, space: Space): boolean {
        if (!this.board) {
            throw {
                message: "Unexpected missing board",
            };
        }

        this.draggingPiece = undefined;
        // this.activeSpace = undefined;
        this.hoverSpace = undefined;
        this.hoverStartFromSpace = undefined;
        
        if (piece) {
            piece.dragging = false;
            piece.touchDragging = false;

            if (piece.x === space.x && piece.y === space.y) {
                this.board.movePiece(piece, space.x, space.y);
                // this.activeSpace = this.board.spaces[piece.y][piece.x];
                this.activateSpace(space);
                return false;
            }

            // Check if piece can move here

            this.movedFromSpace = this.board.spaces[piece.y][piece.x];

            this.board.movePiece(piece, space.x, space.y);

            this.movedToSpace = this.board.spaces[piece.y][piece.x];

            this.board.hideMovementDots();

            return true;
        }

        return false;
    }

    dragPiece(piece: Piece, dragMovedEvent: DragMoved): void {
        if (!this.board) {
            throw {
                message: "Unexpected missing board",
            }
        }
        // TODO: check other pieces and drop them

        const width = dragMovedEvent.cdkDragMove.source.element.nativeElement.offsetWidth;

        let spaceOffsetX = (this.board.boardOrientation === 'flipped' ? (7 - dragMovedEvent.space.x) : dragMovedEvent.space.x) * width;
        let spaceOffsetY = (this.board.boardOrientation === 'flipped' ? (7 - dragMovedEvent.space.y) : dragMovedEvent.space.y) * width;

        const draggedSpaceOffsetX = spaceOffsetX + dragMovedEvent.cdkDragMove.distance.x;
        const draggedSpaceOffsetY = spaceOffsetY + dragMovedEvent.cdkDragMove.distance.y;

        if (dragMovedEvent.cdkDragMove.event.type === 'touchmove') {
            piece.touchDragging = true;

            const pointerOffsetX = draggedSpaceOffsetX + (this.xDelta || 0) - width / 2;
            const pointerOffsetY = draggedSpaceOffsetY + (this.yDelta || 0) - width / 2;

            const left = pointerOffsetX;
            const top = pointerOffsetY;

            piece.top = `${top}px`;
            piece.left = `${left}px`;
        } else {
            const left = draggedSpaceOffsetX;
            const top = draggedSpaceOffsetY;

            piece.top = `${top}px`;
            piece.left = `${left}px`;
        }

        piece.dragging = true;        
    }

    public updateHoverSpace(dragMovedEvent: DragMoved): void {
        if (!this.board) {
            throw {
                message: "Unexpected missing board",
            }
        }
        const event = dragMovedEvent.cdkDragMove;

        const width = event.source.element.nativeElement.offsetWidth;

        dragMovedEvent.cdkDragMove.source.element.nativeElement.offsetWidth

        // console.log(dragMovedEvent);

        let _x = this.hoverStartFromSpace && this.hoverStartFromSpace.x || 0;
        let _y = this.hoverStartFromSpace && this.hoverStartFromSpace.y || 0;

        let _xDelta = 0;
        let _yDelta = 0;

        if (dragMovedEvent.cdkDragMove.event.type === 'touchmove') {
            _xDelta = Math.round((event.distance.x + (this.xDelta || 0) - width / 2) / width);
            _yDelta = Math.round((event.distance.y + (this.yDelta || 0) - width / 2) / width);
        } else {
            _xDelta = Math.round(event.distance.x / width);
            _yDelta = Math.round(event.distance.y / width);
        }

        if (this.board.boardOrientation === 'flipped') {
            _x -= _xDelta;
            _y -= _yDelta;
        } else {
            _x += _xDelta;
            _y += _yDelta;
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

        this.hoverSpace = this.board.spaces[_y][_x];
    }

    public activateSpace(space: Space): void {
        if (!this.board) {
            throw {
                message: 'Unexpected missing message',
            }
        }

        const check = this.board.checkSpace(space.x, space.y);

        if (!check.piece) {
            return;
        }

        if (this.activeSpace !== check.space) {
            this.activeSpace = check.space;
            this.board.getMoveToSpaces(check.piece, true);
        }
    }

    public handleDragStarted(dragStartedEvent: DragStarted): void {
        if (!this.board) {
            throw {
                message: 'Unexpected missing message',
            }
        }

        const event = dragStartedEvent.cdkDragStart;

        // console.log('handleDragStarted');
        // console.log(event);

        event.source.element.nativeElement.classList.add('active');

        this.hoverStartFromSpace = dragStartedEvent.space;

        this.hoverSpace = undefined;
        // this.activeSpace = dragStartedEvent.space;
        this.activateSpace(dragStartedEvent.space);

        return this.dragStarted.emit(dragStartedEvent);
    }

    public handleDragMoved(dragMovedEvent: DragMoved): void {
        if (!this.board) {
            throw {
                message: 'Unexpected missing message',
            }
        }

        const event = dragMovedEvent.cdkDragMove;

        // console.log('handleDragMoved');
        // console.log(event);

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

        for (let piece of this.board.pieces) {
            this.draggingPiece = piece;

            if (piece.x === dragMovedEvent.space.x && piece.y === dragMovedEvent.space.y) {
                this.dragPiece(piece, dragMovedEvent);

                return this.dragMoved.emit(dragMovedEvent);
            }
        }
    }
    
    public handleDragEnded(dragEndedEvent: DragEnded): void {
        if (!this.board) {
            throw {
                message: "Unexpected missing board",
            }
        }
        this.dragging = false;
        this.touchDragging = false;

        const event = dragEndedEvent.cdkDragEnd;

        // console.log('handleDragEnded');
        // console.log(event, event.distance.x, event.distance.y);

        event.source.element.nativeElement.classList.remove('active');

        if (this.draggingPiece && this.hoverSpace) {
            this.dropPiece(this.draggingPiece, this.hoverSpace);
        }

        this.hoverSpace = undefined;
        this.hoverStartFromSpace = undefined;

        event.source.reset();

        this.xDelta = undefined;
        this.yDelta = undefined;

        return this.dragEnded.emit(dragEndedEvent);
    }
}
