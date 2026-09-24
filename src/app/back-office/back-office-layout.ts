import { Component, computed, inject } from '@angular/core';
import { DashboardShell, ShellNavItem } from '../shared/components/dashboard-shell/dashboard-shell';
import { AuthService } from '../shared/services/auth-service';

const DASHBOARD: ShellNavItem = {
  label: 'Dashboard',
  path: 'dashboard',
  iconPath:
    'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z',
};

const DEMANDES: ShellNavItem = {
  label: 'Demandes de cotation',
  path: 'demandes',
  iconPath:
    'M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322-1.096.128-1.907 1.077-1.907 2.185V19.5A2.25 2.25 0 0 0 6.75 21.75h10.5A2.25 2.25 0 0 0 19.5 19.5V4.757c0-1.108-.811-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z',
};

const CONTRATS: ShellNavItem = {
  label: 'Contrats',
  path: 'contrats',
  iconPath:
    'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
};

const OPERATIONS: ShellNavItem = {
  label: 'Opérations',
  path: 'operations',
  iconPath:
    'M9 12.75 11.25 15 15 9.75M21 7.5V6a2.25 2.25 0 0 0-2.25-2.25H15M3 7.5V6a2.25 2.25 0 0 1 2.25-2.25H9m0 0v-.75A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5v.75M9 5.25h6M4.5 7.5h15v12.75a1.5 1.5 0 0 1-1.5 1.5h-12a1.5 1.5 0 0 1-1.5-1.5V7.5Z',
};

const POLICES: ShellNavItem = {
  label: "Polices d'assurance",
  path: 'polices',
  iconPath:
    'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
};

const SOUSCRIPTEURS: ShellNavItem = {
  label: 'Souscripteurs',
  path: 'souscripteurs',
  iconPath:
    'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
};

const AGENTS: ShellNavItem = {
  label: 'Agents',
  path: 'agents',
  iconPath:
    'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
};

@Component({
  selector: 'app-back-office-layout',
  imports: [DashboardShell],
  templateUrl: './back-office-layout.html',
})
export class BackOfficeLayout {
  private readonly authService = inject(AuthService);
  protected readonly currentUser = this.authService.currentUser;

  protected readonly navItems = computed<ShellNavItem[]>(() => {
    const role = this.currentUser()?.role;
    const items = [DASHBOARD, DEMANDES, CONTRATS, OPERATIONS];

    if (role === 'superviseur' || role === 'admin') {
      items.push(POLICES, AGENTS);
    }
    if (role === 'admin') {
      items.push(SOUSCRIPTEURS);
    }

    return items;
  });

  protected readonly userName = computed(() => this.currentUser()?.name ?? 'Agent Assureur');
  protected readonly userInitials = computed(() => this.currentUser()?.initials ?? 'AA');
}
