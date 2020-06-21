import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestComponent } from './test.component';
import { TestRoutingModule } from './test-routing.module';
import { BoardModule } from '@app/components/board/board.module';

import { FormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import {MatButtonModule} from '@angular/material/button';


@NgModule({
    declarations: [
        TestComponent
    ],
    imports: [
        CommonModule,
        TestRoutingModule,

        BoardModule,

        FormsModule,
        MatInputModule,
        MatFormFieldModule,

        MatButtonModule,
    ]
})
export class TestModule { }
