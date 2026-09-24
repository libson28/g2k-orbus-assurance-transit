import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;
}

const DEFAULT_DURATION = 4500;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private counter = 0;

  show(variant: ToastVariant, title: string, description?: string, duration = DEFAULT_DURATION): number {
    const id = ++this.counter;
    this._toasts.update((list) => [...list, { id, variant, title, description, duration }]);
    return id;
  }

  success(title: string, description?: string, duration?: number): number {
    return this.show('success', title, description, duration);
  }

  error(title: string, description?: string, duration?: number): number {
    return this.show('error', title, description, duration);
  }

  warning(title: string, description?: string, duration?: number): number {
    return this.show('warning', title, description, duration);
  }

  info(title: string, description?: string, duration?: number): number {
    return this.show('info', title, description, duration);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
