// src/app/properties/page.tsx
import Link from 'next/link';

type Listing = {
  id: string;
  name: string;
  hero: string; // path to 1st image
};

const listings: Listing[] = [
  {
    id: '2b-n1-a-29-shoreditch-heights',
    name: '2B N1 A – 29 Shoreditch Heights',
    hero: '/properties/2b-n1-a-29-shoreditch-heights/1.jpg',
  },
  {
    id: 'camden-loft-12',
    name: 'Camden Loft – 12',
    hero: '/properties/camden-loft-12/1.jpg',
  },
  {
    id: 'soho-studio-5',
    name: 'Soho Studio – 5',
    hero: '/properties/soho-studio-5/1.jpg',
  },
];

export default function PropertiesPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Properties</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((p) => (
          <Link
            key={p.id}
            href={`/property/${p.id}`}
            className="group overflow-hidden rounded-xl border bg-white"
            title={p.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.hero}
              alt={p.name}
              className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="p-4">
              <div className="line-clamp-2 font-medium">{p.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
