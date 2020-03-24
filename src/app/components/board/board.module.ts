import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoardComponent } from './board.component';

import { SpaceModule } from '../space/space.module';
import { PieceModule } from '../piece/piece.module';
import { DraggableSpaceModule } from '../draggableSpace/draggableSpace.module';

import { SquareDirective } from '../../directives/square.directive';

@NgModule({
    declarations: [
        BoardComponent,
        SquareDirective,
    ],
    imports: [
        CommonModule,

        SpaceModule,
        PieceModule,
        DraggableSpaceModule,
    ],
    exports: [BoardComponent]
})
export class BoardModule { }
