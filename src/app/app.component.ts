import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BoardManager } from './types/board';

// import ecoOpenings from '@app/eco_openings_metadata.json';

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
        // console.log(ecoOpenings);
        this.boardManager = new BoardManager();

        this.boardManagers = [];

        // setTimeout(() => {
        //     for (let i = 0; i < ecoOpenings.length; i++) {
        //         try {
        //             const boardManager = new BoardManager();
        //             const notation = ecoOpenings[i].notation;
        //             this.boardManagers?.push(boardManager);
        //             this.play(boardManager, notation);
        //             console.log(i);
        //         }catch(error) {
        //             console.error(error);
        //         }
        //     }
        // }, 3000);

        

        // setTimeout(() => {
        //     this.play("1.Nf3 d5 2.g3 c5 3.Bg2 Nc6 4.O-O e6 5.d3 Nf6 6.Nbd2 Be7 7.e4 O-O 8.Re1");           
        // }, 1000);

        // setTimeout(() => {
        //     this.boardManager = new BoardManager();
        //     this.play("1.e4 e6 2.d4 d5 3.exd5");
        // }, 2000);
    }

    updateValue(inputChangeEvent: any) {
        this.test = inputChangeEvent.target.value;
    }

    play(boardManager: BoardManager, notation: string): void {
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

        // console.log(moves);

        const time = 0;//300;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];

            if (!time) {
                boardManager.moveUsingNotation(move.white);
                move.black && boardManager.moveUsingNotation(move.black);
            } else {
                setTimeout(() => {
                    // console.log(move.white);
                    boardManager.moveUsingNotation(move.white);
                }, 3 * i * time);
    
                if (move.black) {
                    setTimeout(() => {
                        // console.log(move.black);
                        move.black && boardManager.moveUsingNotation(move.black);
                    },time + 3 * i * time);
                }
            }
        }
    }

    ngAfterViewInit() {
    }
}
