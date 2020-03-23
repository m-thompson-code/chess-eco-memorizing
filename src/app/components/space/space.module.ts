import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpaceComponent } from './space.component'; 
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [SpaceComponent],
    imports: [
        DragDropModule,

        CommonModule,
    ],
    exports: [SpaceComponent]
})
export class SpaceModule { }
