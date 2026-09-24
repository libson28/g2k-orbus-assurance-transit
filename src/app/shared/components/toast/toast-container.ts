import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast-service';
import { ToastItem } from './toast-item';

@Component({
  selector: 'app-toast-container',
  imports: [ToastItem],
  templateUrl: './toast-container.html',
})
export class ToastContainer {
  private readonly toastService = inject(ToastService);

  protected readonly toasts = this.toastService.toasts;

  protected dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
