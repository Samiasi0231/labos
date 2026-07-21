<<<<<<< HEAD
export type SearchResourceType = "patients" | "staff" | "test_catalog" | "test_orders" | "appointments" | "inventory";
=======
export type SearchResourceType = "patients" | "staff" | "test_catalog" | "test_orders" | "appointments";
>>>>>>> origin/main

export interface SearchHit {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
}

export interface GlobalSearchResult {
  q: string;
  groups: Partial<Record<SearchResourceType, SearchHit[]>>;
}
