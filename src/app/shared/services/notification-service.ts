import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService, UserRole } from './auth-service';

export type NotificationKind = 'complement' | 'cotation' | 'accept' | 'contrat' | 'info' | 'user';

export interface AppNotification {
  id: number;
  /** Profils à qui la notification s'adresse. */
  audience: UserRole[];
  kind: NotificationKind;
  title: string;
  detail: string;
  createdAt: number;
  /** Page à ouvrir au clic. */
  link?: string;
  /** Profils qui l'ont déjà lue / masquée (l'état est propre à chaque profil). */
  readBy: UserRole[];
  hiddenBy: UserRole[];
}

export interface NotificationInput {
  audience: UserRole[];
  kind: NotificationKind;
  title: string;
  detail: string;
  link?: string;
}

export const TRANSITAIRE_ROLES: UserRole[] = ['souscripteur', 'agent-transitaire', 'cad'];
export const ASSUREUR_ROLES: UserRole[] = ['agent-assureur', 'superviseur', 'admin'];

export const NOTIFICATION_STYLES: Record<NotificationKind, { tint: string; iconPath: string }> = {
  complement: {
    tint: 'bg-rose-50 text-rose-600',
    iconPath: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-8.25 3.75h.008v.008h-.008v-.008Z',
  },
  cotation: {
    tint: 'bg-amber-50 text-amber-600',
    iconPath:
      'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z',
  },
  accept: {
    tint: 'bg-[#1F5DA8]/10 text-[#1F5DA8]',
    iconPath: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  contrat: {
    tint: 'bg-emerald-50 text-emerald-600',
    iconPath:
      'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
  },
  info: {
    tint: 'bg-slate-100 text-slate-500',
    iconPath:
      'm11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
  },
  user: {
    tint: 'bg-violet-50 text-violet-600',
    iconPath:
      'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
  },
};

/** « Il y a 2 h », « Hier »… */
export function timeAgo(timestamp: number, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - timestamp) / 60_000));
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Hier';
  return `Il y a ${days} jours`;
}

const MIN = 60_000;
const H = 60 * MIN;
const D = 24 * H;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly auth = inject(AuthService);
  private counter = 0;

  private readonly all = signal<AppNotification[]>([]);

  private readonly role = computed(() => this.auth.currentUser()?.role ?? null);

  /** Notifications visibles du profil connecté, les plus récentes d'abord. */
  readonly items = computed(() => {
    const role = this.role();
    if (!role) return [];
    return this.all()
      .filter((n) => n.audience.includes(role) && !n.hiddenBy.includes(role))
      .sort((a, b) => b.createdAt - a.createdAt);
  });

  readonly unreadCount = computed(() => {
    const role = this.role();
    return role ? this.items().filter((n) => !n.readBy.includes(role)).length : 0;
  });

  constructor() {
    const now = Date.now();
    // Côté transitaire (souscripteur, agent, CAD)
    this.seed(TRANSITAIRE_ROLES, 'complement', 'Complément demandé', 'La demande OP-2026-0065 nécessite des documents supplémentaires.', now - 2 * H, '/espace-transitaire/cotations', false);
    this.seed(TRANSITAIRE_ROLES, 'cotation', 'Cotation à accepter', 'OP-2026-0112 · 820 000 FCFA en attente de votre acceptation.', now - 4 * H, '/espace-transitaire/cotations', false);
    this.seed(TRANSITAIRE_ROLES, 'cotation', 'Cotation à accepter', 'OP-2026-0109 · 1 440 000 FCFA en attente de votre acceptation.', now - 5 * H, '/espace-transitaire/cotations', false);
    this.seed(TRANSITAIRE_ROLES, 'contrat', 'Récépissé disponible', "Le récépissé de l'opération OP-2026-0097 est prêt au téléchargement.", now - 1 * D, '/espace-transitaire/operations', true);
    this.seed(TRANSITAIRE_ROLES, 'info', 'Demande prise en charge', "L'agent assureur a pris en charge la demande OP-2026-0058.", now - 2 * D, '/espace-transitaire/cotations', true);
    // Côté assureur (agent assureur, superviseur, admin)
    this.seed(ASSUREUR_ROLES, 'cotation', 'Nouvelle demande de cotation', 'ABC Transit — COT-00124 (3 polices) attend un traitement.', now - 1 * H, '/back-office/demandes', false);
    this.seed(['agent-assureur', 'superviseur'], 'complement', 'Complément reçu', 'Baobab Trading a transmis les pièces demandées pour COT-00119.', now - 3 * H, '/back-office/demandes', false);
    this.seed(['admin', 'superviseur'], 'contrat', 'Contrats arrivant à échéance', '18 contrats arrivent à échéance dans les 90 prochains jours.', now - 5 * H, '/back-office/contrats', false);
    this.seed(ASSUREUR_ROLES, 'accept', 'Cotation acceptée', 'Teranga Logistics a accepté la cotation OP-2026-0084.', now - 1 * D, '/back-office/operations', true);
    this.seed(['admin'], 'user', 'Nouveau souscripteur', 'Cargo Sénégal SARL a été ajouté à la plateforme.', now - 2 * D, '/back-office/souscripteurs', true);
    this.seed(['admin'], 'user', 'Agent assureur ajouté', 'Ousmane Fall a rejoint les agents assureurs.', now - 3 * D, '/back-office/agents', true);
  }

  private seed(audience: UserRole[], kind: NotificationKind, title: string, detail: string, createdAt: number, link: string, read: boolean): void {
    this.all.update((list) => [
      ...list,
      { id: ++this.counter, audience, kind, title, detail, createdAt, link, readBy: read ? [...audience] : [], hiddenBy: [] },
    ]);
  }

  /** Ajoute une notification à destination d'un ou plusieurs profils (déclenchée par une action d'un autre profil). */
  push(input: NotificationInput): void {
    this.all.update((list) => [
      { id: ++this.counter, ...input, createdAt: Date.now(), readBy: [], hiddenBy: [] },
      ...list,
    ]);
  }

  isUnread(notification: AppNotification): boolean {
    const role = this.role();
    return !!role && !notification.readBy.includes(role);
  }

  markRead(id: number): void {
    this.updateForRole(id, 'readBy');
  }

  dismiss(id: number): void {
    this.updateForRole(id, 'hiddenBy');
  }

  markAllRead(): void {
    const role = this.role();
    if (!role) return;
    this.all.update((list) =>
      list.map((n) => (n.audience.includes(role) && !n.readBy.includes(role) ? { ...n, readBy: [...n.readBy, role] } : n)),
    );
  }

  private updateForRole(id: number, field: 'readBy' | 'hiddenBy'): void {
    const role = this.role();
    if (!role) return;
    this.all.update((list) =>
      list.map((n) => (n.id === id && !n[field].includes(role) ? { ...n, [field]: [...n[field], role] } : n)),
    );
  }
}
