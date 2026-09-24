import { Component } from '@angular/core';

@Component({
  selector: 'app-profil-page',
  imports: [],
  templateUrl: './profil-page.html',
})
export class ProfilPage {
  protected readonly agent = {
    nom: 'Fatou Diop',
    email: 'fatou.diop@entreprise.sn',
    telephone: '+221 77 123 45 67',
    profil: 'Agent transitaire',
  };

  protected readonly souscripteur = {
    ninea: 'SN-0123456789',
    raisonSociale: 'ABC Transit',
    adresse: 'Zone Industrielle, Dakar, Sénégal',
    representant: 'Moussa Ndiaye — Gérant',
  };
}
