import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DraggableSpaceComponent } from './draggableSpace.component'; 
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [DraggableSpaceComponent],
    imports: [
        DragDropModule,

        CommonModule,
    ],
    exports: [DraggableSpaceComponent]
})
export class DraggableSpaceModule { }
