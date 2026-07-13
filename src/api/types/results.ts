
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
export interface LabResult {
  _id: string;
  lab: string;
  testOrder: PopulatedRef<{ code?: string }>;
  testOrderItem: PopulatedRef<{ testName?: string; samples?: string[] }>;
  patient: PopulatedRef<{ firstName?: string; lastName?: string; code?: string }>;
  values: ResultValue[]; status: ResultStatus;
  submittedBy?: PopulatedRef<{ user?: PopulatedRef<{ firstName?: string; lastName?: string }>; role?: string }>;
  reviewedBy?: PopulatedRef<{ user?: PopulatedRef<{ firstName?: string; lastName?: string }>; role?: string }>;
  approvedBy?: PopulatedRef<{ user?: PopulatedRef<{ firstName?: string; lastName?: string }>; role?: string }>;
  comments?: string;
  submittedAt?: string;
  approvedAt?: string;
  releasedAt?: string;
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
}

export interface ReturnResultPayload {
  comments: string;
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

/** Result shape returned by GET /patient/results (list item — no values/signatories) */
export interface PatientResult extends Omit<LabResult, "values" | "submittedBy" | "reviewedBy" | "approvedBy"> {
  values?: never;
  submittedBy?: never;
  reviewedBy?: never;
  approvedBy?: never;
}

/** Result shape returned by GET /patient/results/:id (full detail) */
export interface PatientResultDetail extends Omit<LabResult, "values" | "submittedBy" | "reviewedBy" | "approvedBy"> {
  values: PatientResultValue[];
  submittedBy?: { _id: string; role: string; user: { firstName?: string; lastName?: string } };
  approvedBy?:  { _id: string; role: string; user: { firstName?: string; lastName?: string } };
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