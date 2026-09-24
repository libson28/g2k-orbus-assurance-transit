import { Component, OnDestroy, OnInit, input, output, signal } from '@angular/core';
import { ToastMessage } from '../../services/toast-service';

@Component({
  selector: 'app-toast-item',
  imports: [],
  templateUrl: './toast-item.html',
})
export class ToastItem implements OnInit, OnDestroy {
  readonly toast = input.required<ToastMessage>();
  readonly dismissed = output<number>();

  protected readonly leaving = signal(false);
  protected readonly paused = signal(false);

  private timer: ReturnType<typeof setTimeout> | null = null;
  private startedAt = 0;
  private remainingMs = 0;

  ngOnInit(): void {
    this.remainingMs = this.toast().duration;
    this.startTimer();
  }

  private startTimer(): void {
    this.startedAt = Date.now();
    this.timer = setTimeout(() => this.startExit(), this.remainingMs);
  }

  protected pause(): void {
    if (this.leaving()) return;
    this.paused.set(true);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.remainingMs -= Date.now() - this.startedAt;
  }

  protected resume(): void {
    if (this.leaving()) return;
    this.paused.set(false);
    this.startTimer();
  }

  protected startExit(): void {
    if (this.leaving()) return;
    this.leaving.set(true);
    setTimeout(() => this.dismissed.emit(this.toast().id), 220);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
