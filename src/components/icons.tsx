// src/components/icons.tsx
// Compact inline SVG icon set with consistent stroke + size.
// Usage: <Ic.Wifi className="h-5 w-5" /> or <Ic.Wifi size={18} />

import * as React from 'react';

type P = React.SVGProps<SVGSVGElement> & { size?: number };
// All strokes use currentColor so you can color with Tailwind (e.g., text-[var(--flex-green)])
const A = {
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const Base = ({ children, size = 20, ...rest }: React.PropsWithChildren<P>) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    {children}
  </svg>
);

/* ===== Stats ===== */
export const Guests = (p: P) => (
  <Base {...p}>
    <path d="M16 11c1.7 0 3-1.8 3-4s-1.3-4-3-4-3 1.8-3 4 1.3 4 3 4Z" {...A} />
    <path d="M8 11c1.7 0 3-1.8 3-4S9.7 3 8 3 5 4.8 5 7s1.3 4 3 4Z" {...A} />
    <path d="M1 19v-2c0-2.7 4.7-4 7-4" {...A} />
    <path d="M15 13c2.3 0 7 1.3 7 4v2" {...A} />
  </Base>
);
export const Bedroom = (p: P) => (
  <Base {...p}>
    <path d="M21 10V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3M3 10v9M21 10v9M3 17h18" {...A} />
    <path d="M5 7h14v3H5z" {...A} />
  </Base>
);
export const Bathroom = (p: P) => (
  <Base {...p}>
    <path d="M7 4a3 3 0 0 1 3 3v3h8" {...A} />
    <path d="M4 12h17" {...A} />
    <path d="M5 12v6a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-6" {...A} />
    <path d="M11 7a1 1 0 0 0-2 0v1" {...A} />
  </Base>
);
export const Bed = (p: P) => (
  <Base {...p}>
    <path d="M3 17v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M3 17h20M6 11V9a2 2 0 0 1 2-2h4" {...A} />
  </Base>
);

/* ===== Amenities ===== */
export const Wifi = (p: P) => (
  <Base {...p}>
    <path d="M2 8.5C8.5 3.5 15.5 3.5 22 8.5" {...A} />
    <path d="M5 12c5-4 9-4 14 0" {...A} />
    <path d="M9 15.5c3-2.5 3-2.5 6 0" {...A} />
    <circle cx="12" cy="19" r="1.3" fill="currentColor" />
  </Base>
);
export const Kitchen = (p: P) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="6" rx="1.5" {...A} />
    <rect x="3" y="11" width="18" height="10" rx="1.5" {...A} />
    <path d="M8 6v8M16 6v8" {...A} />
  </Base>
);
export const Washer = (p: P) => (
  <Base {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" {...A} />
    <circle cx="12" cy="14" r="5" {...A} />
    <circle cx="8.5" cy="7.5" r="0.8" fill="currentColor" />
  </Base>
);
export const Elevator = (p: P) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" {...A} />
    <path d="M9 8l3-3 3 3M9 16l3 3 3-3" {...A} />
  </Base>
);
export const HairDryer = (p: P) => (
  <Base {...p}>
    <path d="M3 10h10a4 4 0 0 0 0-8H9v8" {...A} />
    <path d="M9 14l2 2-1 3" {...A} />
    <path d="M13 6h5" {...A} />
  </Base>
);
export const Heating = (p: P) => (
  <Base {...p}>
    <path d="M12 3c3 4-1 5-1 8a3 3 0 0 0 6 0c0-2-2-3-2-5 0-1.5.7-2.5 1.5-3.5" {...A} />
  </Base>
);
export const Smoke = (p: P) => (
  <Base {...p}>
    <rect x="3" y="8" width="18" height="10" rx="2" {...A} />
    <path d="M6 8V6a2 2 0 0 1 2-2h2" {...A} />
    <path d="M9 14h6" {...A} />
  </Base>
);
export const Carbon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" {...A} />
    <path d="M8 12h8M12 8v8" {...A} />
  </Base>
);
export const Essentials = (p: P) => (
  <Base {...p}>
    <rect x="3" y="6" width="18" height="12" rx="2" {...A} />
    <path d="M3 10h18" {...A} />
    <path d="M8 14h4" {...A} />
  </Base>
);

/* ===== Misc ===== */
export const Calendar = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" {...A} />
    <path d="M8 3v4M16 3v4M3 10h18" {...A} />
  </Base>
);

const Ic = {
  Guests, Bedroom, Bathroom, Bed,
  Wifi, Kitchen, Washer, Elevator, HairDryer, Heating, Smoke, Carbon, Essentials,
  Calendar,
};
export default Ic;
