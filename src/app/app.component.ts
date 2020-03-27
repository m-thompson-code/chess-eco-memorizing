import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BoardManager } from './types/board';

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

    constructor() {
        this.test = "";
    }

    ngOnInit() {
        this.boardManager = new BoardManager();
        this.extraManager = new BoardManager();
    }

    updateValue(inputChangeEvent: any) {
        this.test = inputChangeEvent.target.value;
    }

    ngAfterViewInit() {
    }
}
