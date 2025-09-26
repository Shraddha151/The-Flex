'use client';

import { useEffect, useMemo, useState } from 'react';

type Review = {
  id: string | number;
  propertyId?: string | number;
  propertyName?: string;
  rating?: number;
  text?: string;
  guestName?: string;
  submittedAt?: string;
  approved?: boolean;
};

type PropStats = {
  pid: string;
  name: string;
  count: number;
  sum: number;
  avg: number;
  last: number; // ms since epoch
  lowCount: number;
  examples: { text: string; rating?: number }[];
  issueCounts: Record<string, number>;
};

const TREND_MIN_AVG = 2.5;
const TREND_MIN_REVIEWS_PRIMARY = 3;
const TREND_MIN_REVIEWS_FALLBACK = 2;

/* utils */
const fmtDate = (ms?: number) => (ms ? new Date(ms).toLocaleDateString() : '—');
function slug(input?: string | number) {
  if (input === undefined || input === null) return '';
  return String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}

export default function ReviewsPage() {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const qs = approvedOnly ? '?approvedOnly=1' : '';
      const res = await fetch(`/api/reviews/hostaway${qs}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRows(json.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load reviews');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedOnly]);

  const totals = useMemo(() => {
    const total = rows.length;
    const approved = rows.filter((r) => r.approved).length;
    const low = rows.filter((r) => (r.rating ?? 0) < 3).length;
    const properties = new Set(rows.map((r) => r.propertyName ?? r.propertyId)).size;
    return { total, approved, low, properties };
  }, [rows]);

  /* -------- Aggregate per property -------- */
  const { byProperty, detectors } = useMemo(() => {
    const map = new Map<string, PropStats>();

    const detectors = [
      { key: 'Noise', test: (s: string) => /\b(noisy|noise|traffic|loud|street noise)\b/i.test(s) },
      { key: 'Cleanliness', test: (s: string) => /\b(dirty|unclean|smell|stain|dust|grime)\b/i.test(s) },
      { key: 'Wi-Fi', test: (s: string) => /\b(wifi|wi-?fi|internet|spotty|slow wifi)\b/i.test(s) },
      { key: 'Space', test: (s: string) => /\b(small|tiny|cramped)\b/i.test(s) },
      { key: 'Bed', test: (s: string) => /\b(bed|mattress|pillow|uncomfortable)\b/i.test(s) },
      { key: 'Check-in', test: (s: string) => /\b(check[\s-]?in|lockbox|code|entry)\b/i.test(s) },
    ] as const;

    for (const r of rows) {
      const pid = slug(r.propertyId ?? r.propertyName ?? 'unknown');
      const name = r.propertyName ?? String(r.propertyId ?? 'Property');

      let curr = map.get(pid);
      if (!curr) {
        curr = {
          pid,
          name,
          count: 0,
          sum: 0,
          avg: 0,
          last: 0,
          lowCount: 0,
          examples: [],
          issueCounts: {},
        };
        map.set(pid, curr);
      }

      const rating = Number(r.rating ?? 0);
      curr.count += 1;
      curr.sum += rating;
      curr.last = Math.max(curr.last, r.submittedAt ? new Date(r.submittedAt).getTime() : 0);
      if (rating < 3) curr.lowCount += 1;

      const text = (r.text ?? '').toLowerCase();
      if (rating < 3 && text) {
        for (const d of detectors) {
          if (d.test(text)) {
            curr.issueCounts[d.key] = (curr.issueCounts[d.key] ?? 0) + 1;
          }
        }
      }
    }

    const byProperty = Array.from(map.values()).map((p) => ({
      ...p,
      avg: p.count ? Math.round((p.sum / p.count) * 10) / 10 : 0,
    }));

    return { byProperty, detectors };
  }, [rows]);

  /* -------- Trending -------- */
  const trending = useMemo(() => {
    const primary = byProperty
      .filter((p) => p.count >= TREND_MIN_REVIEWS_PRIMARY && p.avg >= TREND_MIN_AVG)
      .sort((a, b) => (b.avg - a.avg) || (b.last - a.last))
      .slice(0, 6);

    const fallback = byProperty
      .filter((p) => p.count >= TREND_MIN_REVIEWS_FALLBACK && p.avg >= TREND_MIN_AVG)
      .sort((a, b) => (b.avg - a.avg) || (b.last - a.last))
      .slice(0, 6);

    return primary.length ? primary : fallback;
  }, [byProperty]);

  /* -------- Recurring issues with property names -------- */
  const issueBuckets = useMemo(() => {
    type Bucket = {
      key: string;
      total: number;
      props: Map<string, { name: string; count: number }>;
      examples: string[];
    };

    const propByPid = new Map(byProperty.map((p) => [p.pid, p.name]));
    const buckets = new Map<string, Bucket>();

    const pidOf = (r: Review) => slug(r.propertyId ?? r.propertyName ?? 'unknown');

    for (const r of rows) {
      const rating = Number(r.rating ?? 0);
      if (rating >= 3) continue;
      const text = (r.text ?? '').trim();
      if (!text) continue;

      const pid = pidOf(r);
      const pname = propByPid.get(pid) ?? String(r.propertyName ?? r.propertyId ?? 'Property');

      for (const d of detectors) {
        if (!d.test(text)) continue;

        let b = buckets.get(d.key);
        if (!b) {
          b = { key: d.key, total: 0, props: new Map(), examples: [] };
          buckets.set(d.key, b);
        }
        b.total += 1;

        const prev = b.props.get(pid) ?? { name: pname, count: 0 };
        prev.count += 1;
        b.props.set(pid, prev);

        if (b.examples.length < 3) {
          b.examples.push(text.length > 140 ? text.slice(0, 137) + '…' : text);
        }
      }
    }

    return Array.from(buckets.values())
      .map((b) => {
        const propsLine = Array.from(b.props.values())
          .sort((a, b) => b.count - a.count)
          .map((p) => `${p.name} (${p.count})`)
          .join(', ');
        return { ...b, propsLine };
      })
      .filter((b) => b.total >= 2)
      .sort((a, b) => b.total - a.total);
  }, [rows, byProperty, detectors]);

  async function onToggleApprove(r: Review) {
    const next = !r.approved;
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, approved: next } : x)));

    try {
      const res = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewId: r.id, approved: next }),
      });

    if (!res.ok) throw new Error(`Approve failed: ${res.status}`);
      await load();
    } catch (e) {
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, approved: r.approved } : x)));
      alert((e as any)?.message ?? 'Approve failed');
    }
  }

  return (
    <main className="pb-10">
      <h1 className="mb-6 text-2xl font-semibold">Manager Dashboard</h1>

      {/* Summary cards */}
      <section className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card title="Total reviews" value={totals.total} />
        <Card title="Approved reviews" value={totals.approved} />
        <Card title="Low-star (< 3)" value={totals.low} />
        <Card title="Properties" value={totals.properties} />
      </section>

      <label className="mb-3 inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={approvedOnly}
          onChange={(e) => setApprovedOnly(e.target.checked)}
        />
        <span>Use approved reviews only</span>
      </label>

      {/* Table */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Property</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Rating</th>
              <th className="px-3 py-2 text-left">Review</th>
              <th className="px-3 py-2 text-left">Approved</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-gray-500" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="px-3 py-3 text-red-600" colSpan={6}>
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-gray-500" colSpan={6}>
                  No reviews to display.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.propertyName ?? r.propertyId}</td>
                  <td className="px-3 py-2">
                    {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-3 py-2">{r.rating ?? '—'}</td>
                  <td className="px-3 py-2 truncate">{r.text ?? '—'}</td>
                  <td className="px-3 py-2">{r.approved ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className={`rounded px-3 py-1 text-white ${
                        r.approved ? 'bg-rose-500' : 'bg-emerald-600'
                      }`}
                      onClick={() => onToggleApprove(r)}
                    >
                      {r.approved ? 'Unapprove' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* -------- Performance by Property -------- */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Performance by Property</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {byProperty.map((p) => (
            <div key={p.pid} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="font-medium">{p.name}</div>
              <div className="mt-2 text-sm text-gray-700">
                <span>
                  Avg ★ <span className="font-semibold">{p.avg || '—'}</span>
                </span>
                <span className="mx-2">·</span>
                <span>
                  Reviews <span className="font-semibold">{p.count}</span>
                </span>
                <span className="mx-2">·</span>
                {/* CHANGED: clearer wording for low-star count */}
                <span title="Count of reviews rated below 3 stars">
                  Low-star (&lt;3): <span className="font-semibold">{p.lowCount}</span>
                </span>
                <span className="mx-2">·</span>
                <span>
                  Last <span className="font-semibold">{fmtDate(p.last)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------- Trending -------- */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Trending</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {trending.length ? (
            trending.map((p) => (
              <div key={p.pid} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="font-medium">{p.name}</div>
                <div className="mt-2 text-sm text-gray-700">
                  Avg ★ <span className="font-semibold">{p.avg}</span>
                  <span className="mx-2">·</span>
                  Last <span className="font-semibold">{fmtDate(p.last)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-white p-5 text-sm text-gray-600 shadow-sm">
              Not enough data for trending yet.
            </div>
          )}
        </div>
      </section>

      {/* -------- Recurring issues -------- */}
      <section className="mt-8">
        <h2 className="mb-1 text-lg font-semibold">
          Recurring issues <span className="text-sm font-normal text-gray-600">(from review text)</span>
        </h2>
        {issueBuckets.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {issueBuckets.map((b) => (
              <div key={b.key} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-2 font-medium">
                  {b.key} • {b.total} {b.total === 1 ? 'mention' : 'mentions'}
                </div>
                <div className="mb-3 text-sm text-gray-700">
                  <span className="font-medium">Properties:</span> {b.propsLine || '—'}
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  {b.examples.map((t, i) => (
                    <div key={i}>{t}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-5 text-sm text-gray-600 shadow-sm">
            No repeated issues yet. Add more reviews to surface patterns.
          </div>
        )}
      </section>
    </main>
  );
}

/* small stat card */
function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
