import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { AuthService } from '../../../shared/services/auth-service';
import { ToastService } from '../../../shared/services/toast-service';

@Component({
  selector: 'app-change-password-page',
  imports: [AuthShell],
  templateUrl: './change-password-page.html',
})
export class ChangePasswordPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly userName = computed(() => this.authService.currentUser()?.name ?? '');

  protected readonly passwordVisible = signal(false);
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly touched = signal(false);

  protected readonly lengthValid = computed(() => this.newPassword().length >= 12);
  protected readonly matchValid = computed(() => this.newPassword().length > 0 && this.newPassword() === this.confirmPassword());
  protected readonly formValid = computed(() => this.lengthValid() && this.matchValid());

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected onNewPasswordInput(event: Event): void {
    this.newPassword.set((event.target as HTMLInputElement).value);
  }

  protected onConfirmPasswordInput(event: Event): void {
    this.confirmPassword.set((event.target as HTMLInputElement).value);
  }

  protected onSubmit(): void {
    this.touched.set(true);
    if (!this.formValid()) {
      return;
    }

    this.authService.clearMustChangePassword();

    const role = this.authService.currentUser()?.role;
    const redirect = role === 'souscripteur' ? '/espace-transitaire/dashboard' : '/back-office/dashboard';
    this.router.navigateByUrl(redirect);
    this.toast.success('Mot de passe mis à jour', 'Bienvenue ! Votre nouveau mot de passe est actif.');
  }
}
