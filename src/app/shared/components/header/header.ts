import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppLanguage, LanguageService } from '../../services/language-service';

const STATIC_STYLE_ROUTES = ['/services', '/demander-une-cotation', '/suivre-ma-demande'];

const TRANSLATIONS: Record<AppLanguage, {
  home: string;
  contracts: string;
  policies: string;
  howItWorks: string;
  contact: string;
  portalCta: string;
  mobileCta: string;
  openMenu: string;
  language: string;
  brandName: string;
  brandTagline: string;
}> = {
  fr: {
    home: 'Accueil',
    contracts: 'Contrats',
    policies: 'Polices',
    howItWorks: 'Comment ça marche',
    contact: 'Contact',
    portalCta: 'Espace Transitaire',
    mobileCta: 'Espace connecté',
    openMenu: 'Ouvrir le menu',
    language: 'Langue',
    brandName: 'Assurance et transit',
    brandTagline: 'Protéger ce qui compte',
  },
  en: {
    home: 'Home',
    contracts: 'Contracts',
    policies: 'Policies',
    howItWorks: 'How it works',
    contact: 'Contact',
    portalCta: 'Transitaire Portal',
    mobileCta: 'Connected space',
    openMenu: 'Open menu',
    language: 'Language',
    brandName: 'Insurance & transit',
    brandTagline: 'Protecting what matters',
  },
};

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly langMenuOpen = signal(false);

  protected readonly lang = this.languageService.lang;
  protected readonly t = computed(() => TRANSLATIONS[this.lang()]);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)),
    { initialValue: null },
  );

  private readonly isStaticStyleRoute = computed(() => {
    const url = this.currentUrl()?.urlAfterRedirects ?? this.router.url;
    return STATIC_STYLE_ROUTES.some((route) => url.startsWith(route));
  });

  protected readonly appearsScrolled = computed(() => this.isStaticStyleRoute() || this.scrolled());

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected onWindowScroll(): void {
    if (this.isStaticStyleRoute()) {
      return;
    }
    this.scrolled.set(window.scrollY > 20);
  }

  protected toggleLangMenu(event: Event): void {
    event.stopPropagation();
    this.langMenuOpen.update((open) => !open);
  }

  protected closeLangMenu(): void {
    this.langMenuOpen.set(false);
  }

  protected selectLang(lang: AppLanguage): void {
    this.languageService.setLang(lang);
    this.langMenuOpen.set(false);
  }
}
