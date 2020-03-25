import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragMove, CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Space } from 'src/app/app.component';

export interface DragStarted<T=any> {
    cdkDragStart: CdkDragStart<T>;
    space: Space | undefined | null;
}

export interface DragMoved<T=any> {
    cdkDragMove: CdkDragMove<T>;
    space: Space | undefined | null;
}

export interface DragEnded<T=any> {
    cdkDragEnd: CdkDragEnd<T>;
    space: Space | undefined | null;
}

export type HoverElement = HTMLElement;

@Component({
    selector: 'moo-draggable-space',
    templateUrl: './draggableSpace.template.html',
    styleUrls: ['./draggableSpace.style.scss']
})
export class DraggableSpaceComponent implements OnInit {
    private _space: Space | undefined | null;

    @Input()
    public set space(space: Space | undefined | null) {
        if (this._space && this._space.draggableSpaceComponent === this) {
            this._space.draggableSpaceComponent = undefined;
        }

        this._space = space;

        if (this._space) {
            this._space.draggableSpaceComponent = this;
        }
    }
    public get space(): Space | undefined | null {
        return this._space;
    };

    @Input() public hoverSpace?: Space;
    @Input() public touchDragging?: boolean;

    @Output() public dragStarted: EventEmitter<DragStarted<HoverElement>> = new EventEmitter;
    @Output() public dragMoved: EventEmitter<DragMoved<HoverElement>> = new EventEmitter;
    @Output() public dragEnded: EventEmitter<DragEnded<HoverElement>> = new EventEmitter;

    constructor() {

    }

    public ngOnInit() {
    }

    public handleDragStarted(event: CdkDragStart<HoverElement>): void {
        const dragStartedEvent = {
            space: this.space,
            cdkDragStart: event,
        };
        // console.log('dragStarted', dragStartedEvent);
        return this.dragStarted.emit(dragStartedEvent);
    }

    public handleDragMoved(event: CdkDragMove<HoverElement>): void {
        const dragMovedEvent = {
            space: this.space,
            cdkDragMove: event,
        };
        // console.log('dragMoved', dragMovedEvent);
        return this.dragMoved.emit(dragMovedEvent);
    }

    public handleDragEnded(event: CdkDragEnd<HoverElement>): void {
        const dragEndedEvent = {
            space: this.space,
            cdkDragEnd: event,
        };
        // console.log('dragEnded', dragEndedEvent);
        return this.dragEnded.emit(dragEndedEvent);
    }
}
