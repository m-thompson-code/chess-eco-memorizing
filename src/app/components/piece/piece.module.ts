import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PieceComponent } from './piece.component'; 

import { OnBoardDirective } from '../../directives/on-board.directive';

@NgModule({
    declarations: [
        PieceComponent,
        OnBoardDirective,
    ],
    imports: [
        
        CommonModule,
    ],
    exports: [PieceComponent]
})
export class PieceModule { }
