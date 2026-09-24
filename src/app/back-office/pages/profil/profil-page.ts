import { Component, computed, inject } from '@angular/core';
import { AuthService, ROLE_LABELS, UserRole } from '../../../shared/services/auth-service';

const ROLE_COMPANY: Record<UserRole, string> = {
  souscripteur: '—',
  'agent-transitaire': '—',
  cad: '—',
  'agent-assureur': 'Compagnie d’assurance partenaire',
  superviseur: 'Compagnie d’assurance partenaire',
  admin: 'AXA Assurances',
};

@Component({
  selector: 'app-back-office-profil-page',
  imports: [],
  templateUrl: './profil-page.html',
})
export class ProfilPage {
  private readonly authService = inject(AuthService);

  protected readonly compte = computed(() => {
    const user = this.authService.currentUser();
    return {
      nom: user?.name ?? 'Agent Assureur',
      initiales: user?.initials ?? 'AA',
      email: user?.email ?? 'admin@axa.sn',
      telephone: '+221 33 889 12 00',
      profil: user ? ROLE_LABELS[user.role] : 'Agent assureur',
      compagnie: user ? ROLE_COMPANY[user.role] : 'Compagnie d’assurance partenaire',
    };
  });
}
