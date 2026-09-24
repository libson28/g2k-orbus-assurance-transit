import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../shared/services/auth-service';
import { ToastService } from '../../../shared/services/toast-service';
import { DataTable, DataTableColumn } from '../../../shared/components/data-table/data-table';

type MembreRole = 'Agent transitaire' | 'Superviseur (CAD)';

interface Membre {
  nom: string;
  email: string;
  telephone: string;
  role: MembreRole;
  roleClass: string;
  statut: string;
  statutClass: string;
}

const ROLE_CLASS: Record<MembreRole, string> = {
  'Agent transitaire': 'bg-[#1F5DA8]/10 text-[#1F5DA8]',
  'Superviseur (CAD)': 'bg-indigo-50 text-indigo-600',
};

@Component({
  selector: 'app-equipe-page',
  imports: [DataTable],
  templateUrl: './equipe-page.html',
})
export class EquipePage {
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly canManage = computed(() => this.authService.currentUser()?.role === 'souscripteur');
  /** Chosen at registration: souscripteur handles requests and supervision alone, without a team. */
  protected readonly soloMode = computed(() => this.authService.currentUser()?.hasTeam === false);

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
    { key: 'email', label: 'Contact' },
    { key: 'role', label: 'Rôle' },
    { key: 'statut', label: 'Statut' },
  ];

  protected readonly souscripteur = {
    raisonSociale: 'ABC Transit',
    ninea: 'SN-0123456789',
  };

  protected readonly membres = signal<Membre[]>([
    {
      nom: 'Fatou Diop',
      email: 'fatou.diop@entreprise.sn',
      telephone: '+221 77 123 45 67',
      role: 'Agent transitaire',
      roleClass: ROLE_CLASS['Agent transitaire'],
      statut: 'Actif',
      statutClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      nom: 'Aminata Sarr',
      email: 'aminata.sarr@entreprise.sn',
      telephone: '+221 77 456 78 90',
      role: 'Superviseur (CAD)',
      roleClass: ROLE_CLASS['Superviseur (CAD)'],
      statut: 'Actif',
      statutClass: 'bg-emerald-50 text-emerald-600',
    },
  ]);

  protected readonly drawerOpen = signal(false);

  protected readonly formNom = signal('');
  protected readonly formEmail = signal('');
  protected readonly formTelephone = signal('');
  protected readonly formRole = signal<MembreRole>('Agent transitaire');
  protected readonly touched = signal(false);

  protected readonly nomValid = computed(() => this.formNom().trim().length > 0);
  protected readonly emailValid = computed(() => /^\S+@\S+\.\S+$/.test(this.formEmail().trim()));
  protected readonly formValid = computed(() => this.nomValid() && this.emailValid());

  protected openDrawer(): void {
    this.formNom.set('');
    this.formEmail.set('');
    this.formTelephone.set('');
    this.formRole.set('Agent transitaire');
    this.touched.set(false);
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

  protected setRole(role: MembreRole): void {
    this.formRole.set(role);
  }

  protected submit(): void {
    this.touched.set(true);
    if (!this.formValid()) {
      return;
    }
    const role = this.formRole();
    this.membres.update((list) => [
      ...list,
      {
        nom: this.formNom().trim(),
        email: this.formEmail().trim(),
        telephone: this.formTelephone().trim() || '—',
        role,
        roleClass: ROLE_CLASS[role],
        statut: 'Actif',
        statutClass: 'bg-emerald-50 text-emerald-600',
      },
    ]);
    this.closeDrawer();
    this.toast.success('Membre ajouté', `${this.formNom().trim()} a rejoint votre équipe (${role}).`);
  }
}
