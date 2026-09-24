import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LanguageService } from '../../../shared/services/language-service';
import { POLICES_CATALOG } from '../../../espace-transitaire/data/polices-catalog';

type TabId = 'cotation' | 'operations' | 'polices' | 'contrats';

interface Tab {
  id: TabId;
  label: string;
  iconPath: string;
}

type PoliceCategoryId = 'rc' | 'transport' | 'formule' | 'stockage' | 'financier';

interface PoliceCard {
  code: string;
  libelle: string;
  couverture: string;
  categorie: PoliceCategoryId;
}

interface Operation {
  numero: string;
  contrat: string;
  libelle: string;
  montant: string;
  date: string;
  statut: string;
  statutClass: string;
}

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
}

interface DocStep {
  title: string;
  description: string;
}

interface DocStatus {
  label: string;
  description: string;
  statutClass: string;
}

interface DocFaq {
  question: string;
  answer: string;
}

interface TabDoc {
  overview: string;
  processTitle: string;
  steps: DocStep[];
  noteTitle: string;
  notes: string[];
  statuses: DocStatus[];
  faqs: DocFaq[];
}

const TAB_LABELS_FR: Record<TabId, string> = {
  cotation: 'Demande de cotation',
  operations: 'Suivi des opérations',
  polices: 'Nos polices',
  contrats: 'Nos contrats',
};

const TAB_LABELS_EN: Record<TabId, string> = {
  cotation: 'Quotation request',
  operations: 'Operations tracking',
  polices: 'Our policies',
  contrats: 'Our contracts',
};

// FR value -> EN value, used to translate example data (statuses, origins, labels) without duplicating whole datasets.
const STRING_MAP: Record<string, string> = {
  // statuses
  'Demande envoyée': 'Request sent',
  'Complément demandé': 'Complement requested',
  'En étude': 'Under review',
  "En attente d'acceptation": 'Awaiting acceptance',
  'Acceptée': 'Accepted',
  'Coté': 'Quoted',
  'Accepté': 'Accepted',
  'Sécurisé': 'Secured',
  'Actif': 'Active',
  'Épuisé': 'Exhausted',
  'Expiré': 'Expired',
  // operation labels
  'Conteneurs électronique — Dakar/Abidjan': 'Electronics containers — Dakar/Abidjan',
  'Denrées périssables — Thiès/Bamako': 'Perishable goods — Thiès/Bamako',
  'Pièces automobiles — Port de Dakar': 'Automotive parts — Port of Dakar',
  'Textile — Dakar/Nouakchott': 'Textiles — Dakar/Nouakchott',
  'Matériel agricole — Kaolack/Dakar': 'Agricultural equipment — Kaolack/Dakar',
  'Produits chimiques — AIBD': 'Chemical products — AIBD',
  'Mobilier — Rufisque/Dakar': 'Furniture — Rufisque/Dakar',
  'Équipements médicaux — Port de Dakar': 'Medical equipment — Port of Dakar',
  // contract labels
  'Transit Maritime Annuel': 'Annual Maritime Transit',
  'Contrat-cadre Import/Export': 'Import/Export Framework Contract',
  'Transit Routier Sous-Régional': 'Sub-Regional Road Transit',
  'Police au voyage — Import ponctuel': 'Voyage Policy — One-off Import',
};

const POLICE_CATEGORY_ORDER: PoliceCategoryId[] = ['rc', 'transport', 'formule', 'stockage', 'financier'];

const POLICE_CATEGORY: Record<string, PoliceCategoryId> = {
  'RC-PRO': 'rc',
  'RC-COM': 'rc',
  'RC-TRANS': 'rc',
  'RC-EXPL': 'rc',
  MARCH: 'transport',
  TRT: 'transport',
  FAP: 'transport',
  ABON: 'formule',
  VOYAGE: 'formule',
  ANNUEL: 'formule',
  DEPOT: 'stockage',
  ENTREPOT: 'stockage',
  DOUANE: 'stockage',
  CREDIT: 'financier',
  AUTO: 'financier',
};

// French label + coverage come from POLICES_CATALOG (single source of truth, shared with the quotation form).
const POLICES_EN: Record<string, { libelle: string; couverture: string }> = {
  'RC-PRO': { libelle: 'Professional Liability', couverture: 'Covers the professional civil liability of the freight forwarder.' },
  'RC-COM': { libelle: 'Commission Agent Liability', couverture: "Covers the commission agent's liability towards its clients." },
  'RC-TRANS': { libelle: 'Carrier Liability', couverture: "Covers the carrier's liability for the goods entrusted to it." },
  MARCH: { libelle: 'Goods in Transit', couverture: 'Compensates loss of or damage to goods during transport.' },
  TRT: { libelle: 'All Risks Transport', couverture: 'All-risks cover of transport, from departure to arrival.' },
  FAP: { libelle: 'FPA (Free of Particular Average)', couverture: 'Free of particular average: covers major average only.' },
  ABON: { libelle: 'Open / Floating Policy', couverture: 'Automatically covers all shipments declared over a given period.' },
  VOYAGE: { libelle: 'Single Voyage Policy', couverture: 'One-off cover for a single trip.' },
  ANNUEL: { libelle: 'Annual Policy / Framework Contract', couverture: "Continuous cover for all of the year's operations." },
  'RC-EXPL': { libelle: 'Operations Liability', couverture: 'Covers damage caused in the course of day-to-day operations.' },
  DEPOT: { libelle: 'Goods in Custody / Stored Goods', couverture: 'Covers stored goods entrusted by third parties.' },
  ENTREPOT: { libelle: 'Warehouse / Bonded Store', couverture: 'Covers goods stored in a bonded warehouse.' },
  DOUANE: { libelle: 'Customs Risks / Customs Guarantee', couverture: 'Guarantees customs duties and taxes in case of dispute.' },
  CREDIT: { libelle: 'Credit / Financial Guarantee', couverture: 'Financial guarantee for payment commitments.' },
  AUTO: { libelle: 'Motor / Fleet', couverture: "Covers the freight forwarder's fleet vehicles." },
};

interface ServicesCopy {
  backLink: string;
  pageTitle: string;
  pageSubtitle: string;
  faqHeading: string;
  statusesHeading: string;
  exampleHeading: string;
  exampleSubtitle: string;
  cotationPanel: {
    description: string;
    descriptionText: string;
    policiesLabel: string;
    policyTags: [string, string];
    attachmentsLabel: string;
    periodLabel: string;
    historyLabel: string;
    historyEntries: [string, string, string];
  };
  operationsPanel: {
    statUnderReview: string;
    statQuoted: string;
    statAccepted: string;
    statSecured: string;
    colOperation: string;
    colLabel: string;
    colContract: string;
    colAmount: string;
    colDate: string;
    colStatus: string;
  };
  policesPanel: {
    filterLabel: string;
    all: string;
    coverage: string;
    countSuffix: string;
    categories: Record<PoliceCategoryId, string>;
  };
  contratsPanel: {
    colContract: string;
    colSubscriber: string;
    colTotalAmount: string;
    colOutstanding: string;
    colBalance: string;
    colDueDate: string;
    colStatus: string;
  };
  banner: { text: string; cta: string };
}

const T_FR: ServicesCopy = {
  backLink: "Retour à l'accueil",
  pageTitle: 'Demandes, opérations, polices et contrats — tout votre suivi transitaire au même endroit.',
  pageSubtitle:
    "Passez d'une action à l'autre sans changer de page : chaque onglet reflète ce que vous verriez depuis votre espace AXA Assurance une fois connecté.",
  faqHeading: 'Questions fréquentes',
  statusesHeading: 'Statuts possibles',
  exampleHeading: 'Exemple concret',
  exampleSubtitle: 'Un aperçu du suivi tel que vous le verriez, une fois connecté.',
  cotationPanel: {
    description: 'Description',
    descriptionText: 'Transport de 3 conteneurs de marchandises électroniques, Dakar → Abidjan, par voie maritime.',
    policiesLabel: 'Polices demandées',
    policyTags: ['RC Pro', 'Marchandises Transportées'],
    attachmentsLabel: 'Pièces jointes',
    periodLabel: 'Période',
    historyLabel: 'Historique',
    historyEntries: ['Demande envoyée — 03/03/2026', 'Assignée à un agent assureur — 03/03/2026', 'En attente de cotation'],
  },
  operationsPanel: {
    statUnderReview: 'En étude',
    statQuoted: 'Cotées',
    statAccepted: 'Acceptées',
    statSecured: 'Sécurisées',
    colOperation: 'Opération',
    colLabel: 'Libellé',
    colContract: 'Contrat',
    colAmount: 'Montant',
    colDate: 'Date',
    colStatus: 'Statut',
  },
  policesPanel: {
    filterLabel: 'Filtrer les polices par famille',
    all: 'Toutes',
    coverage: 'Couverture',
    countSuffix: 'polices',
    categories: {
      rc: 'Responsabilité civile',
      transport: 'Marchandises & transport',
      formule: 'Formules de couverture',
      stockage: 'Stockage & douane',
      financier: 'Financier & flotte',
    },
  },
  contratsPanel: {
    colContract: 'Contrat',
    colSubscriber: 'Souscripteur',
    colTotalAmount: 'Montant total',
    colOutstanding: 'Encours',
    colBalance: 'Solde',
    colDueDate: 'Échéance',
    colStatus: 'Statut',
  },
  banner: { text: 'Ces données sont illustratives. Connectez-vous pour accéder aux vôtres.', cta: 'Accéder à mon espace' },
};

const T_EN: ServicesCopy = {
  backLink: 'Back to home',
  pageTitle: 'Requests, operations, policies and contracts — all your freight-forwarding tracking in one place.',
  pageSubtitle:
    'Move from one action to another without changing page: each tab reflects what you would see from your AXA Assurance portal once logged in.',
  faqHeading: 'Frequently asked questions',
  statusesHeading: 'Possible statuses',
  exampleHeading: 'Concrete example',
  exampleSubtitle: 'A preview of the tracking as you would see it once logged in.',
  cotationPanel: {
    description: 'Description',
    descriptionText: 'Transport of 3 containers of electronic goods, Dakar → Abidjan, by sea.',
    policiesLabel: 'Requested policies',
    policyTags: ['RC Pro', 'Cargo Insurance'],
    attachmentsLabel: 'Attachments',
    periodLabel: 'Period',
    historyLabel: 'History',
    historyEntries: ['Request sent — 03/03/2026', 'Assigned to an insurance agent — 03/03/2026', 'Awaiting quotation'],
  },
  operationsPanel: {
    statUnderReview: 'Under review',
    statQuoted: 'Quoted',
    statAccepted: 'Accepted',
    statSecured: 'Secured',
    colOperation: 'Operation',
    colLabel: 'Label',
    colContract: 'Contract',
    colAmount: 'Amount',
    colDate: 'Date',
    colStatus: 'Status',
  },
  policesPanel: {
    filterLabel: 'Filter policies by family',
    all: 'All',
    coverage: 'Coverage',
    countSuffix: 'policies',
    categories: {
      rc: 'Liability',
      transport: 'Cargo & transport',
      formule: 'Cover formulas',
      stockage: 'Storage & customs',
      financier: 'Financial & fleet',
    },
  },
  contratsPanel: {
    colContract: 'Contract',
    colSubscriber: 'Subscriber',
    colTotalAmount: 'Total amount',
    colOutstanding: 'Outstanding',
    colBalance: 'Balance',
    colDueDate: 'Due date',
    colStatus: 'Status',
  },
  banner: { text: 'This data is illustrative. Log in to access your own.', cta: 'Go to my portal' },
};

const TAB_DOCS_FR: Record<TabId, TabDoc> = {
  cotation: {
    overview:
      "La demande de cotation est le point d'entrée du parcours transitaire. Elle permet de solliciter un tarif auprès de l'agent assureur pour une ou plusieurs polices d'assurance, sur la base d'un contrat existant.",
    processTitle: 'Comment ça marche',
    steps: [
      {
        title: 'Choisir un contrat',
        description:
          'Indiquez le contrat souscripteur sous lequel la demande sera rattachée. Le contrat détermine les polices éligibles et le solde disponible.',
      },
      {
        title: "Sélectionner les polices d'assurance",
        description:
          "Choisissez une ou plusieurs polices parmi celles éligibles au contrat (RC Professionnelle, Marchandises Transportées, Tous Risques Transport, etc.).",
      },
      {
        title: "Définir les spécificités de l'opération",
        description: 'Renseignez la description de l’opération, la date de début et la date de fin de la période à couvrir.',
      },
      {
        title: 'Joindre les documents attendus',
        description:
          "Chaque police a ses propres pièces attendues (facture commerciale, liste de colisage, connaissement...). Elles sont nécessaires pour que l'assureur puisse étudier la demande.",
      },
      {
        title: 'Soumettre la demande',
        description:
          "Une fois envoyée, la demande est transmise à l'agent assureur, qui peut demander un complément ou coter directement chaque police.",
      },
    ],
    noteTitle: 'Documents généralement demandés',
    notes: ['Facture commerciale', 'Liste de colisage', 'Connaissement / lettre de transport (BL, LTA, CMR…)', 'Valeur déclarée des marchandises'],
    statuses: [
      { label: 'Demande envoyée', description: 'La demande vient d’être transmise, en attente de prise en charge.', statutClass: 'bg-slate-100 text-slate-500' },
      { label: 'Complément demandé', description: "L'agent assureur a besoin d'informations ou de documents supplémentaires.", statutClass: 'bg-rose-50 text-rose-600' },
      { label: 'En étude', description: 'La demande est en cours d’analyse par l’agent assureur.', statutClass: 'bg-amber-50 text-amber-600' },
      { label: "En attente d'acceptation", description: 'Un montant a été coté pour chaque police ; à valider par le souscripteur.', statutClass: 'bg-indigo-50 text-indigo-600' },
      { label: 'Acceptée', description: "La cotation est validée, l'opération peut être sécurisée.", statutClass: 'bg-emerald-50 text-emerald-600' },
    ],
    faqs: [
      { question: 'Qui peut valider une cotation ?', answer: "Seul le souscripteur (agent transitaire habilité ou CAD) peut accepter une cotation reçue de l'assureur." },
      { question: "Que se passe-t-il après l'acceptation ?", answer: "Les montants sont mis à jour, l'opération est liée au contrat choisi, et l'agent assureur transmet le scan du contrat final." },
      { question: 'Puis-je modifier une demande déjà envoyée ?', answer: "Non. Si des informations manquent, l'agent assureur vous demandera un complément que vous pourrez fournir depuis le suivi de la demande." },
    ],
  },
  operations: {
    overview:
      "Chaque opération représente une expédition assurée : elle regroupe le contrat, les polices associées et le montant engagé. Le suivi des opérations permet de visualiser l'avancement de chacune, de la mise en étude jusqu'à la sécurisation complète.",
    processTitle: "Cycle de vie d'une opération",
    steps: [
      { title: 'En étude', description: "La demande de cotation associée est en cours d'analyse par l'agent assureur." },
      { title: 'Cotée', description: "Un montant a été fixé pour chaque police ; l'opération attend l'acceptation du souscripteur." },
      { title: 'Acceptée', description: 'Le souscripteur a validé la cotation ; les montants sont définitivement fixés et imputés sur l’encours du contrat.' },
      { title: 'Sécurisée', description: "Le contrat final (ou son scan) a été transmis : l'opération est pleinement couverte." },
    ],
    noteTitle: 'Ce que vous voyez pour chaque opération',
    notes: ["Numéro d'opération", 'Contrat lié', 'Polices associées, avec leur détail', 'Montant et statut'],
    statuses: [
      { label: 'En étude', description: 'La demande de cotation associée est en cours de traitement.', statutClass: 'bg-slate-100 text-slate-500' },
      { label: 'Coté', description: 'Un montant a été fixé pour chaque police.', statutClass: 'bg-amber-50 text-amber-600' },
      { label: 'Accepté', description: 'Le souscripteur a validé la cotation.', statutClass: 'bg-emerald-50 text-emerald-600' },
      { label: 'Sécurisé', description: 'Le contrat final a été transmis, l’opération est pleinement couverte.', statutClass: 'bg-brand-blue/10 text-brand-blue' },
    ],
    faqs: [
      { question: 'Une opération peut-elle changer de contrat ?', answer: "Non. Le contrat est fixé dès la demande de cotation et ne peut plus être modifié une fois l'opération créée." },
      { question: "Comment l'encours du contrat est-il calculé ?", answer: "Chaque opération acceptée ou sécurisée augmente l'encours du contrat ; le solde disponible correspond au montant total moins l'encours." },
    ],
  },
  polices: {
    overview:
      "Retrouvez l'ensemble des polices d'assurance proposées aux transitaires. Pour chacune : la couverture qu'elle apporte.",
    processTitle: 'Comment choisir votre police',
    steps: [
      { title: 'Identifier le risque à couvrir', description: "Responsabilité, marchandises en transit, stockage, douane… partez de ce que vous souhaitez protéger." },
      { title: 'Comparer les couvertures', description: 'Filtrez par famille, puis comparez ce que chaque police couvre.' },
      { title: 'Demander une cotation', description: "Sélectionnez une ou plusieurs polices dans votre demande : l'agent assureur cote chacune d'elles." },
    ],
    noteTitle: 'À savoir sur les tarifs',
    notes: [
      "Le catalogue n'affiche pas de prix : le montant est établi pour chaque demande.",
      "L'agent assureur cote chaque police après étude de votre dossier.",
      'Le montant définitif figure dans la cotation, avant toute acceptation.',
    ],
    statuses: [],
    faqs: [
      { question: 'Puis-je souscrire plusieurs polices en une seule demande ?', answer: "Oui. Une demande de cotation peut porter sur plusieurs polices ; chacune est cotée séparément." },
      { question: 'Où trouver le montant d’une police ?', answer: "Le catalogue n'affiche pas de prix : le montant est établi par l'agent assureur dans la cotation que vous recevez, avant toute acceptation." },
    ],
  },
  contrats: {
    overview: 'Un contrat centralise les polices d’assurance éligibles, les opérations qui lui sont rattachées et le suivi financier de l’engagement : montant total, encours et solde disponible.',
    processTitle: 'Ce que contient un contrat',
    steps: [
      { title: 'Numéro', description: 'Identifiant unique du contrat.' },
      { title: 'Souscripteur', description: 'Entreprise associée au contrat.' },
      { title: 'Libellé', description: 'Nom usuel du contrat.' },
      { title: 'Montant total', description: 'Plafond global engagé sur le contrat.' },
      { title: 'Échéance', description: 'Date de fin de validité du contrat.' },
      { title: 'Polices éligibles', description: 'Liste des polices utilisables dans le cadre du contrat.' },
      { title: 'Opérations rattachées', description: 'Historique des opérations liées au contrat.' },
    ],
    noteTitle: 'Calcul du solde',
    notes: ['Solde = Montant total − Encours', "L'encours augmente à chaque opération acceptée ou sécurisée."],
    statuses: [
      { label: 'Actif', description: 'Le contrat est en vigueur et peut être utilisé pour de nouvelles opérations.', statutClass: 'bg-emerald-50 text-emerald-600' },
      { label: 'Épuisé', description: 'Le solde disponible est à zéro ; aucune nouvelle opération sans renouvellement.', statutClass: 'bg-amber-50 text-amber-600' },
      { label: 'Expiré', description: 'La date d’échéance est dépassée.', statutClass: 'bg-slate-100 text-slate-500' },
    ],
    faqs: [
      { question: "Comment le solde d'un contrat est-il calculé ?", answer: "Solde = Montant total − Encours. L'encours augmente à chaque opération acceptée ou sécurisée." },
      { question: 'Que se passe-t-il quand le solde atteint zéro ?', answer: "Le contrat passe au statut Épuisé : aucune nouvelle opération ne peut y être rattachée tant qu'il n'est pas renouvelé ou révisé." },
    ],
  },
};

const TAB_DOCS_EN: Record<TabId, TabDoc> = {
  cotation: {
    overview:
      "The quotation request is the entry point of the freight forwarder journey. It lets you ask the insurance agent for a rate on one or more insurance policies, based on an existing contract.",
    processTitle: 'How it works',
    steps: [
      { title: 'Choose a contract', description: 'Indicate the subscriber contract under which the request will be attached. The contract determines the eligible policies and available balance.' },
      { title: 'Select the insurance policies', description: 'Choose one or more policies among those eligible for the contract (Professional Liability, Cargo Insurance, All Risks Transport, etc.).' },
      { title: 'Define the operation details', description: 'Enter the operation description, start date and end date of the period to cover.' },
      { title: 'Attach the required documents', description: 'Each policy has its own expected documents (commercial invoice, packing list, bill of lading...). They are needed for the insurer to review the request.' },
      { title: 'Submit the request', description: 'Once sent, the request is forwarded to the insurance agent, who can either ask for a complement or quote each policy directly.' },
    ],
    noteTitle: 'Documents typically requested',
    notes: ['Commercial invoice', 'Packing list', 'Bill of lading / transport document (BL, AWB, CMR…)', 'Declared value of goods'],
    statuses: [
      { label: 'Request sent', description: 'The request has just been sent, awaiting processing.', statutClass: 'bg-slate-100 text-slate-500' },
      { label: 'Complement requested', description: 'The insurance agent needs additional information or documents.', statutClass: 'bg-rose-50 text-rose-600' },
      { label: 'Under review', description: 'The request is being analysed by the insurance agent.', statutClass: 'bg-amber-50 text-amber-600' },
      { label: 'Awaiting acceptance', description: 'A price has been quoted for each policy; to be validated by the subscriber.', statutClass: 'bg-indigo-50 text-indigo-600' },
      { label: 'Accepted', description: 'The quotation is validated, the operation can be secured.', statutClass: 'bg-emerald-50 text-emerald-600' },
    ],
    faqs: [
      { question: 'Who can validate a quotation?', answer: 'Only the subscriber (an authorised freight forwarder agent or CAD) can accept a quotation received from the insurer.' },
      { question: 'What happens after acceptance?', answer: 'Amounts are updated, the operation is linked to the chosen contract, and the insurance agent sends the scanned final contract.' },
      { question: 'Can I edit a request already sent?', answer: 'No. If information is missing, the insurance agent will ask you for a complement, which you can provide from the request tracking view.' },
    ],
  },
  operations: {
    overview:
      "Each operation represents an insured shipment: it groups the contract, the associated policies and the committed amount. Operations tracking lets you see the progress of each one, from review to full security.",
    processTitle: 'Operation lifecycle',
    steps: [
      { title: 'Under review', description: 'The associated quotation request is being analysed by the insurance agent.' },
      { title: 'Quoted', description: 'A price has been set for each policy; the operation awaits the subscriber’s acceptance.' },
      { title: 'Accepted', description: 'The subscriber has validated the quotation; amounts are finalised and charged to the contract’s outstanding balance.' },
      { title: 'Secured', description: 'The final contract (or its scan) has been sent: the operation is fully covered.' },
    ],
    noteTitle: 'What you see for each operation',
    notes: ['Operation number', 'Linked contract', 'Associated policies, with their detail', 'Amount and status'],
    statuses: [
      { label: 'Under review', description: 'The associated quotation request is being processed.', statutClass: 'bg-slate-100 text-slate-500' },
      { label: 'Quoted', description: 'A price has been set for each policy.', statutClass: 'bg-amber-50 text-amber-600' },
      { label: 'Accepted', description: 'The subscriber has validated the quotation.', statutClass: 'bg-emerald-50 text-emerald-600' },
      { label: 'Secured', description: 'The final contract has been sent, the operation is fully covered.', statutClass: 'bg-brand-blue/10 text-brand-blue' },
    ],
    faqs: [
      { question: 'Can an operation change contract?', answer: 'No. The contract is fixed from the quotation request and can no longer be changed once the operation is created.' },
      { question: 'How is the contract’s outstanding balance calculated?', answer: 'Every accepted or secured operation increases the contract’s outstanding balance; the available balance equals the total amount minus the outstanding balance.' },
    ],
  },
  polices: {
    overview:
      'Browse all the insurance policies offered to freight forwarders. For each one: the coverage it provides.',
    processTitle: 'How to choose your policy',
    steps: [
      { title: 'Identify the risk to cover', description: 'Liability, goods in transit, storage, customs… start from what you want to protect.' },
      { title: 'Compare coverage', description: 'Filter by family, then compare what each policy covers.' },
      { title: 'Request a quotation', description: 'Select one or more policies in your request: the insurance agent quotes each of them.' },
    ],
    noteTitle: 'About pricing',
    notes: [
      'The catalogue does not display prices: the amount is set for each request.',
      'The insurance agent quotes each policy after reviewing your file.',
      'The final amount appears in the quotation, before any acceptance.',
    ],
    statuses: [],
    faqs: [
      { question: 'Can I take out several policies in a single request?', answer: 'Yes. A quotation request can cover several policies; each one is quoted separately.' },
      { question: 'Where can I find the amount of a policy?', answer: 'The catalogue does not display prices: the amount is set by the insurance agent in the quotation you receive, before any acceptance.' },
    ],
  },
  contrats: {
    overview: 'A contract centralises the eligible insurance policies, the operations attached to it and the financial tracking of the commitment: total amount, outstanding balance and available balance.',
    processTitle: 'What a contract contains',
    steps: [
      { title: 'Number', description: 'Unique identifier of the contract.' },
      { title: 'Subscriber', description: 'Company associated with the contract.' },
      { title: 'Label', description: 'Usual name of the contract.' },
      { title: 'Total amount', description: 'Overall ceiling committed on the contract.' },
      { title: 'Due date', description: 'Expiry date of the contract.' },
      { title: 'Eligible policies', description: 'List of policies usable under the contract.' },
      { title: 'Attached operations', description: 'History of operations linked to the contract.' },
    ],
    noteTitle: 'Balance calculation',
    notes: ['Balance = Total amount − Outstanding', 'The outstanding balance increases with every accepted or secured operation.'],
    statuses: [
      { label: 'Active', description: 'The contract is in force and can be used for new operations.', statutClass: 'bg-emerald-50 text-emerald-600' },
      { label: 'Exhausted', description: 'The available balance is zero; no new operation without renewal.', statutClass: 'bg-amber-50 text-amber-600' },
      { label: 'Expired', description: 'The due date has passed.', statutClass: 'bg-slate-100 text-slate-500' },
    ],
    faqs: [
      { question: "How is a contract's balance calculated?", answer: 'Balance = Total amount − Outstanding. The outstanding balance increases with every accepted or secured operation.' },
      { question: 'What happens when the balance reaches zero?', answer: 'The contract switches to Exhausted status: no new operation can be attached to it until it is renewed or revised.' },
    ],
  },
};

@Component({
  selector: 'app-services-page',
  imports: [RouterLink],
  templateUrl: './services-page.html',
})
export class ServicesPage {
  private readonly languageService = inject(LanguageService);
  protected readonly lang = this.languageService.lang;
  protected readonly t = computed(() => (this.lang() === 'en' ? T_EN : T_FR));

  private readonly tabIds: TabId[] = ['cotation', 'operations', 'polices', 'contrats'];
  private readonly tabIconPaths: Record<TabId, string> = {
    cotation: 'M16.862 4.487 18.549 2.8a1.94 1.94 0 1 1 2.74 2.74L7.09 19.74 2.25 21l1.26-4.84L16.862 4.487Z',
    operations:
      'M9 12.75 11.25 15 15 9.75M21 7.5V6a2.25 2.25 0 0 0-2.25-2.25H15M3 7.5V6a2.25 2.25 0 0 1 2.25-2.25H9m0 0v-.75A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5v.75M9 5.25h6M4.5 7.5h15v12.75a1.5 1.5 0 0 1-1.5 1.5h-12a1.5 1.5 0 0 1-1.5-1.5V7.5Z',
    polices:
      'M9 12.75 11.25 15 15 9.75M12 3c2.755 0 5.455.232 8.083.678.712.12 1.217.751 1.217 1.473v3.848a15.75 15.75 0 0 1-8.382 13.9.75.75 0 0 1-.636 0A15.75 15.75 0 0 1 3.7 9V5.15c0-.722.505-1.353 1.217-1.473A48.416 48.416 0 0 1 12 3Z',
    contrats:
      'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
  };

  protected readonly tabs = computed<Tab[]>(() => {
    const labels = this.lang() === 'en' ? TAB_LABELS_EN : TAB_LABELS_FR;
    return this.tabIds.map((id) => ({ id, label: labels[id], iconPath: this.tabIconPaths[id] }));
  });

  protected readonly activeTabId = signal<TabId>('cotation');
  protected readonly activeTab = computed(() => this.tabs().find((tab) => tab.id === this.activeTabId())!);

  private readonly tabDocsByLang = computed(() => (this.lang() === 'en' ? TAB_DOCS_EN : TAB_DOCS_FR));
  protected readonly activeDoc = computed(() => this.tabDocsByLang()[this.activeTabId()]);

  protected readonly policeFilter = signal<'all' | PoliceCategoryId>('all');

  protected readonly policeCards = computed<PoliceCard[]>(() => {
    const en = this.lang() === 'en';
    return POLICES_CATALOG.map((p) => {
      const labels = en ? POLICES_EN[p.code] : undefined;
      return {
        code: p.code,
        libelle: labels?.libelle ?? p.libelle,
        couverture: labels?.couverture ?? p.description,
        categorie: POLICE_CATEGORY[p.code] ?? 'formule',
      };
    });
  });

  protected readonly policeFilters = computed(() => {
    const cards = this.policeCards();
    const copy = this.t().policesPanel;
    return [
      { id: 'all' as const, label: copy.all, count: cards.length },
      ...POLICE_CATEGORY_ORDER.map((id) => ({ id, label: copy.categories[id], count: cards.filter((c) => c.categorie === id).length })),
    ];
  });

  protected readonly filteredPolices = computed(() => {
    const filter = this.policeFilter();
    const cards = this.policeCards();
    return filter === 'all' ? cards : cards.filter((c) => c.categorie === filter);
  });

  protected readonly operations: Operation[] = [
    { numero: 'OP-2026-0231', contrat: 'CT-2025-0148', libelle: 'Conteneurs électronique — Dakar/Abidjan', montant: '4 200 000 FCFA', date: '11/03/2026', statut: 'Coté', statutClass: 'bg-amber-50 text-amber-600' },
    { numero: 'OP-2026-0230', contrat: 'CT-2025-0102', libelle: 'Denrées périssables — Thiès/Bamako', montant: '1 850 000 FCFA', date: '09/03/2026', statut: 'Accepté', statutClass: 'bg-emerald-50 text-emerald-600' },
    { numero: 'OP-2026-0229', contrat: 'CT-2025-0148', libelle: 'Pièces automobiles — Port de Dakar', montant: '2 400 000 FCFA', date: '05/03/2026', statut: 'Sécurisé', statutClass: 'bg-brand-blue/10 text-brand-blue' },
    { numero: 'OP-2026-0228', contrat: 'CT-2024-0091', libelle: 'Textile — Dakar/Nouakchott', montant: '960 000 FCFA', date: '02/03/2026', statut: 'En étude', statutClass: 'bg-slate-100 text-slate-500' },
    { numero: 'OP-2026-0227', contrat: 'CT-2025-0102', libelle: 'Matériel agricole — Kaolack/Dakar', montant: '3 100 000 FCFA', date: '26/02/2026', statut: 'Sécurisé', statutClass: 'bg-brand-blue/10 text-brand-blue' },
    { numero: 'OP-2026-0226', contrat: 'CT-2025-0148', libelle: 'Produits chimiques — AIBD', montant: '5 750 000 FCFA', date: '21/02/2026', statut: 'Accepté', statutClass: 'bg-emerald-50 text-emerald-600' },
    { numero: 'OP-2026-0225', contrat: 'CT-2024-0091', libelle: 'Mobilier — Rufisque/Dakar', montant: '540 000 FCFA', date: '15/02/2026', statut: 'Sécurisé', statutClass: 'bg-brand-blue/10 text-brand-blue' },
    { numero: 'OP-2026-0224', contrat: 'CT-2025-0102', libelle: 'Équipements médicaux — Port de Dakar', montant: '6 300 000 FCFA', date: '08/02/2026', statut: 'Sécurisé', statutClass: 'bg-brand-blue/10 text-brand-blue' },
  ];

  protected readonly contrats: Contrat[] = [
    { numero: 'CT-2025-0148', libelle: 'Transit Maritime Annuel', souscripteur: 'Cargo Sénégal SARL', montantTotal: '25 000 000 FCFA', encours: '8 400 000 FCFA', solde: '16 600 000 FCFA', echeance: '31/12/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600' },
    { numero: 'CT-2025-0102', libelle: 'Contrat-cadre Import/Export', souscripteur: 'Teranga Logistics', montantTotal: '18 500 000 FCFA', encours: '11 950 000 FCFA', solde: '6 550 000 FCFA', echeance: '30/09/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600' },
    { numero: 'CT-2024-0091', libelle: 'Transit Routier Sous-Régional', souscripteur: 'Sahel Freight', montantTotal: '9 000 000 FCFA', encours: '2 000 000 FCFA', solde: '7 000 000 FCFA', echeance: '15/06/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600' },
    { numero: 'CT-2024-0067', libelle: 'Police au voyage — Import ponctuel', souscripteur: 'Baobab Trading', montantTotal: '4 200 000 FCFA', encours: '4 200 000 FCFA', solde: '0 FCFA', echeance: '28/02/2026', statut: 'Épuisé', statutClass: 'bg-amber-50 text-amber-600' },
    { numero: 'CT-2023-0134', libelle: 'Transit Maritime Annuel', souscripteur: 'Cargo Sénégal SARL', montantTotal: '20 000 000 FCFA', encours: '20 000 000 FCFA', solde: '0 FCFA', echeance: '31/12/2025', statut: 'Expiré', statutClass: 'bg-slate-100 text-slate-500' },
  ];

  constructor(route: ActivatedRoute) {
    route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const requested = params.get('tab') as TabId | null;
      if (requested && this.tabIds.includes(requested)) {
        this.activeTabId.set(requested);
      }
    });
  }

  protected setPoliceFilter(id: 'all' | PoliceCategoryId): void {
    this.policeFilter.set(id);
  }

  protected categoryLabel(id: PoliceCategoryId): string {
    return this.t().policesPanel.categories[id];
  }

  protected selectTab(id: TabId): void {
    this.activeTabId.set(id);
  }

  protected tr(value: string): string {
    if (this.lang() !== 'en') {
      return value;
    }
    return STRING_MAP[value] ?? value;
  }
}
