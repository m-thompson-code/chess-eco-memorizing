import { Directive, ElementRef, HostListener, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[mooSquare]'
})
export class SquareDirective implements AfterViewInit {
    constructor(private element: ElementRef) {
    }

    @HostListener('window:resize') public onResize(): void {
        this.matchWidth(this.element.nativeElement);
    }

    public ngAfterViewInit(): void {
        this.matchWidth(this.element.nativeElement);
    }

    public matchWidth(element: HTMLElement): void {
        if (!element) return;

        const width: number = element.getBoundingClientRect().width || 0;

        element.style.height = `${width}px`;
    }
}
