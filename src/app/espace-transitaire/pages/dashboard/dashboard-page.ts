import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type RangeKey = '7j' | '30j' | '3m' | '6m' | '1a';

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

interface ContratStat {
  numero: string;
  libelle: string;
  total: number;
  encours: number;
  dateFin: Date;
}

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '7j', label: '7 jours' },
  { key: '30j', label: '30 jours' },
  { key: '3m', label: '3 mois' },
  { key: '6m', label: '6 mois' },
  { key: '1a', label: '1 an' },
];

// Activité relative des 12 derniers mois (le mois courant = 1).
const MONTH_FACTORS = [0.55, 0.62, 0.58, 0.7, 0.66, 0.78, 0.74, 0.85, 0.9, 0.82, 0.94, 1];

// Valeurs du mois courant ; les mois précédents en sont dérivés.
const BASE = {
  attente: 6,
  traitement: 7,
  complements: 4,
  cotation: 7,
  acceptees: 87,
  refusees: 17,
  montantCote: 285_400_000,
  montantAccepte: 245_850_000,
  polices: [42, 31, 27, 18, 10],
};

const STATUS_DEFS = [
  { key: 'attente', label: 'En attente', color: '#B7791F' },
  { key: 'traitement', label: 'En traitement', color: '#2F6FED' },
  { key: 'complements', label: 'Compléments demandés', color: '#E2620F' },
  { key: 'cotation', label: 'Cotation effectuée', color: '#7C4DDB' },
  { key: 'acceptees', label: 'Acceptées', color: '#12805C' },
  { key: 'refusees', label: 'Refusées', color: '#D0343F' },
] as const;

const POLICE_LABELS = ['Marchandises transportées', 'Tous Risques Transport', 'RC Pro', 'RC Commissionnaire', 'Police au voyage'];

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

function fmtM(value: number): string {
  const m = Math.floor(value / 100_000) / 10;
  return `${m.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M F`;
}

function fmtFcfa(value: number): string {
  return `${value.toLocaleString('fr-FR')} FCFA`;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  private readonly now = new Date();

  protected readonly ranges = RANGES;
  protected readonly polices = POLICE_LABELS;

  protected readonly months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(this.now.getFullYear(), this.now.getMonth() - (11 - i), 1);
    return {
      index: i,
      label: capitalize(d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })),
      short: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
    };
  });

  protected readonly selectedMonth = signal(11);
  protected readonly range = signal<RangeKey>('6m');
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
    const s = (n: number) => Math.round(n * f);
    const attente = s(BASE.attente);
    const traitement = s(BASE.traitement);
    const complements = s(BASE.complements);
    const cotation = s(BASE.cotation);
    const acceptees = s(BASE.acceptees);
    const refusees = s(BASE.refusees);
    const round50k = (n: number) => Math.round(n / 50_000) * 50_000;
    const montantAccepte = round50k(BASE.montantAccepte * f);
    const montantCote = round50k(BASE.montantCote * f);
    return {
      attente,
      traitement,
      complements,
      cotation,
      acceptees,
      refusees,
      total: attente + traitement + complements + cotation + acceptees + refusees,
      enCours: attente + traitement + complements + cotation,
      montantAccepte,
      montantCote,
      montantAttente: montantCote - montantAccepte,
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
      ['Opérations', cur.total, String(cur.total), prev?.total],
      ['En cours', cur.enCours, String(cur.enCours), prev?.enCours],
      ['Acceptées', cur.acceptees, String(cur.acceptees), prev?.acceptees],
      ['Montant assuré', cur.montantAccepte, fmtM(cur.montantAccepte), prev?.montantAccepte],
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

    switch (range) {
      case '1a':
        return this.months.map((m) => ({ label: m.short, tip: m.label, value: monthTotal(m.index) }));
      case '6m':
        return this.months.slice(6).map((m) => ({ label: m.short, tip: m.label, value: monthTotal(m.index) }));
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
      default:
        return Array.from({ length: 7 }, (_, k) => {
          const d = daysAgo(6 - k);
          const value = Math.round((monthTotal(monthIndexOf(d)) / 30) * (0.5 + 1.1 * rand(k + 41)));
          return {
            label: capitalize(d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')),
            tip: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
            value,
          };
        });
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

  // ---- Montants ----
  protected readonly montants = computed(() => {
    const cur = this.current();
    return [
      { label: 'Montant coté', value: fmtM(cur.montantCote), full: fmtFcfa(cur.montantCote), dot: 'bg-[#1F5DA8]/30' },
      { label: 'Montant accepté', value: fmtM(cur.montantAccepte), full: fmtFcfa(cur.montantAccepte), dot: 'bg-[#1F5DA8]' },
      { label: 'Montant en attente', value: fmtM(cur.montantAttente), full: fmtFcfa(cur.montantAttente), dot: 'bg-amber-400' },
    ];
  });

  protected readonly montantsChart = computed(() => {
    const last6 = this.months.slice(6).map((m) => ({ m, data: this.monthData(m.index) }));
    const W = 560;
    const H = 230;
    const L = 40;
    const R = 8;
    const T = 22;
    const B = 28;
    const maxM = niceMax(Math.max(...last6.map((x) => x.data.montantCote)) / 1_000_000);
    const yOf = (millions: number) => T + (H - T - B) * (1 - millions / maxM);
    const group = (W - L - R) / last6.length;
    const barW = Math.min(group * 0.32, 26);
    const bars = last6.map((x, i) => {
      const cx = L + group * i + group / 2;
      const coteM = x.data.montantCote / 1_000_000;
      const accM = x.data.montantAccepte / 1_000_000;
      return {
        label: x.m.short,
        tip: `${x.m.label} — coté ${fmtM(x.data.montantCote)}, accepté ${fmtM(x.data.montantAccepte)}`,
        coteX: cx - barW - 2,
        accX: cx + 2,
        barW,
        coteY: yOf(coteM),
        coteH: H - B - yOf(coteM),
        accY: yOf(accM),
        accH: H - B - yOf(accM),
        cx,
        accLabel: (Math.floor(accM * 10) / 10).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }),
      };
    });
    const yTicks = [0, 1, 2, 3, 4].map((i) => ({ label: String(Math.round((maxM * i) / 4)), y: yOf((maxM * i) / 4) }));
    return { W, H, L, R, B, bars, yTicks };
  });

  // ---- Polices ----
  protected readonly policeBars = computed(() => {
    const counts = this.current().polices;
    const max = Math.max(...counts, 1);
    return this.polices.map((label, i) => ({ label, count: counts[i], width: Math.round((counts[i] / max) * 100) }));
  });

  // ---- Contrats ----
  private readonly contrats: ContratStat[] = [
    { numero: 'CTR-2026-0045', libelle: 'Transit Maritime Annuel', total: 50_000_000, encours: 18_500_000, dateFin: new Date(2026, 11, 31) },
    { numero: 'CTR-2025-0102', libelle: 'Contrat-cadre Import/Export', total: 18_500_000, encours: 11_950_000, dateFin: new Date(2026, 8, 30) },
    { numero: 'CTR-2024-0091', libelle: 'Transit Routier Sous-Régional', total: 9_000_000, encours: 2_000_000, dateFin: new Date(2026, 5, 15) },
  ];

  protected readonly contratsStats = computed(() => {
    const encours = this.contrats.reduce((s, c) => s + c.encours, 0);
    const total = this.contrats.reduce((s, c) => s + c.total, 0);
    const horizon = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() + 90);
    const bientot = this.contrats.filter((c) => c.dateFin >= this.now && c.dateFin <= horizon).length;
    return {
      tiles: [
        { label: 'Contrats actifs', value: String(this.contrats.length) },
        { label: 'Échéances proches', value: String(bientot) },
        { label: 'Encours', value: fmtM(encours) },
        { label: 'Solde disponible', value: fmtM(total - encours) },
      ],
      bars: this.contrats.map((c) => ({
        numero: c.numero,
        libelle: c.libelle,
        encoursPct: Math.round((c.encours / c.total) * 100),
        encours: fmtM(c.encours),
        solde: fmtM(c.total - c.encours),
      })),
    };
  });
}
