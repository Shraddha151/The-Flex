import { NextRequest, NextResponse } from 'next/server';
import { normalizeHostaway } from '@/lib/normalize-hostaway';
import mockData from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

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

function readApprovedIds(req: NextRequest): Set<string> {
  const raw = req.cookies.get('approved_ids')?.value ?? '[]';
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr.map((x) => String(x)));
    return new Set<string>();
  } catch {
    const arr = raw.split(',').map((s) => s.trim()).filter(Boolean);
    return new Set(arr.map((x) => String(x)));
  }
}

function slugify(input?: string) {
  if (!input) return '';
  return input
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const approvedOnly = url.searchParams.get('approvedOnly') === '1';

    // Allow ?ref=... or ?propertyId=... or ?slug=...
    const filterRefRaw =
      url.searchParams.get('ref') ??
      url.searchParams.get('propertyId') ??
      url.searchParams.get('slug') ??
      '';
    const filterRef = filterRefRaw.trim();

    // In real life, fetch Hostaway. Here we use mock data.
    const payload = mockData;

    // Normalize to our shape
    const normalized: Review[] = normalizeHostaway(payload);

    // Merge client “approved_ids” cookie (used by Approve API)
    const approvedSet = readApprovedIds(req);

    let data: Review[] = normalized.map((r) => ({
      ...r,
      approved: approvedSet.has(String(r.id)),
    }));

    // Optional per-property filtering by id or slug(name)
    if (filterRef) {
      const target = slugify(filterRef);
      data = data.filter(
        (r) =>
          String(r.propertyId) === filterRef ||
          slugify(r.propertyName) === target
      );
    }

    // Optional: only approved reviews
    if (approvedOnly) {
      data = data.filter((r) => r.approved);
    }

    return NextResponse.json({ status: 'success', data });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err?.message ?? 'Failed to load reviews' },
      { status: 500 }
    );
  }
}
