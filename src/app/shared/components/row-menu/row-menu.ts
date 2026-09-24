import { Component, output, signal } from '@angular/core';

// Hauteur au-dessous de laquelle le menu bascule vers le haut (≈ 3 entrées + marges).
const MENU_SPACE_NEEDED = 190;

@Component({
  selector: 'app-row-menu',
  imports: [],
  templateUrl: './row-menu.html',
})
export class RowMenu {
  readonly opened = output<void>();

  protected readonly open = signal(false);
  /** Position du panneau : « fixed » pour ne jamais être rogné par le conteneur défilant du tableau. */
  protected readonly position = signal<{ top?: number; bottom?: number; right: number }>({ right: 0 });

  protected toggle(event: Event): void {
    event.stopPropagation();
    const next = !this.open();
    if (next) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const right = window.innerWidth - rect.right;
      const spaceBelow = window.innerHeight - rect.bottom;
      this.position.set(
        spaceBelow < MENU_SPACE_NEEDED ? { bottom: window.innerHeight - rect.top + 6, right } : { top: rect.bottom + 6, right },
      );
    }
    this.open.set(next);
    if (next) {
      this.opened.emit();
    }
  }

  close(): void {
    this.open.set(false);
  }
}
