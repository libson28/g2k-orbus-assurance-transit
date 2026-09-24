import { Injectable } from '@angular/core';

export type OtpChannel = 'email' | 'sms';

@Injectable({ providedIn: 'root' })
export class OtpService {
  generate(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  mask(channel: OtpChannel, value: string): string {
    if (channel === 'email') {
      const [user, domain] = value.split('@');
      if (!domain) return value;
      const visible = user.slice(0, Math.min(2, user.length));
      return `${visible}${'•'.repeat(Math.max(user.length - visible.length, 2))}@${domain}`;
    }
    const digits = value.replace(/\D/g, '');
    return `•• •• ${digits.slice(-2)}`;
  }
}
