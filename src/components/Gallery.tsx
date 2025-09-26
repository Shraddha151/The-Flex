// src/components/Gallery.tsx
'use client';

import ClientOnly from './ClientOnly';

type Img = { src: string; alt?: string };

export default function Gallery({ images }: { images: Img[] }) {
  const [a, b, c, d, e] = [images[0], images[1], images[2], images[3], images[4]];

  return (
    <section className="relative mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
      <div className="col-span-1 md:col-span-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a?.src} alt={a?.alt ?? ''} className="block h-[420px] w-full rounded-2xl object-cover" />
      </div>
      <div className="col-span-1 grid grid-cols-2 gap-4 md:col-span-2">
        {[b, c, d, e].filter(Boolean).map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={(img as Img).src} alt={(img as Img).alt ?? ''} className="block h-[200px] w-full rounded-2xl object-cover" />
        ))}
      </div>

      <ClientOnly>
        <button
          type="button"
          className="absolute bottom-6 right-6 gallery-pill"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => (document.activeElement as HTMLElement | null)?.blur()}
        >
          View all photos
        </button>
      </ClientOnly>
    </section>
  );
}
