import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragMove, CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { BoardPosition } from '@app/types/boardPosition';

export interface DragStarted<T=any> {
    cdkDragStart: CdkDragStart<T>;
    position?: BoardPosition;
}

export interface DragMoved<T=any> {
    cdkDragMove: CdkDragMove<T>;
    position?: BoardPosition;
}

export interface DragEnded<T=any> {
    cdkDragEnd: CdkDragEnd<T>;
    position?: BoardPosition;
}

export type HoverElement = HTMLElement;

@Component({
    selector: 'moo-draggable-position',
    templateUrl: './draggablePosition.template.html',
    styleUrls: ['./draggablePosition.style.scss']
})
export class DraggablePositionComponent implements OnInit {
    private _position: BoardPosition | undefined;

    @Input() public set position(position: BoardPosition | undefined) {
        if (this._position && this._position.draggablePositionComponent === this) {
            this._position.draggablePositionComponent = undefined;
        }

        this._position = position;

        if (this._position) {
            this._position.draggablePositionComponent = this;
        }
    }
    public get position(): BoardPosition | undefined {
        return this._position;
    };

    @Input() public hoverPosition?: BoardPosition;
    @Input() public touchDragging?: boolean;

    @Output() public dragStarted: EventEmitter<DragStarted<HoverElement>> = new EventEmitter();
    @Output() public dragMoved: EventEmitter<DragMoved<HoverElement>> = new EventEmitter();
    @Output() public dragEnded: EventEmitter<DragEnded<HoverElement>> = new EventEmitter();

    constructor() {

    }

    public ngOnInit() {
    }

    public handleDragStarted(cdkDragStart: CdkDragStart<HoverElement>): void {
        const dragStartedEvent: DragStarted<HTMLElement> = {
            position: this.position,
            cdkDragStart: cdkDragStart,
        };

        return this.dragStarted.emit(dragStartedEvent);
    }

    public handleDragMoved(cdkDragMove: CdkDragMove<HoverElement>): void {
        const dragMovedEvent: DragMoved<HTMLElement> = {
            position: this.position,
            cdkDragMove: cdkDragMove,
        };

        return this.dragMoved.emit(dragMovedEvent);
    }

    public handleDragEnded(cdkDragEnd: CdkDragEnd<HoverElement>): void {
        const dragEndedEvent: DragEnded<HTMLElement> = {
            position: this.position,
            cdkDragEnd: cdkDragEnd,
        };
        
        this.dragEnded.emit(dragEndedEvent);

        cdkDragEnd.source.reset();
    }
}
