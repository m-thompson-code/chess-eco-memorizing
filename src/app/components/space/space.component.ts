import { Component, OnInit, Input } from '@angular/core';
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
    private _space: Space | undefined | null;

    @Input()
    public set space(space: Space | undefined | null) {
        if (this._space && this._space.spaceComponent === this) {
            this._space.spaceComponent = undefined;
        }

        this._space = space;

        if (this._space) {
            this._space.spaceComponent = this;
        }
    }
    public get space(): Space | undefined | null {
        return this._space;
    };

    @Input() hoverStartFromSpace?: Space;
    @Input() hoverSpace?: Space;
    @Input() movedToSpace?: Space;

    constructor() {

    }

    public ngOnInit() {
    }
}
