import { afterNextRender, Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
})
export class Modal {
  readonly open = input.required<boolean>();
  readonly title = input<string | null>(null);
  readonly subtitle = input<string | null>(null);
  readonly maxWidth = input('max-w-lg');
  readonly closed = output<void>();

  // Guards against a transition firing on a freshly (re)created instance —
  // only enabled after at least one committed paint (double rAF), never on
  // initial mount. afterNextRender alone isn't enough: when a route is
  // revisited (chunk already cached), Angular's "next render" can resolve
  // before the browser has actually painted the closed state, so the
  // subsequent class application still animates.
  protected readonly ready = signal(false);

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => this.ready.set(true));
      });
    });
  }

  protected close(): void {
    this.closed.emit();
  }

  protected stop(event: Event): void {
    event.stopPropagation();
  }
}
