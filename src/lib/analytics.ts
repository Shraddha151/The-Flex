import type { Review } from "@/lib/types";

/** Small helper */
function toIso(s?: string | null): string | null {
  if (!s) return null;
  try {
    const d = new Date(String(s).replace(" ", "T") + "Z");
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

export type PropertyStat = {
  propertyId: string;
  propertyName: string;
  count: number;
  avg: number;
  lowPct: number;
  highPct: number;
  lastDate: string | null;
};

export type IssueItem = {
  issue: string;
  count: number;
  avgRating?: number;
  examples: Array<{
    propertyName: string;
    text: string;
    rating?: number;
  }>;
};

const ISSUE_GROUPS: string[][] = [
  ["noisy", "noise", "loud", "party", "traffic"],
  ["wifi", "wi-fi", "internet", "connection", "network", "signal"],
  ["dirty", "unclean", "dust", "smell", "odor", "smelly", "stain", "cleanliness", "dish", "dishes"],
  ["check in", "arrival", "access", "key", "keys", "door code"],
  ["communication", "respond", "responsive", "reply", "contact"],
  ["heating", "heater", "radiator", "ac", "aircon", "air con", "cold", "hot"],
  ["kitchen", "utensils", "microwave", "cooktop", "oven"],
  ["bathroom", "shower", "toilet", "sink"],
  ["bed", "mattress", "pillow", "blanket", "bedding"],
  ["bug", "bugs", "insect", "insects", "cockroach", "mosquito", "ant", "ants"],
];

export function mentionsIssue(text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const group of ISSUE_GROUPS) {
    for (const word of group) {
      if (lower.includes(word)) return group[0];
    }
  }
  return null;
}

export function computePropertyStats(reviewsInput?: Review[] | null): PropertyStat[] {
  const reviews = Array.isArray(reviewsInput) ? reviewsInput : [];
  const map = new Map<string, PropertyStat>();

  for (const r of reviews) {
    const id = String(r.propertyId ?? "unknown");
    const name = String(r.propertyName ?? id);
    const curr = map.get(id) ?? {
      propertyId: id,
      propertyName: name,
      count: 0,
      avg: 0,
      lowPct: 0,
      highPct: 0,
      lastDate: null as string | null,
    };

    curr.count += 1;
    if (typeof r.rating === "number") {
      curr.avg += r.rating;
      curr.lowPct += r.rating < 3 ? 1 : 0;
      curr.highPct += r.rating >= 4 ? 1 : 0;
    }

    const iso = toIso(r.submittedAt ?? null);
    if (iso && (!curr.lastDate || iso > curr.lastDate)) curr.lastDate = iso;

    map.set(id, curr);
  }

  const arr = Array.from(map.values()).map((s) => {
    const c = Math.max(1, s.count);
    return {
      ...s,
      avg: s.avg / c,
      lowPct: s.lowPct / c,
      highPct: s.highPct / c,
    };
  });

  arr.sort((a, b) => a.propertyName.localeCompare(b.propertyName));
  return arr;
}

export function computeTrending(statsInput?: PropertyStat[] | null) {
  const stats = Array.isArray(statsInput) ? statsInput : [];
  return [...stats]
    .sort((a, b) => {
      if (b.avg !== a.avg) return b.avg - a.avg;
      if ((b.lastDate ?? "") !== (a.lastDate ?? "")) {
        return (b.lastDate ?? "").localeCompare(a.lastDate ?? "");
      }
      return b.count - a.count;
    })
    .map((s) => ({
      propertyId: s.propertyId,
      propertyName: s.propertyName,
      avg: s.avg,
      count: s.count,
      lastDate: s.lastDate,
    }));
}

export function computeRepeatedIssues(reviewsInput?: Review[] | null): IssueItem[] {
  const reviews = Array.isArray(reviewsInput) ? reviewsInput : [];
  const map = new Map<string, { count: number; sum: number; examples: IssueItem["examples"] }>();

  for (const r of reviews) {
    const issue = mentionsIssue(String(r.text ?? ""));
    if (!issue) continue;
    const curr = map.get(issue) ?? { count: 0, sum: 0, examples: [] };
    curr.count += 1;
    if (typeof r.rating === "number") curr.sum += r.rating;
    curr.examples.push({
      propertyName: String(r.propertyName ?? r.propertyId ?? "Unknown"),
      text: String(r.text ?? ""),
      rating: typeof r.rating === "number" ? r.rating : undefined,
    });
    map.set(issue, curr);
  }

  const items: IssueItem[] = [];
  for (const [issue, agg] of map.entries()) {
    if (agg.count < 2) continue;
    items.push({
      issue,
      count: agg.count,
      avgRating: agg.count ? agg.sum / agg.count : undefined,
      examples: agg.examples.slice(0, 3),
    });
  }

  items.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    const aa = a.avgRating ?? 99;
    const bb = b.avgRating ?? 99;
    return aa - bb;
  });

  return items;
}
