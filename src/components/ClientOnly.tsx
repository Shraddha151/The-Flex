// src/components/ClientOnly.tsx
'use client';
import { useEffect, useState } from 'react';
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready ? <>{children}</> : null;
}
