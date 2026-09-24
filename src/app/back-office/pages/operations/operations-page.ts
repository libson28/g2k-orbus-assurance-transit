import { Component, computed, signal } from '@angular/core';
import { DataTable, DataTableColumn } from '../../../shared/components/data-table/data-table';
import { Modal } from '../../../shared/components/modal/modal';

interface OperationPolice {
  code: string;
  libelle: string;
  prix: string;
}

interface OperationDocument {
  label: string;
  fileName: string | null;
}

interface Operation {
  numero: string;
  libelle: string;
  souscripteur: string;
  contrat: string;
  montant: string;
  statut: string;
  statutClass: string;
  policesDetail: OperationPolice[];
  marchandise: {
    nature: string;
    description: string;
    valeur: string;
    quantite: string;
    poidsVolume: string;
    typeEmballage: string;
  };
  transport: {
    modeTransport: string;
    dateDepart: string;
    destination: string;
    dateArrivee: string;
    transporteur: string;
    numeroVehicule: string;
    typeCouverture: string;
  };
  documents: OperationDocument[];
  dateDemande: string;
}

@Component({
  selector: 'app-back-office-operations-page',
  imports: [DataTable, Modal],
  templateUrl: './operations-page.html',
})
export class OperationsPage {
  protected readonly columns: DataTableColumn[] = [
    { key: 'numero', label: 'Opération' },
    { key: 'souscripteur', label: 'Souscripteur' },
    { key: 'contrat', label: 'Contrat' },
    { key: 'montant', label: 'Montant' },
    { key: 'statut', label: 'Statut' },
    { key: 'actions', label: '' },
  ];

  protected readonly operations = signal<Operation[]>([
    {
      numero: 'OP-2026-0088',
      libelle: 'Importation équipements industriels',
      souscripteur: 'ABC Transit',
      contrat: 'CTR-2026-0045',
      montant: '425 000 FCFA',
      statut: "En cours d'assurance",
      statutClass: 'bg-emerald-50 text-emerald-600',
      policesDetail: [
        { code: 'RC-PRO', libelle: 'RC Professionnelle', prix: '150 000 FCFA' },
        { code: 'MARCH', libelle: 'Marchandises Transportées', prix: '275 000 FCFA' },
      ],
      marchandise: {
        nature: 'Équipements industriels',
        description: 'Lignes de production textile et pièces de rechange.',
        valeur: '34 000 000 FCFA',
        quantite: '2 conteneurs 40 pieds',
        poidsVolume: '18 tonnes',
        typeEmballage: 'Caisses bois renforcées',
      },
      transport: {
        modeTransport: 'Maritime',
        dateDepart: '12/01/2026',
        destination: 'Port de Dakar',
        dateArrivee: '02/02/2026',
        transporteur: 'Maersk Line',
        numeroVehicule: 'MSCU-771204',
        typeCouverture: 'Tous risques',
      },
      documents: [
        { label: 'Facture commerciale', fileName: 'facture-equipements.pdf' },
        { label: 'Liste de colisage', fileName: 'colisage-equipements.pdf' },
      ],
      dateDemande: '05/01/2026',
    },
    {
      numero: 'OP-2026-0084',
      libelle: 'Denrées périssables — Thiès/Bamako',
      souscripteur: 'Teranga Logistics',
      contrat: 'CTR-2025-0102',
      montant: '1 850 000 FCFA',
      statut: 'Assurance expirée',
      statutClass: 'bg-slate-200 text-slate-600',
      policesDetail: [{ code: 'TRT', libelle: 'Tous Risques Transport', prix: '1 850 000 FCFA' }],
      marchandise: {
        nature: 'Denrées périssables',
        description: 'Fruits et légumes réfrigérés destinés à la revente.',
        valeur: '9 400 000 FCFA',
        quantite: '1 camion frigorifique',
        poidsVolume: '12 tonnes',
        typeEmballage: 'Cagettes ventilées',
      },
      transport: {
        modeTransport: 'Routier',
        dateDepart: '20/01/2026',
        destination: 'Bamako, Mali',
        dateArrivee: '24/01/2026',
        transporteur: 'Teranga Logistics',
        numeroVehicule: 'DK-4521-AB',
        typeCouverture: 'Tous risques',
      },
      documents: [
        { label: 'Facture commerciale', fileName: 'facture-denrees.pdf' },
        { label: "Certificat d'origine", fileName: 'certificat-origine.pdf' },
      ],
      dateDemande: '15/01/2026',
    },
    {
      numero: 'OP-2026-0079',
      libelle: 'Pièces automobiles — Port de Dakar',
      souscripteur: 'Sahel Freight',
      contrat: 'CTR-2024-0091',
      montant: '2 400 000 FCFA',
      statut: "En cours d'assurance",
      statutClass: 'bg-emerald-50 text-emerald-600',
      policesDetail: [{ code: 'RC-PRO', libelle: 'RC Professionnelle', prix: '2 400 000 FCFA' }],
      marchandise: {
        nature: 'Pièces automobiles',
        description: 'Pièces détachées pour véhicules utilitaires.',
        valeur: '28 500 000 FCFA',
        quantite: '1 conteneur 20 pieds',
        poidsVolume: '9 tonnes',
        typeEmballage: 'Cartons palettisés',
      },
      transport: {
        modeTransport: 'Maritime',
        dateDepart: '01/02/2026',
        destination: 'Port de Dakar',
        dateArrivee: '20/02/2026',
        transporteur: 'CMA CGM',
        numeroVehicule: 'CMAU-330198',
        typeCouverture: 'FAP (Franc d’avaries particulières)',
      },
      documents: [{ label: 'Facture commerciale', fileName: 'facture-pieces-auto.pdf' }],
      dateDemande: '22/01/2026',
    },
    {
      numero: 'OP-2026-0071',
      libelle: 'Textile — Dakar/Nouakchott',
      souscripteur: 'Baobab Trading',
      contrat: 'CTR-2024-0067',
      montant: '960 000 FCFA',
      statut: "En cours d'assurance",
      statutClass: 'bg-emerald-50 text-emerald-600',
      policesDetail: [{ code: 'RC-PRO', libelle: 'RC Professionnelle', prix: '960 000 FCFA' }],
      marchandise: {
        nature: 'Textile',
        description: 'Rouleaux de tissu et vêtements confectionnés.',
        valeur: '12 000 000 FCFA',
        quantite: '150 cartons',
        poidsVolume: '4,2 tonnes',
        typeEmballage: 'Cartons filmés',
      },
      transport: {
        modeTransport: 'Routier',
        dateDepart: '10/02/2026',
        destination: 'Nouakchott, Mauritanie',
        dateArrivee: '14/02/2026',
        transporteur: 'Sahel Freight',
        numeroVehicule: 'DK-1189-CD',
        typeCouverture: 'Sur mesure',
      },
      documents: [{ label: 'Facture commerciale', fileName: 'facture-textile.pdf' }],
      dateDemande: '02/02/2026',
    },
    {
      numero: 'OP-2026-0065',
      libelle: 'Matériel agricole — Kaolack/Dakar',
      souscripteur: 'Cargo Sénégal SARL',
      contrat: 'CTR-2023-0134',
      montant: '3 100 000 FCFA',
      statut: "En cours d'assurance",
      statutClass: 'bg-emerald-50 text-emerald-600',
      policesDetail: [{ code: 'MARCH', libelle: 'Marchandises Transportées', prix: '3 100 000 FCFA' }],
      marchandise: {
        nature: 'Matériel agricole',
        description: 'Tracteurs et outils agricoles reconditionnés.',
        valeur: '6 750 000 FCFA',
        quantite: '3 unités',
        poidsVolume: '5,8 tonnes',
        typeEmballage: 'Sans emballage (roulant)',
      },
      transport: {
        modeTransport: 'Routier',
        dateDepart: '15/02/2026',
        destination: 'Dakar',
        dateArrivee: '17/02/2026',
        transporteur: 'Cargo Sénégal SARL',
        numeroVehicule: 'KL-0234-EF',
        typeCouverture: 'Tous risques',
      },
      documents: [{ label: 'Facture commerciale', fileName: 'facture-materiel-agricole.pdf' }],
      dateDemande: '12/02/2026',
    },
  ]);

  protected readonly selectedNumero = signal<string | null>(null);

  protected readonly selected = computed(() => this.operations().find((op) => op.numero === this.selectedNumero()) ?? null);

  protected openDetails(numero: string): void {
    this.selectedNumero.set(numero);
  }

  protected closeDetails(): void {
    this.selectedNumero.set(null);
  }
}
