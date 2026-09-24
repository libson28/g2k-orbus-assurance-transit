import { Injectable, signal } from '@angular/core';

const SESSION_KEY = 'orbus-authenticated';
const USER_KEY = 'orbus-current-user';

export type UserRole = 'souscripteur' | 'agent-transitaire' | 'cad' | 'agent-assureur' | 'superviseur' | 'admin';

export interface CurrentUser {
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  /** Réservé au souscripteur : indique si ce compte gère une équipe d'agents/de techniciens CAO, sélectionnée lors de l'inscription.
   *  Si la valeur est « false », le souscripteur gère seul les demandes et la supervision. */
  hasTeam?: boolean;
  /** Vrai pour les comptes créés par un assureur/administrateur avec un mot de passe provisoire —
   *  oblige à changer de mot de passe avant que le compte ne puisse accéder à quoi que ce soit d'autre. */
  mustChangePassword?: boolean;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  souscripteur: 'Souscripteur',
  'agent-transitaire': 'Agent transitaire',
  cad: 'CAD',
  'agent-assureur': 'Agent assureur',
  superviseur: 'Superviseur',
  admin: 'Admin',
};

function readStoredUser(): CurrentUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal(sessionStorage.getItem(SESSION_KEY) === 'true');
  private readonly user = signal<CurrentUser | null>(readStoredUser());

  readonly isAuthenticated = this.authenticated.asReadonly();
  readonly currentUser = this.user.asReadonly();

  login(user: CurrentUser): void {
    this.authenticated.set(true);
    this.user.set(user);
    sessionStorage.setItem(SESSION_KEY, 'true');
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  logout(): void {
    this.authenticated.set(false);
    this.user.set(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  clearMustChangePassword(): void {
    const current = this.user();
    if (!current) {
      return;
    }
    const updated = { ...current, mustChangePassword: false };
    this.user.set(updated);
    sessionStorage.setItem(USER_KEY, JSON.stringify(updated));
  }
}
