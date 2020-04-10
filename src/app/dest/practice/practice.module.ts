import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PracticeComponent } from './practice.component';
import { PracticeRoutingModule } from './practice-routing.module';
import { BoardModule } from '@app/components/board/board.module';

@NgModule({
    declarations: [
        PracticeComponent
    ],
    imports: [
        CommonModule,
        PracticeRoutingModule,

        BoardModule,
    ]
})
export class PracticeModule { }
