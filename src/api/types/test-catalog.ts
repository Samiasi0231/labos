
export type ParamType = "numeric" | "text" | "select";

export interface ReferenceRangeValue {
  min: number;
  max: number;
}

export interface ReferenceRange {
  male?: ReferenceRangeValue;
  female?: ReferenceRangeValue;
  general?: ReferenceRangeValue;
}

export interface TestCatalogParameter {
  _id: string;
  name: string;
  unit?: string;
  type: ParamType;
  options?: string[];
  referenceRange?: ReferenceRange;
  price?: number;
}

export interface TestCatalogEntry {
  _id: string;
  lab: string;
  name: string;
  code: string;
  category: string;
  turnaroundTime: number; 
  sampleType: string;
  parameters: TestCatalogParameter[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestCatalogListResponse {
  docs: TestCatalogEntry[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TestCatalogListQuery {
  search?: string;
  category?: string;
  sampleType?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateParameterPayload {
  name: string;
  unit?: string;
  type: ParamType;
  options?: string[];
  referenceRange?: ReferenceRange;
  price: number;
}

export interface UpdateParameterPayload {
  name?: string;
  unit?: string;
  type?: ParamType;
  options?: string[];
  referenceRange?: ReferenceRange;
}

export interface CreateTestCatalogPayload {
  name: string;
  code: string;
  category: string;
  turnaroundTime: number;
  sampleType: string;
  parameters?: CreateParameterPayload[];
}

export interface UpdateTestCatalogPayload {
  name?: string;
  category?: string;
  turnaroundTime?: number;
  sampleType?: string;
}

export interface UpdateTestCatalogStatusPayload {
  isActive: boolean;
}