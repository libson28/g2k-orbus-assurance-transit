import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicDemande, PublicDemandesStore } from '../../services/public-demandes-store';
import { OtpChannel, OtpService } from '../../../shared/services/otp-service';
import { ToastService } from '../../../shared/services/toast-service';
import { WizardStepper } from '../../../shared/components/wizard-stepper/wizard-stepper';

type Phase = 'lookup' | 'otp' | 'result';

@Component({
  selector: 'app-suivre-demande-page',
  imports: [RouterLink, WizardStepper],
  templateUrl: './suivre-demande-page.html',
})
export class SuivreDemandePage {
  private readonly store = inject(PublicDemandesStore);
  private readonly otp = inject(OtpService);
  private readonly toast = inject(ToastService);

  protected readonly phase = signal<Phase>('lookup');

  // Étapes du cycle de vie d'une demande, affichées dans le stepper des résultats.
  protected readonly stages = [
    { n: 1, label: 'Demande envoyée' },
    { n: 2, label: 'En étude' },
    { n: 3, label: 'Cotation' },
    { n: 4, label: 'Acceptée' },
  ];

  protected readonly currentStage = computed(() => {
    const map: Record<string, number> = {
      'Demande envoyée': 1,
      'En étude': 2,
      'Complément demandé': 2,
      "En attente d'acceptation": 3,
      Acceptée: 4,
    };
    return map[this.demande()?.statut ?? ''] ?? 1;
  });

  // ---- Lookup ----
  protected readonly numero = signal('');
  protected readonly lookupTouched = signal(false);
  protected readonly lookupError = signal<string | null>(null);
  protected readonly demande = signal<PublicDemande | null>(null);

  protected onNumeroInput(event: Event): void {
    this.numero.set((event.target as HTMLInputElement).value.toUpperCase());
    this.lookupError.set(null);
  }

  protected lookup(): void {
    this.lookupTouched.set(true);
    const numero = this.numero().trim();
    if (!numero) {
      return;
    }
    const found = this.store.findByNumero(numero);
    if (!found) {
      this.lookupError.set("Aucune demande ne correspond à ce numéro. Vérifiez qu'il est correctement saisi.");
      this.toast.error('Demande introuvable', `Aucune demande ne correspond au numéro ${numero}.`);
      return;
    }
    this.demande.set(found);
    this.otpChannel.set(null);
    this.otpSent.set(false);
    this.otpCode.set('');
    this.otpExpected.set('');
    this.otpTouched.set(false);
    this.phase.set('otp');
  }

  // ---- OTP ----
  protected readonly otpChannel = signal<OtpChannel | null>(null);
  protected readonly otpSent = signal(false);
  protected readonly otpCode = signal('');
  protected readonly otpExpected = signal('');
  protected readonly otpTouched = signal(false);

  protected readonly maskedEmail = computed(() => this.otp.mask('email', this.demande()?.contact.email ?? ''));
  protected readonly maskedTelephone = computed(() => this.otp.mask('sms', this.demande()?.contact.telephone ?? ''));
  protected readonly otpValid = computed(() => this.otpCode().trim().length === 6 && this.otpCode().trim() === this.otpExpected());

  protected backToLookup(): void {
    this.phase.set('lookup');
    this.demande.set(null);
  }

  protected selectOtpChannel(channel: OtpChannel): void {
    this.otpChannel.set(channel);
  }

  protected sendOtp(): void {
    const channel = this.otpChannel();
    if (!channel) return;
    const code = this.otp.generate();
    this.otpExpected.set(code);
    this.otpSent.set(true);
    this.otpCode.set('');
    this.otpTouched.set(false);
    const destination = channel === 'email' ? this.maskedEmail() : this.maskedTelephone();
    this.toast.info(
      `Code envoyé par ${channel === 'email' ? 'email' : 'SMS'}`,
      `Destinataire ${destination} — code de démonstration : ${code}`,
      8000,
    );
  }

  protected resendOtp(): void {
    this.sendOtp();
  }

  protected onOtpInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6);
    this.otpCode.set(value);
  }

  protected verifyOtp(): void {
    this.otpTouched.set(true);
    if (!this.otpValid()) {
      this.toast.error('Code incorrect', 'Vérifiez le code reçu et réessayez.');
      return;
    }
    this.phase.set('result');
    this.toast.success('Identité vérifiée', 'Voici le suivi de votre demande.');
  }

  protected startOver(): void {
    this.phase.set('lookup');
    this.numero.set('');
    this.lookupTouched.set(false);
    this.lookupError.set(null);
    this.demande.set(null);
  }
}
