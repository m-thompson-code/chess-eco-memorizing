import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BoardManager } from './types/board';

import ecoOpenings from '@app/eco_openings_metadata.json';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
    title = 'chess';

    boardManager?: BoardManager;
    extraManager?: BoardManager;

    test: string;

    boardManagers?: BoardManager[];

    constructor() {
        this.test = "";
    }

    ngOnInit() {
        console.log(ecoOpenings);
        const mainBoardManager =  new BoardManager();
        this.boardManager = mainBoardManager;

        this.boardManagers = [];

        setTimeout(() => {
            // const startAt = 10153;
            for (let i = 0; i < ecoOpenings.length; i++) {
                try {
                    const boardManager = new BoardManager();
                    const notation = ecoOpenings[i].notation;
                    this.boardManagers?.push(boardManager);
                    this.play(boardManager, 0, notation);
                    console.log(i);
                }catch(error) {
                    console.error(i);

                    console.error(error);
                    break;
                }
            }
            console.log("COMPLETE");
        }, 3000);

        

        setTimeout(() => {
            const moves: {
                white: string,
                black?: string,
            }[] = [];

            const notation = "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.h3 c5 7.d5 e6 8.Bd3 exd5 9.exd5 Re8+";

            const notationSplits = notation.split('.');

            for (let i = 1; i < notationSplits.length; i += 1) {
                const testSplit = notationSplits[i].split(' ');

                moves.push({
                    white: testSplit[0],
                    black: testSplit[1],
                });
            }

            console.log(moves);

            this.play(mainBoardManager, 300, notation);           
        }, 1000);

        // setTimeout(() => {
        //     this.boardManager = new BoardManager();
        //     this.play("1.e4 e6 2.d4 d5 3.exd5");
        // }, 2000);
    }

    updateValue(inputChangeEvent: any) {
        this.test = inputChangeEvent.target.value;
    }

    play(boardManager: BoardManager, delay: number, notation: string): void {
        const moves: {
            white: string,
            black?: string,
        }[] = [];

        const notationSplits = notation.split('.');

        for (let i = 1; i < notationSplits.length; i += 1) {
            const testSplit = notationSplits[i].split(' ');

            moves.push({
                white: testSplit[0],
                black: testSplit[1],
            });
        }

        // const time = 0;//300;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];

            if (!delay) {
                boardManager.moveUsingNotation(move.white);
                move.black && boardManager.moveUsingNotation(move.black);
            } else {
                setTimeout(() => {
                    boardManager.moveUsingNotation(move.white);
                }, 3 * i * delay);
    
                if (move.black) {
                    setTimeout(() => {
                        move.black && boardManager.moveUsingNotation(move.black);
                    },delay + 3 * i * delay);
                }
            }
        }
    }

    ngAfterViewInit() {
    }
}
