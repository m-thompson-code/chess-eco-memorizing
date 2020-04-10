import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestComponent } from './test.component';
import { TestRoutingModule } from './test-routing.module';
import { BoardModule } from '@app/components/board/board.module';

@NgModule({
    declarations: [
        TestComponent
    ],
    imports: [
        CommonModule,
        TestRoutingModule,

        BoardModule,
    ]
})
export class TestModule { }
