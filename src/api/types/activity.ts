export interface Activity {
  _id: string;
  lab: string;
  actor: string | { _id: string; firstName?: string; lastName?: string; email?: string };
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ActivityListResponse {
  docs: Activity[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface ActivityListQuery {
  resource?: string;
  action?: string;
  actor?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}
