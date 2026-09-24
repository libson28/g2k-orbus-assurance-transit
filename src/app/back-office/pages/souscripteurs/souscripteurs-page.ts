import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { Modal } from '../../../shared/components/modal/modal';
import { ToastService } from '../../../shared/services/toast-service';
import { DataTable, DataTableColumn } from '../../../shared/components/data-table/data-table';
import { RowMenu } from '../../../shared/components/row-menu/row-menu';

interface SouscripteurContrat {
  numero: string;
  libelle: string;
  montantTotal: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  statutClass: string;
}

interface Souscripteur {
  ninea: string;
  raisonSociale: string;
  adresse: string;
  representant: string;
  agent: string;
  agentEmail: string;
  cadNom: string;
  cadEmail: string;
  superviseur: string;
  nbContrats: number;
  contrats: SouscripteurContrat[];
  archived: boolean;
}

type Vue = 'actifs' | 'archives';

const DEMO_PASSWORD = 'orbus2026!';

@Component({
  selector: 'app-souscripteurs-page',
  imports: [Modal, DataTable, RowMenu],
  templateUrl: './souscripteurs-page.html',
})
export class SouscripteursPage {
  private readonly toast = inject(ToastService);

  protected readonly columns: DataTableColumn[] = [
    { key: 'raisonSociale', label: 'Souscripteur' },
    { key: 'email', label: 'Email' },
    { key: 'agent', label: 'Agent transitaire' },
    { key: 'cad', label: 'Superviseur (CAD)' },
    { key: 'contrats', label: 'Contrats' },
    { key: 'statut', label: 'Statut' },
    { key: 'actions', label: '' },
  ];

  // Guards against a transition firing on a freshly (re)created instance.
  protected readonly ready = signal(false);

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => this.ready.set(true));
      });
    });
  }

  protected readonly souscripteurs = signal<Souscripteur[]>([
    {
      ninea: 'SN-0123456789',
      raisonSociale: 'ABC Transit',
      adresse: 'Zone Industrielle, Dakar',
      representant: 'Moussa Ndiaye — Gérant',
      agent: 'Fatou Diop',
      agentEmail: 'transitaire@axa.sn',
      cadNom: 'Aminata Sarr',
      cadEmail: 'aminata.sarr@abctransit.sn',
      superviseur: 'Ibrahima Sow',
      nbContrats: 1,
      contrats: [
        { numero: 'CTR-2026-0045', libelle: 'Transit Maritime Annuel', montantTotal: '50 000 000 FCFA', dateDebut: '01/01/2026', dateFin: '31/12/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600' },
      ],
      archived: false,
    },
    {
      ninea: 'SN-0198765432',
      raisonSociale: 'Teranga Logistics',
      adresse: 'Route de Rufisque, Dakar',
      representant: 'Aïssatou Fall — Directrice',
      agent: 'Cheikh Ba',
      agentEmail: 'cheikh.ba@teranga.sn',
      cadNom: '',
      cadEmail: '',
      superviseur: 'Ibrahima Sow',
      nbContrats: 1,
      contrats: [
        { numero: 'CTR-2025-0102', libelle: 'Contrat-cadre Import/Export', montantTotal: '18 500 000 FCFA', dateDebut: '01/10/2025', dateFin: '30/09/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600' },
      ],
      archived: false,
    },
    {
      ninea: 'SN-0145678923',
      raisonSociale: 'Sahel Freight',
      adresse: 'Zone Aéroportuaire, Dakar',
      representant: 'Omar Sy — Gérant',
      agent: 'Awa Diallo',
      agentEmail: 'awa.diallo@sahel.sn',
      cadNom: '',
      cadEmail: '',
      superviseur: 'Ibrahima Sow',
      nbContrats: 1,
      contrats: [
        { numero: 'CTR-2024-0091', libelle: 'Transit Routier Sous-Régional', montantTotal: '9 000 000 FCFA', dateDebut: '16/06/2025', dateFin: '15/06/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600' },
      ],
      archived: false,
    },
    {
      ninea: 'SN-0167891234',
      raisonSociale: 'Baobab Trading',
      adresse: 'Poste de Rosso, Saint-Louis',
      representant: 'Mariama Cissé — Gérante',
      agent: 'Cheikh Ba',
      agentEmail: 'cheikh.ba@baobab.sn',
      cadNom: '',
      cadEmail: '',
      superviseur: 'Ibrahima Sow',
      nbContrats: 1,
      contrats: [
        { numero: 'CTR-2024-0067', libelle: 'Police au voyage — Import ponctuel', montantTotal: '4 200 000 FCFA', dateDebut: '01/03/2025', dateFin: '28/02/2026', statut: 'Épuisé', statutClass: 'bg-amber-50 text-amber-600' },
      ],
      archived: false,
    },
    {
      ninea: 'SN-0134567891',
      raisonSociale: 'Cargo Sénégal SARL',
      adresse: 'Port Autonome, Dakar',
      representant: 'Modou Diop — Directeur',
      agent: 'Fatou Diop',
      agentEmail: 'fatou.diop@cargosn.sn',
      cadNom: '',
      cadEmail: '',
      superviseur: 'Ibrahima Sow',
      nbContrats: 1,
      contrats: [
        { numero: 'CTR-2023-0134', libelle: 'Transit Maritime Annuel', montantTotal: '20 000 000 FCFA', dateDebut: '01/01/2025', dateFin: '31/12/2025', statut: 'Expiré', statutClass: 'bg-slate-100 text-slate-500' },
      ],
      archived: false,
    },
  ]);

  // ---- Vue Actifs / Archivés ----
  protected readonly vue = signal<Vue>('actifs');
  protected readonly nbActifs = computed(() => this.souscripteurs().filter((s) => !s.archived).length);
  protected readonly nbArchives = computed(() => this.souscripteurs().filter((s) => s.archived).length);
  protected readonly visibleSouscripteurs = computed(() =>
    this.souscripteurs().filter((s) => s.archived === (this.vue() === 'archives')),
  );

  // ---- Create / edit drawer ----
  protected readonly drawerOpen = signal(false);
  /** NINÉA du souscripteur en cours de modification (null = création). C'est son identifiant : il n'est pas modifiable. */
  protected readonly editingNinea = signal<string | null>(null);
  protected readonly created = signal<{ email: string; password: string } | null>(null);

  protected readonly formNinea = signal('');
  protected readonly formRaisonSociale = signal('');
  protected readonly formAdresse = signal('');
  protected readonly formAgentNom = signal('');
  protected readonly formAgentEmail = signal('');
  protected readonly formCadNom = signal('');
  protected readonly formCadEmail = signal('');
  protected readonly touched = signal(false);

  protected readonly raisonSocialeValid = computed(() => this.formRaisonSociale().trim().length > 0);
  protected readonly nineaValid = computed(() => this.formNinea().trim().length > 0);
  protected readonly agentNomValid = computed(() => this.formAgentNom().trim().length > 0);
  protected readonly agentEmailValid = computed(() => /^\S+@\S+\.\S+$/.test(this.formAgentEmail().trim()));
  protected readonly cadEmailValid = computed(() => !this.formCadEmail().trim() || /^\S+@\S+\.\S+$/.test(this.formCadEmail().trim()));
  protected readonly formValid = computed(
    () => this.raisonSocialeValid() && this.nineaValid() && this.agentNomValid() && this.agentEmailValid() && this.cadEmailValid(),
  );

  protected openDrawer(): void {
    this.editingNinea.set(null);
    this.formNinea.set('');
    this.formRaisonSociale.set('');
    this.formAdresse.set('');
    this.formAgentNom.set('');
    this.formAgentEmail.set('');
    this.formCadNom.set('');
    this.formCadEmail.set('');
    this.touched.set(false);
    this.created.set(null);
    this.drawerOpen.set(true);
  }

  protected openEdit(s: Souscripteur): void {
    this.editingNinea.set(s.ninea);
    this.formNinea.set(s.ninea);
    this.formRaisonSociale.set(s.raisonSociale);
    this.formAdresse.set(s.adresse === '—' ? '' : s.adresse);
    this.formAgentNom.set(s.agent);
    this.formAgentEmail.set(s.agentEmail);
    this.formCadNom.set(s.cadNom);
    this.formCadEmail.set(s.cadEmail);
    this.touched.set(false);
    this.created.set(null);
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  protected onNineaInput(event: Event): void {
    this.formNinea.set((event.target as HTMLInputElement).value);
  }

  protected onRaisonSocialeInput(event: Event): void {
    this.formRaisonSociale.set((event.target as HTMLInputElement).value);
  }

  protected onAdresseInput(event: Event): void {
    this.formAdresse.set((event.target as HTMLInputElement).value);
  }

  protected onAgentNomInput(event: Event): void {
    this.formAgentNom.set((event.target as HTMLInputElement).value);
  }

  protected onAgentEmailInput(event: Event): void {
    this.formAgentEmail.set((event.target as HTMLInputElement).value);
  }

  protected onCadNomInput(event: Event): void {
    this.formCadNom.set((event.target as HTMLInputElement).value);
  }

  protected onCadEmailInput(event: Event): void {
    this.formCadEmail.set((event.target as HTMLInputElement).value);
  }

  protected submit(): void {
    this.touched.set(true);
    if (!this.formValid()) {
      return;
    }

    const email = this.formAgentEmail().trim();
    const editing = this.editingNinea();

    if (editing) {
      this.souscripteurs.update((list) =>
        list.map((s) =>
          s.ninea === editing
            ? {
                ...s,
                raisonSociale: this.formRaisonSociale().trim(),
                adresse: this.formAdresse().trim() || '—',
                agent: this.formAgentNom().trim(),
                agentEmail: email,
                cadNom: this.formCadNom().trim(),
                cadEmail: this.formCadEmail().trim(),
              }
            : s,
        ),
      );
      this.closeDrawer();
      this.toast.success('Souscripteur modifié', `${this.formRaisonSociale().trim()} — informations mises à jour.`);
      return;
    }

    this.souscripteurs.update((list) => [
      ...list,
      {
        ninea: this.formNinea().trim(),
        raisonSociale: this.formRaisonSociale().trim(),
        adresse: this.formAdresse().trim() || '—',
        representant: '—',
        agent: this.formAgentNom().trim(),
        agentEmail: email,
        cadNom: this.formCadNom().trim(),
        cadEmail: this.formCadEmail().trim(),
        superviseur: 'Ibrahima Sow',
        nbContrats: 0,
        contrats: [],
        archived: false,
      },
    ]);

    this.created.set({ email, password: DEMO_PASSWORD });
    this.toast.success('Souscripteur créé', `${this.formRaisonSociale().trim()} — identifiants générés.`);
  }

  // ---- Détails popup + contract creation/édition ----
  protected readonly selectedNinea = signal<string | null>(null);
  protected readonly creatingContract = signal(false);
  protected readonly editingContratNumero = signal<string | null>(null);

  protected readonly selected = computed(() => this.souscripteurs().find((s) => s.ninea === this.selectedNinea()) ?? null);

  protected openDetails(ninea: string): void {
    this.selectedNinea.set(ninea);
    this.creatingContract.set(false);
    this.editingContratNumero.set(null);
    this.resetContractForm();
  }

  protected closeDetails(): void {
    this.selectedNinea.set(null);
    this.creatingContract.set(false);
    this.editingContratNumero.set(null);
  }

  protected readonly formContratLibelle = signal('');
  protected readonly formContratMontant = signal('');
  protected readonly formContratDateDebut = signal('');
  protected readonly formContratDateFin = signal('');
  protected readonly contractTouched = signal(false);

  protected readonly contratLibelleValid = computed(() => this.formContratLibelle().trim().length > 0);
  protected readonly contratMontantValid = computed(() => this.formContratMontant().trim().length > 0);
  protected readonly contractFormValid = computed(() => this.contratLibelleValid() && this.contratMontantValid());

  private resetContractForm(): void {
    this.formContratLibelle.set('');
    this.formContratMontant.set('');
    this.formContratDateDebut.set('');
    this.formContratDateFin.set('');
    this.contractTouched.set(false);
  }

  protected openCreateContract(): void {
    this.editingContratNumero.set(null);
    this.resetContractForm();
    this.creatingContract.set(true);
  }

  protected openEditContract(contrat: SouscripteurContrat): void {
    this.editingContratNumero.set(contrat.numero);
    this.formContratLibelle.set(contrat.libelle);
    this.formContratMontant.set(contrat.montantTotal);
    this.formContratDateDebut.set(contrat.dateDebut === '—' ? '' : contrat.dateDebut);
    this.formContratDateFin.set(contrat.dateFin === '—' ? '' : contrat.dateFin);
    this.contractTouched.set(false);
    this.creatingContract.set(true);
  }

  protected cancelCreateContract(): void {
    this.creatingContract.set(false);
    this.editingContratNumero.set(null);
  }

  protected submitContract(): void {
    this.contractTouched.set(true);
    if (!this.contractFormValid()) {
      return;
    }
    const ninea = this.selectedNinea();
    if (!ninea) {
      return;
    }

    const editingNumero = this.editingContratNumero();

    if (editingNumero) {
      this.souscripteurs.update((list) =>
        list.map((s) =>
          s.ninea === ninea
            ? {
                ...s,
                contrats: s.contrats.map((c) =>
                  c.numero === editingNumero
                    ? {
                        ...c,
                        libelle: this.formContratLibelle().trim(),
                        montantTotal: this.formContratMontant().trim(),
                        dateDebut: this.formContratDateDebut() || '—',
                        dateFin: this.formContratDateFin() || '—',
                      }
                    : c,
                ),
              }
            : s,
        ),
      );
      this.creatingContract.set(false);
      this.editingContratNumero.set(null);
      this.toast.success('Contrat modifié', `${editingNumero} mis à jour.`);
      return;
    }

    const numero = `CTR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const nouveauContrat: SouscripteurContrat = {
      numero,
      libelle: this.formContratLibelle().trim(),
      montantTotal: this.formContratMontant().trim(),
      dateDebut: this.formContratDateDebut() || '—',
      dateFin: this.formContratDateFin() || '—',
      statut: 'Actif',
      statutClass: 'bg-emerald-50 text-emerald-600',
    };

    this.souscripteurs.update((list) =>
      list.map((s) =>
        s.ninea === ninea
          ? { ...s, contrats: [nouveauContrat, ...s.contrats], nbContrats: s.nbContrats + 1 }
          : s,
      ),
    );

    this.creatingContract.set(false);
    this.toast.success('Contrat créé', `${numero} ajouté au souscripteur.`);
  }

  // ---- Archiver / supprimer ----
  protected readonly confirmingNinea = signal<string | null>(null);

  protected confirmDelete(ninea: string): void {
    this.confirmingNinea.set(ninea);
  }

  protected toggleArchive(souscripteur: Souscripteur): void {
    const archive = !souscripteur.archived;
    this.souscripteurs.update((list) => list.map((s) => (s.ninea === souscripteur.ninea ? { ...s, archived: archive } : s)));
    if (archive) {
      this.toast.info('Souscripteur archivé', `${souscripteur.raisonSociale} n'apparaît plus dans la liste des souscripteurs actifs.`);
    } else {
      this.toast.success('Souscripteur restauré', `${souscripteur.raisonSociale} est de nouveau actif.`);
    }
  }

  protected deleteSouscripteur(souscripteur: Souscripteur): void {
    if (this.selectedNinea() === souscripteur.ninea) {
      this.closeDetails();
    }
    this.souscripteurs.update((list) => list.filter((s) => s.ninea !== souscripteur.ninea));
    this.confirmingNinea.set(null);
    this.toast.success('Souscripteur supprimé', `${souscripteur.raisonSociale} et ses contrats ont été supprimés.`);
  }
}
