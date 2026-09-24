export interface ContratTransitaire {
  numero: string;
  libelle: string;
  souscripteur: string;
  montantTotal: string;
  encours: string;
  solde: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  statutClass: string;
}

export const CONTRATS_TRANSITAIRE: ContratTransitaire[] = [
  { numero: 'CTR-2026-0045', libelle: 'Transit Maritime Annuel', souscripteur: 'ABC Transit', montantTotal: '50 000 000 FCFA', encours: '18 500 000 FCFA', solde: '31 500 000 FCFA', dateDebut: '01/01/2026', dateFin: '31/12/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600' },
  { numero: 'CTR-2025-0102', libelle: 'Contrat-cadre Import/Export', souscripteur: 'Teranga Logistics', montantTotal: '18 500 000 FCFA', encours: '11 950 000 FCFA', solde: '6 550 000 FCFA', dateDebut: '01/10/2025', dateFin: '30/09/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600' },
  { numero: 'CTR-2024-0091', libelle: 'Transit Routier Sous-Régional', souscripteur: 'Sahel Freight', montantTotal: '9 000 000 FCFA', encours: '2 000 000 FCFA', solde: '7 000 000 FCFA', dateDebut: '16/06/2025', dateFin: '15/06/2026', statut: 'Actif', statutClass: 'bg-emerald-50 text-emerald-600' },
  { numero: 'CTR-2024-0067', libelle: 'Police au voyage — Import ponctuel', souscripteur: 'Baobab Trading', montantTotal: '4 200 000 FCFA', encours: '4 200 000 FCFA', solde: '0 FCFA', dateDebut: '01/03/2025', dateFin: '28/02/2026', statut: 'Épuisé', statutClass: 'bg-amber-50 text-amber-600' },
  { numero: 'CTR-2023-0134', libelle: 'Transit Maritime Annuel', souscripteur: 'Cargo Sénégal SARL', montantTotal: '20 000 000 FCFA', encours: '20 000 000 FCFA', solde: '0 FCFA', dateDebut: '01/01/2025', dateFin: '31/12/2025', statut: 'Expiré', statutClass: 'bg-slate-100 text-slate-500' },
];

/** "31 500 000 FCFA" → 31500000 */
export function parseFcfa(value: string | null): number {
  return Number((value ?? '').replace(/\D/g, '')) || 0;
}
