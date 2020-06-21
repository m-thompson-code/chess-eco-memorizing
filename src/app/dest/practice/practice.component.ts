import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { BoardManager } from '@app/types/boardManager';

import { ECOService, EcoOpening } from '@app/services/eco.service';

@Component({
    selector: 'moo-practice',
    templateUrl: './practice.template.html',
    styleUrls: ['./practice.style.scss']
})
export class PracticeComponent implements OnInit, OnDestroy {
    paramsSub?: Subscription;
    public boardManager?: BoardManager;

    index: number = 0;
    title?: string;
    notation?: string;
    queryNotation?: string;
    minMoves: number = 0;
    maxMoves: number = 0;

    doInc: boolean = false;

    showExpected?: boolean;

    ecoOpenings: EcoOpening[] = [];
    constructor(public router: Router, private activeRoute: ActivatedRoute, public ecoService: ECOService) {
    }

    public ngOnInit(): void {
        this.paramsSub = this.activeRoute.params.subscribe(val => {
            console.log(val);

            this.index = +val.id;
            this.queryNotation = (val.notation || '').replace(/_/g, ' ').replace(/dot/g, '.');
            this.minMoves = +val.minMoves || +val.minmoves || 0;
            this.maxMoves = +val.maxMoves || +val.maxmoves || 0;

            this.ecoOpenings = this.ecoService.getEcoOpeningsByNotation(this.queryNotation || '', {maxMoves: this.maxMoves, minMoves: this.minMoves}, 'whiteMoves') || [];

            const opening = this.ecoOpenings[this.index];
            console.log(this.ecoOpenings);

            this.title = opening.text;
            this.notation = opening.notation;

            const mainBoardManager =  new BoardManager();
            this.boardManager = mainBoardManager;

            if (!this.notation) {
                throw {
                    message: "Unexpected missing notation",
                };
            }
            
            mainBoardManager.setNotation(this.notation);

            mainBoardManager.setAutoPlay({
                white: false,
                black: true,
            });

            // const seed = Math.floor(Math.random() * 2);

            // if (seed === 0) {
            //     mainBoardManager.setAutoPlay({
            //         white: true,
            //         black: false,
            //     });

            //     this.boardManager.flipBoardOrientation();
            // } else {
            //     mainBoardManager.setAutoPlay({
            //         white: false,
            //         black: true,
            //     });
            // }
        });
    }

    public goNext(): Promise<boolean> {
        if (this.ecoService.doInc) {
            this.index += 1;
        } else {
            const oldIndex = this.index;
            while(oldIndex === this.index) {
                this.index = Math.floor(Math.random() * this.ecoOpenings.length);
            }
        }
        console.log(this.index);
        this.index = this.index % this.ecoOpenings.length;
        console.log(this.index);

        const q = (this.queryNotation || "").replace(/ /g, '_').replace(/\./g, 'dot');
        console.log('/practice', q, this.index, this.minMoves, this.maxMoves);
        return this.router.navigate(['/practice', this.index, q, this.minMoves, this.maxMoves]);
    }

    public ngOnDestroy(): void {
        this.paramsSub && this.paramsSub.unsubscribe();
    }
}
