// src/components/ReviewsPanel.tsx
'use client';

import { useMemo, useState } from 'react';

export type Review = {
  id: string | number;
  propertyId?: string;
  propertyName?: string;
  rating?: number;
  text?: string;
  guestName?: string;
  submittedAt?: string;
  approved?: boolean;
  categories?: { category: string; score: number }[];
};

type Props = { reviews: Review[]; title?: string };

const fmtDate = (s?: string | number | Date | null) =>
  s ? new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(s)) : '—';

function useAggregates(reviews: Review[]) {
  return useMemo(() => {
    const count = reviews.length;
    const overall = count ? Math.round((reviews.reduce((a, r) => a + (r.rating ?? 0), 0) / count) * 100) / 100 : 0;

    const hist = [0, 0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const b = Math.max(1, Math.min(5, Math.round(r.rating ?? 0)));
      hist[b] += 1;
    });

    const sums = new Map<string, { total: number; n: number }>();
    for (const r of reviews) for (const c of r.categories ?? []) {
      const key = c.category.toLowerCase();
      const e = sums.get(key) ?? { total: 0, n: 0 };
      e.total += Number(c.score || 0); e.n += 1; sums.set(key, e);
    }
    const averages = new Map<string, number>();
    for (const [k, v] of sums) averages.set(k, v.n ? v.total / v.n : 0);

    return { count, overall, hist, averages };
  }, [reviews]);
}

export default function ReviewsPanel({ reviews, title = 'Reviews' }: Props) {
  const { count, overall, hist, averages } = useAggregates(reviews);

  const [q, setQ] = useState('');
  const [min, setMin] = useState<number>(0);
  const [topic, setTopic] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase();
    return reviews.filter((r) => {
      const okStars = (r.rating ?? 0) >= min;
      const okText =
        !qx || r.text?.toLowerCase().includes(qx) || r.guestName?.toLowerCase().includes(qx) || r.propertyName?.toLowerCase().includes(qx);
      const okTopic =
        !topic ||
        (topic === 'wifi' && /\bwifi|wi\-fi|internet\b/i.test(r.text ?? '')) ||
        (topic === 'clean' && /\bclean|spotless|dirty|dust\b/i.test(r.text ?? '')) ||
        (topic === 'location' && /\blocation|near|walk|tube|metro|station\b/i.test(r.text ?? '')) ||
        (topic === 'room' && /\broom|bedroom|space|size\b/i.test(r.text ?? '')) ||
        (topic === 'bed' && /\bbed|mattress|pillow\b/i.test(r.text ?? '')) ||
        (topic === 'quiet' && /\bquiet|calm|peaceful\b/i.test(r.text ?? ''));
      return okStars && okText && okTopic;
    });
  }, [reviews, q, min, topic]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-4xl font-semibold leading-tight" style={{ color: 'var(--flex-green)' }}>
          {overall.toFixed(2)}
        </div>
        <h3 className="mt-1 text-xl font-semibold">{title}</h3>
        <div className="text-sm text-gray-600">{count} reviews</div>
      </div>

      {/* Booking-like top grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Category bars */}
        <div className="card p-4">
          <div className="mb-3 text-base font-semibold">Category Scores</div>
          <div className="space-y-3">
            {[
              ['cleanliness','Cleanliness'],
              ['location','Location'],
              ['comfort','Comfort'],
              ['value_for_money','Value'],
              ['wifi','Wi-Fi'],
            ].map(([key,label]) => {
              const v = averages.get(key) ?? 0;          // 0–10
              const pct = Math.max(0, Math.min(100, (v/10)*100));
              return (
                <div key={key} className="min-w-0 flex items-center gap-3">
                  <div className="min-w-0 w-full">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      {/* WRAP instead of truncate */}
                      <span className="whitespace-normal break-words text-gray-700">{label}</span>
                      <span className="shrink-0 font-medium">{v ? v.toFixed(1) : '—'}</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Topic chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {['clean','location','quiet','wifi','room','bed'].map((k) => {
              const active = topic === k;
              return (
                <button
                  key={k}
                  type="button"
                  /* add reviews-chip for nicer wrapping; keep your chip styles */
                  className={`chip reviews-chip ${active ? 'chip--active' : ''}`}
                  onClick={() => setTopic(active ? null : k)}
                >
                  + {k[0].toUpperCase() + k.slice(1)}
                </button>
              );
            })}
            {topic && (
              <button type="button" className="chip reviews-chip" onClick={() => setTopic(null)}>Clear</button>
            )}
          </div>
        </div>

        {/* Filters + extra scores */}
        <div className="card p-4">
          <div className="mb-3 text-base font-semibold">Filters</div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded border bg-white px-3 py-1.5 text-sm">
              <span>🔎</span>
              <input
                placeholder="Search reviews…"
                className="w-40 outline-none"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 rounded border bg-white px-3 py-1.5 text-sm">
              <span>★</span>
              <input
                type="number" min={0} max={5} step={0.5}
                className="w-16 outline-none"
                placeholder="Min"
                value={min}
                onChange={(e) => setMin(Number(e.target.value || 0))}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {[
              ['facilities','Facilities'],
              ['communication','Communication'],
              ['respect_house_rules','House rules'],
            ].map(([key,label]) => (
              <div key={key} className="rounded border bg-white px-3 py-2">
                <div className="flex items-center justify-between">
                  {/* WRAP instead of truncate */}
                  <span className="whitespace-normal break-words font-medium">{label}</span>
                  <span className="shrink-0 text-gray-600">{(averages.get(key) ?? 0).toFixed(1)} / 10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Airbnb-like histogram */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="mb-3 font-medium">Rating distribution</div>
          {[5,4,3,2,1].map((n) => {
            const c = hist[n] ?? 0;
            const pct = count ? (c / count) * 100 : 0;
            return (
              <div key={n} className="mb-2 flex items-center gap-3">
                <span className="w-6 text-right text-sm text-gray-600">{n}</span>
                <div className="hist-track w-full"><div className="hist-fill" style={{ width: `${pct}%` }} /></div>
                <span className="w-8 text-right text-sm text-gray-600">{c}</span>
              </div>
            );
          })}
        </div>

        <div className="card p-4">
          <div className="mb-3 font-medium">Highlights</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['wifi','Wi-Fi'],
              ['location','Location'],
              ['comfort','Comfort'],
              ['value_for_money','Value'],
            ].map(([key,label]) => (
              <div key={key} className="rounded border bg-white px-3 py-2">
                <div className="flex items-center justify-between">
                  {/* WRAP instead of truncate */}
                  <span className="whitespace-normal break-words font-medium">{label}</span>
                  <span className="shrink-0 text-gray-600">{(averages.get(key) ?? 0).toFixed(1)} / 10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((r) => (
          <article key={r.id} className="card p-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="min-w-0 text-sm text-gray-700">
                <strong className="truncate">{r.guestName ?? 'Guest'}</strong>
                <span className="mx-1">·</span>
                <span className="shrink-0">{fmtDate(r.submittedAt)}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--flex-green)] px-2 py-0.5 text-xs text-white">
                <span className="font-semibold">{(r.rating ?? 0).toFixed(1)}</span>
                <span>★</span>
              </div>
            </div>
            <p className="mt-3 break-words hyphens-auto leading-relaxed">{r.text ?? '—'}</p>
            {!!r.categories?.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.categories.map((c) => (
                  <span
                    key={c.category}
                    /* add reviews-chip so long category names wrap cleanly */
                    className="reviews-chip rounded-full border px-2 py-1 text-xs text-gray-700"
                  >
                    {c.category.replace(/_/g, ' ')}: {c.score}/10
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
        {filtered.length === 0 && <div className="text-sm text-gray-600">No reviews match your filters.</div>}
      </div>
    </section>
  );
}
