import { Component, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive';
import { LanguageService } from '../../../shared/services/language-service';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  colorClass: string;
  avatar: string;
}

interface InsurancePolicy {
  title: string;
  description: string;
  tags: [string, string];
  tintClass: string;
  image: string;
}

interface ProcessStep {
  duration: string;
  title: string;
  caption: string;
  iconPath: string;
}

interface KeyStat {
  target: number;
  suffix: string;
  label: string;
  iconPath: string;
}

interface ContactInfoItem {
  iconClass: string;
  label: string;
  value: string;
}

interface FeatureItem {
  title: string;
  description: string;
}

const POLICY_META: { tintClass: string; image: string }[] = [
  { tintClass: 'bg-blue-50', image: '/policies/rc-professionnelle.jpg' },
  { tintClass: 'bg-sky-50', image: '/policies/marchandises.jpg' },
  { tintClass: 'bg-indigo-50', image: '/policies/tous-risques.jpg' },
  { tintClass: 'bg-blue-50', image: '/policies/commissionnaire.jpg' },
  { tintClass: 'bg-sky-50', image: '/policies/entrepot.jpg' },
  { tintClass: 'bg-indigo-50', image: '/policies/plus.jpg' },
];

const POLICIES_FR: Omit<InsurancePolicy, 'tintClass' | 'image'>[] = [
  { title: 'RC Professionnelle', description: "Couvre les dommages causés aux tiers ou clients dans le cadre de l'activité.", tags: ['Transitaires', 'Obligatoire'] },
  { title: 'Marchandises Transportées', description: 'Protège vos marchandises contre les pertes et avaries pendant le transport.', tags: ['Cargo', 'Tous modes'] },
  { title: 'Tous Risques Transport', description: 'Couverture étendue des risques majeurs pour les marchandises à forte valeur.', tags: ['Étendue', 'Valeur élevée'] },
  { title: 'Responsabilité du Commissionnaire', description: "Couvre votre responsabilité lorsque vous organisez le transport pour le compte d'un client.", tags: ['Commissionnaire', 'Contractuel'] },
  { title: 'Entrepôt / Stockage', description: 'Protège les marchandises confiées en dépôt et en entrepôt sous douane.', tags: ['Entrepôt', 'Douane'] },
  { title: 'Et bien plus...', description: 'Plusieurs autres polices sur mesure, adaptées à vos besoins spécifiques.', tags: ['+15 polices', 'Sur mesure'] },
];

const POLICIES_EN: Omit<InsurancePolicy, 'tintClass' | 'image'>[] = [
  { title: 'Professional Liability', description: 'Covers damages caused to third parties or clients in the course of business.', tags: ['Freight forwarders', 'Mandatory'] },
  { title: 'Cargo Insurance', description: 'Protects your goods against loss and damage during transport.', tags: ['Cargo', 'All modes'] },
  { title: 'All Risks Transport', description: 'Extended coverage of major risks for high-value goods.', tags: ['Extensive', 'High value'] },
  { title: 'Freight Forwarder Liability', description: 'Covers your liability when you organise transport on behalf of a client.', tags: ['Forwarder', 'Contractual'] },
  { title: 'Warehouse / Storage', description: 'Protects goods entrusted to storage and bonded warehouses.', tags: ['Warehouse', 'Customs'] },
  { title: 'And much more...', description: 'Several other tailor-made policies, adapted to your specific needs.', tags: ['+15 policies', 'Bespoke'] },
];

const PROCESS_META: { iconPath: string }[] = [
  { iconPath: 'M16.862 4.487 18.549 2.8a1.94 1.94 0 1 1 2.74 2.74L7.09 19.74 2.25 21l1.26-4.84L16.862 4.487Z' },
  { iconPath: 'm21 21-5.197-5.197m0 0a7.5 7.5 0 1 0-10.607 0 7.5 7.5 0 0 0 10.607 0Z' },
  { iconPath: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
  {
    iconPath:
      'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
  },
  {
    iconPath:
      'M12 3c2.755 0 5.455.232 8.083.678.712.12 1.217.751 1.217 1.473v3.848a15.75 15.75 0 0 1-8.382 13.9.75.75 0 0 1-.636 0A15.75 15.75 0 0 1 3.7 9V5.15c0-.722.505-1.353 1.217-1.473A48.416 48.416 0 0 1 12 3Z',
  },
];

const PROCESS_STEPS_FR: Omit<ProcessStep, 'iconPath'>[] = [
  { duration: '5 min', title: 'Déposer votre demande', caption: 'Informations & contrat' },
  { duration: '24h', title: 'Étude & cotation', caption: 'Analyse par nos experts' },
  { duration: 'Immédiat', title: 'Acceptation', caption: 'Validation de la cotation' },
  { duration: '24h', title: 'Émission du contrat', caption: 'Contrat généré & archivé' },
  { duration: 'Continu', title: 'Opération sécurisée', caption: 'Suivi en temps réel' },
];

const PROCESS_STEPS_EN: Omit<ProcessStep, 'iconPath'>[] = [
  { duration: '5 min', title: 'Submit your request', caption: 'Details & contract' },
  { duration: '24h', title: 'Review & quotation', caption: 'Analysed by our experts' },
  { duration: 'Instant', title: 'Acceptance', caption: 'Quotation validation' },
  { duration: '24h', title: 'Contract issuance', caption: 'Contract generated & archived' },
  { duration: 'Ongoing', title: 'Secured operation', caption: 'Real-time tracking' },
];

const STAT_META: { target: number; suffix: string; iconPath: string }[] = [
  {
    target: 350,
    suffix: '+',
    iconPath:
      'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
  },
  {
    target: 1250,
    suffix: '+',
    iconPath:
      'M9 12.75 11.25 15 15 9.75M12 3c2.755 0 5.455.232 8.083.678.712.12 1.217.751 1.217 1.473v3.848a15.75 15.75 0 0 1-8.382 13.9.75.75 0 0 1-.636 0A15.75 15.75 0 0 1 3.7 9V5.15c0-.722.505-1.353 1.217-1.473A48.416 48.416 0 0 1 12 3Z',
  },
  {
    target: 15,
    suffix: '+',
    iconPath:
      'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
  },
  {
    target: 98,
    suffix: '%',
    iconPath:
      'm11.48 3.499 2.286 4.635 5.114.744a.562.562 0 0 1 .312.959l-3.7 3.607.874 5.094a.562.562 0 0 1-.815.592L12 16.72l-4.552 2.393a.562.562 0 0 1-.815-.592l.874-5.094-3.7-3.607a.562.562 0 0 1 .312-.96l5.115-.743 2.285-4.635a.562.562 0 0 1 1.007 0Z',
  },
];

const STATS_LABELS_FR = ['Transitaires accompagnés', 'Opérations assurées', "Polices d'assurance disponibles", 'Taux de satisfaction clients'];
const STATS_LABELS_EN = ['Freight forwarders supported', 'Insured operations', 'Insurance policies available', 'Client satisfaction rate'];

const TESTIMONIAL_META: { colorClass: string; avatar: string }[] = [
  { colorClass: 'bg-rose-0', avatar: 'https://i.pravatar.cc/100?img=47' },
  { colorClass: 'bg-sky-0', avatar: 'https://i.pravatar.cc/100?img=12' },
  { colorClass: 'bg-amber-0', avatar: 'https://i.pravatar.cc/100?img=32' },
  { colorClass: 'bg-emerald-0', avatar: 'https://i.pravatar.cc/100?img=44' },
  { colorClass: 'bg-violet-0', avatar: 'https://i.pravatar.cc/100?img=' },
  { colorClass: 'bg-pink-0', avatar: 'https://i.pravatar.cc/100?img=2' },
  { colorClass: 'bg-blue-0', avatar: 'https://i.pravatar.cc/100?img=68' },
  { colorClass: 'bg-lime-0', avatar: 'https://i.pravatar.cc/100?img=9' },
];

const TESTIMONIALS_FR: Omit<Testimonial, 'colorClass' | 'avatar'>[] = [
  { quote: "AXA nous permet de sécuriser toutes nos opérations avec des solutions adaptées et un accompagnement de qualité.", author: 'Fatou Diop', role: 'Responsable Logistique, Dakar' },
  { quote: "La plateforme a divisé par deux le temps nécessaire pour obtenir une cotation sur nos dossiers de transit.", author: 'Moussa Ndiaye', role: 'Directeur Général, Thiès' },
  { quote: "Un vrai gain de visibilité sur nos contrats et nos polices, avec un suivi en temps réel de chaque opération.", author: 'Aïssatou Ba', role: "CAD, Port de Dakar" },
  { quote: "Le suivi en temps réel de nos opérations a changé notre façon de travailler avec nos assureurs.", author: 'Cheikh Sow', role: 'Responsable Opérations, Rufisque' },
  { quote: "Lancer une cotation prend maintenant quelques minutes, pas plusieurs jours.", author: 'Awa Fall', role: 'Agent Transitaire, Saint-Louis' },
  { quote: "Les compléments demandés sont clairs et le suivi de nos cotations est d'une transparence totale.", author: 'Ibrahima Sarr', role: 'Souscripteur, Kaolack' },
  { quote: "Toute notre équipe adopte AXA car la plateforme est simple et rapide à prendre en main.", author: 'Khady Diallo', role: 'Superviseur, Ziguinchor' },
  { quote: "Nos contrats, polices et opérations sont enfin centralisés au même endroit.", author: 'Omar Thiam', role: 'Responsable Conformité, Mbour' },
];

const TESTIMONIALS_EN: Omit<Testimonial, 'colorClass' | 'avatar'>[] = [
  { quote: 'AXA lets us secure all our operations with tailored solutions and quality support.', author: 'Fatou Diop', role: 'Logistics Manager, Dakar' },
  { quote: 'The platform halved the time needed to get a quotation on our transit files.', author: 'Moussa Ndiaye', role: 'Managing Director, Thiès' },
  { quote: 'Real visibility gains on our contracts and policies, with real-time tracking of every operation.', author: 'Aïssatou Ba', role: 'CAD, Port of Dakar' },
  { quote: 'Real-time tracking of our operations has changed the way we work with our insurers.', author: 'Cheikh Sow', role: 'Operations Manager, Rufisque' },
  { quote: 'Launching a quotation now takes minutes, not days.', author: 'Awa Fall', role: 'Freight Forwarder Agent, Saint-Louis' },
  { quote: 'Requested complements are clear and tracking our quotations is fully transparent.', author: 'Ibrahima Sarr', role: 'Subscriber, Kaolack' },
  { quote: 'Our whole team adopted AXA because the platform is simple and quick to learn.', author: 'Khady Diallo', role: 'Supervisor, Ziguinchor' },
  { quote: 'Our contracts, policies and operations are finally centralised in one place.', author: 'Omar Thiam', role: 'Compliance Manager, Mbour' },
];

const CONTACT_INFO_FR: ContactInfoItem[] = [
  { iconClass: 'ri-phone-line', label: 'Téléphone', value: '+221 33 123 45 67' },
  { iconClass: 'ri-mail-line', label: 'Email', value: 'contact@axa-assurance.sn' },
  { iconClass: 'ri-map-pin-line', label: 'Adresse', value: 'Dakar, Sénégal' },
  { iconClass: 'ri-time-line', label: 'Horaires', value: 'Lun – Ven, 8h à 18h' },
];

const CONTACT_INFO_EN: ContactInfoItem[] = [
  { iconClass: 'ri-phone-line', label: 'Phone', value: '+221 33 123 45 67' },
  { iconClass: 'ri-mail-line', label: 'Email', value: 'contact@axa-assurance.sn' },
  { iconClass: 'ri-map-pin-line', label: 'Address', value: 'Dakar, Senegal' },
  { iconClass: 'ri-time-line', label: 'Hours', value: 'Mon – Fri, 8am to 6pm' },
];

const CONTRACT_FEATURES_FR: FeatureItem[] = [
  { title: "Numéro, souscripteur et échéance en un coup d'œil", description: 'Toutes les informations clés de votre contrat, centralisées.' },
  { title: 'Polices éligibles rattachées à chaque contrat', description: 'Choisissez parmi vos polices autorisées lors de chaque demande.' },
  { title: 'Encours et solde calculés automatiquement', description: 'Le solde disponible est mis à jour à chaque nouvelle opération.' },
  { title: 'Historique complet des opérations liées', description: "Retrouvez chaque opération rattachée à son contrat d'origine." },
];

const CONTRACT_FEATURES_EN: FeatureItem[] = [
  { title: 'Number, subscriber and due date at a glance', description: 'All the key information of your contract, centralised.' },
  { title: 'Eligible policies attached to each contract', description: 'Choose among your authorised policies for every request.' },
  { title: 'Outstanding amount and balance calculated automatically', description: 'The available balance is updated with every new operation.' },
  { title: 'Full history of related operations', description: 'Find every operation linked back to its originating contract.' },
];

interface AccueilCopy {
  hero: { title1: string; title2: string; title3: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  trust: { title: string; subtitle: string }[];
  actions: {
    heading: (typeof ACTION_CARDS_FR)[number][];
    learnMore: string;
  };
  policiesSection: { title1: string; title2: string; subtitle: string; paragraph: string; cta: string };
  howItWorks: { badge: string; heading: string; stepLabel: string };
  contracts: { badge: string; heading: string; paragraph: string; cta: string };
  testimonials: { heading: string; subtitle: string };
  partners: { badge: string; heading1: string; heading2: string; paragraph: string; cta: string };
  cta: { heading: string; paragraph: string; button: string };
  contact: {
    badge: string;
    heading: string;
    coordTitle: string;
    coordSubtitle: string;
    successTitle: string;
    successMessage: string;
    nameLabel: string;
    namePlaceholder: string;
    nameError: string;
    companyLabel: string;
    companyPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailError: string;
    messageLabel: string;
    messagePlaceholder: string;
    messageError: string;
    submit: string;
  };
}

const ACTION_CARDS_FR = [
  { title: 'Demande de cotation', description: 'Créez votre demande en quelques étapes simples et rapides.' },
  { title: 'Suivi de vos opérations', description: "Suivez l'état de vos demandes et opérations en temps réel." },
  { title: 'Nos polices', description: "Consultez toutes nos polices d'assurance, avec leur couverture." },
  { title: 'Nos contrats', description: 'Découvrez nos contrats et conditions adaptés à vos besoins.' },
];

const ACTION_CARDS_EN = [
  { title: 'Quotation request', description: 'Create your request in a few simple, fast steps.' },
  { title: 'Track your operations', description: 'Track the status of your requests and operations in real time.' },
  { title: 'Our policies', description: 'Browse all our insurance policies, with their coverage.' },
  { title: 'Our contracts', description: 'Discover our contracts and terms tailored to your needs.' },
];

const T_FR: AccueilCopy = {
  hero: {
    title1: 'Votre partenaire',
    title2: 'en assurance transport',
    title3: 'et transit',
    subtitle: "Des solutions d'assurance adaptées à vos opérations de transit et de transport.",
    ctaPrimary: 'Demander une cotation',
    ctaSecondary: 'Suivre ma demande',
  },
  trust: [
    { title: 'Sécurisez vos opérations', subtitle: 'avec des garanties complètes' },
    { title: 'Réponse rapide', subtitle: 'Cotation en 24h' },
    { title: 'Accompagnement dédié', subtitle: 'Par nos experts' },
  ],
  actions: { heading: ACTION_CARDS_FR, learnMore: 'En savoir plus' },
  policiesSection: {
    title1: 'Nos principales',
    title2: "polices d'assurance",
    subtitle: 'Des couvertures pensées pour le transit et le transport',
    paragraph:
      'Des couvertures complètes pour chaque risque lié à vos activités de transit et de transport, sélectionnées avec nos partenaires assureurs.',
    cta: 'Voir toutes les polices',
  },
  howItWorks: {
    badge: 'Notre processus',
    heading: "De la demande à l'opération sécurisée, chaque étape pensée pour la simplicité.",
    stepLabel: 'Étape',
  },
  contracts: {
    badge: 'Vos contrats',
    heading: 'Un contrat, toutes vos polices et opérations au même endroit',
    paragraph:
      'Chaque contrat centralise vos polices éligibles, vos opérations liées et le suivi financier de votre engagement — pour une visibilité complète, en temps réel.',
    cta: 'Découvrir mes contrats',
  },
  testimonials: {
    heading: 'Ce que disent nos clients',
    subtitle: 'Ne nous croyez pas sur parole — découvrez ce que nos clients pensent de leur expérience.',
  },
  partners: {
    badge: 'Partenaires',
    heading1: 'Grandir ensemble,',
    heading2: 'plus loin.',
    paragraph:
      'Nous collaborons avec des assureurs et réassureurs de premier plan pour proposer des couvertures solides et adaptées à vos activités de transit et de transport.',
    cta: 'Devenir partenaire',
  },
  cta: {
    heading: 'Prêt à sécuriser vos opérations ?',
    paragraph: 'Demandez votre cotation dès maintenant et protégez vos activités en toute sérénité.',
    button: 'Demander une cotation',
  },
  contact: {
    badge: 'Contact',
    heading: 'Une question ? Parlons de vos besoins en assurance transit.',
    coordTitle: 'Nos coordonnées',
    coordSubtitle: 'Notre équipe vous répond sous 24h ouvrées, du lundi au vendredi.',
    successTitle: 'Message envoyé',
    successMessage: 'Merci de nous avoir contactés. Un membre de notre équipe reviendra vers vous sous 24h ouvrées.',
    nameLabel: 'Nom complet',
    namePlaceholder: 'Votre nom',
    nameError: "Merci d'indiquer votre nom.",
    companyLabel: 'Société',
    companyPlaceholder: 'Nom de votre société',
    emailLabel: 'Email professionnel',
    emailPlaceholder: 'vous@societe.sn',
    emailError: "Merci d'indiquer une adresse email valide.",
    messageLabel: 'Message',
    messagePlaceholder: 'Décrivez votre besoin en quelques mots',
    messageError: 'Merci de décrire votre demande.',
    submit: 'Envoyer le message',
  },
};

const T_EN: AccueilCopy = {
  hero: {
    title1: 'Your partner',
    title2: 'in transport insurance',
    title3: 'and freight forwarding',
    subtitle: 'Insurance solutions tailored to your transit and transport operations.',
    ctaPrimary: 'Request a quotation',
    ctaSecondary: 'Track my request',
  },
  trust: [
    { title: 'Secure your operations', subtitle: 'with comprehensive coverage' },
    { title: 'Fast response', subtitle: 'Quotation within 24h' },
    { title: 'Dedicated support', subtitle: 'From our experts' },
  ],
  actions: { heading: ACTION_CARDS_EN, learnMore: 'Learn more' },
  policiesSection: {
    title1: 'Our main',
    title2: 'insurance policies',
    subtitle: 'Coverage designed for transit and transport',
    paragraph:
      'Comprehensive coverage for every risk related to your transit and transport activities, selected with our insurance partners.',
    cta: 'View all policies',
  },
  howItWorks: {
    badge: 'Our process',
    heading: 'From request to secured operation, every step designed for simplicity.',
    stepLabel: 'Step',
  },
  contracts: {
    badge: 'Your contracts',
    heading: 'One contract, all your policies and operations in one place',
    paragraph:
      'Every contract centralises your eligible policies, related operations and financial tracking of your commitment — for complete, real-time visibility.',
    cta: 'Discover my contracts',
  },
  testimonials: {
    heading: 'What people are saying?',
    subtitle: "Don't just take our word for it — see what our customers have to say about their experience.",
  },
  partners: {
    badge: 'Partners',
    heading1: 'Growing together,',
    heading2: 'further.',
    paragraph:
      'We work with leading insurers and reinsurers to offer solid coverage tailored to your transit and transport activities.',
    cta: 'Become a partner',
  },
  cta: {
    heading: 'Ready to secure your operations?',
    paragraph: 'Request your quotation now and protect your activities with complete peace of mind.',
    button: 'Request a quotation',
  },
  contact: {
    badge: 'Contact',
    heading: 'A question? Let’s talk about your transit insurance needs.',
    coordTitle: 'Our contact details',
    coordSubtitle: 'Our team replies within 24 business hours, Monday to Friday.',
    successTitle: 'Message sent',
    successMessage: 'Thank you for contacting us. A member of our team will get back to you within 24 business hours.',
    nameLabel: 'Full name',
    namePlaceholder: 'Your name',
    nameError: 'Please enter your name.',
    companyLabel: 'Company',
    companyPlaceholder: 'Your company name',
    emailLabel: 'Business email',
    emailPlaceholder: 'you@company.com',
    emailError: 'Please enter a valid email address.',
    messageLabel: 'Message',
    messagePlaceholder: 'Describe your need in a few words',
    messageError: 'Please describe your request.',
    submit: 'Send message',
  },
};

@Component({
  selector: 'app-accueil-page',
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './accueil-page.html',
})
export class AccueilPage {
  private readonly languageService = inject(LanguageService);
  protected readonly lang = this.languageService.lang;
  protected readonly t = computed(() => (this.lang() === 'en' ? T_EN : T_FR));

  protected readonly policies = computed<InsurancePolicy[]>(() => {
    const texts = this.lang() === 'en' ? POLICIES_EN : POLICIES_FR;
    return texts.map((text, i) => ({ ...text, ...POLICY_META[i] }));
  });

  protected readonly processSteps = computed<ProcessStep[]>(() => {
    const texts = this.lang() === 'en' ? PROCESS_STEPS_EN : PROCESS_STEPS_FR;
    return texts.map((text, i) => ({ ...text, ...PROCESS_META[i] }));
  });

  protected readonly stepHeights = [56, 104, 152, 200, 248];

  protected readonly processAnimated = signal(false);
  private readonly processSection = viewChild<ElementRef<HTMLElement>>('processSection');
  private processTriggered = false;

  protected readonly keyStats = computed<KeyStat[]>(() => {
    const labels = this.lang() === 'en' ? STATS_LABELS_EN : STATS_LABELS_FR;
    return STAT_META.map((meta, i) => ({ ...meta, label: labels[i] }));
  });

  protected readonly statValues = STAT_META.map(() => signal(0));

  protected readonly contractFeatures = computed(() => (this.lang() === 'en' ? CONTRACT_FEATURES_EN : CONTRACT_FEATURES_FR));

  private readonly statsSection = viewChild<ElementRef<HTMLElement>>('statsSection');
  private statsAnimated = false;

  constructor() {
    afterNextRender(() => {
      const el = this.statsSection()?.nativeElement;
      if (!el) {
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !this.statsAnimated) {
            this.statsAnimated = true;
            this.animateStats();
            observer.disconnect();
          }
        },
        { threshold: 0.3 },
      );
      observer.observe(el);

      const processEl = this.processSection()?.nativeElement;
      if (!processEl) {
        return;
      }

      const processObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !this.processTriggered) {
            this.processTriggered = true;
            this.processAnimated.set(true);
            processObserver.disconnect();
          }
        },
        { threshold: 0.3 },
      );
      processObserver.observe(processEl);
    });
  }

  protected formatStat(value: number): string {
    return value.toLocaleString(this.lang() === 'en' ? 'en-US' : 'fr-FR');
  }

  private animateStats(): void {
    const duration = 8000;
    const start = performance.now();
    const targets = STAT_META.map((stat) => stat.target);

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      targets.forEach((target, index) => {
        this.statValues[index].set(Math.round(target * eased));
      });

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  protected readonly testimonials = computed<Testimonial[]>(() => {
    const texts = this.lang() === 'en' ? TESTIMONIALS_EN : TESTIMONIALS_FR;
    return texts.map((text, i) => ({ ...text, ...TESTIMONIAL_META[i] }));
  });

  protected readonly testimonialRow1 = computed(() => this.testimonials().filter((_, i) => i % 2 === 0));
  protected readonly testimonialRow2 = computed(() => this.testimonials().filter((_, i) => i % 2 === 1));

  protected readonly partnerLogos = [
    { name: 'AXA', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ6VIr9_1qV_MHa3QyK2O_Fv7fnBguGQ--lIcV2EuGZA&s=10' },
    { name: 'Allianz', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNEiPSByK4QqDTU0a97A4YB9jRDu4kySwa8ClMrOiwRw&s=10' },
    { name: 'Aon', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEdPbqaKzZLw5b6uUybcYkpJgbD-HhdL9sD7NAHO9HAQ&s=10' },
    { name: 'SUNU Assurances', logo: '/partners/sunu.png' },
    { name: 'Gainde2000', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZQdBZDZDrv34wJpWmzIYT4cX3bmEbMIEaqJtTkPXF4g&s=10' },
    { name: 'AMSA Assurances', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRokJfnr0cIa_DW9RuG36vs5vrFNQy8aeq1sck4gYlk8g&s=10' },
  ];

  protected readonly contactInfo = computed(() => (this.lang() === 'en' ? CONTACT_INFO_EN : CONTACT_INFO_FR));

  protected readonly contactName = signal('');
  protected readonly contactCompany = signal('');
  protected readonly contactEmail = signal('');
  protected readonly contactMessage = signal('');
  protected readonly contactTouched = signal(false);
  protected readonly contactSubmitted = signal(false);

  protected readonly contactNameValid = computed(() => this.contactName().trim().length > 0);
  protected readonly contactEmailValid = computed(() => /^\S+@\S+\.\S+$/.test(this.contactEmail().trim()));
  protected readonly contactMessageValid = computed(() => this.contactMessage().trim().length > 0);
  protected readonly contactFormValid = computed(
    () => this.contactNameValid() && this.contactEmailValid() && this.contactMessageValid(),
  );

  protected onContactNameInput(event: Event): void {
    this.contactName.set((event.target as HTMLInputElement).value);
  }

  protected onContactCompanyInput(event: Event): void {
    this.contactCompany.set((event.target as HTMLInputElement).value);
  }

  protected onContactEmailInput(event: Event): void {
    this.contactEmail.set((event.target as HTMLInputElement).value);
  }

  protected onContactMessageInput(event: Event): void {
    this.contactMessage.set((event.target as HTMLTextAreaElement).value);
  }

  protected submitContact(): void {
    this.contactTouched.set(true);
    if (!this.contactFormValid()) {
      return;
    }
    this.contactSubmitted.set(true);
  }
}
