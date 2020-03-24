import {
    Directive, ElementRef, 
    Input, HostListener, AfterViewInit, AfterViewChecked, OnChanges
} from '@angular/core';
import { Space } from '../app.component';

@Directive({
    selector: '[mooOnBoard]'
})
export class OnBoardDirective implements OnChanges {
    @Input() activeSpace: Space;

    constructor(private el: ElementRef) {
    }

    @HostListener('window:resize')
    onResize(): void {
        console.log("on Resize");
        this.matchWidth(this.el.nativeElement, this.activeSpace);
    }

    // public ngAfterViewChecked(): void {
    //     console.log('ngAfterViewChecked');
    //     this.matchWidth(this.el.nativeElement, this.activeSpace);
    // }

    public ngOnChanges(): void {
        console.log('ngOnChanges');
        this.matchWidth(this.el.nativeElement, this.activeSpace);
    }

    public matchWidth(ele: HTMLElement, activeSpace: Space): void {
        if (!ele) return;

        console.log(ele, activeSpace);
    }
}
