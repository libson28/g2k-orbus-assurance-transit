import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../shared/services/toast-service';
import { POLICES_CATALOG } from '../../data/polices-catalog';
import { OperationsStore, STATUT_CLASSES, STATUT_NOUVELLE } from '../../services/operations-store';
import { WizardStepper } from '../../../shared/components/wizard-stepper/wizard-stepper';

type WizardStep = 1 | 2 | 3 | 4;

interface PieceRow {
  key: string;
  policeCode: string;
  policeLibelle: string;
  label: string;
}

const MODES_TRANSPORT = ['Maritime', 'Routier', 'Aérien', 'Multimodal'];
const TYPES_COUVERTURE = ['Tous risques', 'FAP (Franc d’avaries particulières)', 'Sur mesure'];

@Component({
  selector: 'app-demande-cotation-page',
  imports: [WizardStepper],
  templateUrl: './demande-cotation-page.html',
})
export class DemandeCotationPage {
  private readonly toast = inject(ToastService);

  protected readonly steps: { n: WizardStep; label: string }[] = [
    { n: 1, label: 'Informations' },
    { n: 2, label: 'Polices' },
    { n: 3, label: 'Documents' },
    { n: 4, label: 'Récapitulatif' },
  ];

  protected readonly modesTransport = MODES_TRANSPORT;
  protected readonly typesCouverture = TYPES_COUVERTURE;

  protected readonly polices = POLICES_CATALOG;

  protected readonly step = signal<WizardStep>(1);
  protected readonly submitted = signal(false);
  protected readonly submittedNumero = signal<string | null>(null);

  // Step 1 — Informations : marchandise
  protected readonly nature = signal('');
  protected readonly description = signal('');
  protected readonly valeur = signal('');
  protected readonly quantite = signal('');
  protected readonly poidsVolume = signal('');
  protected readonly typeEmballage = signal('');

  // Step 1 — Informations : transport
  protected readonly modeTransport = signal('');
  protected readonly dateDepart = signal('');
  protected readonly destination = signal('');
  protected readonly dateArrivee = signal('');
  protected readonly transporteur = signal('');
  protected readonly numeroVehicule = signal('');
  protected readonly typeCouverture = signal('');
  protected readonly dateDemande = new Date().toLocaleDateString('fr-FR');

  // Step 2 — Polices (l'assuré ne fait que choisir ; le montant est coté par l'assureur)
  protected readonly selectedPoliceCodes = signal<string[]>([]);
  protected readonly policeSearch = signal('');

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

  // Step 3 — Pièces attendues des polices sélectionnées (une entrée par pièce unique)
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

  // Le contrat n'est plus choisi ici : la demande y est liée à l'acceptation de la cotation.
  protected readonly selectedPolicesList = computed(() => {
    const codes = this.selectedPoliceCodes();
    return this.polices.filter((p) => codes.includes(p.code));
  });

  constructor(
    private readonly router: Router,
    private readonly operationsStore: OperationsStore,
  ) {}

  protected canContinue(): boolean {
    switch (this.step()) {
      case 1:
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
      case 2:
        return this.selectedPoliceCodes().length > 0;
      default:
        return true;
    }
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
    if (this.step() < 4 && this.canContinue()) {
      this.step.update((s) => (s + 1) as WizardStep);
    }
  }

  protected goBack(): void {
    if (this.step() > 1) {
      this.step.update((s) => (s - 1) as WizardStep);
    }
  }

  protected goToStep(n: number): void {
    if (n < this.step()) {
      this.step.set(n as WizardStep);
    }
  }

  protected submit(): void {
    const numero = `OP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const files = this.documentFiles();
    const polices = this.selectedPolicesList();

    this.operationsStore.add({
      numero,
      libelle: this.nature().trim() || 'Nouvelle demande',
      contrat: null,
      polices: polices.map((p) => p.libelle).join(' + '),
      policesDetail: polices.map((p) => ({ code: p.code, libelle: p.libelle })),
      montant: null,
      statut: STATUT_NOUVELLE,
      statutClass: STATUT_CLASSES[STATUT_NOUVELLE],
      action: 'Suivre',
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
      documents: this.pieceRows().map((row) => ({ label: row.label, fileName: files[row.key] ?? null })),
      dateDemande: this.dateDemande,
    });

    this.submittedNumero.set(numero);
    this.submitted.set(true);
    this.toast.success('Demande envoyée', `${numero} a été transmise à l’agent assureur.`);
  }

  protected finish(): void {
    this.router.navigateByUrl('/espace-transitaire/cotations');
  }
}
