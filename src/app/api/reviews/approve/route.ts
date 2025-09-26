// src/app/api/reviews/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ReqBody = {
  reviewId?: string | number;
  approved?: boolean;
};

function readApprovedIds(req: NextRequest): string[] {
  const raw = req.cookies.get('approved_ids')?.value ?? '[]';
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map((x) => String(x)) : [];
  } catch {
    // fallback if an old cookie was CSV
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reviewId, approved }: ReqBody = await req.json();

    if (!reviewId) {
      return NextResponse.json(
        { status: 'error', message: 'reviewId required' },
        { status: 400 }
      );
    }

    const ids = new Set(readApprovedIds(req));
    const key = String(reviewId);

    if (approved) ids.add(key);
    else ids.delete(key);

    const serialized = JSON.stringify([...ids]);

    const res = NextResponse.json({
      status: 'success',
      approved: ids.has(key),
      ids: [...ids],
    });

    // Persist for 30 days
    res.cookies.set('approved_ids', serialized, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { status: 'error', message: e?.message ?? 'failed' },
      { status: 500 }
    );
  }
}
