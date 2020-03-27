import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PositionComponent } from './position.component';

@NgModule({
    declarations: [PositionComponent],
    imports: [
        CommonModule,
    ],
    exports: [PositionComponent]
})
export class PositionModule { }
