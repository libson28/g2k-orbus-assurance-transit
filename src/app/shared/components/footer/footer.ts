import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppLanguage, LanguageService } from '../../services/language-service';

const TRANSLATIONS: Record<AppLanguage, {
  brandName: string;
  brandTagline: string;
  tagline: string;
  navigation: string;
  home: string;
  about: string;
  contracts: string;
  policies: string;
  howItWorks: string;
  news: string;
  contact: string;
  clientArea: string;
  login: string;
  requestQuote: string;
  trackRequests: string;
  information: string;
  faq: string;
  legalNotice: string;
  terms: string;
  privacy: string;
  contactUs: string;
  rightsReserved: string;
}> = {
  fr: {
    brandName: 'Assurance et transit',
    brandTagline: 'Protéger ce qui compte',
    tagline: 'La plateforme dédiée aux transitaires pour des assurances simples, rapides et adaptées à chaque opération.',
    navigation: 'Navigation',
    home: 'Accueil',
    about: 'À propos',
    contracts: 'Nos contrats',
    policies: 'Nos polices',
    howItWorks: 'Comment ça marche',
    news: 'Actualités',
    contact: 'Contact',
    clientArea: 'Espace client',
    login: 'Se connecter',
    requestQuote: 'Demander une cotation',
    trackRequests: 'Suivi de mes demandes',
    information: 'Informations',
    faq: 'FAQ',
    legalNotice: 'Mentions légales',
    terms: "Conditions d'utilisation",
    privacy: 'Politique de confidentialité',
    contactUs: 'Contactez-nous',
    rightsReserved: 'Tous droits réservés.',
  },
  en: {
    brandName: 'Insurance & transit',
    brandTagline: 'Protecting what matters',
    tagline: 'The platform dedicated to freight forwarders for simple, fast insurance tailored to every operation.',
    navigation: 'Navigation',
    home: 'Home',
    about: 'About',
    contracts: 'Our contracts',
    policies: 'Our policies',
    howItWorks: 'How it works',
    news: 'News',
    contact: 'Contact',
    clientArea: 'Client area',
    login: 'Log in',
    requestQuote: 'Request a quotation',
    trackRequests: 'Track my requests',
    information: 'Information',
    faq: 'FAQ',
    legalNotice: 'Legal notice',
    terms: 'Terms of use',
    privacy: 'Privacy policy',
    contactUs: 'Contact us',
    rightsReserved: 'All rights reserved.',
  },
};

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
})
export class Footer {
  private readonly languageService = inject(LanguageService);
  protected readonly lang = this.languageService.lang;
  protected readonly t = computed(() => TRANSLATIONS[this.lang()]);

  protected readonly currentYear = new Date().getFullYear();
}
