import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { POLICES_CATALOG } from '../../../espace-transitaire/data/polices-catalog';
import {
  PUBLIC_MODE_PAIEMENT_LOGOS,
  PublicDemandesStore,
  PublicModePaiement,
} from '../../services/public-demandes-store';
import { OtpChannel, OtpService } from '../../../shared/services/otp-service';
import { ToastService } from '../../../shared/services/toast-service';
import { WizardStepper } from '../../../shared/components/wizard-stepper/wizard-stepper';

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;
type Phase = 'form' | 'otp' | 'done';

interface PieceRow {
  key: string;
  policeCode: string;
  policeLibelle: string;
  label: string;
}

interface ModePaiementOption {
  key: PublicModePaiement;
  label: string;
  hint: string;
  logo: string;
  logoClass: string;
}

const MODES_TRANSPORT = ['Maritime', 'Routier', 'Aérien', 'Multimodal'];
const TYPES_COUVERTURE = ['Tous risques', 'FAP (Franc d’avaries particulières)', 'Sur mesure'];
const MODES_PAIEMENT: ModePaiementOption[] = [
  { key: 'wave', label: 'Wave', hint: 'Paiement mobile', logo: PUBLIC_MODE_PAIEMENT_LOGOS.wave, logoClass: 'h-9 w-9' },
  { key: 'orange-money', label: 'Orange Money', hint: 'Paiement mobile', logo: PUBLIC_MODE_PAIEMENT_LOGOS['orange-money'], logoClass: 'h-9 w-9' },
  { key: 'carte', label: 'Carte bancaire', hint: 'Visa, Mastercard', logo: PUBLIC_MODE_PAIEMENT_LOGOS.carte, logoClass: 'h-9 w-14' },
];

@Component({
  selector: 'app-demande-publique-page',
  imports: [RouterLink, WizardStepper],
  templateUrl: './demande-publique-page.html',
})
export class DemandePubliquePage {
  private readonly router = inject(Router);
  private readonly store = inject(PublicDemandesStore);
  private readonly otp = inject(OtpService);
  private readonly toast = inject(ToastService);

  protected readonly steps: { n: number; label: string }[] = [
    { n: 1, label: 'Coordonnées' },
    { n: 2, label: 'Expédition' },
    { n: 3, label: 'Polices' },
    { n: 4, label: 'Documents' },
    { n: 5, label: 'Récapitulatif' },
    { n: 6, label: 'Paiement' },
    { n: 7, label: 'Vérification' },
  ];

  protected readonly modesTransport = MODES_TRANSPORT;
  protected readonly typesCouverture = TYPES_COUVERTURE;
  protected readonly polices = POLICES_CATALOG;
  protected readonly modesPaiement = MODES_PAIEMENT;

  protected readonly phase = signal<Phase>('form');
  protected readonly step = signal<WizardStep>(1);

  // 1-6 = formulaire, 7 = vérification OTP, 8 = terminé (toutes les étapes cochées)
  protected readonly currentStep = computed(() => (this.phase() === 'form' ? this.step() : this.phase() === 'otp' ? 7 : 8));

  // Step 1 — Coordonnées
  protected readonly nom = signal('');
  protected readonly societe = signal('');
  protected readonly email = signal('');
  protected readonly telephone = signal('');

  // Step 2 — Marchandise
  protected readonly nature = signal('');
  protected readonly description = signal('');
  protected readonly valeur = signal('');
  protected readonly quantite = signal('');
  protected readonly poidsVolume = signal('');
  protected readonly typeEmballage = signal('');

  // Step 2 — Transport
  protected readonly modeTransport = signal('');
  protected readonly dateDepart = signal('');
  protected readonly destination = signal('');
  protected readonly dateArrivee = signal('');
  protected readonly transporteur = signal('');
  protected readonly numeroVehicule = signal('');
  protected readonly typeCouverture = signal('');
  protected readonly dateDemande = new Date().toLocaleDateString('fr-FR');

  // Step 3 — Polices
  protected readonly selectedPoliceCodes = signal<string[]>([]);
  protected readonly policeSearch = signal('');

  protected readonly selectedPolicesList = computed(() => {
    const codes = this.selectedPoliceCodes();
    return this.polices.filter((p) => codes.includes(p.code));
  });

  protected readonly filteredPolices = computed(() => {
    const query = this.policeSearch().trim().toLowerCase();
    if (!query) return this.polices;
    return this.polices.filter(
      (p) => p.libelle.toLowerCase().includes(query) || p.description.toLowerCase().includes(query),
    );
  });

  protected onPoliceSearchInput(event: Event): void {
    this.policeSearch.set((event.target as HTMLInputElement).value);
  }

  // Step 4 — Pièces attendues des polices sélectionnées
  protected readonly pieceRows = computed<PieceRow[]>(() => {
    const codes = this.selectedPoliceCodes();
    const seen = new Set<string>();
    const rows: PieceRow[] = [];
    for (const code of codes) {
      const police = this.polices.find((p) => p.code === code);
      if (!police) continue;
      for (const label of police.piecesAttendues) {
        const key = `${code}::${label}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({ key, policeCode: code, policeLibelle: police.libelle, label });
      }
    }
    return rows;
  });

  protected readonly documentFiles = signal<Record<string, string | null>>({});

  // Step 5 — Moyen de paiement souhaité pour le règlement de la prime (une fois la cotation reçue)
  protected readonly modePaiement = signal<PublicModePaiement>('wave');
  protected readonly telephonePaiement = signal('');
  protected readonly carteNumero = signal('');
  protected readonly carteExpiration = signal('');
  protected readonly carteCvc = signal('');
  protected readonly carteTitulaire = signal('');

  protected readonly paiementValid = computed(() => {
    if (this.modePaiement() === 'carte') {
      return (
        this.carteNumero().replace(/\s/g, '').length >= 13 &&
        /^(0[1-9]|1[0-2])\/\d{2}$/.test(this.carteExpiration()) &&
        /^\d{3,4}$/.test(this.carteCvc()) &&
        this.carteTitulaire().trim().length > 1
      );
    }
    return this.telephonePaiement().replace(/\D/g, '').length >= 9;
  });

  protected readonly moyenPaiementResume = computed(() => {
    const option = this.modesPaiement.find((m) => m.key === this.modePaiement())!;
    const reference =
      this.modePaiement() === 'carte'
        ? `carte se terminant par ${this.carteNumero().replace(/\s/g, '').slice(-4) || '····'}`
        : this.telephonePaiement().trim() || '—';
    return `${option.label} · ${reference}`;
  });

  protected setModePaiement(mode: PublicModePaiement): void {
    this.modePaiement.set(mode);
  }

  protected onTelephonePaiementInput(event: Event): void {
    this.telephonePaiement.set((event.target as HTMLInputElement).value);
  }

  protected onCarteNumeroInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
    input.value = grouped;
    this.carteNumero.set(grouped);
  }

  protected onCarteExpirationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    input.value = formatted;
    this.carteExpiration.set(formatted);
  }

  protected onCarteCvcInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = digits;
    this.carteCvc.set(digits);
  }

  protected onCarteTitulaireInput(event: Event): void {
    this.carteTitulaire.set((event.target as HTMLInputElement).value);
  }

  // ---- Validation ----
  protected readonly nomValid = computed(() => this.nom().trim().length > 0);
  protected readonly societeValid = computed(() => this.societe().trim().length > 0);
  protected readonly emailValid = computed(() => /^\S+@\S+\.\S+$/.test(this.email().trim()));
  protected readonly telephoneValid = computed(() => this.telephone().trim().replace(/\D/g, '').length >= 9);

  protected canContinue(): boolean {
    switch (this.step()) {
      case 1:
        return this.nomValid() && this.societeValid() && this.emailValid() && this.telephoneValid();
      case 2:
        return (
          this.nature().trim().length > 0 &&
          this.valeur().trim().length > 0 &&
          this.quantite().trim().length > 0 &&
          !!this.modeTransport() &&
          !!this.dateDepart() &&
          this.destination().trim().length > 0 &&
          !!this.dateArrivee() &&
          !!this.typeCouverture()
        );
      case 3:
        return this.selectedPoliceCodes().length > 0;
      case 6:
        return this.paiementValid();
      default:
        return true;
    }
  }

  protected onNomInput(event: Event): void {
    this.nom.set((event.target as HTMLInputElement).value);
  }
  protected onSocieteInput(event: Event): void {
    this.societe.set((event.target as HTMLInputElement).value);
  }
  protected onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }
  protected onTelephoneInput(event: Event): void {
    this.telephone.set((event.target as HTMLInputElement).value);
  }

  protected onNatureInput(event: Event): void {
    this.nature.set((event.target as HTMLInputElement).value);
  }
  protected onDescriptionInput(event: Event): void {
    this.description.set((event.target as HTMLTextAreaElement).value);
  }
  protected onValeurInput(event: Event): void {
    this.valeur.set((event.target as HTMLInputElement).value);
  }
  protected onQuantiteInput(event: Event): void {
    this.quantite.set((event.target as HTMLInputElement).value);
  }
  protected onPoidsVolumeInput(event: Event): void {
    this.poidsVolume.set((event.target as HTMLInputElement).value);
  }
  protected onTypeEmballageInput(event: Event): void {
    this.typeEmballage.set((event.target as HTMLInputElement).value);
  }
  protected setModeTransport(mode: string): void {
    this.modeTransport.set(mode);
  }
  protected onDateDepartInput(event: Event): void {
    this.dateDepart.set((event.target as HTMLInputElement).value);
  }
  protected onDestinationInput(event: Event): void {
    this.destination.set((event.target as HTMLInputElement).value);
  }
  protected onDateArriveeInput(event: Event): void {
    this.dateArrivee.set((event.target as HTMLInputElement).value);
  }
  protected onTransporteurInput(event: Event): void {
    this.transporteur.set((event.target as HTMLInputElement).value);
  }
  protected onNumeroVehiculeInput(event: Event): void {
    this.numeroVehicule.set((event.target as HTMLInputElement).value);
  }
  protected setTypeCouverture(type: string): void {
    this.typeCouverture.set(type);
  }

  protected togglePolice(code: string): void {
    this.selectedPoliceCodes.update((current) =>
      current.includes(code) ? current.filter((c) => c !== code) : [...current, code],
    );
  }

  protected onPieceFileSelected(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const fileName = input.files?.[0]?.name ?? null;
    this.documentFiles.update((files) => ({ ...files, [key]: fileName }));
  }

  protected goNext(): void {
    if (this.step() < 6 && this.canContinue()) {
      this.step.update((s) => (s + 1) as WizardStep);
    }
  }

  protected goBack(): void {
    if (this.step() > 1) {
      this.step.update((s) => (s - 1) as WizardStep);
    }
  }

  protected onStepClick(n: number): void {
    if (this.phase() === 'done' || n >= this.currentStep()) {
      return;
    }
    this.phase.set('form');
    this.step.set(n as WizardStep);
  }

  // ---- OTP anti-robot verification ----
  protected readonly otpChannel = signal<OtpChannel | null>(null);
  protected readonly otpSent = signal(false);
  protected readonly otpCode = signal('');
  protected readonly otpExpected = signal('');
  protected readonly otpTouched = signal(false);
  protected readonly submittedNumero = signal<string | null>(null);

  protected readonly maskedEmail = computed(() => this.otp.mask('email', this.email().trim()));
  protected readonly maskedTelephone = computed(() => this.otp.mask('sms', this.telephone().trim()));
  protected readonly otpValid = computed(() => this.otpCode().trim().length === 6 && this.otpCode().trim() === this.otpExpected());

  protected startVerification(): void {
    this.phase.set('otp');
    this.otpChannel.set(null);
    this.otpSent.set(false);
    this.otpCode.set('');
    this.otpExpected.set('');
    this.otpTouched.set(false);
  }

  protected backToForm(): void {
    this.phase.set('form');
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

    const numero = this.store.generateNumero();
    this.store.add({
      numero,
      contact: {
        nom: this.nom().trim(),
        societe: this.societe().trim(),
        email: this.email().trim(),
        telephone: this.telephone().trim(),
      },
      marchandise: {
        nature: this.nature().trim(),
        description: this.description().trim(),
        valeur: this.valeur().trim(),
        quantite: this.quantite().trim(),
        poidsVolume: this.poidsVolume().trim(),
        typeEmballage: this.typeEmballage().trim(),
      },
      transport: {
        modeTransport: this.modeTransport(),
        dateDepart: this.dateDepart(),
        destination: this.destination().trim(),
        dateArrivee: this.dateArrivee(),
        transporteur: this.transporteur().trim(),
        numeroVehicule: this.numeroVehicule().trim(),
        typeCouverture: this.typeCouverture(),
      },
      polices: this.selectedPolicesList().map((p) => ({ code: p.code, libelle: p.libelle })),
      documents: this.pieceRows().map((row) => ({ label: row.label, fileName: this.documentFiles()[row.key] ?? null })),
      moyenPaiement: {
        mode: this.modePaiement(),
        reference:
          this.modePaiement() === 'carte'
            ? `•••• ${this.carteNumero().replace(/\s/g, '').slice(-4)}`
            : this.telephonePaiement().trim(),
      },
      statut: 'Demande envoyée',
      statutClass: 'bg-slate-100 text-slate-500',
      historique: [{ label: 'Demande envoyée', date: this.dateDemande }],
      dateDemande: this.dateDemande,
    });

    this.submittedNumero.set(numero);
    this.phase.set('done');
    this.toast.success('Demande envoyée', `Votre numéro de suivi est ${numero}.`);
  }

  protected goToTracking(): void {
    this.router.navigateByUrl('/suivre-ma-demande');
  }
}
