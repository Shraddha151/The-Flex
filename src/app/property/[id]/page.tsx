'use client';

import { useEffect, useState, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Ic from '../../../components/icons';

type Review = {
  id: string | number;
  propertyId?: string | number;
  propertyName?: string;
  rating?: number;
  text?: string;
  guestName?: string;
  submittedAt?: string;
  approved?: boolean;
  categories?: { category: string; score: number }[];
};

type ReviewsPanelProps = { reviews: Review[]; title?: string };

const ReviewsPanel = dynamic(
  () => import('../../../components/ReviewsPanel'),
  { ssr: false }
) as unknown as React.ComponentType<ReviewsPanelProps>;

type Stat = { label: string; value: string; Icon: ComponentType<{ size?: number }> };
type GallerySet = { main: string; thumbs: string[] };

function galleryFor(id: string): GallerySet {
  const base = `/properties/${id}`;
  const img = (n: number) => `${base}/${n}.jpg`;
  return { main: img(1), thumbs: [2, 3, 4, 5].map(img) };
}

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [rows, setRows] = useState<Review[]>([]);
  const [name, setName] = useState<string>('—');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = `?approvedOnly=1&ref=${encodeURIComponent(String(id))}`;
        const res = await fetch(`/api/reviews/hostaway${qs}`, {
          cache: 'no-store',
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const scoped: Review[] = json.data ?? [];
        if (!cancelled) {
          setRows(scoped);
          setName(scoped[0]?.propertyName ?? 'Property');
        }
      } catch {
        if (!cancelled) setRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const approved = rows.filter((r) => r.approved);
  const gallery = galleryFor(String(id));

  const stats: Stat[] = [
    { label: 'Guests', value: '5', Icon: Ic.Guests },
    { label: 'Bedrooms', value: '2', Icon: Ic.Bedroom },
    { label: 'Bathrooms', value: '2', Icon: Ic.Bathroom },
    { label: 'Beds', value: '3', Icon: Ic.Bed },
  ];

  return (
    <main className="pb-10">
      <div className="pt-6">
        <Link href="/properties" className="text-sm text-gray-600 hover:underline">
          ← Back to Properties
        </Link>
      </div>

      {/* Gallery */}
      <section className="relative mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="col-span-1 md:col-span-3">
          <img
            src={gallery.main}
            alt="Main"
            className="block h-[420px] w-full rounded-2xl object-cover"
          />
        </div>
        <div className="col-span-1 grid grid-cols-2 gap-4 md:col-span-2">
          {gallery.thumbs.slice(0, 4).map((t, i) => (
            <img
              key={i}
              src={t}
              alt={`thumb-${i + 1}`}
              className="block h-[200px] w-full rounded-2xl object-cover"
            />
          ))}
        </div>
      </section>

      {/* Title + stats */}
      <section className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
        <div className="mt-4 flex flex-wrap gap-8 text-sm">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Icon size={18} />
              </span>
              <span className="font-medium">{value}</span>
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left */}
        <div className="space-y-8 lg:col-span-2">
          {/* About */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">About this property</h2>
            <p className="text-gray-700">
              This 2-bedroom apartment in Acton is perfect for up to 5 guests. Each bedroom has a
              double bed, ideal for two people, and the living room features an extra single bed for
              one more guest. The apartment also includes two modern bathrooms and a fully equipped
              kitchen, so you’ll have everything you need…{' '}
              <span className="text-emerald-700">Read more</span>
            </p>
          </section>

          {/* Amenities */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Amenities</h2>
              <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 focus:outline-none">
                View all amenities ▸
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                'Internet',
                'Kitchen',
                'Hair Dryer',
                'Cable TV',
                'Washing Machine',
                '24-Hour Checkin',
                'Smoke Detector',
                'Essentials',
              ].map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-700" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Policies */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">Stay Policies</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-emerald-50/40 p-5">
                <div className="mb-3 font-medium">Check-in &amp; Check-out</div>
                <div className="text-gray-800">
                  <div className="text-sm">Check-in Time</div>
                  <div className="text-lg font-semibold">3:00 PM</div>
                </div>
                <div className="mt-3 text-gray-800">
                  <div className="text-sm">Check-out Time</div>
                  <div className="text-lg font-semibold">10:00 AM</div>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50/40 p-5">
                <div className="mb-3 font-medium">House Rules</div>
                <ul className="space-y-2 text-gray-800">
                  <li>• No smoking</li>
                  <li>• No pets</li>
                  <li>• No parties or events</li>
                  <li>• Security deposit required</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl bg-emerald-800 p-5 text-white shadow-sm">
            <h2 className="text-lg font-semibold">Book Your Stay</h2>
            <div className="text-sm opacity-90">Select dates to see prices</div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm" suppressHydrationWarning>
            <div className="space-y-3">
              {/* Date input */}
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                <span className="text-emerald-700">
                  <Ic.Calendar size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Select dates"
                  className="w-full outline-none"
                  autoComplete="off"
                  name="booking-dates"
                  suppressHydrationWarning
                />
              </div>

              {/* Guests input */}
              <div className="flex gap-2">
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2"
                  aria-label="Guests"
                  min={1}
                  defaultValue={1}
                  autoComplete="off"
                  name="booking-guests"
                  suppressHydrationWarning
                />
                <button className="rounded-lg border px-3 py-2" aria-label="Guests menu">
                  ▾
                </button>
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-400 py-2 text-white">
                <Ic.Calendar size={18} />
                <span>Check availability</span>
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border py-2">
                <Ic.Wifi size={18} />
                <span>Send Inquiry</span>
              </button>
              <div className="text-center text-xs text-gray-500">
                ○ Instant booking confirmation
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Reviews full-width under both cols */}
      <section id="reviews" className="mt-12 lg:col-span-3">
        <ReviewsPanel reviews={approved} />
      </section>
    </main>
  );
}
