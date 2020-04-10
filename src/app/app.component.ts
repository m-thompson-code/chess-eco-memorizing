import { Component, OnInit, AfterViewInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { BoardManager } from './types/board';

// import ecoOpenings from '@app/eco_openings_metadata.json';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
    constructor() {
    }

    ngOnInit() {
        // // Allows for ngOnInit to be called on routing to the same routing Component since we will never reuse a route
        // this.router.routeReuseStrategy.shouldReuseRoute = function() {
        //     return false;
        // };

        console.log('app component');
    }

    ngAfterViewInit() {
    }
}
