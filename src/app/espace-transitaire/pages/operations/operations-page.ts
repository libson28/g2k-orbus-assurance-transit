import { Component, computed, inject, signal } from '@angular/core';
import { DataTable, DataTableColumn } from '../../../shared/components/data-table/data-table';
import { Modal } from '../../../shared/components/modal/modal';
import { OperationDetails } from '../../components/operation-details/operation-details';
import { MODE_PAIEMENT_LABELS, MODE_PAIEMENT_LOGOS, OperationsStore, STATUT_EXPIREE } from '../../services/operations-store';

@Component({
  selector: 'app-operations-page',
  imports: [DataTable, Modal, OperationDetails],
  templateUrl: './operations-page.html',
})
export class OperationsPage {
  private readonly store = inject(OperationsStore);

  protected readonly columns: DataTableColumn[] = [
    { key: 'numero', label: 'Opération' },
    { key: 'contrat', label: 'Contrat' },
    { key: 'polices', label: 'Polices' },
    { key: 'montant', label: 'Montant' },
    { key: 'statut', label: 'Statut' },
    { key: 'actions', label: '' },
  ];

  protected readonly modeLabels = MODE_PAIEMENT_LABELS;
  protected readonly modeLogos = MODE_PAIEMENT_LOGOS;
  protected readonly statutExpiree = STATUT_EXPIREE;
  protected readonly operations = this.store.operations;

  protected readonly selectedNumero = signal<string | null>(null);
  protected readonly selected = computed(() => this.operations().find((op) => op.numero === this.selectedNumero()) ?? null);

  protected openDetails(numero: string): void {
    this.selectedNumero.set(numero);
  }

  protected closeDetails(): void {
    this.selectedNumero.set(null);
  }
}
