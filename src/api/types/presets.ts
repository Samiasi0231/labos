export interface TestCatalogPreset {
  id: number;
  name: string;
  code: string;
  category: string;
  turnaroundTime: number;
  samples: string[];
  parameterCount: number;
  alreadyImported: boolean;
}

export interface InventoryPreset {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
  reorderLevel: number;
  unitCost: number;
  supplier?: string;
  alreadyImported: boolean;
}

export interface ImportPresetsPayload {
  ids: number[];
}
