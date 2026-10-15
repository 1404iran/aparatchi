import { useState } from "react";
import { SHEET_CSV_URL, useSheetData } from "./useSheetData";

type IconProps = { className?: string };

const FilmIcon = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 6.5h16v11H4zM8 6.5v11m8-11v11M4 10h4m8 0h4M4 14h4m8 0h4" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const SearchIcon = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="1.8" />
    <path d="m15.5 15.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ChevronDown = ({ className = "size-4" }: IconProps) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RefreshIcon = ({ className = "size-4" }: IconProps) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M15.5 7A6 6 0 1 0 16 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M12.5 6.5h3.4V3.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DownloadIcon = ({ className = "size-4" }: IconProps) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M10 3v9m0 0 3-3m-3 3L7 9M4 14.5V17h12v-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MoreIcon = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
    <circle cx="4" cy="10" r="1.3" /><circle cx="10" cy="10" r="1.3" /><circle cx="16" cy="10" r="1.3" />
  </svg>
);

const ArrowUpLeft = ({ className = "size-4" }: IconProps) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M6 14 14 6m0 0H8m6 0v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FilterSelect = ({
  value,
  onChange,
  options,
  allLabel,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
  label: string;
}) => (
  <label className="relative block">
    <span className="sr-only">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-11 min-w-36 appearance-none border py-0 pr-4 pl-10 text-sm outline-none transition ${
        value
          ? "border-violet-300 bg-violet-50 font-semibold text-violet-800"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
      aria-label={label}
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
  </label>
);

const faNumber = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });

const formatSales = (rial: number) => faNumber.format(rial / 10_000_000_000);
const formatCount = (value: number) =>
  value >= 1_000_000
    ? `${faNumber.format(value / 1_000_000)} میلیون`
    : value >= 1_000
      ? `${faNumber.format(value / 1_000)} هزار`
      : faNumber.format(value);

export default function App() {
  const [period, setPeriod] = useState("۳۰ روز");
  const [metric, setMetric] = useState("فروش");
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const data = useSheetData(period, query, refreshKey, selectedMovie, selectedGenre, selectedProvince);

  const chartSeries = data.series.filter((item) => metric === "مقایسه" || item.key === metric);

  const refresh = () => setRefreshKey((value) => value + 1);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center bg-violet-600 text-white">
              <FilmIcon className="size-6" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight">آپاراتچی</div>
              <div className="-mt-1 text-[10px] font-medium text-slate-400">رصدخانه سینمای ایران</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            <a href="#overview" className="border-b-2 border-violet-600 py-[22px] text-slate-900">نمای کلی</a>
            <a href="#films" className="py-6 transition hover:text-slate-900">فیلم‌ها</a>
            <a href="#provinces" className="py-6 transition hover:text-slate-900">استان‌ها</a>
            <a href="#about" className="py-6 transition hover:text-slate-900">درباره داده‌ها</a>
          </nav>

          <button className="flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900" onClick={refresh}>
            <span className={`size-2 rounded-full ${data.status === "loading" ? "animate-pulse bg-amber-400" : data.status === "error" ? "bg-rose-500" : "bg-emerald-500"}`} />
            <span className="hidden sm:inline">
              {data.status === "loading" ? "در حال همگام‌سازی..." : data.status === "error" ? "خطا در دریافت داده" : "متصل به Google Sheets"}
            </span>
            <RefreshIcon className={data.status === "loading" ? "size-4 animate-spin" : "size-4"} />
          </button>
        </div>
      </header>

      <section id="overview" className="mx-auto max-w-[1240px] px-5 py-8 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-600">
              <span className="h-px w-7 bg-violet-400" />
              گزارش زنده اکران
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">نبض سینمای ایران</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
              روند فروش، استقبال مخاطبان و عملکرد سینماها را از میان تازه‌ترین داده‌های ثبت‌شده دنبال کنید.
            </p>
          </div>

          <label className="flex h-12 w-full items-center gap-3 border border-slate-200 bg-white px-4 shadow-sm lg:w-80">
            <SearchIcon className="size-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="جست‌وجوی نام فیلم یا سینما..."
              aria-label="جست‌وجوی فیلم یا سینما"
            />
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[10px] text-slate-400">⌘ K</kbd>
          </label>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {["۷ روز", "۳۰ روز", "امسال"].map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`h-11 border px-4 text-sm transition ${
                period === item ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {item}
            </button>
          ))}
          <div className="mx-1 hidden h-7 w-px self-center bg-slate-200 sm:block" />
          <FilterSelect
            value={selectedMovie}
            onChange={setSelectedMovie}
            options={data.movieOptions}
            allLabel="همه فیلم‌ها"
            label="انتخاب فیلم"
          />
          <FilterSelect
            value={selectedGenre}
            onChange={setSelectedGenre}
            options={data.genreOptions}
            allLabel="همه ژانرها"
            label="انتخاب ژانر"
          />
          <FilterSelect
            value={selectedProvince}
            onChange={setSelectedProvince}
            options={data.provinceOptions}
            allLabel="کل کشور"
            label="انتخاب استان"
          />
          {(selectedMovie || selectedGenre || selectedProvince) && (
            <button
              type="button"
              onClick={() => {
                setSelectedMovie("");
                setSelectedGenre("");
                setSelectedProvince("");
              }}
              className="h-11 px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              پاک‌کردن فیلترها
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
            <div className="flex items-start justify-between">
              <span className="text-sm text-slate-500">فروش کل</span>
              <span className="text-xs font-bold text-emerald-600">داده زنده</span>
            </div>
            <strong className="mt-3 block text-2xl font-black">{formatSales(data.totals.sales)} <small className="text-sm font-medium text-slate-400">میلیارد تومان</small></strong>
            <div className="mt-5 h-1 bg-slate-100"><div className="h-full w-[72%] bg-violet-500" /></div>
          </article>
          <article className="border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
            <div className="flex items-start justify-between">
              <span className="text-sm text-slate-500">بلیت فروخته‌شده</span>
              <span className="text-xs font-bold text-emerald-600">داده زنده</span>
            </div>
            <strong className="mt-3 block text-2xl font-black">{formatCount(data.totals.tickets)} <small className="text-sm font-medium text-slate-400">بلیت</small></strong>
            <div className="mt-5 h-1 bg-slate-100"><div className="h-full w-[61%] bg-rose-400" /></div>
          </article>
          <article className="border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
            <div className="flex items-start justify-between">
              <span className="text-sm text-slate-500">تعداد سانس</span>
              <span className="text-xs font-bold text-emerald-600">داده زنده</span>
            </div>
            <strong className="mt-3 block text-2xl font-black">{formatCount(data.totals.sessions)} <small className="text-sm font-medium text-slate-400">سانس</small></strong>
            <div className="mt-5 h-1 bg-slate-100"><div className="h-full w-[48%] bg-cyan-500" /></div>
          </article>
        </div>

        <section className="mt-5 border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.03)]">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold">روند عملکرد اکران</h2>
              <p className="mt-1 text-xs text-slate-400">تغییرات روزانه در {period} گذشته</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1">
              {["فروش", "بلیت", "مقایسه"].map((item) => (
                <button
                  key={item}
                  onClick={() => setMetric(item)}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${metric === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="mb-6 flex flex-wrap items-center gap-6 text-xs text-slate-500">
              {chartSeries.map((item) => (
                <span key={item.key} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.key === "فروش" ? "فروش (میلیارد تومان)" : "تعداد بلیت (هزار)"}
                </span>
              ))}
              <span className="mr-auto text-slate-400">آخرین روز ثبت‌شده: {data.lastDate} • {faNumber.format(data.rowCount)} رکورد</span>
            </div>
            <div className="relative h-64 w-full overflow-hidden sm:h-72">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((line) => <span key={line} className="block w-full border-t border-dashed border-slate-100" />)}
              </div>
              <svg viewBox="0 0 700 175" preserveAspectRatio="none" className="relative h-[88%] w-full overflow-visible">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6d5dfc" stopOpacity=".16" />
                    <stop offset="100%" stopColor="#6d5dfc" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {metric !== "بلیت" && data.series[0].points && <path d={`M${data.series[0].points.replaceAll(" ", " L")} L700,175 L0,175Z`} fill="url(#area)" />}
                {chartSeries.map((item) => (
                  <polyline key={item.key} points={item.points} fill="none" stroke={item.color} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                ))}
              </svg>
              <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-slate-400">
                <span>{data.firstDate}</span><span>میانه بازه</span><span>{data.lastDate}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <section id="provinces" className="border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-bold">استان‌های پیشتاز</h2>
                <p className="mt-1 text-xs text-slate-400">رتبه‌بندی بر اساس فروش گیشه</p>
              </div>
              <button className="text-slate-400 transition hover:text-slate-700" aria-label="گزینه‌های بیشتر"><MoreIcon /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-right text-sm">
                <thead className="bg-slate-50 text-xs font-medium text-slate-400">
                  <tr><th className="px-5 py-3">رتبه</th><th className="px-3 py-3">استان</th><th className="px-3 py-3">فروش</th><th className="px-3 py-3">سهم از بازار</th><th className="px-5 py-3">بلیت</th></tr>
                </thead>
                <tbody>
                  {data.provinces.map((row, index) => (
                    <tr key={row.name} className="border-t border-slate-100 transition hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-semibold text-slate-400">{index + 1}</td>
                      <td className="px-3 py-4 font-bold">{row.name}</td>
                      <td className="px-3 py-4 text-slate-600">{formatSales(row.value)} میلیارد</td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3"><span className="w-8 text-xs text-slate-400">{faNumber.format(row.share)}٪</span><div className="h-1.5 w-20 bg-slate-100"><div className="h-full bg-violet-500" style={{ width: `${row.bar}%` }} /></div></div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-600">{formatCount(row.tickets)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="flex flex-col justify-between bg-slate-900 p-6 text-white">
            <div>
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">داده‌نمای امروز</span>
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,.1)]" />
              </div>
              <p className="text-xl font-bold leading-9">{data.topGenre} محبوب‌ترین ژانر این بازه است.</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">{faNumber.format(data.topGenreShare)}٪ از کل بلیت‌های فروخته‌شده متعلق به فیلم‌های این ژانر بوده است.</p>
            </div>
            <div className="mt-10">
              <div className="mb-2 flex justify-between text-xs"><span>سهم ژانر {data.topGenre}</span><span className="text-violet-300">{faNumber.format(data.topGenreShare)}٪</span></div>
              <div className="h-2 bg-slate-700"><div className="h-full bg-violet-400" style={{ width: `${data.topGenreShare}%` }} /></div>
              <button className="mt-7 flex items-center gap-2 text-sm font-semibold text-white transition hover:text-violet-300">
                مشاهده تحلیل ژانرها <ArrowUpLeft />
              </button>
            </div>
          </aside>
        </div>

        <footer id="about" className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>منبع: سامانه مدیریت فروش و اکران سینمای ایران • بروزرسانی خودکار از Google Sheets</p>
          <button onClick={() => window.open(SHEET_CSV_URL, "_blank")} className="flex items-center gap-2 text-slate-500 hover:text-slate-800"><DownloadIcon /> دریافت خروجی CSV</button>
        </footer>
      </section>
    </main>
  );
}
