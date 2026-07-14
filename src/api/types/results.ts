
export type ResultStatus = "draft" | "submitted" | "returned" | "approved" | "released";

export interface ResultValue {
  parameterId: string;
  parameterName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
}


export type PopulatedRef<T> = string | (T & { _id: string });
export interface TimelineEntry {
  status: ResultStatus;
  at: string;
  by: PopulatedRef<{ role?: string; user?: PopulatedRef<{ firstName?: string; lastName?: string }> }>;
  note?: string;
}

export interface LabResult {
  _id: string;
  lab: string;
  testOrder: PopulatedRef<{ code?: string }>;
  testOrderItem: PopulatedRef<{ testName?: string; samples?: string[] }>;
  patient: PopulatedRef<{ firstName?: string; lastName?: string; code?: string }>;
  values: ResultValue[];
  status: ResultStatus;
  notes?: string;
  timelines: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}
export interface ResultListResponse {
  docs: LabResult[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface ResultListQuery {
  status?: ResultStatus;
  patient?: string;
  testOrder?: string;
  page?: number;
  limit?: number;
}


export type EntryParamType = "numeric" | "text" | "select";

export interface EntryFormParameter {
  parameterId: string;
  name: string;
  type: EntryParamType;
  unit?: string;
  referenceRange?: { min: number; max: number };
  referenceRangeDisplay?: string;
  options?: string[];
}

export interface EntryFormItem {
  id: string;
  testName: string;
  samples: string[];
  status: string;
}

export interface EntryFormPatient {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  dob: string;
}

export interface ResultEntryFormResponse {
  item: EntryFormItem;
  patient: EntryFormPatient;
  parameters: EntryFormParameter[];
  existingResult: LabResult | null;
}

export interface SaveResultDraftValue {
  parameterId: string;
  value: string;
}

export interface SaveResultDraftPayload {
  values: SaveResultDraftValue[];
  notes?: string;
}

export interface ReturnResultPayload {
  note: string;
}

// ── Patient portal result types ───────────────────────────────────────────────
// The patient API exposes the same underlying entity but with simplified field
// names: `name` (vs parameterName) and `flag` (vs isAbnormal: boolean).

export type ResultFlag = "H" | "L" | "ABN" | null;

export interface PatientResultValue {
  parameterId: string;
  name: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  flag: ResultFlag;
}

/** Result shape returned by GET /patient/results (list item — no values) */
export interface PatientResult extends Omit<LabResult, "values"> {
  values?: never;
}

/** Result shape returned by GET /patient/results/:id (full detail) */
export interface PatientResultDetail extends Omit<LabResult, "values"> {
  values: PatientResultValue[];
}

export interface PatientResultListResponse {
  docs: PatientResult[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PatientResultListQuery {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}