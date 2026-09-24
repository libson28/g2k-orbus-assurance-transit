import { Component, computed, input, output } from '@angular/core';

export interface WizardStepItem {
  n: number;
  label: string;
}

@Component({
  selector: 'app-wizard-stepper',
  imports: [],
  templateUrl: './wizard-stepper.html',
})
export class WizardStepper {
  readonly steps = input.required<WizardStepItem[]>();
  readonly current = input.required<number>();
  readonly activeClass = input('bg-[#1F5DA8]');
  readonly interactive = input(true);
  readonly stepClick = output<number>();

  // Au-delà de 5 étapes, les libellés inactifs n'apparaissent qu'à partir de lg pour ne jamais faire déborder la barre.
  protected readonly many = computed(() => this.steps().length > 5);
}
