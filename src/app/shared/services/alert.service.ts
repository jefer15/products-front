import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class AlertService {

  message = signal<string | null>(null);
  type = signal<AlertType>('info');

  show(message: string, type: AlertType = 'info'): void {
    this.message.set(message);
    this.type.set(type);

    setTimeout(() => {
      this.clear();
    }, 2000);
  }

  clear(): void {
    this.message.set(null);
  }
}
