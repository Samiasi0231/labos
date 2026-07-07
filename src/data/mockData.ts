// LabOS Mock Data

export type PatientStatus = 'Active' | 'Inactive';
export type TestStatus = 'Pending' | 'In Progress' | 'Completed' | 'Approved';
export type ResultStatus = 'Submitted' | 'Returned' | 'Approved' | 'Released';
export type StaffRole = 'Manager' | 'Scientist' | 'Receptionist' | 'Technician';
export type StaffStatus = 'Active' | 'On Leave' | 'Inactive' | 'Pending';
export type TransactionType = 'Revenue' | 'Expense';
export type PortalAccess = 'none' | 'invite_sent' | 'active';

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  gender: 'Male' | 'Female';
  dob: string;
  address: string;
  registeredAt: string;
  testsCount: number;
  status: PatientStatus;
  portalAccess: PortalAccess;
}

export interface Test {
  id: string;
  sampleId: string;
  patientId: string;
  patientName: string;
  testType: string;
  status: TestStatus;
  assignedTo: string;
  date: string;
  priority: 'Normal' | 'Urgent';
}

export interface Result {
  id: string;
  testId: string;
  sampleId: string;
  patientName: string;
  testType: string;
  values: Record<string, string>;
  referenceRange: Record<string, string>;
  status: ResultStatus;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  hasAttachment: boolean;
  isAbnormal: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  hospital: string;
  requestsCount: number;
  lastRequest: string;
  portalAccess: PortalAccess;
}

export interface InventoryItem {
  id: string;
  product: string;
  category: 'Reagent' | 'Consumable' | 'Equipment';
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier: string;
  lastRestocked: string;
  unitCost: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  status: StaffStatus;
  lastActive: string;
  testsProcessed: number;
  avatar?: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  testsThisMonth: number;
  revenue: number;
  staffCount: number;
  status: 'Active' | 'Inactive';
  manager: string;
  openSince: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  reference: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  subject: string;
  time: string;
  type: 'result' | 'patient' | 'test' | 'payment' | 'staff';
}

// --- DATA ---

export const patients: Patient[] = [
  { id: 'PAT-001', name: 'Amara Okonkwo',     email: 'a.okonkwo@gmail.com',  phone: '+234 801 234 5678', gender: 'Female', dob: '1990-03-15', address: '12 Victoria Island, Lagos',  registeredAt: '2024-01-10', testsCount: 8,  status: 'Active',   portalAccess: 'active' },
  { id: 'PAT-002', name: 'Emeka Chukwu',      email: 'e.chukwu@yahoo.com',   phone: '+234 802 345 6789', gender: 'Male',   dob: '1985-07-22', address: '5 Wuse II, Abuja',          registeredAt: '2024-02-14', testsCount: 3,  status: 'Active',   portalAccess: 'invite_sent' },
  { id: 'PAT-003', name: 'Fatima Bello',      email: 'f.bello@gmail.com',    phone: '+234 803 456 7890', gender: 'Female', dob: '1995-11-08', address: '30 GRA, Port Harcourt',     registeredAt: '2024-03-02', testsCount: 5,  status: 'Active',   portalAccess: 'none' },
  { id: 'PAT-004', name: 'Tunde Adeyemi',     email: 't.adeyemi@gmail.com',  phone: '+234 804 567 8901', gender: 'Male',   dob: '1978-05-30', address: '7 Bodija, Ibadan',          registeredAt: '2024-03-18', testsCount: 12, status: 'Active',   portalAccess: 'none' },
  { id: 'PAT-005', name: 'Ngozi Eze',         email: 'n.eze@yahoo.com',      phone: '+234 805 678 9012', gender: 'Female', dob: '2000-09-12', address: '15 Trans-Ekulu, Enugu',     registeredAt: '2024-04-05', testsCount: 2,  status: 'Active',   portalAccess: 'invite_sent' },
  { id: 'PAT-006', name: 'Biodun Lawal',                                     phone: '+234 806 789 0123', gender: 'Male',   dob: '1968-12-01', address: '22 Ring Road, Benin City',  registeredAt: '2024-04-20', testsCount: 7,  status: 'Inactive', portalAccess: 'none' },
  { id: 'PAT-007', name: 'Chioma Obi',        email: 'c.obi@gmail.com',      phone: '+234 807 890 1234', gender: 'Female', dob: '1992-06-25', address: '9 Maiduguri Road, Kano',    registeredAt: '2024-05-08', testsCount: 4,  status: 'Active',   portalAccess: 'none' },
  { id: 'PAT-008', name: 'Musa Ibrahim',      email: 'm.ibrahim@yahoo.com',  phone: '+234 808 901 2345', gender: 'Male',   dob: '1982-02-18', address: '3 Airport Road, Kano',      registeredAt: '2024-05-22', testsCount: 6,  status: 'Active',   portalAccess: 'active' },
  { id: 'PAT-009', name: 'Aisha Mahmoud',     email: 'a.mahmoud@gmail.com',  phone: '+234 809 012 3456', gender: 'Female', dob: '1998-10-07', address: '18 Sokoto Road, Kaduna',    registeredAt: '2024-06-01', testsCount: 1,  status: 'Active',   portalAccess: 'none' },
  { id: 'PAT-010', name: 'Oluwaseun Fashola', email: 'o.fashola@gmail.com',  phone: '+234 810 123 4567', gender: 'Male',   dob: '1975-04-14', address: '44 Lekki Phase 1, Lagos',  registeredAt: '2024-06-15', testsCount: 9,  status: 'Active',   portalAccess: 'none' },
];

export const tests: Test[] = [
  { id: 'TST-001', sampleId: 'SMP-2024-0891', patientId: 'PAT-001', patientName: 'Amara Okonkwo', testType: 'Full Blood Count', status: 'Approved', assignedTo: 'Dr. Chidi Nwosu', date: '2024-06-17', priority: 'Normal' },
  { id: 'TST-002', sampleId: 'SMP-2024-0892', patientId: 'PAT-003', patientName: 'Fatima Bello', testType: 'Liver Function Test', status: 'In Progress', assignedTo: 'Bisi Adeola', date: '2024-06-17', priority: 'Urgent' },
  { id: 'TST-003', sampleId: 'SMP-2024-0893', patientId: 'PAT-002', patientName: 'Emeka Chukwu', testType: 'Malaria Parasite', status: 'Completed', assignedTo: 'Dr. Chidi Nwosu', date: '2024-06-17', priority: 'Urgent' },
  { id: 'TST-004', sampleId: 'SMP-2024-0894', patientId: 'PAT-004', patientName: 'Tunde Adeyemi', testType: 'Urinalysis', status: 'Pending', assignedTo: 'Unassigned', date: '2024-06-17', priority: 'Normal' },
  { id: 'TST-005', sampleId: 'SMP-2024-0895', patientId: 'PAT-007', patientName: 'Chioma Obi', testType: 'HIV Screening', status: 'Pending', assignedTo: 'Unassigned', date: '2024-06-17', priority: 'Normal' },
  { id: 'TST-006', sampleId: 'SMP-2024-0886', patientId: 'PAT-005', patientName: 'Ngozi Eze', testType: 'Blood Glucose', status: 'Approved', assignedTo: 'Bisi Adeola', date: '2024-06-16', priority: 'Normal' },
  { id: 'TST-007', sampleId: 'SMP-2024-0887', patientId: 'PAT-008', patientName: 'Musa Ibrahim', testType: 'Hepatitis B', status: 'Approved', assignedTo: 'Dr. Chidi Nwosu', date: '2024-06-16', priority: 'Normal' },
  { id: 'TST-008', sampleId: 'SMP-2024-0888', patientId: 'PAT-010', patientName: 'Oluwaseun Fashola', testType: 'Kidney Function Test', status: 'In Progress', assignedTo: 'Bisi Adeola', date: '2024-06-16', priority: 'Urgent' },
  { id: 'TST-009', sampleId: 'SMP-2024-0889', patientId: 'PAT-009', patientName: 'Aisha Mahmoud', testType: 'Thyroid Function Test', status: 'Completed', assignedTo: 'Dr. Chidi Nwosu', date: '2024-06-15', priority: 'Normal' },
  { id: 'TST-010', sampleId: 'SMP-2024-0890', patientId: 'PAT-006', patientName: 'Biodun Lawal', testType: 'Lipid Profile', status: 'Approved', assignedTo: 'Bisi Adeola', date: '2024-06-15', priority: 'Normal' },
];

export const results: Result[] = [
  {
    id: 'RES-001', testId: 'TST-001', sampleId: 'SMP-2024-0891', patientName: 'Amara Okonkwo',
    testType: 'Full Blood Count', status: 'Released',
    values: { 'WBC': '5.2 x10³/µL', 'RBC': '4.8 x10⁶/µL', 'Hemoglobin': '14.2 g/dL', 'Hematocrit': '42%', 'Platelets': '250 x10³/µL' },
    referenceRange: { 'WBC': '4.5–11.0', 'RBC': '4.5–5.5', 'Hemoglobin': '12–16', 'Hematocrit': '37–47', 'Platelets': '150–400' },
    submittedBy: 'Dr. Chidi Nwosu', submittedAt: '2024-06-17 09:30', approvedBy: 'Dr. Nnenna Okafor', approvedAt: '2024-06-17 11:00', hasAttachment: false, isAbnormal: false,
  },
  {
    id: 'RES-002', testId: 'TST-003', sampleId: 'SMP-2024-0893', patientName: 'Emeka Chukwu',
    testType: 'Malaria Parasite', status: 'Approved',
    values: { 'Parasite': 'P. falciparum', 'Density': '++', 'Stage': 'Ring forms' },
    referenceRange: { 'Parasite': 'None', 'Density': 'Negative', 'Stage': 'N/A' },
    submittedBy: 'Dr. Chidi Nwosu', submittedAt: '2024-06-17 10:15', approvedBy: 'Dr. Nnenna Okafor', approvedAt: '2024-06-17 12:00', hasAttachment: true, isAbnormal: true,
  },
  {
    id: 'RES-003', testId: 'TST-009', sampleId: 'SMP-2024-0889', patientName: 'Aisha Mahmoud',
    testType: 'Thyroid Function Test', status: 'Submitted',
    values: { 'TSH': '6.8 mIU/L', 'T3': '1.1 nmol/L', 'T4': '55 nmol/L' },
    referenceRange: { 'TSH': '0.5–4.5', 'T3': '1.2–3.1', 'T4': '60–150' },
    submittedBy: 'Dr. Chidi Nwosu', submittedAt: '2024-06-15 14:20', hasAttachment: false, isAbnormal: true,
  },
  {
    id: 'RES-004', testId: 'TST-006', sampleId: 'SMP-2024-0886', patientName: 'Ngozi Eze',
    testType: 'Blood Glucose', status: 'Released',
    values: { 'Fasting Glucose': '5.4 mmol/L', 'Post-Prandial': '7.8 mmol/L' },
    referenceRange: { 'Fasting Glucose': '3.9–5.5', 'Post-Prandial': '<7.8' },
    submittedBy: 'Bisi Adeola', submittedAt: '2024-06-16 11:00', approvedBy: 'Dr. Nnenna Okafor', approvedAt: '2024-06-16 13:00', hasAttachment: false, isAbnormal: false,
  },
];

export const doctors: Doctor[] = [
  { id: 'DOC-001', name: 'Dr. Uchenna Obi',   specialty: 'Internal Medicine',       phone: '+234 801 111 2222', email: 'u.obi@generalhosp.ng',    hospital: 'Lagos General Hospital',    requestsCount: 42, lastRequest: '2024-06-17', portalAccess: 'active' },
  { id: 'DOC-002', name: 'Dr. Amina Sule',     specialty: 'Pediatrics',              phone: '+234 802 222 3333', email: 'a.sule@childrenhosp.ng',  hospital: 'National Children Hospital', requestsCount: 28, lastRequest: '2024-06-16', portalAccess: 'invite_sent' },
  { id: 'DOC-003', name: 'Dr. Felix Nzekwe',   specialty: 'Cardiology',              phone: '+234 803 333 4444', email: 'f.nzekwe@heartclinic.ng', hospital: 'Heart Care Clinic',         requestsCount: 15, lastRequest: '2024-06-15', portalAccess: 'active' },
  { id: 'DOC-004', name: 'Dr. Hauwa Musa',     specialty: 'Obstetrics & Gynecology', phone: '+234 804 444 5555', email: 'h.musa@maternityhosp.ng', hospital: 'Federal Maternity Hospital', requestsCount: 33, lastRequest: '2024-06-14', portalAccess: 'none' },
  { id: 'DOC-005', name: 'Dr. Emmanuel Ade',   specialty: 'Neurology',               phone: '+234 805 555 6666', email: 'e.ade@neurocentre.ng',    hospital: 'Brain & Spine Centre',      requestsCount: 9,  lastRequest: '2024-06-10', portalAccess: 'active' },
];

export const inventory: InventoryItem[] = [
  { id: 'INV-001', product: 'EDTA Tubes (5mL)', category: 'Consumable', quantity: 240, unit: 'pcs', reorderLevel: 100, supplier: 'MedSupply Nigeria', lastRestocked: '2024-06-01', unitCost: 250 },
  { id: 'INV-002', product: 'Malaria RDT Kits', category: 'Reagent', quantity: 45, unit: 'kits', reorderLevel: 50, supplier: 'DiagnosticsPlus', lastRestocked: '2024-05-20', unitCost: 1800 },
  { id: 'INV-003', product: 'Full Blood Count Reagent', category: 'Reagent', quantity: 12, unit: 'bottles', reorderLevel: 20, supplier: 'BioMed Supplies', lastRestocked: '2024-05-15', unitCost: 45000 },
  { id: 'INV-004', product: 'Urine Cups', category: 'Consumable', quantity: 380, unit: 'pcs', reorderLevel: 150, supplier: 'MedSupply Nigeria', lastRestocked: '2024-06-05', unitCost: 80 },
  { id: 'INV-005', product: 'Latex Gloves (M)', category: 'Consumable', quantity: 8, unit: 'boxes', reorderLevel: 15, supplier: 'SafeMed', lastRestocked: '2024-05-28', unitCost: 2500 },
  { id: 'INV-006', product: 'Hepatitis B Surface Antigen Kit', category: 'Reagent', quantity: 60, unit: 'tests', reorderLevel: 30, supplier: 'DiagnosticsPlus', lastRestocked: '2024-06-10', unitCost: 3200 },
  { id: 'INV-007', product: 'Autoclave Tapes', category: 'Consumable', quantity: 25, unit: 'rolls', reorderLevel: 10, supplier: 'SafeMed', lastRestocked: '2024-06-08', unitCost: 1200 },
  { id: 'INV-008', product: 'Centrifuge Tubes (15mL)', category: 'Consumable', quantity: 150, unit: 'pcs', reorderLevel: 80, supplier: 'BioMed Supplies', lastRestocked: '2024-06-03', unitCost: 150 },
];

export const staffMembers: StaffMember[] = [
  { id: 'STF-001', name: 'Dr. Nnenna Okafor', role: 'Manager',      email: 'n.okafor@labos.ng', phone: '+234 801 100 2001', status: 'Active',   lastActive: '2024-06-17 08:30', testsProcessed: 0 },
  { id: 'STF-002', name: 'Dr. Chidi Nwosu',   role: 'Scientist',    email: 'c.nwosu@labos.ng',  phone: '+234 802 200 3002', status: 'Active',   lastActive: '2024-06-17 09:45', testsProcessed: 312 },
  { id: 'STF-003', name: 'Bisi Adeola',        role: 'Scientist',    email: 'b.adeola@labos.ng', phone: '+234 803 300 4003', status: 'Active',   lastActive: '2024-06-17 10:15', testsProcessed: 274 },
  { id: 'STF-004', name: 'Kemi Adewale',       role: 'Receptionist', email: 'k.adewale@labos.ng',phone: '+234 804 400 5004', status: 'Active',   lastActive: '2024-06-17 08:00', testsProcessed: 0 },
  { id: 'STF-005', name: 'Ibrahim Yusuf',      role: 'Technician',   email: 'i.yusuf@labos.ng',  phone: '+234 805 500 6005', status: 'Inactive', lastActive: '2024-06-10 17:00', testsProcessed: 188 },
  { id: 'STF-006', name: 'Grace Akpan',        role: 'Receptionist', email: 'g.akpan@labos.ng',  phone: '+234 806 600 7006', status: 'Active',   lastActive: '2024-06-17 08:15', testsProcessed: 0 },
  { id: 'STF-007', name: 'Adaeze Okonjo',      role: 'Scientist',    email: 'a.okonjo@labos.ng', phone: '+234 807 700 8007', status: 'Pending',  lastActive: '—',               testsProcessed: 0 },
];

export const branches: Branch[] = [
  { id: 'BRN-001', name: 'Main Branch – Victoria Island', location: 'Victoria Island, Lagos', testsThisMonth: 1240, revenue: 4850000, staffCount: 12, status: 'Active', manager: 'Dr. Nnenna Okafor', openSince: '2020-01-15' },
  { id: 'BRN-002', name: 'Ikeja Branch', location: 'Ikeja, Lagos', testsThisMonth: 880, revenue: 3120000, staffCount: 8, status: 'Active', manager: 'Dr. Samuel Ojo', openSince: '2021-06-01' },
  { id: 'BRN-003', name: 'Lekki Branch', location: 'Lekki Phase 2, Lagos', testsThisMonth: 560, revenue: 2240000, staffCount: 6, status: 'Active', manager: 'Ngozi Williams', openSince: '2022-11-15' },
  { id: 'BRN-004', name: 'Abuja Branch', location: 'Wuse II, Abuja', testsThisMonth: 420, revenue: 1680000, staffCount: 5, status: 'Active', manager: 'Dr. Abubakar Sani', openSince: '2023-03-01' },
];

export const transactions: Transaction[] = [
  { id: 'TXN-001', type: 'Revenue', amount: 45000, description: 'Full Blood Count – Amara Okonkwo', category: 'Test Fee', date: '2024-06-17', reference: 'INV-2024-0891' },
  { id: 'TXN-002', type: 'Revenue', amount: 38000, description: 'Liver Function Test – Fatima Bello', category: 'Test Fee', date: '2024-06-17', reference: 'INV-2024-0892' },
  { id: 'TXN-003', type: 'Expense', amount: 120000, description: 'Malaria RDT Kits Restock', category: 'Inventory', date: '2024-06-17', reference: 'PO-2024-0112' },
  { id: 'TXN-004', type: 'Revenue', amount: 22000, description: 'Urinalysis – Tunde Adeyemi', category: 'Test Fee', date: '2024-06-16', reference: 'INV-2024-0890' },
  { id: 'TXN-005', type: 'Revenue', amount: 85000, description: 'Lipid Profile – Biodun Lawal', category: 'Test Fee', date: '2024-06-16', reference: 'INV-2024-0889' },
  { id: 'TXN-006', type: 'Expense', amount: 540000, description: 'Staff Salaries – June 2024', category: 'Payroll', date: '2024-06-15', reference: 'PAY-2024-006' },
  { id: 'TXN-007', type: 'Revenue', amount: 32000, description: 'Blood Glucose – Ngozi Eze', category: 'Test Fee', date: '2024-06-15', reference: 'INV-2024-0888' },
  { id: 'TXN-008', type: 'Revenue', amount: 60000, description: 'Hepatitis B – Musa Ibrahim', category: 'Test Fee', date: '2024-06-15', reference: 'INV-2024-0887' },
  { id: 'TXN-009', type: 'Expense', amount: 90000, description: 'Electricity Bill – June', category: 'Utilities', date: '2024-06-14', reference: 'UTIL-2024-06' },
  { id: 'TXN-010', type: 'Revenue', amount: 95000, description: 'Thyroid Function Test – Aisha Mahmoud', category: 'Test Fee', date: '2024-06-14', reference: 'INV-2024-0886' },
];

export const activities: Activity[] = [
  { id: 'ACT-001', user: 'Dr. Nnenna Okafor', action: 'approved result for', subject: 'Emeka Chukwu – Malaria Parasite', time: '5 min ago', type: 'result' },
  { id: 'ACT-002', user: 'Kemi Adewale', action: 'registered new patient', subject: 'Oluwaseun Fashola', time: '18 min ago', type: 'patient' },
  { id: 'ACT-003', user: 'Bisi Adeola', action: 'submitted results for', subject: 'Aisha Mahmoud – Thyroid Function', time: '32 min ago', type: 'result' },
  { id: 'ACT-004', user: 'Kemi Adewale', action: 'received payment for', subject: 'INV-2024-0892 – ₦38,000', time: '1 hr ago', type: 'payment' },
  { id: 'ACT-005', user: 'Dr. Chidi Nwosu', action: 'processed test for', subject: 'Fatima Bello – LFT', time: '1 hr ago', type: 'test' },
  { id: 'ACT-006', user: 'Kemi Adewale', action: 'registered new patient', subject: 'Chioma Obi', time: '2 hr ago', type: 'patient' },
  { id: 'ACT-007', user: 'Dr. Nnenna Okafor', action: 'released result for', subject: 'Amara Okonkwo – FBC', time: '2 hr ago', type: 'result' },
];

// Revenue chart data (last 7 days)
export const revenueChartData = [
  { day: 'Mon', revenue: 285000, tests: 32 },
  { day: 'Tue', revenue: 340000, tests: 41 },
  { day: 'Wed', revenue: 298000, tests: 35 },
  { day: 'Thu', revenue: 420000, tests: 48 },
  { day: 'Fri', revenue: 385000, tests: 44 },
  { day: 'Sat', revenue: 510000, tests: 58 },
  { day: 'Sun', revenue: 190000, tests: 22 },
];

// Tests by type
export const testsByTypeData = [
  { type: 'FBC', count: 280 },
  { type: 'Malaria', count: 195 },
  { type: 'LFT', count: 142 },
  { type: 'Urinalysis', count: 168 },
  { type: 'Glucose', count: 124 },
  { type: 'Hepatitis', count: 98 },
  { type: 'Lipid', count: 87 },
  { type: 'Others', count: 146 },
];

// Monthly revenue (last 6 months)
export const monthlyRevenueData = [
  { month: 'Jan', revenue: 3200000, expenses: 1800000 },
  { month: 'Feb', revenue: 3850000, expenses: 1950000 },
  { month: 'Mar', revenue: 4100000, expenses: 2100000 },
  { month: 'Apr', revenue: 3700000, expenses: 1880000 },
  { month: 'May', revenue: 4450000, expenses: 2200000 },
  { month: 'Jun', revenue: 4850000, expenses: 2350000 },
];
