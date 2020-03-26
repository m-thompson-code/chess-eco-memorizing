import {
    Directive, ElementRef, HostListener, AfterViewInit
} from '@angular/core';

@Directive({
    selector: '[mooSquare]'
})
export class SquareDirective implements AfterViewInit {
    constructor(private el: ElementRef) {
    }

    @HostListener('window:resize') 
    onResize(): void {
        this.matchWidth(this.el.nativeElement);
    }

    public ngAfterViewInit(): void {
        this.matchWidth(this.el.nativeElement);
    }

    public matchWidth(ele: HTMLElement): void {
        if (!ele) return;

        const width: number = ele.getBoundingClientRect().width || 0;

        ele.style.height = `${width}px`;
    }
}
