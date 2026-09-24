import { afterNextRender, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService, ROLE_LABELS } from '../../services/auth-service';
import {
  AppNotification,
  NOTIFICATION_STYLES,
  NotificationKind,
  NotificationService,
  timeAgo,
} from '../../services/notification-service';
import { ToastService } from '../../services/toast-service';

export interface ShellNavItem {
  label: string;
  path: string;
  iconPath: string;
}

@Component({
  selector: 'app-dashboard-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-shell.html',
})
export class DashboardShell {
  readonly navItems = input.required<ShellNavItem[]>();
  readonly profilePath = input<string | null>(null);
  readonly notificationsPath = input<string | null>(null);
  readonly userName = input('Fatou Diop');
  readonly userInitials = input('FD');
  readonly logoSrc = input('/logo-axa.png');
  readonly bannerSubtitle = input('Voici un aperçu de votre activité.');

  protected readonly firstName = computed(() => this.userName().split(' ')[0]);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly notificationService = inject(NotificationService);

  protected readonly notifications = this.notificationService.items;
  protected readonly unreadCount = this.notificationService.unreadCount;

  protected readonly roleLabel = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role ? ROLE_LABELS[role] : '';
  });

  protected readonly menuOpen = signal(false);
  protected readonly notifOpen = signal(false);
  protected readonly scrolled = signal(false);

  constructor() {
    afterNextRender(() => this.onWindowScroll());
  }

  protected onWindowScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    this.notifOpen.set(false);
    this.menuOpen.update((open) => !open);
  }

  protected toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.notifOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected closeAllMenus(): void {
    this.menuOpen.set(false);
    this.notifOpen.set(false);
  }

  // ---- Notifications ----
  protected style(kind: NotificationKind) {
    return NOTIFICATION_STYLES[kind];
  }

  protected ago(timestamp: number): string {
    return timeAgo(timestamp);
  }

  protected isUnread(notification: AppNotification): boolean {
    return this.notificationService.isUnread(notification);
  }

  protected openNotification(notification: AppNotification): void {
    this.notificationService.markRead(notification.id);
    this.closeAllMenus();
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  protected markAllRead(): void {
    this.notificationService.markAllRead();
  }

  protected dismiss(id: number): void {
    this.notificationService.dismiss(id);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/accueil');
    this.toast.info('Déconnecté', 'À bientôt sur ORBUS Assurances.');
  }
}
