import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface AuthStep {
  label: string;
}

@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink],
  templateUrl: './auth-shell.html',
})
export class AuthShell {
  readonly badge = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly steps = input<AuthStep[]>([]);
  readonly activeStep = input(1);
}
