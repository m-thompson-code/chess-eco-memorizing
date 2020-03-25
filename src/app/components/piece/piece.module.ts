import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PieceComponent } from './piece.component'; 

@NgModule({
    declarations: [
        PieceComponent,
    ],
    imports: [
        
        CommonModule,
    ],
    exports: [PieceComponent]
})
export class PieceModule { }
