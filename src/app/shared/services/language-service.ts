import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'fr' | 'en';

const STORAGE_KEY = 'orbus-lang';

function readStoredLang(): AppLanguage {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly lang = signal<AppLanguage>(readStoredLang());

  setLang(lang: AppLanguage): void {
    this.lang.set(lang);
    try {
      sessionStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }
}
