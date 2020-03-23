import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragMove, CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Space } from 'src/app/app.component';

export interface DragStarted<T=any> {
    cdkDragStart: CdkDragStart<T>;
    space: Space;
}

export interface DragMoved<T=any> {
    cdkDragMove: CdkDragMove<T>;
    space: Space;
}

export interface DragEnded<T=any> {
    cdkDragEnd: CdkDragEnd<T>;
    space: Space;
}

export type HoverElement = HTMLElement;

@Component({
    selector: 'moo-space',
    templateUrl: './space.template.html',
    styleUrls: ['./space.style.scss']
})
export class SpaceComponent implements OnInit {
    // (cdkDragStarted)="cdkDragStarted($event)"
    // (cdkDragEnded)="cdkDragEnded($event)"
    // (cdkDragMoved)="cdkDragMoved($event)"

    @Input() space: Space;
    @Input() hoverStartSpace?: Space;
    @Input() hoverSpace?: Space;
    @Input() activeSpace?: Space;

    @Output() dragStarted: EventEmitter<DragStarted<HoverElement>> = new EventEmitter;
    @Output() dragMoved: EventEmitter<DragMoved<HoverElement>> = new EventEmitter;
    @Output() dragEnded: EventEmitter<DragEnded<HoverElement>> = new EventEmitter;

    constructor() {

    }

    public ngOnInit() {
    }

    public _cdkDragStartedWrapper(event: CdkDragStart<HoverElement>): void {
        const dragStartedEvent = {
            space: this.space,
            cdkDragStart: event,
        };
        console.log('dragStarted', dragStartedEvent);
        return this.dragStarted.emit(dragStartedEvent);
    }

    public _cdkDragMovedWrapper(event: CdkDragMove<HoverElement>): void {
        const dragMovedEvent = {
            space: this.space,
            cdkDragMove: event,
        };
        console.log('dragMoved', dragMovedEvent);
        return this.dragMoved.emit(dragMovedEvent);
    }

    public _cdkDragEndedWrapper(event: CdkDragEnd<HoverElement>): void {
        const dragEndedEvent = {
            space: this.space,
            cdkDragEnd: event,
        };
        console.log('dragEnded', dragEndedEvent);
        return this.dragEnded.emit(dragEndedEvent);
    }
}
