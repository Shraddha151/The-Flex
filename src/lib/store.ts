// src/lib/store.ts
import { cookies } from 'next/headers';

const COOKIE = 'flex_approved_ids';
const ONE_YEAR = 60 * 60 * 24 * 365;

function readSet(): Set<string> {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw) as unknown;
    if (Array.isArray(arr)) return new Set(arr.map(String));
  } catch {}
  return new Set();
}

function writeSet(set: Set<string>) {
  cookies().set(COOKIE, JSON.stringify([...set]), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR,
  });
}

export const Approved = {
  list(): Set<string> {
    return readSet();
  },
  has(id: string | number): boolean {
    return readSet().has(String(id));
  },
  add(id: string | number): void {
    const s = readSet();
    s.add(String(id));
    writeSet(s);
  },
  delete(id: string | number): void {
    const s = readSet();
    s.delete(String(id));
    writeSet(s);
  },
};
