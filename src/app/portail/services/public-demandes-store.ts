import { inject, Injectable, signal } from '@angular/core';
import { ASSUREUR_ROLES, NotificationService } from '../../shared/services/notification-service';

export interface PublicDemandeContact {
  nom: string;
  societe: string;
  email: string;
  telephone: string;
}

export interface PublicDemandeMarchandise {
  nature: string;
  description: string;
  valeur: string;
  quantite: string;
  poidsVolume: string;
  typeEmballage: string;
}

export interface PublicDemandeTransport {
  modeTransport: string;
  dateDepart: string;
  destination: string;
  dateArrivee: string;
  transporteur: string;
  numeroVehicule: string;
  typeCouverture: string;
}

export interface PublicDemandePolice {
  code: string;
  libelle: string;
}

export type PublicModePaiement = 'wave' | 'orange-money' | 'carte';

export const PUBLIC_MODE_PAIEMENT_LABELS: Record<PublicModePaiement, string> = {
  wave: 'Wave',
  'orange-money': 'Orange Money',
  carte: 'Carte bancaire',
};

export const PUBLIC_MODE_PAIEMENT_LOGOS: Record<PublicModePaiement, string> = {
  wave: '/wave.png',
  'orange-money': '/orange-money.png',
  carte: '/carte-bancaire.jpg',
};

export interface PublicDemandeMoyenPaiement {
  mode: PublicModePaiement;
  /** Numéro (mobile money) ou 4 derniers chiffres (carte) masqués, à titre indicatif. */
  reference: string;
}

export interface PublicDemandeDocument {
  label: string;
  fileName: string | null;
}

export interface PublicDemande {
  numero: string;
  contact: PublicDemandeContact;
  marchandise: PublicDemandeMarchandise;
  transport: PublicDemandeTransport;
  polices: PublicDemandePolice[];
  documents: PublicDemandeDocument[];
  /** Moyen de paiement souhaité pour le règlement de la prime, une fois la cotation reçue. */
  moyenPaiement: PublicDemandeMoyenPaiement;
  statut: string;
  statutClass: string;
  historique: { label: string; date: string }[];
  dateDemande: string;
}

@Injectable({ providedIn: 'root' })
export class PublicDemandesStore {
  private readonly notifications = inject(NotificationService);

  readonly demandes = signal<PublicDemande[]>([
    {
      numero: 'DP-2026-0001',
      contact: { nom: 'Moussa Diallo', societe: 'Diallo Import Export', email: 'moussa.diallo@example.sn', telephone: '+221 77 654 32 10' },
      marchandise: {
        nature: 'Matériel électroménager',
        description: 'Réfrigérateurs et climatiseurs neufs destinés à la revente.',
        valeur: '15 500 000 FCFA',
        quantite: '1 conteneur 40 pieds',
        poidsVolume: '11 tonnes',
        typeEmballage: 'Cartons sur palettes',
      },
      transport: {
        modeTransport: 'Maritime',
        dateDepart: '2026-03-10',
        destination: 'Port de Dakar',
        dateArrivee: '2026-03-28',
        transporteur: 'CMA CGM',
        numeroVehicule: 'CMAU-552017',
        typeCouverture: 'Tous risques',
      },
      polices: [{ code: 'MARCH', libelle: 'Marchandises Transportées' }],
      documents: [{ label: 'Facture commerciale', fileName: 'facture-electromenager.pdf' }],
      moyenPaiement: { mode: 'orange-money', reference: '•• •• •• 10' },
      statut: 'En étude',
      statutClass: 'bg-amber-50 text-amber-600',
      historique: [
        { label: 'Demande envoyée', date: '02/03/2026' },
        { label: 'Prise en charge par un agent assureur', date: '03/03/2026' },
        { label: 'En attente de cotation', date: '03/03/2026' },
      ],
      dateDemande: '02/03/2026',
    },
  ]);

  add(demande: PublicDemande): void {
    this.demandes.update((list) => [demande, ...list]);
    this.notifications.push({
      audience: ASSUREUR_ROLES,
      kind: 'cotation',
      title: 'Nouvelle demande publique',
      detail: `${demande.numero} — ${demande.contact.societe || demande.contact.nom} sollicite une cotation sans compte.`,
      link: '/back-office/demandes',
    });
  }

  findByNumero(numero: string): PublicDemande | null {
    const target = numero.trim().toUpperCase();
    return this.demandes().find((d) => d.numero.toUpperCase() === target) ?? null;
  }

  generateNumero(): string {
    const year = new Date().getFullYear();
    const seq = String(this.demandes().length + 1).padStart(4, '0');
    return `DP-${year}-${seq}`;
  }
}
