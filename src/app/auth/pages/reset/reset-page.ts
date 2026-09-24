import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { ToastService } from '../../../shared/services/toast-service';

@Component({
  selector: 'app-reset-page',
  imports: [RouterLink, AuthShell],
  templateUrl: './reset-page.html',
})
export class ResetPage {
  private readonly toast = inject(ToastService);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const email = ((event.target as HTMLFormElement).elements.namedItem('reset-email') as HTMLInputElement | null)?.value.trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      this.toast.error('Email invalide', 'Saisissez une adresse email valide.');
      return;
    }
    this.toast.success('Lien envoyé', `Un lien de réinitialisation a été envoyé à ${email}.`);
  }
}
