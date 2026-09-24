import { Directive, ElementRef, HostBinding, afterNextRender, inject, signal } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
})
export class ScrollRevealDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  protected readonly revealed = signal(false);

  @HostBinding('class.transition-all') protected readonly alwaysTransition = true;
  @HostBinding('class.duration-700') protected readonly alwaysDuration = true;
  @HostBinding('class.ease-out') protected readonly alwaysEase = true;

  @HostBinding('class.opacity-0') protected get hiddenOpacity(): boolean {
    return !this.revealed();
  }

  @HostBinding('class.translate-y-8') protected get hiddenTranslate(): boolean {
    return !this.revealed();
  }

  @HostBinding('class.opacity-100') protected get shownOpacity(): boolean {
    return this.revealed();
  }

  @HostBinding('class.translate-y-0') protected get shownTranslate(): boolean {
    return this.revealed();
  }

  constructor() {
    afterNextRender(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        this.revealed.set(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.revealed.set(true);
            observer.disconnect();
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
      );
      observer.observe(this.el.nativeElement);
    });
  }
}
