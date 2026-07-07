// Test Order Data Model

export type OrderStatus = 'pending' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled';
export type OrderPriority = 'Routine' | 'Urgent' | 'Stat';
export type ItemStatus = 'pending' | 'in_progress' | 'completed';

export interface SelectedParam {
  paramId: string;
  name: string;
  price: number;
  unit: string;
}

export interface OrderItem {
  id: string;
  catalogTestId: string;
  testName: string;
  selectedParams: SelectedParam[];
  sampleType: string;
  container: string;
  assignedTo?: string;       // staff ID
  assignedToName?: string;   // display name
  status: ItemStatus;
  subtotal: number;
}

export interface TestOrder {
  id: string;
  patientId: string;
  patientName: string;
  patientGender: 'Male' | 'Female';
  priority: OrderPriority;
  status: OrderStatus;
  items: OrderItem[];
  notes: string;
  createdAt: string;
}

// ── Seed data ──────────────────────────────────────────────────

export const seedOrders: TestOrder[] = [
  {
    id: 'ORD-001',
    patientId: 'PAT-001',
    patientName: 'Amara Okonkwo',
    patientGender: 'Female',
    priority: 'Urgent',
    status: 'in_progress',
    notes: 'Referred by Dr. Obi – repeat FBC',
    createdAt: '2026-06-30',
    items: [
      {
        id: 'ITM-001a',
        catalogTestId: 'T001',
        testName: 'Full Blood Count',
        sampleType: 'Venous Blood',
        container: 'EDTA Tube (Purple)',
        assignedTo: 'STF-002',
        assignedToName: 'Dr. Chidi Nwosu',
        status: 'in_progress',
        subtotal: 3500,
        selectedParams: [
          { paramId: 'p1', name: 'Haemoglobin',       price: 500, unit: 'g/dL' },
          { paramId: 'p2', name: 'White Blood Cells',  price: 400, unit: '×10⁹/L' },
          { paramId: 'p3', name: 'Red Blood Cells',    price: 400, unit: '×10¹²/L' },
          { paramId: 'p4', name: 'Platelets',          price: 350, unit: '×10⁹/L' },
          { paramId: 'p5', name: 'Packed Cell Volume', price: 350, unit: '%' },
          { paramId: 'p6', name: 'MCV',                price: 300, unit: 'fL' },
          { paramId: 'p9', name: 'Neutrophils',        price: 300, unit: '%' },
          { paramId: 'p10', name: 'Lymphocytes',       price: 300, unit: '%' },
        ],
      },
      {
        id: 'ITM-001b',
        catalogTestId: 'T004',
        testName: 'Liver Function Test',
        sampleType: 'Venous Blood',
        container: 'SST/Gel Tube (Yellow)',
        assignedTo: 'STF-003',
        assignedToName: 'Bisi Adeola',
        status: 'completed',
        subtotal: 7800,
        selectedParams: [
          { paramId: 'p1', name: 'Total Bilirubin', price: 1500, unit: 'μmol/L' },
          { paramId: 'p2', name: 'ALT (SGPT)',      price: 1500, unit: 'U/L' },
          { paramId: 'p3', name: 'AST (SGOT)',      price: 1300, unit: 'U/L' },
          { paramId: 'p4', name: 'ALP',             price: 1300, unit: 'U/L' },
          { paramId: 'p5', name: 'Total Protein',   price: 1200, unit: 'g/L' },
          { paramId: 'p6', name: 'Albumin',         price: 1200, unit: 'g/L' },
        ],
      },
    ],
  },
  {
    id: 'ORD-002',
    patientId: 'PAT-003',
    patientName: 'Fatima Bello',
    patientGender: 'Female',
    priority: 'Routine',
    status: 'sample_collected',
    notes: '',
    createdAt: '2026-06-30',
    items: [
      {
        id: 'ITM-002a',
        catalogTestId: 'T005',
        testName: 'Kidney Function Test',
        sampleType: 'Venous Blood',
        container: 'SST/Gel Tube (Yellow)',
        status: 'pending',
        subtotal: 7500,
        selectedParams: [
          { paramId: 'p1', name: 'Urea',       price: 1800, unit: 'mmol/L' },
          { paramId: 'p2', name: 'Creatinine', price: 1800, unit: 'μmol/L' },
          { paramId: 'p3', name: 'Sodium',     price: 1400, unit: 'mEq/L' },
          { paramId: 'p4', name: 'Potassium',  price: 1400, unit: 'mEq/L' },
          { paramId: 'p5', name: 'eGFR',       price: 1100, unit: 'mL/min/1.73m²' },
        ],
      },
      {
        id: 'ITM-002b',
        catalogTestId: 'T007',
        testName: 'Fasting Blood Glucose',
        sampleType: 'Venous Blood',
        container: 'Fluoride Tube (Grey)',
        status: 'pending',
        subtotal: 2000,
        selectedParams: [
          { paramId: 'p1', name: 'Fasting Blood Glucose', price: 2000, unit: 'mmol/L' },
        ],
      },
    ],
  },
  {
    id: 'ORD-003',
    patientId: 'PAT-002',
    patientName: 'Emeka Chukwu',
    patientGender: 'Male',
    priority: 'Stat',
    status: 'pending',
    notes: 'Patient reports fever for 3 days',
    createdAt: '2026-07-01',
    items: [
      {
        id: 'ITM-003a',
        catalogTestId: 'T009',
        testName: 'Malaria Parasite',
        sampleType: '',
        container: '',
        status: 'pending',
        subtotal: 2500,
        selectedParams: [
          { paramId: 'p1', name: 'Malaria Parasite', price: 1500, unit: '' },
          { paramId: 'p2', name: 'Species',          price: 1000, unit: '' },
        ],
      },
      {
        id: 'ITM-003b',
        catalogTestId: 'T001',
        testName: 'Full Blood Count',
        sampleType: '',
        container: '',
        status: 'pending',
        subtotal: 3500,
        selectedParams: [
          { paramId: 'p1', name: 'Haemoglobin',       price: 500, unit: 'g/dL' },
          { paramId: 'p2', name: 'White Blood Cells',  price: 400, unit: '×10⁹/L' },
          { paramId: 'p4', name: 'Platelets',          price: 350, unit: '×10⁹/L' },
          { paramId: 'p5', name: 'Packed Cell Volume', price: 350, unit: '%' },
          { paramId: 'p6', name: 'MCV',                price: 300, unit: 'fL' },
          { paramId: 'p9', name: 'Neutrophils',        price: 300, unit: '%' },
          { paramId: 'p10', name: 'Lymphocytes',       price: 300, unit: '%' },
        ],
      },
    ],
  },
  {
    id: 'ORD-004',
    patientId: 'PAT-004',
    patientName: 'Tunde Adeyemi',
    patientGender: 'Male',
    priority: 'Routine',
    status: 'pending',
    notes: 'Annual wellness checkup',
    createdAt: '2026-07-01',
    items: [
      {
        id: 'ITM-004a',
        catalogTestId: 'T006',
        testName: 'Lipid Profile',
        sampleType: '',
        container: '',
        status: 'pending',
        subtotal: 6500,
        selectedParams: [
          { paramId: 'p1', name: 'Total Cholesterol', price: 1800, unit: 'mmol/L' },
          { paramId: 'p2', name: 'HDL Cholesterol',   price: 1700, unit: 'mmol/L' },
          { paramId: 'p3', name: 'LDL Cholesterol',   price: 1700, unit: 'mmol/L' },
          { paramId: 'p4', name: 'Triglycerides',     price: 1300, unit: 'mmol/L' },
        ],
      },
      {
        id: 'ITM-004b',
        catalogTestId: 'T007',
        testName: 'Fasting Blood Glucose',
        sampleType: '',
        container: '',
        status: 'pending',
        subtotal: 2000,
        selectedParams: [
          { paramId: 'p1', name: 'Fasting Blood Glucose', price: 2000, unit: 'mmol/L' },
        ],
      },
    ],
  },
  {
    id: 'ORD-005',
    patientId: 'PAT-007',
    patientName: 'Chioma Obi',
    patientGender: 'Female',
    priority: 'Routine',
    status: 'completed',
    notes: '',
    createdAt: '2026-06-29',
    items: [
      {
        id: 'ITM-005a',
        catalogTestId: 'T012',
        testName: 'HIV I & II Screening',
        sampleType: 'Venous Blood',
        container: 'Plain Tube (Red)',
        assignedTo: 'STF-002',
        assignedToName: 'Dr. Chidi Nwosu',
        status: 'completed',
        subtotal: 4000,
        selectedParams: [
          { paramId: 'p1', name: 'HIV I Antibody',  price: 2000, unit: '' },
          { paramId: 'p2', name: 'HIV II Antibody', price: 2000, unit: '' },
        ],
      },
    ],
  },
  {
    id: 'ORD-006',
    patientId: 'PAT-008',
    patientName: 'Musa Ibrahim',
    patientGender: 'Male',
    priority: 'Urgent',
    status: 'cancelled',
    notes: 'Patient left before sample collection',
    createdAt: '2026-06-29',
    items: [
      {
        id: 'ITM-006a',
        catalogTestId: 'T014',
        testName: 'Thyroid Function Test',
        sampleType: '',
        container: '',
        status: 'pending',
        subtotal: 12000,
        selectedParams: [
          { paramId: 'p1', name: 'TSH',     price: 4500, unit: 'μIU/mL' },
          { paramId: 'p2', name: 'Free T3', price: 4000, unit: 'pmol/L' },
          { paramId: 'p3', name: 'Free T4', price: 3500, unit: 'pmol/L' },
        ],
      },
    ],
  },
  {
    id: 'ORD-007',
    patientId: 'PAT-010',
    patientName: 'Oluwaseun Fashola',
    patientGender: 'Male',
    priority: 'Urgent',
    status: 'sample_collected',
    notes: 'Pre-operative workup',
    createdAt: '2026-07-01',
    items: [
      {
        id: 'ITM-007a',
        catalogTestId: 'T001',
        testName: 'Full Blood Count',
        sampleType: 'Venous Blood',
        container: 'EDTA Tube (Purple)',
        status: 'pending',
        subtotal: 3500,
        selectedParams: [
          { paramId: 'p1', name: 'Haemoglobin',       price: 500, unit: 'g/dL' },
          { paramId: 'p2', name: 'White Blood Cells',  price: 400, unit: '×10⁹/L' },
          { paramId: 'p3', name: 'Red Blood Cells',    price: 400, unit: '×10¹²/L' },
          { paramId: 'p4', name: 'Platelets',          price: 350, unit: '×10⁹/L' },
          { paramId: 'p5', name: 'Packed Cell Volume', price: 350, unit: '%' },
          { paramId: 'p6', name: 'MCV',                price: 300, unit: 'fL' },
          { paramId: 'p9', name: 'Neutrophils',        price: 300, unit: '%' },
          { paramId: 'p10', name: 'Lymphocytes',       price: 300, unit: '%' },
        ],
      },
      {
        id: 'ITM-007b',
        catalogTestId: 'T003',
        testName: 'Blood Group & Genotype',
        sampleType: 'Venous Blood',
        container: 'EDTA Tube (Purple)',
        status: 'pending',
        subtotal: 2500,
        selectedParams: [
          { paramId: 'p1', name: 'Blood Group',          price: 1250, unit: '' },
          { paramId: 'p2', name: 'Haemoglobin Genotype', price: 1250, unit: '' },
        ],
      },
      {
        id: 'ITM-007c',
        catalogTestId: 'T013',
        testName: 'HBsAg',
        sampleType: 'Venous Blood',
        container: 'Plain Tube (Red)',
        status: 'pending',
        subtotal: 3500,
        selectedParams: [
          { paramId: 'p1', name: 'HBsAg', price: 3500, unit: '' },
        ],
      },
    ],
  },
  {
    id: 'ORD-008',
    patientId: 'PAT-009',
    patientName: 'Aisha Mahmoud',
    patientGender: 'Female',
    priority: 'Routine',
    status: 'in_progress',
    notes: 'Follow-up on hypothyroid management',
    createdAt: '2026-06-30',
    items: [
      {
        id: 'ITM-008a',
        catalogTestId: 'T014',
        testName: 'Thyroid Function Test',
        sampleType: 'Venous Blood',
        container: 'SST/Gel Tube (Yellow)',
        assignedTo: 'STF-002',
        assignedToName: 'Dr. Chidi Nwosu',
        status: 'pending',
        subtotal: 12000,
        selectedParams: [
          { paramId: 'p1', name: 'TSH',     price: 4500, unit: 'μIU/mL' },
          { paramId: 'p2', name: 'Free T3', price: 4000, unit: 'pmol/L' },
          { paramId: 'p3', name: 'Free T4', price: 3500, unit: 'pmol/L' },
        ],
      },
    ],
  },
];

/** Compute total price of an order from its items */
export function orderTotal(order: TestOrder): number {
  return order.items.reduce((s, i) => s + i.subtotal, 0);
}
