// src/lib/normalize-hostaway.ts
export type Review = {
  id: string | number;
  propertyId?: string | number;
  propertyName?: string;
  rating?: number;
  text?: string;
  guestName?: string;
  submittedAt?: string; // ISO
  approved?: boolean;
  categories?: { category: string; score: number }[];
};

/**
 * Accepts Hostaway-like payloads (live or mock) and maps them into the
 * Review shape that the UI expects. Handles both:
 * - live-style keys: id, propertyId, propertyName, text, submittedAt
 * - mock-style keys: reviewId, listingId, listingName, message, createdAt
 */
export function normalizeHostaway(input: any): Review[] {
  // Some payloads are wrapped in { data: [...] }
  const rows: any[] = Array.isArray(input)
    ? input
    : Array.isArray(input?.data)
    ? input.data
    : [];

  const out: Review[] = rows.map((r: any) => {
    // tolerant key mapping
    const id =
      r.id ??
      r.reviewId ??
      r.review_id ??
      r.uuid ??
      `${r.listingId ?? r.listing_id ?? r.propertyId ?? r.property_id ?? 'unknown'}-${r.createdAt ?? r.created_at ?? r.date ?? ''}`;

    const propertyId =
      r.propertyId ?? r.property_id ?? r.listingId ?? r.listing_id ?? r.unitId ?? r.unit_id;

    const propertyName =
      r.propertyName ?? r.property_name ?? r.listingName ?? r.listing_name ?? r.unitName ?? r.unit_name;

    const rating = Number(
      r.rating ?? r.stars ?? r.score ?? (typeof r.overall === 'number' ? r.overall : 0),
    );

    // IMPORTANT: map `message` -> `text`
    const text: string | undefined =
      r.text ?? r.comment ?? r.message ?? r.body ?? r.reviewText;

    // IMPORTANT: map `createdAt` -> `submittedAt`
    const submittedAt: string | undefined =
      r.submittedAt ?? r.submitted_at ?? r.createdAt ?? r.created_at ?? r.date;

    const guestName: string | undefined =
      r.guestName ?? r.guest_name ?? r.reviewer ?? r.author ?? r.reviewerName ?? 'Guest';

    // categories may arrive either as array of {category, score} or an object
    let categories: { category: string; score: number }[] | undefined;
    if (Array.isArray(r.categories)) {
      categories = r.categories.map((c: any) => ({
        category: String(c.category ?? c.name ?? ''),
        score: Number(c.score ?? c.value ?? 0),
      }));
    } else if (r.categories && typeof r.categories === 'object') {
      categories = Object.entries(r.categories).map(([k, v]) => ({
        category: String(k),
        score: Number(v),
      }));
    }

    return {
      id,
      propertyId: propertyId != null ? String(propertyId) : undefined,
      propertyName,
      rating: Number.isFinite(rating) ? rating : undefined,
      text,
      guestName,
      submittedAt,
      approved: r.approved ?? r.isApproved ?? false,
      categories,
    };
  });

  // Sort newest first when we have a valid date
  out.sort((a, b) => {
    const ad = a.submittedAt ? Date.parse(a.submittedAt) : 0;
    const bd = b.submittedAt ? Date.parse(b.submittedAt) : 0;
    return bd - ad;
  });

  return out;
}

export default normalizeHostaway;
