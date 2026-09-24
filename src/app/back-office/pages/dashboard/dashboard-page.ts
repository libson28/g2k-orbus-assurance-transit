import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type RangeKey = 'auj' | '7j' | '30j' | '3m' | '1a';

interface KpiCard {
  label: string;
  value: string;
  delta: string | null;
  deltaUp: boolean;
}

interface SeriesPoint {
  label: string;
  tip: string;
  value: number;
}

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'auj', label: "Aujourd'hui" },
  { key: '7j', label: '7 jours' },
  { key: '30j', label: '30 jours' },
  { key: '3m', label: '3 mois' },
  { key: '1a', label: '1 an' },
];

// Activité relative des opérations/cotations/montants sur les 12 derniers mois (mois courant = 1).
const MONTH_FACTORS = [0.55, 0.62, 0.58, 0.7, 0.66, 0.78, 0.74, 0.85, 0.9, 0.82, 0.94, 1];

// Courbe de croissance pour les compteurs cumulatifs (souscripteurs, contrats actifs) — monotone.
const MONTH_GROWTH = [0.58, 0.62, 0.66, 0.71, 0.75, 0.79, 0.83, 0.87, 0.9, 0.94, 0.97, 1];

// Valeurs du mois courant (plateforme entière) ; les mois précédents en sont dérivés.
const BASE = {
  souscripteurs: 156,
  contratsActifs: 284,
  attente: 185,
  traitement: 240,
  complements: 96,
  cotees: 321,
  acceptees: 914,
  refusees: 86,
  montantAccepte: 4_800_000_000,
  montantCote: 5_200_000_000,
  demandes: 1245,
  cotationsEffectuees: 982,
  enAttenteTraitement: 176,
  complementsCotation: 87,
  delaiMoyenJours: 2.4,
  polices: [612, 438, 337, 254, 201],
};

const STATUS_DEFS = [
  { key: 'attente', label: 'En attente', color: '#B7791F' },
  { key: 'traitement', label: 'En traitement', color: '#2F6FED' },
  { key: 'complements', label: 'Compléments', color: '#E2620F' },
  { key: 'cotees', label: 'Cotées', color: '#7C4DDB' },
  { key: 'acceptees', label: 'Acceptées', color: '#12805C' },
  { key: 'refusees', label: 'Refusées', color: '#D0343F' },
] as const;

const POLICE_LABELS = ['Marchandises transportées', 'Tous Risques Transport', 'RC Professionnelle', 'Police au voyage', 'RC Commissionnaire'];

// Souscripteurs déjà présents dans le catalogue démo (agents/contrats) — pour rester cohérent avec le reste de l'app.
const TOP_SOUSCRIPTEURS = [
  { nom: 'ABC Transit', operations: 184, montant: 520_000_000 },
  { nom: 'Teranga Logistics', operations: 156, montant: 410_000_000 },
  { nom: 'Sahel Freight', operations: 143, montant: 380_000_000 },
  { nom: 'Cargo Sénégal SARL', operations: 118, montant: 295_000_000 },
  { nom: 'Baobab Trading', operations: 96, montant: 230_000_000 },
];

function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function niceMax(value: number): number {
  const quarter = Math.max(value, 4) / 4;
  const unit = Math.pow(10, Math.floor(Math.log10(quarter)));
  return Math.ceil(quarter / unit) * unit * 4;
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const mid = (prev.x + cur.x) / 2;
    d += ` C ${mid} ${prev.y}, ${mid} ${cur.y}, ${cur.x} ${cur.y}`;
  }
  return d;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Millions FCFA, ex. "245,8 M F". */
function fmtM(value: number): string {
  const m = Math.floor(value / 100_000) / 10;
  return `${m.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M F`;
}

/** Milliards FCFA, ex. "4,8 Md F" — utilisé pour les montants à l'échelle de la plateforme. */
function fmtMd(value: number): string {
  const md = Math.floor(value / 100_000_000) / 10;
  return `${md.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Md F`;
}

function fmtFcfa(value: number): string {
  return `${Math.round(value).toLocaleString('fr-FR')} FCFA`;
}

@Component({
  selector: 'app-back-office-dashboard-page',
  imports: [RouterLink],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  private readonly now = new Date();

  protected readonly ranges = RANGES;
  protected readonly polices = POLICE_LABELS;
  protected readonly topSouscripteurs = TOP_SOUSCRIPTEURS.map((s) => ({
    ...s,
    montantLabel: fmtM(s.montant),
  }));
  protected readonly topSouscripteursMax = Math.max(...TOP_SOUSCRIPTEURS.map((s) => s.operations));

  protected readonly months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(this.now.getFullYear(), this.now.getMonth() - (11 - i), 1);
    return {
      index: i,
      label: capitalize(d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })),
      short: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
    };
  });

  protected readonly selectedMonth = signal(11);
  protected readonly range = signal<RangeKey>('1a');
  protected readonly opsHover = signal<number | null>(null);

  protected setMonth(event: Event): void {
    this.selectedMonth.set(Number((event.target as HTMLSelectElement).value));
  }

  protected setRange(key: RangeKey): void {
    this.range.set(key);
    this.opsHover.set(null);
  }

  private monthData(index: number) {
    const f = MONTH_FACTORS[index];
    const g = MONTH_GROWTH[index];
    const s = (n: number) => Math.round(n * f);
    const attente = s(BASE.attente);
    const traitement = s(BASE.traitement);
    const complements = s(BASE.complements);
    const cotees = s(BASE.cotees);
    const acceptees = s(BASE.acceptees);
    const refusees = s(BASE.refusees);
    const round10M = (n: number) => Math.round(n / 10_000_000) * 10_000_000;
    return {
      souscripteurs: Math.round(BASE.souscripteurs * g),
      contratsActifs: Math.round(BASE.contratsActifs * g),
      attente,
      traitement,
      complements,
      cotees,
      acceptees,
      refusees,
      total: attente + traitement + complements + cotees + acceptees + refusees,
      montantAccepte: round10M(BASE.montantAccepte * f),
      montantCote: round10M(BASE.montantCote * f),
      demandes: s(BASE.demandes),
      cotationsEffectuees: s(BASE.cotationsEffectuees),
      enAttenteTraitement: s(BASE.enAttenteTraitement),
      complementsCotation: s(BASE.complementsCotation),
      // Illustratif (suppose que la plateforme horodate la soumission et la 1ère cotation de chaque
      // demande) : plus le mois est chargé, plus le délai moyen de traitement s'allonge légèrement.
      delaiMoyenJours: Math.round(BASE.delaiMoyenJours * (0.7 + 0.3 * f) * 10) / 10,
      polices: BASE.polices.map(s),
    };
  }

  private readonly current = computed(() => this.monthData(this.selectedMonth()));

  // ---- KPI ----
  protected readonly kpis = computed<KpiCard[]>(() => {
    const i = this.selectedMonth();
    const cur = this.monthData(i);
    const prev = i > 0 ? this.monthData(i - 1) : null;
    const delta = (a: number, b: number | undefined) => {
      if (b === undefined || b === 0) return { text: null as string | null, up: true };
      const pct = Math.round(((a - b) / b) * 100);
      return { text: `${pct >= 0 ? '+' : ''}${pct} % vs mois précédent`, up: pct >= 0 };
    };
    const cards: [string, number, string, number | undefined][] = [
      ['Souscripteurs / Transitaires', cur.souscripteurs, String(cur.souscripteurs), prev?.souscripteurs],
      ['Contrats actifs', cur.contratsActifs, String(cur.contratsActifs), prev?.contratsActifs],
      ['Opérations', cur.total, String(cur.total), prev?.total],
      ['Montant assuré', cur.montantAccepte, fmtMd(cur.montantAccepte), prev?.montantAccepte],
    ];
    return cards.map(([label, raw, value, before]) => {
      const d = delta(raw, before);
      return { label, value, delta: d.text, deltaUp: d.up };
    });
  });

  // ---- Évolution des opérations ----
  private opsSeries(range: RangeKey): SeriesPoint[] {
    const monthTotal = (idx: number) => this.monthData(Math.min(11, Math.max(0, idx))).total;
    const monthIndexOf = (d: Date) => 11 - ((this.now.getFullYear() - d.getFullYear()) * 12 + this.now.getMonth() - d.getMonth());
    const daysAgo = (n: number) => new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() - n);
    const shortDate = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const todayTotal = Math.round(monthTotal(11) / 30);
    // Courbe d'activité horaire type (creux la nuit, pic en journée).
    const HOURLY_SHAPE = [0.1, 0.06, 0.04, 0.03, 0.03, 0.06, 0.2, 0.5, 0.85, 1, 1.1, 1.15, 1.1, 1.2, 1.15, 1.05, 0.95, 0.8, 0.55, 0.35, 0.25, 0.2, 0.16, 0.12];
    const shapeSum = HOURLY_SHAPE.reduce((s, v) => s + v, 0);

    switch (range) {
      case '1a':
        return this.months.map((m) => ({ label: m.short, tip: m.label, value: monthTotal(m.index) }));
      case '3m':
        return Array.from({ length: 13 }, (_, w) => {
          const d = daysAgo((12 - w) * 7);
          const value = Math.round((monthTotal(monthIndexOf(d)) / 4.3) * (0.75 + 0.5 * rand(w + 3)));
          return { label: shortDate(d), tip: `Semaine du ${shortDate(d)}`, value };
        });
      case '30j':
        return Array.from({ length: 30 }, (_, k) => {
          const d = daysAgo(29 - k);
          const value = Math.round((monthTotal(monthIndexOf(d)) / 30) * (0.45 + 1.1 * rand(k + 11)));
          return { label: shortDate(d), tip: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }), value };
        });
      case '7j':
        return Array.from({ length: 7 }, (_, k) => {
          const d = daysAgo(6 - k);
          const value = Math.round((monthTotal(monthIndexOf(d)) / 30) * (0.5 + 1.1 * rand(k + 41)));
          return {
            label: capitalize(d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')),
            tip: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
            value,
          };
        });
      case 'auj':
      default:
        return HOURLY_SHAPE.map((shape, h) => ({
          label: `${h}h`,
          tip: `${String(h).padStart(2, '0')}h – ${String((h + 1) % 24).padStart(2, '0')}h`,
          value: Math.round(((todayTotal * shape) / shapeSum) * 24 * (0.85 + 0.3 * rand(h + 71))),
        }));
    }
  }

  protected readonly opsChart = computed(() => {
    const series = this.opsSeries(this.range());
    const W = 640;
    const H = 250;
    const L = 40;
    const R = 14;
    const T = 16;
    const B = 30;
    const max = niceMax(Math.max(...series.map((s) => s.value)));
    const step = series.length > 1 ? (W - L - R) / (series.length - 1) : 0;
    const pts = series.map((s, i) => ({ ...s, x: L + i * step, y: T + (H - T - B) * (1 - s.value / max) }));
    const line = smoothPath(pts);
    const area = pts.length ? `${line} L ${pts[pts.length - 1].x} ${H - B} L ${pts[0].x} ${H - B} Z` : '';
    const yTicks = [0, 1, 2, 3, 4].map((i) => ({ label: String(Math.round((max * i) / 4)), y: T + (H - T - B) * (1 - i / 4) }));
    const every = Math.ceil(series.length / 7);
    const xLabels = pts.filter((_, i) => i % every === 0);
    const total = series.reduce((sum, s) => sum + s.value, 0);
    return { W, H, L, R, T, B, pts, line, area, yTicks, xLabels, total, band: step || W };
  });

  protected readonly opsHoverPoint = computed(() => {
    const i = this.opsHover();
    const chart = this.opsChart();
    return i === null ? null : chart.pts[i] ?? null;
  });

  protected tooltipX(x: number): number {
    const c = this.opsChart();
    return Math.min(Math.max(x - 75, c.L), c.W - c.R - 150);
  }

  // ---- Répartition par statut (donut) ----
  protected readonly donut = computed(() => {
    const cur = this.current();
    const R = 70;
    const C = 2 * Math.PI * R;
    let acc = 0;
    const segments = STATUS_DEFS.map((def) => {
      const value = cur[def.key];
      const pct = cur.total ? value / cur.total : 0;
      const dash = Math.max(pct * C - 1.5, 0);
      const seg = { ...def, value, percent: Math.round(pct * 100), dash, gap: C - dash, offset: -acc };
      acc += pct * C;
      return seg;
    });
    return { R, C, segments, total: cur.total };
  });

  // ---- Activité des cotations ----
  protected readonly cotations = computed(() => {
    const cur = this.current();
    return {
      tiles: [
        { label: 'Demandes reçues', value: cur.demandes },
        { label: 'Cotations effectuées', value: cur.cotationsEffectuees },
        { label: 'En attente de traitement', value: cur.enAttenteTraitement },
        { label: 'Compléments demandés', value: cur.complementsCotation },
      ],
      delaiMoyenJours: cur.delaiMoyenJours,
    };
  });

  // ---- Polices ----
  protected readonly policeBars = computed(() => {
    const counts = this.current().polices;
    const max = Math.max(...counts, 1);
    return this.polices.map((label, i) => ({ label, count: counts[i], width: Math.round((counts[i] / max) * 100) }));
  });

  // ---- Situation des contrats (vue plateforme — instantané, indépendant du mois sélectionné) ----
  protected readonly contratsGlobal = {
    total: 342,
    actifs: 284,
    echeancesProches: 18,
    encours: 2_400_000_000,
    solde: 3_100_000_000,
  };

  protected readonly contratsTiles = [
    { label: 'Contrats actifs', value: String(this.contratsGlobal.actifs) },
    { label: 'Échéances proches (90 j)', value: String(this.contratsGlobal.echeancesProches) },
    { label: 'Encours global', value: fmtMd(this.contratsGlobal.encours) },
    { label: 'Solde global', value: fmtMd(this.contratsGlobal.solde) },
  ];

  protected fmtFcfa(value: number): string {
    return fmtFcfa(value);
  }
}
