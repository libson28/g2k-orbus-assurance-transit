import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { AuthService, CurrentUser } from '../../../shared/services/auth-service';
import { ToastService } from '../../../shared/services/toast-service';

interface DemoAccount {
  password: string;
  redirectTo: string;
  user: CurrentUser;
}

const DEMO_ACCOUNTS: Record<string, DemoAccount> = {
  'admin@axa.sn': {
    password: 'passer123',
    redirectTo: '/back-office/dashboard',
    user: { name: 'Admin AXA', initials: 'AA', email: 'admin@axa.sn', role: 'admin' },
  },
  'superviseur@axa.sn': {
    password: 'passer123',
    redirectTo: '/back-office/dashboard',
    user: { name: 'Mamadou Kane', initials: 'MK', email: 'superviseur@axa.sn', role: 'superviseur' },
  },
  'agent.assureur@axa.sn': {
    password: 'passer123',
    redirectTo: '/back-office/dashboard',
    user: { name: 'Moustapha Diagne', initials: 'MD', email: 'agent.assureur@axa.sn', role: 'agent-assureur' },
  },
  'transitaire@axa.sn': {
    password: 'passer123',
    redirectTo: '/espace-transitaire/dashboard',
    user: { name: 'Fatou Diop', initials: 'FD', email: 'transitaire@axa.sn', role: 'souscripteur', hasTeam: true },
  },
  'nouveau@axa.sn': {
    password: 'orbus2026!',
    redirectTo: '/espace-transitaire/dashboard',
    user: {
      name: 'Compte souscripteur',
      initials: 'CS',
      email: 'nouveau@axa.sn',
      role: 'souscripteur',
      hasTeam: true,
      mustChangePassword: true,
    },
  },
};

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, AuthShell],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly toast = inject(ToastService);
  protected readonly passwordVisible = signal(false);
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly errorMessage = signal<string | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.errorMessage.set(null);
  }

  protected onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
    this.errorMessage.set(null);
  }

  protected onSubmit(): void {
    const account = DEMO_ACCOUNTS[this.email().trim().toLowerCase()];

    if (!account || account.password !== this.password()) {
      this.errorMessage.set('Email ou mot de passe incorrect.');
      this.toast.error('Connexion refusée', 'Email ou mot de passe incorrect.');
      return;
    }

    this.authService.login(account.user);
    if (!account.user.mustChangePassword) {
      this.toast.success(`Bienvenue, ${account.user.name.split(' ')[0]}`, 'Connexion réussie.');
    }
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    this.router.navigateByUrl(redirect || account.redirectTo);
  }
}
