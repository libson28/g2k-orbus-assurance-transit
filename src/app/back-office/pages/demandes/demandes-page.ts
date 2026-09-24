import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { DataTable, DataTableColumn } from '../../../shared/components/data-table/data-table';
import { NotificationService, TRANSITAIRE_ROLES } from '../../../shared/services/notification-service';
import { ToastService } from '../../../shared/services/toast-service';

interface PoliceLigne {
  code: string;
  libelle: string;
  montant: number | null;
}

interface DemandeTransport {
  modeTransport: string;
  dateDepart: string;
  destination: string;
  dateArrivee: string;
  transporteur: string;
  numeroVehicule: string;
  typeCouverture: string;
}

interface Demande {
  numero: string;
  souscripteur: string;
  contrat: string;
  contratLibelle: string;
  description: string;
  periode: string;
  transport: DemandeTransport;
  documents: string[];
  polices: PoliceLigne[];
  statut: string;
  statutClass: string;
  complementMessage?: string;
  complementDate?: string;
  cotationDate?: string;
  acceptationDate?: string;
}

type FilterKey = 'toutes' | 'nouvelle' | 'complement' | 'a-coter' | 'attente-acceptation' | 'acceptee';
type ActionMode = null | 'complement' | 'cotation';

@Component({
  selector: 'app-demandes-page',
  imports: [DataTable],
  templateUrl: './demandes-page.html',
})
export class DemandesPage {
  private readonly toast = inject(ToastService);
  private readonly notifications = inject(NotificationService);

  // Guards against a transition firing on a freshly (re)created instance.
  protected readonly ready = signal(false);

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => this.ready.set(true));
      });
    });
  }

  protected readonly columns: DataTableColumn[] = [
    { key: 'numero', label: 'Demande' },
    { key: 'souscripteur', label: 'Souscripteur' },
    { key: 'contrat', label: 'Contrat' },
    { key: 'polices', label: 'Polices' },
    { key: 'statut', label: 'Statut' },
    { key: 'actions', label: '' },
  ];

  protected readonly filters: { key: FilterKey; label: string }[] = [
    { key: 'toutes', label: 'Toutes' },
    { key: 'nouvelle', label: 'Nouvelle demande' },
    { key: 'complement', label: 'Complément demandé' },
    { key: 'a-coter', label: 'À coter' },
    { key: 'attente-acceptation', label: "En attente d'acceptation" },
    { key: 'acceptee', label: 'Acceptée' },
  ];

  protected readonly demandes = signal<Demande[]>([
    {
      numero: 'COT-00125',
      souscripteur: 'ABC Transit',
      contrat: 'CTR-2026-0045',
      contratLibelle: 'Transit Maritime Annuel',
      description: 'Transport de 3 conteneurs de marchandises électroniques, Dakar → Abidjan, par voie maritime.',
      periode: '01/04/2026 → 15/04/2026',
      transport: {
        modeTransport: 'Maritime',
        dateDepart: '01/04/2026',
        destination: 'Abidjan, Côte d’Ivoire',
        dateArrivee: '15/04/2026',
        transporteur: 'Maersk Line',
        numeroVehicule: 'MSCU-771204',
        typeCouverture: 'Tous risques',
      },
      documents: ['facture_commerciale.pdf', 'liste_colisage.pdf', 'connaissement_bl.pdf', 'valeur_marchandises.pdf'],
      polices: [
        { code: 'RC-PRO', libelle: 'RC Professionnelle', montant: null },
        { code: 'MARCH', libelle: 'Marchandises Transportées', montant: null },
      ],
      statut: 'Nouvelle demande',
      statutClass: 'bg-[#1F5DA8]/10 text-[#1F5DA8]',
    },
    {
      numero: 'COT-00124',
      souscripteur: 'Baobab Trading',
      contrat: 'CTR-2024-0067',
      contratLibelle: 'Police au voyage — Import ponctuel',
      description: 'Transport de textile, Rosso → Dakar, par voie routière.',
      periode: '20/03/2026 → 27/03/2026',
      transport: {
        modeTransport: 'Routier',
        dateDepart: '20/03/2026',
        destination: 'Dakar',
        dateArrivee: '27/03/2026',
        transporteur: 'Baobab Trading',
        numeroVehicule: 'SL-2210-RS',
        typeCouverture: 'Sur mesure',
      },
      documents: ['facture_commerciale.pdf'],
      polices: [{ code: 'RC-PRO', libelle: 'RC Professionnelle', montant: null }],
      statut: 'Complément demandé',
      statutClass: 'bg-rose-50 text-rose-600',
      complementMessage: "Merci de fournir un justificatif complémentaire de la valeur déclarée des marchandises transportées.",
      complementDate: '18/03/2026',
    },
    {
      numero: 'COT-00123',
      souscripteur: 'Teranga Logistics',
      contrat: 'CTR-2025-0102',
      contratLibelle: 'Contrat-cadre Import/Export',
      description: 'Transport de denrées périssables, Dakar → Bamako, par voie routière réfrigérée.',
      periode: '05/04/2026 → 09/04/2026',
      transport: {
        modeTransport: 'Routier',
        dateDepart: '05/04/2026',
        destination: 'Bamako, Mali',
        dateArrivee: '09/04/2026',
        transporteur: 'Teranga Logistics',
        numeroVehicule: 'DK-4521-AB',
        typeCouverture: 'Tous risques',
      },
      documents: ['facture_commerciale.pdf', 'liste_colisage.pdf'],
      polices: [
        { code: 'TRT', libelle: 'Tous Risques Transport', montant: null },
        { code: 'ENTR', libelle: 'Entrepôt / Stockage', montant: null },
      ],
      statut: 'À coter',
      statutClass: 'bg-amber-50 text-amber-600',
    },
    {
      numero: 'COT-00122',
      souscripteur: 'ABC Transit',
      contrat: 'CTR-2024-0091',
      contratLibelle: 'Transit Routier Sous-Régional',
      description: 'Importation de pièces automobiles par voie aérienne.',
      periode: '12/03/2026 → 19/03/2026',
      transport: {
        modeTransport: 'Aérien',
        dateDepart: '12/03/2026',
        destination: 'Aéroport de Dakar',
        dateArrivee: '19/03/2026',
        transporteur: 'Air Sénégal Cargo',
        numeroVehicule: 'AS-CARGO-118',
        typeCouverture: 'FAP (Franc d’avaries particulières)',
      },
      documents: ['facture_commerciale.pdf', 'connaissement_bl.pdf'],
      polices: [{ code: 'RC-PRO', libelle: 'RC Professionnelle', montant: 150000 }],
      statut: "En attente d'acceptation",
      statutClass: 'bg-indigo-50 text-indigo-600',
      cotationDate: '15/03/2026',
    },
    {
      numero: 'COT-00108',
      souscripteur: 'Sahel Freight',
      contrat: 'CTR-2024-0091',
      contratLibelle: 'Transit Routier Sous-Régional',
      description: 'Importation de pièces automobiles, cotation acceptée par le souscripteur.',
      periode: '01/02/2026 → 08/02/2026',
      transport: {
        modeTransport: 'Routier',
        dateDepart: '01/02/2026',
        destination: 'Dakar',
        dateArrivee: '08/02/2026',
        transporteur: 'Sahel Freight',
        numeroVehicule: 'KL-0234-EF',
        typeCouverture: 'Tous risques',
      },
      documents: ['facture_commerciale.pdf'],
      polices: [{ code: 'RC-PRO', libelle: 'RC Professionnelle', montant: 2400000 }],
      statut: 'Acceptée',
      statutClass: 'bg-emerald-50 text-emerald-600',
      cotationDate: '02/02/2026',
      acceptationDate: '05/02/2026',
    },
  ]);

  protected readonly activeFilter = signal<FilterKey>('toutes');
  protected readonly selectedNumero = signal<string | null>(null);
  protected readonly drawerOpen = signal(false);
  protected readonly actionMode = signal<ActionMode>(null);
  protected readonly complementMessage = signal('');
  protected readonly draftMontants = signal<Record<string, string>>({});

  private static readonly FILTER_STATUT: Record<Exclude<FilterKey, 'toutes'>, string> = {
    nouvelle: 'Nouvelle demande',
    complement: 'Complément demandé',
    'a-coter': 'À coter',
    'attente-acceptation': "En attente d'acceptation",
    acceptee: 'Acceptée',
  };

  protected readonly filteredDemandes = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'toutes') {
      return this.demandes();
    }
    const statut = DemandesPage.FILTER_STATUT[filter as Exclude<FilterKey, 'toutes'>];
    return this.demandes().filter((d) => d.statut === statut);
  });

  protected readonly selectedDemande = computed(
    () => this.demandes().find((d) => d.numero === this.selectedNumero()) ?? null,
  );

  protected readonly cotationTotal = computed(() => {
    const demande = this.selectedDemande();
    if (!demande) {
      return 0;
    }
    const drafts = this.draftMontants();
    return demande.polices.reduce((sum, p) => sum + (Number(drafts[p.code]) || 0), 0);
  });

  protected setFilter(key: FilterKey): void {
    this.activeFilter.set(key);
  }

  protected openDemande(numero: string): void {
    this.selectedNumero.set(numero);
    this.actionMode.set(null);
    this.complementMessage.set('');
    this.draftMontants.set({});
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  protected setActionMode(mode: ActionMode): void {
    this.actionMode.set(mode);
  }

  protected onComplementInput(event: Event): void {
    this.complementMessage.set((event.target as HTMLTextAreaElement).value);
  }

  protected onMontantInput(code: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.draftMontants.update((current) => ({ ...current, [code]: value }));
  }

  protected sendComplement(): void {
    const numero = this.selectedNumero();
    const message = this.complementMessage().trim();
    if (!numero || !message) {
      return;
    }
    this.demandes.update((list) =>
      list.map((d) =>
        d.numero === numero
          ? {
              ...d,
              statut: 'Complément demandé',
              statutClass: 'bg-rose-50 text-rose-600',
              complementMessage: message,
              complementDate: this.today(),
            }
          : d,
      ),
    );
    this.closeDrawer();
    this.toast.info('Complément demandé', `Message envoyé au souscripteur pour ${numero}.`);
  }

  protected formatFcfa(value: number): string {
    return value.toLocaleString('fr-FR');
  }

  protected totalMontant(demande: Demande): number {
    return demande.polices.reduce((sum, p) => sum + (p.montant ?? 0), 0);
  }

  private today(): string {
    return new Date().toLocaleDateString('fr-FR');
  }

  protected sendCotation(): void {
    const numero = this.selectedNumero();
    const demande = this.selectedDemande();
    if (!numero || !demande) {
      return;
    }
    const drafts = this.draftMontants();
    const allFilled = demande.polices.every((p) => Number(drafts[p.code]) > 0);
    if (!allFilled) {
      this.toast.warning('Cotation incomplète', 'Renseignez un montant pour chaque police avant d’envoyer.');
      return;
    }

    this.demandes.update((list) =>
      list.map((d) =>
        d.numero === numero
          ? {
              ...d,
              polices: d.polices.map((p) => ({ ...p, montant: Number(drafts[p.code]) })),
              statut: "En attente d'acceptation",
              statutClass: 'bg-indigo-50 text-indigo-600',
              cotationDate: this.today(),
            }
          : d,
      ),
    );
    this.closeDrawer();
    this.notifications.push({
      audience: TRANSITAIRE_ROLES,
      kind: 'cotation',
      title: 'Cotation à accepter',
      detail: `Une cotation a été établie pour la demande ${numero} : elle attend votre acceptation.`,
      link: '/espace-transitaire/cotations',
    });
    this.toast.success('Cotation envoyée', `${numero} est en attente d’acceptation par le souscripteur.`);
  }
}
