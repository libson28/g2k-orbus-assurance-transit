import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataTable, DataTableColumn } from '../../../shared/components/data-table/data-table';
import { Modal } from '../../../shared/components/modal/modal';
import { ToastService } from '../../../shared/services/toast-service';
import { OperationDetails } from '../../components/operation-details/operation-details';
import { CONTRATS_TRANSITAIRE, parseFcfa } from '../../data/contrats-catalog';
import { ComplementChamp, ModePaiement, OperationsStore } from '../../services/operations-store';

type Voie = 'contrat' | 'direct';
type ModeDirect = Exclude<ModePaiement, 'contrat'>;

interface ModeDirectOption {
  key: ModeDirect;
  label: string;
  hint: string;
  logo: string;
  logoClass: string;
}

@Component({
  selector: 'app-demandes-cotation-page',
  imports: [DataTable, Modal, OperationDetails, RouterLink],
  templateUrl: './demandes-cotation-page.html',
})
export class DemandesCotationPage {
  private readonly store = inject(OperationsStore);
  private readonly toast = inject(ToastService);

  protected readonly columns: DataTableColumn[] = [
    { key: 'numero', label: 'Demande' },
    { key: 'date', label: 'Date' },
    { key: 'polices', label: 'Polices' },
    { key: 'montant', label: 'Montant coté' },
    { key: 'statut', label: 'Statut' },
    { key: 'actions', label: '' },
  ];

  protected readonly modesDirects: ModeDirectOption[] = [
    { key: 'wave', label: 'Wave', hint: 'Paiement mobile', logo: '/wave.png', logoClass: 'h-9 w-9' },
    { key: 'orange-money', label: 'Orange Money', hint: 'Paiement mobile', logo: '/orange-money.png', logoClass: 'h-9 w-9' },
    { key: 'carte', label: 'Carte bancaire', hint: 'Visa, Mastercard', logo: '/carte-bancaire.jpg', logoClass: 'h-9 w-14' },
  ];

  protected readonly demandes = this.store.demandes;

  // --- Détail
  protected readonly selectedNumero = signal<string | null>(null);
  protected readonly selected = computed(() => this.demandes().find((d) => d.numero === this.selectedNumero()) ?? null);
  protected readonly complementInput = signal('');
  protected readonly complementFields = signal<ComplementChamp[]>([]);

  // --- Acceptation / paiement
  protected readonly paiementNumero = signal<string | null>(null);
  protected readonly paiementDemande = computed(() => this.demandes().find((d) => d.numero === this.paiementNumero()) ?? null);
  protected readonly total = computed(() => parseFcfa(this.paiementDemande()?.montant ?? null));

  protected readonly contratsActifs = CONTRATS_TRANSITAIRE.filter((c) => c.statut === 'Actif').map((c) => ({
    ...c,
    soldeValeur: parseFcfa(c.solde),
  }));

  protected readonly voie = signal<Voie>('contrat');
  protected readonly contratChoisi = signal<string | null>(null);
  protected readonly modeDirect = signal<ModeDirect>('wave');
  protected readonly telephone = signal('');
  protected readonly carteNumero = signal('');
  protected readonly carteExpiration = signal('');
  protected readonly carteCvc = signal('');
  protected readonly carteTitulaire = signal('');
  protected readonly enCours = signal(false);

  protected readonly canPay = computed(() => {
    if (this.enCours()) return false;
    if (this.voie() === 'contrat') {
      const c = this.contratsActifs.find((x) => x.numero === this.contratChoisi());
      return !!c && c.soldeValeur >= this.total();
    }
    if (this.modeDirect() === 'carte') {
      return (
        this.carteNumero().replace(/\s/g, '').length >= 13 &&
        /^(0[1-9]|1[0-2])\/\d{2}$/.test(this.carteExpiration()) &&
        /^\d{3,4}$/.test(this.carteCvc()) &&
        this.carteTitulaire().trim().length > 1
      );
    }
    return this.telephone().replace(/\D/g, '').length >= 9;
  });

  protected fcfa(value: number): string {
    return `${value.toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;
  }

  // ---- Détail
  protected openDetails(numero: string): void {
    this.selectedNumero.set(numero);
    this.complementInput.set('');
    this.complementFields.set([]);
  }

  protected closeDetails(): void {
    this.selectedNumero.set(null);
  }

  // ---- Compléments
  protected addComplementField(type: 'texte' | 'file'): void {
    const id = `cf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.complementFields.update((fields) => [...fields, { id, type, label: '', value: '' }]);
  }

  protected removeComplementField(id: string): void {
    this.complementFields.update((fields) => fields.filter((f) => f.id !== id));
  }

  protected onComplementFieldLabelInput(id: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.complementFields.update((fields) => fields.map((f) => (f.id === id ? { ...f, label: value } : f)));
  }

  protected onComplementFieldValueInput(id: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.complementFields.update((fields) => fields.map((f) => (f.id === id ? { ...f, value } : f)));
  }

  protected onComplementFieldFileSelected(id: string, event: Event): void {
    const value = (event.target as HTMLInputElement).files?.[0]?.name ?? '';
    this.complementFields.update((fields) => fields.map((f) => (f.id === id ? { ...f, value } : f)));
  }

  protected envoyerComplement(numero: string): void {
    this.store.envoyerComplement(numero);
    this.closeDetails();
    this.toast.success('Complément envoyé', `Votre réponse pour ${numero} a été transmise à l’assureur.`);
  }

  // ---- Acceptation
  protected openPaiement(numero: string): void {
    this.closeDetails();
    this.voie.set('contrat');
    this.contratChoisi.set(null);
    this.modeDirect.set('wave');
    this.telephone.set('');
    this.carteNumero.set('');
    this.carteExpiration.set('');
    this.carteCvc.set('');
    this.carteTitulaire.set('');
    this.enCours.set(false);
    this.paiementNumero.set(numero);
  }

  protected closePaiement(): void {
    if (this.enCours()) return;
    this.paiementNumero.set(null);
  }

  protected onTelephoneInput(event: Event): void {
    this.telephone.set((event.target as HTMLInputElement).value);
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

  protected confirmerPaiement(): void {
    const demande = this.paiementDemande();
    if (!demande || !this.canPay()) return;

    const mode: ModePaiement = this.voie() === 'contrat' ? 'contrat' : this.modeDirect();
    const contrat = this.voie() === 'contrat' ? this.contratChoisi() : null;

    this.enCours.set(true);
    // Simulation de la confirmation de l'opérateur / de la banque.
    setTimeout(() => {
      const paiement = this.store.souscrire(demande.numero, mode, contrat);
      this.enCours.set(false);
      this.paiementNumero.set(null);
      if (mode === 'contrat') {
        this.toast.success('Demande liée au contrat', `${demande.numero} est désormais en cours d’assurance (${contrat}).`);
      } else {
        this.toast.success('Paiement confirmé', `${demande.numero} est en cours d’assurance. Réf. ${paiement.reference}.`);
      }
    }, 1400);
  }
}
