import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoardComponent } from './board.component';

import { PositionModule } from '@app/components/position/position.module';
import { PieceModule } from '@app/components/piece/piece.module';
import { DraggablePositionModule } from '@app/components/draggablePosition/draggablePosition.module';

import { SquareDirective } from '@app/directives/square.directive';

@NgModule({
    declarations: [
        BoardComponent,
        SquareDirective,
    ],
    imports: [
        CommonModule,

        PositionModule,
        PieceModule,
        DraggablePositionModule,
    ],
    exports: [BoardComponent]
})
export class BoardModule { }
