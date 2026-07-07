
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
  testOrderItem: PopulatedRef<{ testName?: string; sampleType?: string }>;
  patient: PopulatedRef<{ firstName?: string; lastName?: string; code?: string }>;
  values: ResultValue[];
  status: ResultStatus;
  submittedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
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
  sampleType: string;
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