import { Component, computed, inject } from '@angular/core';
import { DashboardShell, ShellNavItem } from '../shared/components/dashboard-shell/dashboard-shell';
import { AuthService } from '../shared/services/auth-service';

@Component({
  selector: 'app-espace-transitaire-layout',
  imports: [DashboardShell],
  templateUrl: './espace-transitaire-layout.html',
})
export class EspaceTransitaireLayout {
  private readonly authService = inject(AuthService);
  protected readonly userName = computed(() => this.authService.currentUser()?.name ?? 'Fatou Diop');
  protected readonly userInitials = computed(() => this.authService.currentUser()?.initials ?? 'FD');

  protected readonly navItems: ShellNavItem[] = [
    {
      label: 'Dashboard',
      path: 'dashboard',
      iconPath:
        'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z',
    },
    {
      label: 'Demande de cotations',
      path: 'cotations',
      iconPath:
        'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z',
    },
    {
      label: 'Opérations',
      path: 'operations',
      iconPath:
        'M9 12.75 11.25 15 15 9.75M21 7.5V6a2.25 2.25 0 0 0-2.25-2.25H15M3 7.5V6a2.25 2.25 0 0 1 2.25-2.25H9m0 0v-.75A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5v.75M9 5.25h6M4.5 7.5h15v12.75a1.5 1.5 0 0 1-1.5 1.5h-12a1.5 1.5 0 0 1-1.5-1.5V7.5Z',
    },
    {
      label: 'Mes contrats',
      path: 'contrats',
      iconPath:
        'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
    },
    {
      label: 'Mon équipe',
      path: 'equipe',
      iconPath:
        'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
  ];
}
