import { Component, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { AuthShell, AuthStep } from '../../components/auth-shell/auth-shell';
import { ToastService } from '../../../shared/services/toast-service';

@Component({
  selector: 'app-otp-page',
  imports: [AuthShell],
  templateUrl: './otp-page.html',
})
export class OtpPage {
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected verify(): void {
    if (this.digits().some((d) => !d)) {
      this.toast.warning('Code incomplet', 'Saisissez les 6 chiffres du code reçu.');
      return;
    }
    this.toast.success('Identité vérifiée', 'Votre compte est activé.');
    this.router.navigateByUrl('/accueil');
  }

  protected resend(): void {
    this.toast.info('Code renvoyé', 'Un nouveau code vient de vous être envoyé.');
  }

  protected readonly steps: AuthStep[] = [
    { label: 'Créer votre compte' },
    { label: 'Vérifier votre identité' },
    { label: 'Accéder à votre espace' },
  ];

  protected readonly digits = signal(['', '', '', '', '', '']);
  private readonly digitInputs = viewChildren<ElementRef<HTMLInputElement>>('digitInput');

  protected onDigitInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1);

    this.digits.update((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });

    if (value && index < this.digits().length - 1) {
      this.digitInputs()[index + 1]?.nativeElement.focus();
    }
  }

  protected onDigitKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) {
      this.digitInputs()[index - 1]?.nativeElement.focus();
    }
  }
}
