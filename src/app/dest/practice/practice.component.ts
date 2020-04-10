import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { BoardManager } from '@app/types/board';

import ecoOpenings from '@app/eco_openings_metadata.json';


@Component({
    selector: 'moo-practice',
    templateUrl: './practice.template.html',
    styleUrls: ['./practice.style.scss']
})
export class PracticeComponent implements OnInit, OnDestroy {
    paramsSub?: Subscription;
    public boardManager?: BoardManager;

    rand: number = 0;
    title?: string;
    notation?: string;
    constructor(public router: Router, private activeRoute: ActivatedRoute) {
    }

    public ngOnInit(): void {
        this.paramsSub = this.activeRoute.params.subscribe(val => {
            this.rand = this.getRandomID();

            console.log(val);

            const index = +val.id;

            const opening = ecoOpenings[index];
            console.log(opening);

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

            const seed = Math.floor(Math.random() * 2);

            if (seed === 0) {
                mainBoardManager.setAutoPlay({
                    white: true,
                    black: false,
                });

                this.boardManager.flipBoardOrientation();
            } else {
                mainBoardManager.setAutoPlay({
                    white: false,
                    black: true,
                });
            }
        });
    }

    private getRandomID() {
        const seed = Math.floor(ecoOpenings.length * Math.random());

        return seed;
    }

    public goNext() {
        this.router.navigate(['/practice', this.rand]);
    }

    public ngOnDestroy(): void {
        this.paramsSub && this.paramsSub.unsubscribe();
    }
}
