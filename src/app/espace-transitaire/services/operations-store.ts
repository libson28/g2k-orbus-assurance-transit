import { computed, inject, Injectable, signal } from '@angular/core';
import { ASSUREUR_ROLES, NotificationService } from '../../shared/services/notification-service';

export type OperationAction = 'Suivre' | 'Compléter' | 'Accepter' | 'Voir';

export const STATUT_NOUVELLE = 'Nouvelle demande';
export const STATUT_COMPLEMENTS = 'Compléments demandés';
export const STATUT_A_ACCEPTER = 'En attente d’acceptation';
export const STATUT_EN_COURS = "Assurance en cours";
export const STATUT_EXPIREE = 'Assurance expirée';

export const STATUT_CLASSES: Record<string, string> = {
  [STATUT_NOUVELLE]: 'bg-slate-100 text-slate-500',
  [STATUT_COMPLEMENTS]: 'bg-rose-50 text-rose-600',
  [STATUT_A_ACCEPTER]: 'bg-amber-50 text-amber-600',
  [STATUT_EN_COURS]: 'bg-emerald-50 text-emerald-600',
  [STATUT_EXPIREE]: 'bg-slate-200 text-slate-600',
};

// Une demande devient une opération une fois payée / liée à un contrat.
const STATUTS_DEMANDE = [STATUT_NOUVELLE, STATUT_COMPLEMENTS, STATUT_A_ACCEPTER];

export type ModePaiement = 'contrat' | 'wave' | 'orange-money' | 'carte';

export const MODE_PAIEMENT_LABELS: Record<ModePaiement, string> = {
  contrat: 'Débit sur contrat',
  wave: 'Wave',
  'orange-money': 'Orange Money',
  carte: 'Carte bancaire',
};

export const MODE_PAIEMENT_LOGOS: Record<ModePaiement, string | null> = {
  contrat: null,
  wave: '/wave.png',
  'orange-money': '/orange-money.png',
  carte: '/carte-bancaire.jpg',
};

export interface OperationPaiement {
  mode: ModePaiement;
  reference: string;
  date: string;
}

export interface OperationMarchandise {
  nature: string;
  description: string;
  valeur: string;
  quantite: string;
  poidsVolume: string;
  typeEmballage: string;
}

export interface OperationTransport {
  modeTransport: string;
  dateDepart: string;
  destination: string;
  dateArrivee: string;
  transporteur: string;
  numeroVehicule: string;
  typeCouverture: string;
}

export interface OperationDocument {
  label: string;
  fileName: string | null;
}

export interface OperationPolice {
  code: string;
  libelle: string;
  /** Montant coté par l'assureur pour cette police (absent tant que la demande n'est pas cotée). */
  prix?: string;
}

export interface ComplementChamp {
  id: string;
  type: 'texte' | 'file';
  label: string;
  value: string;
}

export interface Operation {
  numero: string;
  libelle: string;
  /** Renseigné à l'acceptation (lien à un contrat) ; null tant que la demande n'est pas acceptée. */
  contrat: string | null;
  polices: string;
  policesDetail: OperationPolice[];
  montant: string | null;
  statut: string;
  statutClass: string;
  action: OperationAction;
  complementMessage?: string;
  recepisseDisponible?: boolean;
  paiement?: OperationPaiement;
  marchandise: OperationMarchandise;
  transport: OperationTransport;
  documents: OperationDocument[];
  dateDemande: string;
}

interface SeedInput {
  numero: string;
  libelle: string;
  dateDemande: string;
  statut: string;
  contrat?: string | null;
  polices: OperationPolice[];
  montant: string | null;
  marchandise: [nature: string, description: string, valeur: string, quantite: string, poidsVolume: string, emballage: string];
  transport: [mode: string, depart: string, destination: string, arrivee: string, transporteur: string, vehicule: string, couverture: string];
  documents: [label: string, fileName: string][];
  paiement?: OperationPaiement;
  complementMessage?: string;
}

const ACTION_PAR_STATUT: Record<string, OperationAction> = {
  [STATUT_NOUVELLE]: 'Suivre',
  [STATUT_COMPLEMENTS]: 'Compléter',
  [STATUT_A_ACCEPTER]: 'Accepter',
  [STATUT_EN_COURS]: 'Voir',
  [STATUT_EXPIREE]: 'Voir',
};

function seed(i: SeedInput): Operation {
  return {
    numero: i.numero,
    libelle: i.libelle,
    contrat: i.contrat ?? null,
    polices: i.polices.map((p) => p.libelle).join(' + '),
    policesDetail: i.polices,
    montant: i.montant,
    statut: i.statut,
    statutClass: STATUT_CLASSES[i.statut],
    action: ACTION_PAR_STATUT[i.statut],
    complementMessage: i.complementMessage,
    recepisseDisponible: i.paiement ? true : undefined,
    paiement: i.paiement,
    marchandise: {
      nature: i.marchandise[0],
      description: i.marchandise[1],
      valeur: i.marchandise[2],
      quantite: i.marchandise[3],
      poidsVolume: i.marchandise[4],
      typeEmballage: i.marchandise[5],
    },
    transport: {
      modeTransport: i.transport[0],
      dateDepart: i.transport[1],
      destination: i.transport[2],
      dateArrivee: i.transport[3],
      transporteur: i.transport[4],
      numeroVehicule: i.transport[5],
      typeCouverture: i.transport[6],
    },
    documents: i.documents.map(([label, fileName]) => ({ label, fileName })),
    dateDemande: i.dateDemande,
  };
}

const RC_COM: OperationPolice = { code: 'RC-COM', libelle: 'RC Commissionnaire de transport', prix: '180 000 FCFA' };
const RC_TRANS: OperationPolice = { code: 'RC-TRANS', libelle: 'RC Transporteur', prix: '220 000 FCFA' };

/** Lignes de démonstration supplémentaires (les plus récentes en premier). */
const SEED_RECENT: Operation[] = [
  // --- Demandes
  seed({
    numero: 'OP-2026-0112',
    libelle: 'Sucre en sacs — Dakar/Bamako',
    dateDemande: '14/09/2026',
    statut: STATUT_A_ACCEPTER,
    polices: [{ code: 'MARCH', libelle: 'Marchandises Transportées', prix: '640 000 FCFA' }, RC_COM],
    montant: '820 000 FCFA',
    marchandise: ['Sucre raffiné', 'Sacs de 50 kg destinés à la distribution.', '80 000 000 FCFA', '1 200 sacs', '60 tonnes', 'Sacs polypropylène'],
    transport: ['Routier', '2026-10-05', 'Bamako, Mali', '2026-10-10', 'Teranga Logistics', 'DK-6612-JK', 'Tous risques'],
    documents: [['Facture commerciale', 'facture-sucre.pdf'], ['Lettre de transport', 'lettre-transport-sucre.pdf']],
  }),
  seed({
    numero: 'OP-2026-0109',
    libelle: 'Ciment — Rufisque/Ziguinchor',
    dateDemande: '09/09/2026',
    statut: STATUT_A_ACCEPTER,
    polices: [{ code: 'TRT', libelle: 'Tous Risques Transport', prix: '1 440 000 FCFA' }],
    montant: '1 440 000 FCFA',
    marchandise: ['Ciment en sacs', 'Ciment CPJ 45 pour chantier de construction.', '120 000 000 FCFA', '3 000 sacs', '150 tonnes', 'Sacs papier kraft'],
    transport: ['Maritime', '2026-10-01', 'Port de Ziguinchor', '2026-10-06', 'Sénégal Lines', 'SL-2210', 'Tous risques'],
    documents: [['Facture commerciale', 'facture-ciment.pdf']],
  }),
  seed({
    numero: 'OP-2026-0104',
    libelle: 'Médicaments — Dakar/Abidjan',
    dateDemande: '02/09/2026',
    statut: STATUT_COMPLEMENTS,
    polices: [{ code: 'FAP', libelle: 'FAP / FAP sauf', prix: '0,6% de la valeur déclarée' }, RC_COM],
    montant: null,
    complementMessage: "Merci de joindre l'autorisation d'importation du ministère de la Santé et le certificat de chaîne du froid.",
    marchandise: ['Produits pharmaceutiques', 'Médicaments sous température dirigée.', '45 000 000 FCFA', '18 palettes', '7 tonnes', 'Caisses isothermes'],
    transport: ['Aérien', '2026-09-28', 'Abidjan, Côte d’Ivoire', '2026-09-29', 'Air Fret Afrique', 'AF-3308', 'Sur mesure'],
    documents: [['Facture commerciale', 'facture-pharma.pdf']],
  }),
  seed({
    numero: 'OP-2026-0101',
    libelle: 'Pièces détachées engins — Port de Dakar',
    dateDemande: '28/08/2026',
    statut: STATUT_NOUVELLE,
    polices: [{ code: 'ABON', libelle: "Police d'abonnement / flottante", prix: '350 000 FCFA' }],
    montant: null,
    marchandise: ['Pièces détachées', 'Pièces pour engins de chantier.', '22 000 000 FCFA', '6 caisses', '3,5 tonnes', 'Caisses bois'],
    transport: ['Maritime', '2026-09-25', 'Port de Dakar', '2026-10-12', 'CMA CGM', 'CMAU-448120', 'FAP (Franc d’avaries particulières)'],
    documents: [['Facture commerciale', 'facture-pieces-engins.pdf']],
  }),
  // --- Opérations
  seed({
    numero: 'OP-2026-0097',
    libelle: 'Riz importé — Port de Dakar',
    dateDemande: '20/08/2026',
    statut: STATUT_EN_COURS,
    contrat: 'CTR-2026-0045',
    polices: [
      { code: 'TRT', libelle: 'Tous Risques Transport', prix: '1 560 000 FCFA' },
      { code: 'DOUANE', libelle: 'Risques douaniers / garantie douanière', prix: '650 000 FCFA' },
    ],
    montant: '2 210 000 FCFA',
    paiement: { mode: 'contrat', reference: 'CTR-2026-0045', date: '24/08/2026' },
    marchandise: ['Riz brisé', 'Riz importé en vrac ensaché.', '130 000 000 FCFA', '2 conteneurs 40 pieds', '48 tonnes', 'Sacs de 50 kg'],
    transport: ['Maritime', '2026-09-10', 'Port de Dakar', '2026-10-05', 'Maersk Line', 'MSCU-905517', 'Tous risques'],
    documents: [['Facture commerciale', 'facture-riz.pdf'], ['Liste de colisage', 'colisage-riz.pdf']],
  }),
  seed({
    numero: 'OP-2026-0093',
    libelle: 'Matériel BTP — Dakar/Tambacounda',
    dateDemande: '12/08/2026',
    statut: STATUT_EN_COURS,
    polices: [RC_TRANS],
    montant: '220 000 FCFA',
    paiement: { mode: 'wave', reference: 'WV-20260816-2284', date: '16/08/2026' },
    marchandise: ['Matériel de BTP', 'Bétonnières et compacteurs.', '18 500 000 FCFA', '5 machines', '11 tonnes', 'Sans emballage (roulant)'],
    transport: ['Routier', '2026-09-08', 'Tambacounda', '2026-09-30', 'Cargo Sénégal SARL', 'DK-7741-LM', 'Tous risques'],
    documents: [['Facture commerciale', 'facture-btp.pdf']],
  }),
  seed({
    numero: 'OP-2026-0076',
    libelle: 'Café vert — Abidjan/Dakar',
    dateDemande: '30/03/2026',
    statut: STATUT_EXPIREE,
    polices: [{ code: 'VOYAGE', libelle: 'Police au voyage', prix: '95 000 FCFA' }],
    montant: '95 000 FCFA',
    paiement: { mode: 'orange-money', reference: 'OM-20260402-6650', date: '02/04/2026' },
    marchandise: ['Café vert', 'Sacs de jute de 60 kg.', '14 000 000 FCFA', '400 sacs', '24 tonnes', 'Sacs de jute'],
    transport: ['Routier', '2026-04-08', 'Dakar', '2026-04-15', 'Sahel Freight', 'CI-2290-QR', 'FAP (Franc d’avaries particulières)'],
    documents: [['Facture commerciale', 'facture-cafe.pdf']],
  }),
  seed({
    numero: 'OP-2026-0062',
    libelle: 'Huile de palme — Zone portuaire',
    dateDemande: '10/03/2026',
    statut: STATUT_EXPIREE,
    polices: [{ code: 'MARCH', libelle: 'Marchandises Transportées', prix: '310 000 FCFA' }],
    montant: '310 000 FCFA',
    paiement: { mode: 'carte', reference: 'CB-20260312-5031', date: '12/03/2026' },
    marchandise: ['Huile de palme', 'Fûts de 200 L destinés à l’agroalimentaire.', '38 750 000 FCFA', '120 fûts', '24 tonnes', 'Fûts métalliques'],
    transport: ['Maritime', '2026-03-18', 'Port de Dakar', '2026-04-01', 'MSC', 'MSCU-120933', 'Tous risques'],
    documents: [['Facture commerciale', 'facture-huile.pdf']],
  }),
];

@Injectable({ providedIn: 'root' })
export class OperationsStore {
  private readonly notifications = inject(NotificationService);

  private readonly items = signal<Operation[]>([
    ...SEED_RECENT,
    {
      numero: 'OP-2026-0088',
      libelle: 'Importation équipements industriels',
      contrat: 'CTR-2026-0045',
      polices: 'RC Pro + Marchandises Transportées',
      policesDetail: [
        { code: 'RC-PRO', libelle: 'RC Professionnelle', prix: '150 000 FCFA' },
        { code: 'MARCH', libelle: 'Marchandises Transportées', prix: '275 000 FCFA' },
      ],
      montant: '425 000 FCFA',
      statut: STATUT_EN_COURS,
      statutClass: STATUT_CLASSES[STATUT_EN_COURS],
      action: 'Voir',
      recepisseDisponible: true,
      paiement: { mode: 'contrat', reference: 'CTR-2026-0045', date: '08/01/2026' },
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
        dateDepart: '2026-01-12',
        destination: 'Port de Dakar',
        dateArrivee: '2026-02-02',
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
      contrat: 'CTR-2025-0102',
      polices: 'Tous Risques Transport',
      policesDetail: [{ code: 'TRT', libelle: 'Tous Risques Transport', prix: '1 850 000 FCFA' }],
      montant: '1 850 000 FCFA',
      statut: STATUT_EXPIREE,
      statutClass: STATUT_CLASSES[STATUT_EXPIREE],
      action: 'Voir',
      recepisseDisponible: true,
      paiement: { mode: 'wave', reference: 'WV-20260118-4471', date: '18/01/2026' },
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
        dateDepart: '2026-01-20',
        destination: 'Bamako, Mali',
        dateArrivee: '2026-01-24',
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
      contrat: 'CTR-2024-0091',
      polices: 'RC Pro',
      policesDetail: [{ code: 'RC-PRO', libelle: 'RC Professionnelle', prix: '2 400 000 FCFA' }],
      montant: '2 400 000 FCFA',
      statut: STATUT_EN_COURS,
      statutClass: STATUT_CLASSES[STATUT_EN_COURS],
      action: 'Voir',
      recepisseDisponible: true,
      paiement: { mode: 'orange-money', reference: 'OM-20260128-9083', date: '28/01/2026' },
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
        dateDepart: '2026-02-01',
        destination: 'Port de Dakar',
        dateArrivee: '2026-02-20',
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
      contrat: null,
      polices: 'RC Pro',
      policesDetail: [{ code: 'RC-PRO', libelle: 'RC Professionnelle', prix: '960 000 FCFA' }],
      montant: '960 000 FCFA',
      statut: STATUT_A_ACCEPTER,
      statutClass: STATUT_CLASSES[STATUT_A_ACCEPTER],
      action: 'Accepter',
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
        dateDepart: '2026-02-10',
        destination: 'Nouakchott, Mauritanie',
        dateArrivee: '2026-02-14',
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
      contrat: null,
      polices: 'Marchandises Transportées',
      policesDetail: [{ code: 'MARCH', libelle: 'Marchandises Transportées', prix: '540 000 FCFA' }],
      montant: null,
      statut: STATUT_COMPLEMENTS,
      statutClass: STATUT_CLASSES[STATUT_COMPLEMENTS],
      action: 'Compléter',
      complementMessage: "Merci de fournir un justificatif complémentaire de la valeur déclarée des marchandises.",
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
        dateDepart: '2026-02-15',
        destination: 'Dakar',
        dateArrivee: '2026-02-17',
        transporteur: 'Cargo Sénégal SARL',
        numeroVehicule: 'KL-0234-EF',
        typeCouverture: 'Tous risques',
      },
      documents: [{ label: 'Facture commerciale', fileName: 'facture-materiel-agricole.pdf' }],
      dateDemande: '12/02/2026',
    },
    {
      numero: 'OP-2026-0058',
      libelle: 'Produits chimiques — Zone industrielle',
      contrat: null,
      polices: 'RC Pro',
      policesDetail: [{ code: 'RC-PRO', libelle: 'RC Professionnelle', prix: '150 000 FCFA' }],
      montant: null,
      statut: STATUT_NOUVELLE,
      statutClass: STATUT_CLASSES[STATUT_NOUVELLE],
      action: 'Suivre',
      marchandise: {
        nature: 'Produits chimiques industriels',
        description: 'Solvants et réactifs pour usage industriel.',
        valeur: '5 200 000 FCFA',
        quantite: '40 fûts de 200L',
        poidsVolume: '8 tonnes',
        typeEmballage: 'Fûts métalliques homologués',
      },
      transport: {
        modeTransport: 'Routier',
        dateDepart: '2026-02-20',
        destination: 'Zone Industrielle, Dakar',
        dateArrivee: '2026-02-21',
        transporteur: 'ABC Transit',
        numeroVehicule: 'DK-8890-GH',
        typeCouverture: 'Sur mesure',
      },
      documents: [{ label: 'Facture commerciale', fileName: 'facture-produits-chimiques.pdf' }],
      dateDemande: '18/02/2026',
    },
  ]);

  readonly demandes = computed(() => this.items().filter((op) => STATUTS_DEMANDE.includes(op.statut)));
  readonly operations = computed(() => this.items().filter((op) => !STATUTS_DEMANDE.includes(op.statut)));

  add(operation: Operation): void {
    this.items.update((list) => [operation, ...list]);
    this.notifications.push({
      audience: ASSUREUR_ROLES,
      kind: 'cotation',
      title: 'Nouvelle demande de cotation',
      detail: `${operation.numero} — ${operation.libelle} attend un traitement.`,
      link: '/back-office/demandes',
    });
  }

  envoyerComplement(numero: string): void {
    this.notifications.push({
      audience: ASSUREUR_ROLES,
      kind: 'complement',
      title: 'Complément reçu',
      detail: `Le souscripteur a transmis les pièces demandées pour ${numero}.`,
      link: '/back-office/demandes',
    });
    this.items.update((list) =>
      list.map((op) =>
        op.numero === numero
          ? { ...op, statut: STATUT_NOUVELLE, statutClass: STATUT_CLASSES[STATUT_NOUVELLE], action: 'Suivre' }
          : op,
      ),
    );
  }

  /** Acceptation d'une cotation : la demande devient une opération « En cours d'assurance ». */
  souscrire(numero: string, mode: ModePaiement, contrat: string | null): OperationPaiement {
    const paiement: OperationPaiement = {
      mode,
      reference: mode === 'contrat' && contrat ? contrat : this.referencePaiement(mode),
      date: new Date().toLocaleDateString('fr-FR'),
    };
    this.items.update((list) =>
      list.map((op) =>
        op.numero === numero
          ? {
              ...op,
              contrat: contrat ?? op.contrat,
              statut: STATUT_EN_COURS,
              statutClass: STATUT_CLASSES[STATUT_EN_COURS],
              action: 'Voir',
              recepisseDisponible: true,
              paiement,
            }
          : op,
      ),
    );
    this.notifications.push({
      audience: ASSUREUR_ROLES,
      kind: 'accept',
      title: 'Cotation acceptée',
      detail: `${numero} a été acceptée et réglée (${MODE_PAIEMENT_LABELS[mode]}) : l'assurance est en cours.`,
      link: '/back-office/operations',
    });
    return paiement;
  }

  private referencePaiement(mode: ModePaiement): string {
    const prefix = mode === 'wave' ? 'WV' : mode === 'orange-money' ? 'OM' : 'CB';
    const d = new Date();
    const day = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `${prefix}-${day}-${Math.floor(Math.random() * 9000) + 1000}`;
  }
}
