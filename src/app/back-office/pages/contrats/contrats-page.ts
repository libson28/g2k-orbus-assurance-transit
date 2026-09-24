import { Component, computed, inject, signal } from '@angular/core';
import { DataTable, DataTableColumn } from '../../../shared/components/data-table/data-table';
import { Modal } from '../../../shared/components/modal/modal';
import { ToastService } from '../../../shared/services/toast-service';

interface Contrat {
  numero: string;
  libelle: string;
  souscripteur: string;
  montantTotal: string;
  encours: string;
  solde: string;
  echeance: string;
  statut: string;
  statutClass: string;
  utilisationPct: number;
}

const SOUSCRIPTEURS_CATALOG = ['ABC Transit', 'Teranga Logistics', 'Sahel Freight', 'Baobab Trading', 'Cargo Sénégal SARL'];

@Component({
  selector: 'app-back-office-contrats-page',
  imports: [DataTable, Modal],
  templateUrl: './contrats-page.html',
})
export class ContratsPage {
  private readonly toast = inject(ToastService);

  protected readonly columns: DataTableColumn[] = [
    { key: 'numero', label: 'Contrat' },
    { key: 'souscripteur', label: 'Souscripteur' },
    { key: 'montantTotal', label: 'Montant total' },
    { key: 'encours', label: 'Encours' },
    { key: 'solde', label: 'Solde' },
    { key: 'echeance', label: 'Échéance' },
    { key: 'statut', label: 'Statut' },
    { key: 'actions', label: '' },
  ];

  protected readonly contrats = signal<Contrat[]>([
    { numero: 'CTR-2026-0045', libelle: 'Transit Maritime Annuel', souscripteur: 'ABC Transit', montantTotal: '50 000 000 FCFA', encours: '18 500 000 FCFA', solde: '31 500 000 FCFA', echeance: '31/12/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600', utilisationPct: 37 },
    { numero: 'CTR-2025-0102', libelle: 'Contrat-cadre Import/Export', souscripteur: 'Teranga Logistics', montantTotal: '18 500 000 FCFA', encours: '11 950 000 FCFA', solde: '6 550 000 FCFA', echeance: '30/09/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600', utilisationPct: 65 },
    { numero: 'CTR-2024-0091', libelle: 'Transit Routier Sous-Régional', souscripteur: 'Sahel Freight', montantTotal: '9 000 000 FCFA', encours: '2 000 000 FCFA', solde: '7 000 000 FCFA', echeance: '15/06/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600', utilisationPct: 22 },
    { numero: 'CTR-2024-0067', libelle: 'Police au voyage — Import ponctuel', souscripteur: 'Baobab Trading', montantTotal: '4 200 000 FCFA', encours: '4 200 000 FCFA', solde: '0 FCFA', echeance: '28/02/2026', statut: 'Épuisé', statutClass: 'bg-amber-50 text-amber-600', utilisationPct: 100 },
    { numero: 'CTR-2023-0134', libelle: 'Transit Maritime Annuel', souscripteur: 'Cargo Sénégal SARL', montantTotal: '20 000 000 FCFA', encours: '20 000 000 FCFA', solde: '0 FCFA', echeance: '31/12/2025', statut: 'Expiré', statutClass: 'bg-slate-100 text-slate-500', utilisationPct: 100 },
  ]);

  protected readonly selectedNumero = signal<string | null>(null);

  protected readonly selected = computed(() => this.contrats().find((c) => c.numero === this.selectedNumero()) ?? null);

  protected openDetails(numero: string): void {
    this.selectedNumero.set(numero);
  }

  protected closeDetails(): void {
    this.selectedNumero.set(null);
  }

  protected readonly createOpen = signal(false);
  protected readonly formLibelle = signal('');
  protected readonly formSouscripteur = signal('');
  protected readonly formMontantTotal = signal('');
  protected readonly formEcheance = signal('');
  protected readonly formDocumentName = signal<string | null>(null);
  protected readonly touched = signal(false);

  protected readonly formValid = computed(
    () => this.formLibelle().trim().length > 0 && this.formSouscripteur().trim().length > 0 && this.formMontantTotal().trim().length > 0,
  );

  // ---- Souscripteur : select avec recherche ----
  protected readonly souscripteurQuery = signal('');
  protected readonly souscripteurMenuOpen = signal(false);

  protected readonly filteredSouscripteurs = computed(() => {
    const q = this.souscripteurQuery().trim().toLowerCase();
    if (!q) return SOUSCRIPTEURS_CATALOG;
    return SOUSCRIPTEURS_CATALOG.filter((s) => s.toLowerCase().includes(q));
  });

  protected onSouscripteurQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.souscripteurQuery.set(value);
    this.formSouscripteur.set('');
    this.souscripteurMenuOpen.set(true);
  }

  protected openSouscripteurMenu(): void {
    this.souscripteurMenuOpen.set(true);
  }

  protected selectSouscripteur(name: string): void {
    this.formSouscripteur.set(name);
    this.souscripteurQuery.set(name);
    this.souscripteurMenuOpen.set(false);
  }

  protected onSouscripteurBlur(): void {
    this.souscripteurMenuOpen.set(false);
  }

  protected onDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.formDocumentName.set(input.files?.[0]?.name ?? null);
  }

  protected removeDocument(): void {
    this.formDocumentName.set(null);
  }

  protected openCreate(): void {
    this.formLibelle.set('');
    this.formSouscripteur.set('');
    this.souscripteurQuery.set('');
    this.souscripteurMenuOpen.set(false);
    this.formMontantTotal.set('');
    this.formEcheance.set('');
    this.formDocumentName.set(null);
    this.touched.set(false);
    this.createOpen.set(true);
  }

  protected closeCreate(): void {
    this.createOpen.set(false);
  }

  protected submitCreate(): void {
    this.touched.set(true);
    if (!this.formValid()) {
      return;
    }
    const montant = this.formMontantTotal().trim();
    const numero = `CTR-${new Date().getFullYear()}-${String(this.contrats().length + 1).padStart(4, '0')}`;
    this.contrats.update((list) => [
      {
        numero,
        libelle: this.formLibelle().trim(),
        souscripteur: this.formSouscripteur().trim(),
        montantTotal: montant,
        encours: '0 FCFA',
        solde: montant,
        echeance: this.formEcheance() || '—',
        statut: 'Actif',
        statutClass: 'bg-emerald-50 text-emerald-600',
        utilisationPct: 0,
      },
      ...list,
    ]);
    this.closeCreate();
    this.toast.success('Contrat créé', `${numero} pour ${this.formSouscripteur().trim()}.`);
  }
}
