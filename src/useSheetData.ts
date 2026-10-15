// پل میان دروازه‌ی داده (Apps Script) و رابط کاربری
import { useEffect, useMemo, useState } from "react";

const EXEC_URL =
  "https://script.google.com/macros/s/AKfycbxv8JWBXo69j3YHLZfLXxYTIYkeWvbmMAKUjjT0S7vMmqZ9_e1r3pjed-91IFkCQNTRpQ/exec";
export const SHEET_CSV_URL = EXEC_URL + "?csv=1";

type Movie = {
  id: string;
  title: string;
  director: string;
  genre: string;
  distributor: string;
  releaseDate: string;
  tickets: number;
  sales: number;
  poster: string;
};

type Series = { t: number[]; s: number[]; c: number[] };

type Gateway = {
  updated: string;
  days: string[];
  provinces: string[];
  movies: Movie[];
  series: {
    byMovie: Record<string, Series>;
    byGenre: Record<string, Series>;
    total: Series;
  };
  provSeries: Record<string, Series>;
  prov: {
    byMovie: Record<string, Record<string, number[]>>;
    byGenre: Record<string, Record<string, number[]>>;
    total: Record<string, number[]>;
  };
};

export type ProvinceRow = {
  name: string;
  value: number;
  share: number;
  bar: number;
  tickets: number;
};

export type Dash = {
  status: "loading" | "ready" | "error";
  totals: { sales: number; tickets: number; sessions: number };
  series: { key: string; color: string; points: string }[];
  firstDate: string;
  lastDate: string;
  rowCount: number;
  movieOptions: string[];
  genreOptions: string[];
  provinceOptions: string[];
  provinces: ProvinceRow[];
  topGenre: string;
  topGenreShare: number;
};

const emptySeries = (): Series => ({ t: [], s: [], c: [] });

const EMPTY_DASH: Dash = {
  status: "loading",
  totals: { sales: 0, tickets: 0, sessions: 0 },
  series: [
    { key: "فروش", color: "#6d5dfc", points: "" },
    { key: "بلیت", color: "#fb7185", points: "" },
  ],
  firstDate: "—",
  lastDate: "—",
  rowCount: 0,
  movieOptions: [],
  genreOptions: [],
  provinceOptions: [],
  provinces: [],
  topGenre: "—",
  topGenreShare: 0,
};

// مختصات نقطه‌های نمودار در viewBox 700×175 — هر سری به بیشینه‌ی خودش نرمال می‌شود
function toPoints(values: number[]): string {
  if (!values.length) return "";
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? 700 / (values.length - 1) : 0;
  return values
    .map((v, i) => `${(i * step).toFixed(1)},${(14 + (1 - v / max) * 145).toFixed(1)}`)
    .join(" ");
}

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

function build(
  raw: Gateway | null,
  status: Dash["status"],
  rowCount: number,
  period: string,
  query: string,
  selectedMovie: string,
  selectedGenre: string,
  selectedProvince: string
): Dash {
  if (!raw || !raw.days || !raw.days.length) return { ...EMPTY_DASH, status };

  const days = raw.days;
  const windowSize = period === "۷ روز" ? 7 : period === "۳۰ روز" ? 30 : days.length;
  const i0 = Math.max(0, days.length - windowSize);
  const winDays = days.slice(i0);

  // جست‌وجوی سریع: اگر عبارت با فیلم یا ژانری بخواند، نمودار روی همان متمرکز می‌شود
  const q = (query || "").trim();
  let focusMovie: Movie | null = null;
  let focusGenre = "";
  if (q.length >= 2) {
    focusMovie = raw.movies.find((m) => m.title.includes(q)) || null;
    if (!focusMovie) {
      focusGenre = Object.keys(raw.series.byGenre).find((g) => g.includes(q)) || "";
    }
  }
  const pickedMovie = selectedMovie
    ? raw.movies.find((m) => m.title === selectedMovie) || null
    : null;

  // منبع داده‌ی نمودار به ترتیب اولویت فیلترها
  let src: Series = raw.series.total;
  if (pickedMovie) src = raw.series.byMovie[pickedMovie.id] || emptySeries();
  else if (focusMovie) src = raw.series.byMovie[focusMovie.id] || emptySeries();
  else if (selectedGenre && raw.series.byGenre[selectedGenre]) src = raw.series.byGenre[selectedGenre];
  else if (focusGenre && raw.series.byGenre[focusGenre]) src = raw.series.byGenre[focusGenre];
  else if (selectedProvince && raw.provSeries[selectedProvince]) src = raw.provSeries[selectedProvince];

  const salesWin = src.s.slice(i0);
  const ticketsWin = src.t.slice(i0);
  const sessionsWin = (src.c || []).slice(i0);

  const series: Dash["series"] = [
    { key: "فروش", color: "#6d5dfc", points: toPoints(salesWin) },
    { key: "بلیت", color: "#fb7185", points: toPoints(ticketsWin) },
  ];

  // جدول استان‌ها: اگر فیلم یا ژانری انتخاب شده، تفکیک استانی همان؛ وگرنه جمع پنجره‌ی زمانی
  let provVals: { name: string; t: number; s: number }[];
  const scopeMovie = pickedMovie || focusMovie;
  if (scopeMovie) {
    const per = raw.prov.byMovie[scopeMovie.id] || {};
    provVals = raw.provinces.map((p) => {
      const a = per[p] || [0, 0, 0];
      return { name: p, t: a[0] || 0, s: a[1] || 0 };
    });
  } else if (selectedGenre && raw.prov.byGenre[selectedGenre]) {
    const per = raw.prov.byGenre[selectedGenre];
    provVals = raw.provinces.map((p) => {
      const a = per[p] || [0, 0, 0];
      return { name: p, t: a[0] || 0, s: a[1] || 0 };
    });
  } else {
    provVals = raw.provinces.map((p) => {
      const ps = raw.provSeries[p];
      return {
        name: p,
        t: ps ? sum(ps.t.slice(i0)) : 0,
        s: ps ? sum(ps.s.slice(i0)) : 0,
      };
    });
  }
  const totalSales = sum(provVals.map((v) => v.s));
  const maxSales = Math.max(...provVals.map((v) => v.s), 1);
  const provinces: ProvinceRow[] = provVals
    .map((v) => ({
      name: v.name,
      value: v.s,
      tickets: v.t,
      share: (v.s / (totalSales || 1)) * 100,
      bar: (v.s / maxSales) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  // ژانر برتر بازه (مستقل از فیلترها)
  let topGenre = "—";
  let topGenreShare = 0;
  const windowTickets = sum(raw.series.total.t.slice(i0));
  let best = { g: "", t: 0 };
  Object.keys(raw.series.byGenre).forEach((g) => {
    const t = sum(raw.series.byGenre[g].t.slice(i0));
    if (t > best.t) best = { g, t };
  });
  if (best.g && windowTickets > 0) {
    topGenre = best.g;
    topGenreShare = Math.min(100, (best.t / windowTickets) * 100);
  }

  return {
    status,
    totals: {
      sales: sum(salesWin),
      tickets: sum(ticketsWin),
      sessions: sum(sessionsWin),
    },
    series,
    firstDate: winDays[0] || "—",
    lastDate: winDays[winDays.length - 1] || "—",
    rowCount,
    movieOptions: raw.movies.map((m) => m.title).sort((a, b) => a.localeCompare(b, "fa")),
    genreOptions: Object.keys(raw.series.byGenre).sort((a, b) => a.localeCompare(b, "fa")),
    provinceOptions: [...raw.provinces].sort((a, b) => a.localeCompare(b, "fa")),
    provinces,
    topGenre,
    topGenreShare,
  };
}

export function useSheetData(
  period: string,
  query: string,
  refreshKey: number,
  selectedMovie: string,
  selectedGenre: string,
  selectedProvince: string
): Dash {
  const [raw, setRaw] = useState<Gateway | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [status, setStatus] = useState<Dash["status"]>("loading");

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetch(EXEC_URL)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((d: Gateway) => {
        if (alive) {
          setRaw(d);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (alive) setStatus("error");
      });
    // شمارش دقیق رکوردهای خام از خروجی CSV
    fetch(SHEET_CSV_URL)
      .then((r) => r.text())
      .then((t) => {
        if (alive) setRowCount(Math.max(0, t.trim().split("\n").length - 1));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  return useMemo(
    () =>
      build(raw, status, rowCount, period, query, selectedMovie, selectedGenre, selectedProvince),
    [raw, status, rowCount, period, query, selectedMovie, selectedGenre, selectedProvince]
  );
}