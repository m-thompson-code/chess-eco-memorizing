import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpaceComponent } from './space.component';

@NgModule({
    declarations: [SpaceComponent],
    imports: [
        CommonModule,
    ],
    exports: [SpaceComponent]
})
export class SpaceModule { }
