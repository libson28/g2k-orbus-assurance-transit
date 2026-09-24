import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../shared/services/auth-service';
import { ToastService } from '../../../shared/services/toast-service';
import { DataTable, DataTableColumn } from '../../../shared/components/data-table/data-table';
import { RowMenu } from '../../../shared/components/row-menu/row-menu';

interface PoliceAssurance {
  code: string;
  libelle: string;
  objet: string;
  piecesAttendues: string[];
}

const SEED_POLICES: PoliceAssurance[] = [
  {
    code: 'RC-PRO',
    libelle: 'RC Professionnelle',
    objet: "Couvre les dommages causés aux clients ou aux tiers dans le cadre de l'activité professionnelle du transitaire.",
    piecesAttendues: ["Statuts de l'entreprise", "Attestation d'activité", 'Historique des sinistres'],
  },
  {
    code: 'RC-COM',
    libelle: 'RC Commissionnaire de transport',
    objet: 'Couvre la responsabilité du transitaire lorsqu’il agit comme commissionnaire et organise le transport.',
    piecesAttendues: ['Contrat de commission', 'Registre des opérations'],
  },
  {
    code: 'RC-TRANS',
    libelle: 'RC Transporteur',
    objet: 'Couvre les dommages aux marchandises lorsque le transitaire intervient également comme transporteur.',
    piecesAttendues: ['Licence de transport', 'Carte grise du véhicule'],
  },
  {
    code: 'MARCH',
    libelle: 'Marchandises Transportées',
    objet: 'Couvre les pertes ou dommages subis par les marchandises pendant le transport maritime, aérien, routier ou multimodal.',
    piecesAttendues: ['Facture commerciale', 'Liste de colisage', 'Connaissement / LTA'],
  },
  {
    code: 'TRT',
    libelle: 'Tous Risques Transport',
    objet: "Offre une couverture étendue des risques de perte ou d'avarie des marchandises pendant le transport.",
    piecesAttendues: ['Facture commerciale', 'Valeur déclarée des marchandises'],
  },
  {
    code: 'FAP',
    libelle: 'FAP / FAP sauf',
    objet: 'Couverture spécifique des risques maritimes, selon les conditions prévues au contrat.',
    piecesAttendues: ['Connaissement maritime', "Certificat d'assurance précédent"],
  },
  {
    code: 'ABON',
    libelle: "Police d'abonnement / flottante",
    objet: "Couvre automatiquement plusieurs expéditions successives déclarées à l'assureur.",
    piecesAttendues: ["Déclaration d'expédition", 'Registre des opérations'],
  },
  {
    code: 'VOYAGE',
    libelle: 'Police au voyage',
    objet: 'Couvre une expédition ou un trajet déterminé.',
    piecesAttendues: ['Facture commerciale', 'Itinéraire du transport'],
  },
  {
    code: 'ANNUEL',
    libelle: 'Police annuelle / contrat-cadre',
    objet: 'Définit les conditions générales de couverture pour une période donnée, avec déclaration des opérations.',
    piecesAttendues: ["Prévisionnel annuel d'activité", 'Historique des opérations'],
  },
  {
    code: 'RC-EXPL',
    libelle: 'RC Exploitation',
    objet: "Couvre les dommages causés à des tiers dans le cadre de l'exploitation de l'entreprise.",
    piecesAttendues: ["Statuts de l'entreprise", "Attestation d'activité"],
  },
  {
    code: 'DEPOT',
    libelle: 'Biens confiés / marchandises en dépôt',
    objet: 'Couvre les marchandises appartenant aux clients lorsqu’elles sont temporairement sous la garde du transitaire.',
    piecesAttendues: ['Bon de dépôt', 'Inventaire des marchandises'],
  },
  {
    code: 'ENTREPOT',
    libelle: 'Entrepôt / magasin sous douane',
    objet: 'Couvre les risques liés aux marchandises stockées dans les installations du transitaire.',
    piecesAttendues: ["Autorisation d'entrepôt sous douane", 'Plan des installations'],
  },
  {
    code: 'DOUANE',
    libelle: 'Risques douaniers / garantie douanière',
    objet: 'Garantit certaines obligations financières ou douanières liées aux opérations effectuées pour le compte des clients.',
    piecesAttendues: ['Agrément douanier', 'Caution bancaire'],
  },
  {
    code: 'CREDIT',
    libelle: 'Crédit / garantie financière',
    objet: "Protège contre certains risques d'impayés ou obligations financières selon le montage contractuel.",
    piecesAttendues: ['États financiers', 'Contrat commercial'],
  },
  {
    code: 'AUTO',
    libelle: 'Automobile / flotte',
    objet: 'Couvre les véhicules utilisés par le transitaire pour les opérations de transport et de livraison.',
    piecesAttendues: ['Carte grise', 'Permis de conduire des chauffeurs'],
  },
];

@Component({
  selector: 'app-polices-page',
  imports: [DataTable, RowMenu],
  templateUrl: './polices-page.html',
})
export class PolicesPage {
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly canManage = computed(() => this.authService.currentUser()?.role === 'admin');

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
    { key: 'code', label: 'Code' },
    { key: 'libelle', label: 'Libellé' },
    { key: 'objet', label: 'Objet / couverture' },
    { key: 'pieces', label: 'Pièces attendues' },
    { key: 'actions', label: '' },
  ];

  protected readonly polices = signal<PoliceAssurance[]>(SEED_POLICES);

  protected readonly confirmingCode = signal<string | null>(null);

  protected confirmDelete(code: string): void {
    this.confirmingCode.set(code);
  }

  // ---- Drawer (création + édition) ----
  protected readonly drawerOpen = signal(false);
  protected readonly editingCode = signal<string | null>(null);
  protected readonly formCode = signal('');
  protected readonly formLibelle = signal('');
  protected readonly formObjet = signal('');
  protected readonly formPieces = signal('');
  protected readonly touched = signal(false);

  protected readonly codeValid = computed(() => this.formCode().trim().length > 0);
  protected readonly libelleValid = computed(() => this.formLibelle().trim().length > 0);
  protected readonly formValid = computed(() => this.codeValid() && this.libelleValid());

  protected openDrawer(): void {
    this.editingCode.set(null);
    this.formCode.set('');
    this.formLibelle.set('');
    this.formObjet.set('');
    this.formPieces.set('');
    this.touched.set(false);
    this.drawerOpen.set(true);
  }

  protected openEdit(police: PoliceAssurance): void {
    this.editingCode.set(police.code);
    this.formCode.set(police.code);
    this.formLibelle.set(police.libelle);
    this.formObjet.set(police.objet);
    this.formPieces.set(police.piecesAttendues.join(', '));
    this.touched.set(false);
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  protected onCodeInput(event: Event): void {
    this.formCode.set((event.target as HTMLInputElement).value.toUpperCase());
  }

  protected onLibelleInput(event: Event): void {
    this.formLibelle.set((event.target as HTMLInputElement).value);
  }

  protected onObjetInput(event: Event): void {
    this.formObjet.set((event.target as HTMLTextAreaElement).value);
  }

  protected onPiecesInput(event: Event): void {
    this.formPieces.set((event.target as HTMLInputElement).value);
  }

  protected submit(): void {
    this.touched.set(true);
    if (!this.formValid()) {
      return;
    }
    const pieces = this.formPieces()
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const code = this.formCode().trim();
    const libelle = this.formLibelle().trim();
    const editing = this.editingCode();

    if (editing) {
      this.polices.update((list) =>
        list.map((p) =>
          p.code === editing
            ? { code, libelle, objet: this.formObjet().trim() || '—', piecesAttendues: pieces.length > 0 ? pieces : ['Aucune pièce définie'] }
            : p,
        ),
      );
      this.closeDrawer();
      this.toast.success('Police modifiée', `${code} — ${libelle}.`);
      return;
    }

    this.polices.update((list) => [
      ...list,
      {
        code,
        libelle,
        objet: this.formObjet().trim() || '—',
        piecesAttendues: pieces.length > 0 ? pieces : ['Aucune pièce définie'],
      },
    ]);
    this.closeDrawer();
    this.toast.success('Police ajoutée', `${code} — ${libelle}.`);
  }

  protected deletePolice(police: PoliceAssurance): void {
    this.polices.update((list) => list.filter((p) => p.code !== police.code));
    this.confirmingCode.set(null);
    this.toast.info('Police supprimée', `${police.code} — ${police.libelle}.`);
  }
}
