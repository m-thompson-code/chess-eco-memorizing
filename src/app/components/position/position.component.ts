import { Component, OnInit, Input } from '@angular/core';
import { CdkDragMove, CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { BoardPosition } from '@app/types/boardPosition';

export interface DragStarted<T=any> {
    cdkDragStart: CdkDragStart<T>;
    position: BoardPosition;
}

export interface DragMoved<T=any> {
    cdkDragMove: CdkDragMove<T>;
    position: BoardPosition;
}

export interface DragEnded<T=any> {
    cdkDragEnd: CdkDragEnd<T>;
    position: BoardPosition;
}

export type HoverElement = HTMLElement;

@Component({
    selector: 'moo-position',
    templateUrl: './position.template.html',
    styleUrls: ['./position.style.scss']
})
export class PositionComponent implements OnInit {
    private _position: BoardPosition | undefined;

    @Input()
    public set position(position: BoardPosition | undefined) {
        if (this._position && this._position.positionComponent === this) {
            this._position.positionComponent = undefined;
        }

        this._position = position;

        if (this._position) {
            this._position.positionComponent = this;
        }
    }
    public get position(): BoardPosition | undefined {
        return this._position;
    };

    @Input() activePosition?: BoardPosition;
    @Input() hoverStartFromPosition?: BoardPosition;
    @Input() hoverPosition?: BoardPosition;
    @Input() movedToPosition?: BoardPosition;
    @Input() movedFromPosition?: BoardPosition;
    
    constructor() {

    }

    public ngOnInit() {
    }
}
