import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../shared/services/auth-service';
import { ToastService } from '../../../shared/services/toast-service';
import { DataTable, DataTableColumn } from '../../../shared/components/data-table/data-table';
import { RowMenu } from '../../../shared/components/row-menu/row-menu';

interface Agent {
  nom: string;
  email: string;
  telephone: string;
  dateAjout: string;
  statut: string;
  statutClass: string;
  archived: boolean;
}

type Vue = 'actifs' | 'archives';

const ARCHIVE_CLASS = 'bg-slate-200 text-slate-600';

const DEMO_PASSWORD = 'passer123';

@Component({
  selector: 'app-agents-page',
  imports: [DataTable, RowMenu],
  templateUrl: './agents-page.html',
})
export class AgentsPage {
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
    { key: 'nom', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'dateAjout', label: "Ajouté le" },
    { key: 'statut', label: 'Statut' },
    { key: 'actions', label: '' },
  ];

  protected readonly agents = signal<Agent[]>([
    { nom: 'Moustapha Diagne', email: 'agent.assureur@axa.sn', telephone: '+221 77 456 12 34', dateAjout: '02/01/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600', archived: false },
    { nom: 'Aïda Ndoye', email: 'aida.ndoye@axa.sn', telephone: '+221 78 902 45 67', dateAjout: '14/02/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600', archived: false },
    { nom: 'Ousmane Fall', email: 'ousmane.fall@axa.sn', telephone: '+221 76 334 78 90', dateAjout: '03/03/2026', statut: 'Inactif', statutClass: 'bg-slate-100 text-slate-500', archived: false },
  ]);

  // ---- Vue Actifs / Archivés ----
  protected readonly vue = signal<Vue>('actifs');
  protected readonly nbActifs = computed(() => this.agents().filter((a) => !a.archived).length);
  protected readonly nbArchives = computed(() => this.agents().filter((a) => a.archived).length);
  protected readonly visibleAgents = computed(() => this.agents().filter((a) => a.archived === (this.vue() === 'archives')));

  protected statutLabel(a: Agent): string {
    return a.archived ? 'Archivé' : a.statut;
  }

  protected statutClassOf(a: Agent): string {
    return a.archived ? ARCHIVE_CLASS : a.statutClass;
  }

  // ---- Create / edit drawer ----
  protected readonly drawerOpen = signal(false);
  /** Email de l'agent en cours de modification (null = création). C'est son identifiant de connexion : il n'est pas modifiable. */
  protected readonly editingEmail = signal<string | null>(null);
  protected readonly created = signal<{ email: string; password: string } | null>(null);

  protected readonly formNom = signal('');
  protected readonly formEmail = signal('');
  protected readonly formTelephone = signal('');
  protected readonly touched = signal(false);

  protected readonly nomValid = computed(() => this.formNom().trim().length > 0);
  protected readonly emailValid = computed(() => /^\S+@\S+\.\S+$/.test(this.formEmail().trim()));
  protected readonly formValid = computed(() => this.nomValid() && this.emailValid());

  protected openDrawer(): void {
    this.editingEmail.set(null);
    this.formNom.set('');
    this.formEmail.set('');
    this.formTelephone.set('');
    this.touched.set(false);
    this.created.set(null);
    this.drawerOpen.set(true);
  }

  protected openEdit(agent: Agent): void {
    this.editingEmail.set(agent.email);
    this.formNom.set(agent.nom);
    this.formEmail.set(agent.email);
    this.formTelephone.set(agent.telephone === '—' ? '' : agent.telephone);
    this.touched.set(false);
    this.created.set(null);
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  protected onNomInput(event: Event): void {
    this.formNom.set((event.target as HTMLInputElement).value);
  }

  protected onEmailInput(event: Event): void {
    this.formEmail.set((event.target as HTMLInputElement).value);
  }

  protected onTelephoneInput(event: Event): void {
    this.formTelephone.set((event.target as HTMLInputElement).value);
  }

  protected submit(): void {
    this.touched.set(true);
    if (!this.formValid()) {
      return;
    }

    const email = this.formEmail().trim();
    const editing = this.editingEmail();

    if (editing) {
      this.agents.update((list) =>
        list.map((a) =>
          a.email === editing ? { ...a, nom: this.formNom().trim(), telephone: this.formTelephone().trim() || '—' } : a,
        ),
      );
      this.closeDrawer();
      this.toast.success('Agent modifié', `${this.formNom().trim()} — informations mises à jour.`);
      return;
    }

    this.agents.update((list) => [
      {
        nom: this.formNom().trim(),
        email,
        telephone: this.formTelephone().trim() || '—',
        dateAjout: new Date().toLocaleDateString('fr-FR'),
        statut: 'Actif',
        statutClass: 'bg-emerald-50 text-emerald-600',
        archived: false,
      },
      ...list,
    ]);

    this.created.set({ email, password: DEMO_PASSWORD });
    this.toast.success('Agent ajouté', `${this.formNom().trim()} — identifiants générés.`);
  }

  // ---- Archiver / supprimer ----
  protected readonly confirmingEmail = signal<string | null>(null);

  protected confirmDelete(email: string): void {
    this.confirmingEmail.set(email);
  }

  protected toggleArchive(agent: Agent): void {
    const archive = !agent.archived;
    this.agents.update((list) => list.map((a) => (a.email === agent.email ? { ...a, archived: archive } : a)));
    if (archive) {
      this.toast.info('Agent archivé', `${agent.nom} n'apparaît plus dans la liste des agents actifs.`);
    } else {
      this.toast.success('Agent restauré', `${agent.nom} est de nouveau dans la liste des agents actifs.`);
    }
  }

  protected deleteAgent(agent: Agent): void {
    this.agents.update((list) => list.filter((a) => a.email !== agent.email));
    this.confirmingEmail.set(null);
    this.toast.success('Agent supprimé', `${agent.nom} a été supprimé.`);
  }
}
