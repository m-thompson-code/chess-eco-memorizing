import { Component, OnInit, Input } from '@angular/core';
import { Piece } from '@app/types/piece';

@Component({
    selector: 'moo-piece',
    templateUrl: './piece.template.html',
    styleUrls: ['./piece.style.scss']
})
export class PieceComponent implements OnInit {
    @Input() piece?: Piece;

    constructor() {

    }

    public ngOnInit() {
    }
}
