import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AppNotification,
  NOTIFICATION_STYLES,
  NotificationKind,
  NotificationService,
  timeAgo,
} from '../../../shared/services/notification-service';

/** Historique complet des notifications du profil connecté (transitaire ou back-office). */
@Component({
  selector: 'app-notifications-page',
  imports: [],
  templateUrl: './notifications-page.html',
})
export class NotificationsPage {
  private readonly service = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly notifications = this.service.items;
  protected readonly unreadCount = this.service.unreadCount;
  protected readonly hasUnread = computed(() => this.unreadCount() > 0);

  protected style(kind: NotificationKind) {
    return NOTIFICATION_STYLES[kind];
  }

  protected ago(timestamp: number): string {
    return timeAgo(timestamp);
  }

  protected isUnread(notification: AppNotification): boolean {
    return this.service.isUnread(notification);
  }

  protected open(notification: AppNotification): void {
    this.service.markRead(notification.id);
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  protected markAllRead(): void {
    this.service.markAllRead();
  }

  protected dismiss(id: number): void {
    this.service.dismiss(id);
  }
}
