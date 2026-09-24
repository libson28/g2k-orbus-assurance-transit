export interface PoliceCatalogEntry {
  code: string;
  libelle: string;
  description: string;
  piecesAttendues: string[];
}

export const POLICES_CATALOG: PoliceCatalogEntry[] = [
  {
    code: 'RC-PRO',
    libelle: 'RC Professionnelle',
    description: 'Couvre la responsabilité civile professionnelle du transitaire.',
    piecesAttendues: ['Attestation RCCM', "Justificatif d'activité"],
  },
  {
    code: 'RC-COM',
    libelle: 'RC Commissionnaire de transport',
    description: 'Couvre la responsabilité du commissionnaire envers ses clients.',
    piecesAttendues: ['Agrément commissionnaire', 'Contrat de commission'],
  },
  {
    code: 'RC-TRANS',
    libelle: 'RC Transporteur',
    description: 'Couvre la responsabilité du transporteur pour les marchandises confiées.',
    piecesAttendues: ['Carte grise du véhicule', 'Licence de transport'],
  },
  {
    code: 'MARCH',
    libelle: 'Marchandises Transportées',
    description: "Indemnise la perte ou l'avarie des marchandises pendant le transport.",
    piecesAttendues: ['Facture commerciale', 'Liste de colisage'],
  },
  {
    code: 'TRT',
    libelle: 'Tous Risques Transport',
    description: "Couverture tous risques du transport, du départ à l'arrivée.",
    piecesAttendues: ['Facture commerciale', "Certificat d'origine", 'Connaissement / LTA'],
  },
  {
    code: 'FAP',
    libelle: 'FAP / FAP sauf',
    description: "Franc d'avaries particulières : couvre les avaries majeures uniquement.",
    piecesAttendues: ['Facture commerciale', "Rapport d'expertise (si disponible)"],
  },
  {
    code: 'ABON',
    libelle: "Police d'abonnement / flottante",
    description: 'Couvre automatiquement tous les envois déclarés sur une période donnée.',
    piecesAttendues: ['Liste des expéditions prévues', 'Facture commerciale'],
  },
  {
    code: 'VOYAGE',
    libelle: 'Police au voyage',
    description: 'Couverture ponctuelle pour un seul trajet.',
    piecesAttendues: ['Facture commerciale', 'Bon de livraison'],
  },
  {
    code: 'ANNUEL',
    libelle: 'Police annuelle / contrat-cadre',
    description: "Couverture continue pour l'ensemble des opérations de l'année.",
    piecesAttendues: ['Contrat-cadre signé', 'Chiffre d’affaires prévisionnel'],
  },
  {
    code: 'RC-EXPL',
    libelle: 'RC Exploitation',
    description: "Couvre les dommages causés dans le cadre de l'exploitation courante.",
    piecesAttendues: ['Attestation RCCM'],
  },
  {
    code: 'DEPOT',
    libelle: 'Biens confiés / marchandises en dépôt',
    description: 'Couvre les marchandises entreposées confiées par des tiers.',
    piecesAttendues: ['Contrat de dépôt', 'Inventaire des biens'],
  },
  {
    code: 'ENTREPOT',
    libelle: 'Entrepôt / magasin sous douane',
    description: 'Couvre les marchandises stockées en entrepôt sous douane.',
    piecesAttendues: ['Agrément entrepôt sous douane', "Plan de l'entrepôt"],
  },
  {
    code: 'DOUANE',
    libelle: 'Risques douaniers / garantie douanière',
    description: 'Garantit les droits et taxes douaniers en cas de litige.',
    piecesAttendues: ['Déclaration en douane', 'Facture commerciale'],
  },
  {
    code: 'CREDIT',
    libelle: 'Crédit / garantie financière',
    description: 'Garantie financière pour les engagements de paiement.',
    piecesAttendues: ['États financiers', 'Garantie bancaire (si disponible)'],
  },
  {
    code: 'AUTO',
    libelle: 'Automobile / flotte',
    description: 'Couvre les véhicules de la flotte du transitaire.',
    piecesAttendues: ['Carte grise du véhicule', 'Permis de conduire du chauffeur'],
  },
];
