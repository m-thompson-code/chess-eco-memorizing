import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BoardManager, BoardPosition } from '@app/types/board';
import { Piece } from '@app/types/piece';
import { Space, Coords } from '@app/types/space';

import { DragMoved, DragStarted, DragEnded, HoverElement } from '../space/space.component';

@Component({
    selector: 'moo-board',
    templateUrl: './board.template.html',
    styleUrls: ['./board.style.scss']
})
export class BoardComponent implements OnInit {
    @Input() public boardManager?: BoardManager;

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

    public pointerPosition: Coords = {
        x: 0,
        y: 0,
    };

    showNotationLabels: boolean;

    verticalNotationlabels: number[];
    horizontalNotationlabels: string[];

    constructor() {
        this.dragging = false;
        this.touchDragging = false;
        this.showNotationLabels = true;

        this.verticalNotationlabels = [8, 7, 6, 5, 4, 3, 2, 1];
        this.horizontalNotationlabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    }

    public ngOnInit() {
        this.pointerPosition = {
            x: 0, y: 0
        };
    }

    public movePiece(piece: Piece, space: Space): void {
        if (!this.boardManager) {
            throw {
                message: "Unexpected missing board",
            };
        }

        this.draggingPiece = undefined;
        this.hoverSpace = undefined;
        this.hoverStartFromSpace = undefined;
    
        piece.dragging = false;
        piece.touchDragging = false;

        const oldPosition = piece.getPosition();
        const newPosition = space.getPosition();

        // Exit early / activate other space with same team piece
        if (newPosition.piece) {
            if (newPosition.piece.color === piece.color) {
                piece.resetBoardPositionStyles();
                this.activateSpace(space);
                return;
            }
        }

        const moved = piece.moveToPosition(newPosition);

        if (moved) {
            this.movedFromSpace = oldPosition.space;
            this.movedToSpace = space;
        } else {
            piece.resetBoardPositionStyles();
        }

        this.boardManager.hideMovementDots();
    }

    dragPiece(piece: Piece, dragMovedEvent: DragMoved): void {
        if (!this.boardManager) {
            throw {
                message: "Unexpected missing board",
            }
        }
        // TODO: check other pieces and drop them

        const width = dragMovedEvent.cdkDragMove.source.element.nativeElement.offsetWidth;

        let spaceOffsetX = (this.boardManager.boardOrientation === 'flipped' ? (7 - dragMovedEvent.space.x) : dragMovedEvent.space.x) * width;
        let spaceOffsetY = (this.boardManager.boardOrientation === 'flipped' ? (7 - dragMovedEvent.space.y) : dragMovedEvent.space.y) * width;

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
        if (!this.boardManager) {
            throw {
                message: "Unexpected missing board",
            };
        }

        const event = dragMovedEvent.cdkDragMove;

        const width = event.source.element.nativeElement.offsetWidth;

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

        if (this.boardManager.boardOrientation === 'flipped') {
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

        const hoverPosition = this.boardManager.getPosition(_x, _y);

        if (!hoverPosition) {
            throw {
                message: "Unexpected hoverPosition",
                _x: _x,
                _y: _y,
            }
        }

        this.hoverSpace = hoverPosition.space;
    }

    public activateSpace(space: Space): void {
        if (!this.boardManager) {
            throw {
                message: 'Unexpected missing message',
            }
        }

        if (this.activeSpace !== space.piece) {
            this.activeSpace = space;

            if (space.piece) {
                this.boardManager.showMovementDots(space.piece);
            }
        }
    }
    
    public deactivateSpace(): void {
        if (!this.boardManager) {
            throw {
                message: 'Unexpected missing message',
            }
        }

        if (this.activeSpace) {
            this.activeSpace = undefined;
            this.boardManager.hideMovementDots();
        }
    }

    public handleDragStarted(dragStartedEvent: DragStarted): void {
        if (!this.boardManager) {
            throw {
                message: 'Unexpected missing message',
            };
        }

        this.hoverStartFromSpace = undefined;
        this.hoverSpace = undefined;

        if (!dragStartedEvent.space || !dragStartedEvent.space.piece || dragStartedEvent.space.piece.color !== this.boardManager.turn) {
            this.hoverStartFromSpace = undefined;
            this.hoverSpace = undefined;
            this.dragging = false;
            this.touchDragging = false;
            this.deactivateSpace();
            return;
        }

        const event = dragStartedEvent.cdkDragStart;

        event.source.element.nativeElement.classList.add('active');

        this.hoverStartFromSpace = dragStartedEvent.space;
        this.hoverSpace = undefined;

        this.activateSpace(dragStartedEvent.space);

        return this.dragStarted.emit(dragStartedEvent);
    }

    public handleDragMoved(dragMovedEvent: DragMoved): void {
        if (!this.boardManager) {
            throw {
                message: 'Unexpected missing message',
            }
        }

        if (!dragMovedEvent.space || !dragMovedEvent.space.piece || dragMovedEvent.space.piece.color !== this.boardManager.turn) {
            this.hoverStartFromSpace = undefined;
            this.hoverSpace = undefined;
            this.dragging = false;
            this.touchDragging = false;
            this.deactivateSpace();
            return;
        }

        const event = dragMovedEvent.cdkDragMove;

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

        this.draggingPiece = dragMovedEvent.space.piece;

        if (this.draggingPiece) {
            this.dragPiece(this.draggingPiece, dragMovedEvent);
        }

        return this.dragMoved.emit(dragMovedEvent);
    }
    
    public handleDragEnded(dragEndedEvent: DragEnded): void {
        if (!this.boardManager) {
            throw {
                message: "Unexpected missing board",
            };
        }

        this.dragging = false;
        this.touchDragging = false;

        if (!dragEndedEvent.space || !dragEndedEvent.space.piece || dragEndedEvent.space.piece.color !== this.boardManager.turn) {
            this.hoverStartFromSpace = undefined;
            this.hoverSpace = undefined;
            this.dragging = false;
            this.touchDragging = false;
            this.deactivateSpace();
            return;
        }

        const event = dragEndedEvent.cdkDragEnd;

        event.source.element.nativeElement.classList.remove('active');

        if (this.draggingPiece && this.hoverSpace) {
            this.movePiece(this.draggingPiece, this.hoverSpace);
        }

        this.hoverSpace = undefined;
        this.hoverStartFromSpace = undefined;

        this.xDelta = undefined;
        this.yDelta = undefined;

        return this.dragEnded.emit(dragEndedEvent);
    }

    public handleClickingDraggable(position: BoardPosition): void {
        if (this.activeSpace && this.activeSpace.piece) {
            this.movePiece(this.activeSpace.piece, position.space);
            return;
        }

        if (!this.boardManager) {
            throw {
                message: "Unexpected missing board",
            };
        }

        if (!position.piece) {
            return;
        }

        if (this.boardManager.turn === position.piece.color) {
            this.activateSpace(position.space);
        }
    }
}
