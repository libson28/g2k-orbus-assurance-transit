import { Component, signal } from '@angular/core';
import { CONTRATS_TRANSITAIRE } from '../../data/contrats-catalog';

@Component({
  selector: 'app-contrats-page',
  imports: [],
  templateUrl: './contrats-page.html',
})
export class ContratsPage {
  protected readonly contrats = CONTRATS_TRANSITAIRE;

  protected readonly expanded = signal<string | null>(null);

  protected toggle(numero: string): void {
    this.expanded.update((current) => (current === numero ? null : numero));
  }
}
