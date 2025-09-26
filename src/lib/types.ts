// src/lib/types.ts

export type CategoryScore = {
  category: string;
  score: number;
};

export type Review = {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName?: string;
  rating?: number;
  text?: string;
  submittedAt?: string | null; // ISO string or null
  categories?: CategoryScore[];
  // NOTE: "approved" is overlaid by the API route using the store.
  approved?: boolean;
};
