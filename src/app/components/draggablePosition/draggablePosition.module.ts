import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DraggablePositionComponent } from './draggablePosition.component'; 
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [DraggablePositionComponent],
    imports: [
        DragDropModule,

        CommonModule,
    ],
    exports: [DraggablePositionComponent]
})
export class DraggablePositionModule { }
