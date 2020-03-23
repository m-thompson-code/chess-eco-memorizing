import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Space } from 'src/app/app.component';
import { DragMoved, DragStarted, DragEnded, HoverElement } from '../space/space.component';

@Component({
    selector: 'moo-board',
    templateUrl: './board.template.html',
    styleUrls: ['./board.style.scss']
})
export class BoardComponent implements OnInit {

    @Input() rows: Space[][];

    @Output() dragStarted: EventEmitter<DragStarted<HoverElement>> = new EventEmitter;
    @Output() dragMoved: EventEmitter<DragMoved<HoverElement>> = new EventEmitter;
    @Output() dragEnded: EventEmitter<DragEnded<HoverElement>> = new EventEmitter;
        
    yDelta?: number;
    xDelta?: number;

    hoverX: number = 0;
    hoverY: number = 0;

    activeSpace?: Space;
    hoverStartSpace?: Space;
    hoverSpace?: Space;

    dragging: boolean;

    constructor() {

    }

    public ngOnInit() {
    }

    public updateHoverSpace(dragMoved: DragMoved): void {
        const event = dragMoved.cdkDragMove;

        const width = event.source.element.nativeElement.offsetWidth;

        let _x = this.hoverStartSpace.x;
        let _y = this.hoverStartSpace.y;

        _x += Math.round((event.distance.x + this.xDelta) / width);

        if (_x < 0) {
            _x = 0;
        } else if (_x > 7) {
            _x = 7;
        }

        _y += Math.round((event.distance.y + this.yDelta) / width);

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
        this.dragging = true;

        const event = dragStartedEvent.cdkDragStart;

        console.log('cdkDragStarted');
        console.log(event);

        event.source.element.nativeElement.classList.add('active');

        this.hoverStartSpace = dragStartedEvent.space;

        this.hoverSpace = undefined;
        this.activeSpace = undefined;

        return this.dragStarted.emit(dragStartedEvent);
    }

    public cdkDragMoved(dragMovedEvent: DragMoved): void {
        const event = dragMovedEvent.cdkDragMove;

        console.log('cdkDragMoved');
        console.log(event);

        const width = event.source.element.nativeElement.offsetWidth;

        if (event.pointerPosition && typeof this.xDelta === 'undefined') {
            const clientRect = event.source.element.nativeElement.getBoundingClientRect();

            const xDelta = event.pointerPosition.x - clientRect.left - width / 2;
            const yDelta = event.pointerPosition.y - clientRect.top - width / 2;

            this.xDelta = xDelta || 0;
            this.yDelta = yDelta || 0;
        }

        this.updateHoverSpace(dragMovedEvent);

        return this.dragMoved.emit(dragMovedEvent);
    }
    
    public cdkDragEnded(dragEndedEvent: DragEnded): void {
        this.dragging = false;

        const event = dragEndedEvent.cdkDragEnd;

        console.log('cdkDragEnded');
        console.log(event, event.distance.x, event.distance.y);

        this.activeSpace = this.hoverSpace;
        this.hoverSpace = undefined;

        if (this.activeSpace !== this.hoverStartSpace) {
            this.activeSpace.piece = this.hoverStartSpace && this.hoverStartSpace.piece;
            
            if (this.hoverStartSpace) {
                this.hoverStartSpace.piece = undefined;
            }
        }

        event.source.element.nativeElement.classList.remove('active');

        event.source.reset();

        this.xDelta = undefined;
        this.yDelta = undefined;

        return this.dragEnded.emit(dragEndedEvent);
    }
}
