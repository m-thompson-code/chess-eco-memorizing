import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DragDropModule } from '@angular/cdk/drag-drop';

import { BoardModule } from './components/board/board.module';

@NgModule({
    declarations: [
        AppComponent,
        // SquareDirective
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,

        BoardModule,

        DragDropModule,
    ],
    providers: [
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
