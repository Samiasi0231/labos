
export type TestCategory =
  | "Haematology"
  | "Biochemistry"
  | "Parasitology"
  | "Microbiology"
  | "Serology"
  | "Endocrinology";

export const ALL_CATEGORIES: TestCategory[] = [
  "Haematology", "Biochemistry", "Parasitology",
  "Microbiology", "Serology", "Endocrinology",
];

export const categoryColors: Record<TestCategory, string> = {
  Haematology:   "bg-red-500/10 text-red-600 border-red-200",
  Biochemistry:  "bg-blue-500/10 text-blue-600 border-blue-200",
  Parasitology:  "bg-green-500/10 text-green-600 border-green-200",
  Microbiology:  "bg-purple-500/10 text-purple-600 border-purple-200",
  Serology:      "bg-orange-500/10 text-orange-600 border-orange-200",
  Endocrinology: "bg-pink-500/10 text-pink-600 border-pink-200",
};

export const categoryIcon: Record<TestCategory, string> = {
  Haematology:   "blood",
  Biochemistry:  "biochem",
  Parasitology:  "parasite",
  Microbiology:  "micro",
  Serology:      "serology",
  Endocrinology: "endo",
};

export interface TestMaterial {
  itemId: string;
  name: string;
  category: 'Reagent' | 'Consumable' | 'Equipment';
  unit: string;
}

export interface TestParam {
  id: string;
  name: string;
  unit: string;
  refMale: string;
  refFemale: string;
  type?: 'numeric' | 'text' | 'select'; // required for new params created via UI
  options?: string[];                    // for select type — comma-separated choices
  method?: string;
  price: number;
  materials?: TestMaterial[];
}

export interface CatalogTest {
  id: string;
  name: string;
  code: string;
  category: TestCategory;
  turnaround: string;
  parameters: TestParam[];
  active: boolean;
  isCustom?: boolean;
  sampleType?: string;  // default sample type collected for this test
  container?: string;   // default collection container
}

/** Compute total price of a test from its parameter prices */
export function testPrice(test: CatalogTest): number {
  return test.parameters.reduce((sum, p) => sum + p.price, 0);
}

export const catalogTests: CatalogTest[] = [
  {
    id: "T001", name: "Full Blood Count", code: "FBC",
    category: "Haematology", turnaround: "2 hrs", active: true,
    sampleType: "Venous Blood", container: "EDTA Tube (Purple)",
    parameters: [
      { id: "p1",  name: "Haemoglobin",       unit: "g/dL",       refMale: "13.0–18.0", refFemale: "12.0–16.0", method: "Cyanmethaemoglobin", price: 500 },
      { id: "p2",  name: "White Blood Cells",  unit: "×10⁹/L",     refMale: "4.0–11.0",  refFemale: "4.0–11.0",  price: 400 },
      { id: "p3",  name: "Red Blood Cells",    unit: "×10¹²/L",    refMale: "4.2–6.0",   refFemale: "3.8–5.2",   price: 400 },
      { id: "p4",  name: "Platelets",          unit: "×10⁹/L",     refMale: "150–400",   refFemale: "150–400",   price: 350 },
      { id: "p5",  name: "Packed Cell Volume", unit: "%",          refMale: "40–54",     refFemale: "36–46",     price: 350 },
      { id: "p6",  name: "MCV",                unit: "fL",         refMale: "80–100",    refFemale: "80–100",    price: 300 },
      { id: "p7",  name: "MCH",                unit: "pg",         refMale: "27–33",     refFemale: "27–33",     price: 300 },
      { id: "p8",  name: "MCHC",               unit: "g/dL",       refMale: "32–36",     refFemale: "32–36",     price: 300 },
      { id: "p9",  name: "Neutrophils",        unit: "%",          refMale: "40–75",     refFemale: "40–75",     price: 300 },
      { id: "p10", name: "Lymphocytes",        unit: "%",          refMale: "20–45",     refFemale: "20–45",     price: 300 },
    ],
  },
  {
    id: "T002", name: "Erythrocyte Sedimentation Rate", code: "ESR",
    category: "Haematology", turnaround: "1 hr", active: true,
    sampleType: "Venous Blood", container: "EDTA Tube (Purple)",
    parameters: [
      { id: "p1", name: "ESR", unit: "mm/hr", refMale: "0–15", refFemale: "0–20", method: "Westergren", price: 1500 },
    ],
  },
  {
    id: "T003", name: "Blood Group & Genotype", code: "BGG",
    category: "Haematology", turnaround: "1 hr", active: true,
    sampleType: "Venous Blood", container: "EDTA Tube (Purple)",
    parameters: [
      { id: "p1", name: "Blood Group",          unit: "", refMale: "ABO/Rh",         refFemale: "ABO/Rh",         price: 1250 },
      { id: "p2", name: "Haemoglobin Genotype", unit: "", refMale: "AA/AS/AC/SS",    refFemale: "AA/AS/AC/SS",    price: 1250 },
    ],
  },
  {
    id: "T004", name: "Liver Function Test", code: "LFT",
    category: "Biochemistry", turnaround: "4 hrs", active: true,
    sampleType: "Venous Blood", container: "SST/Gel Tube (Yellow)",
    parameters: [
      { id: "p1", name: "Total Bilirubin", unit: "μmol/L", refMale: "5–21",   refFemale: "5–21",   price: 1500 },
      { id: "p2", name: "ALT (SGPT)",      unit: "U/L",    refMale: "7–56",   refFemale: "7–45",   price: 1500 },
      { id: "p3", name: "AST (SGOT)",      unit: "U/L",    refMale: "10–40",  refFemale: "10–40",  price: 1300 },
      { id: "p4", name: "ALP",             unit: "U/L",    refMale: "44–147", refFemale: "44–147", price: 1300 },
      { id: "p5", name: "Total Protein",   unit: "g/L",    refMale: "60–83",  refFemale: "60–83",  price: 1200 },
      { id: "p6", name: "Albumin",         unit: "g/L",    refMale: "35–50",  refFemale: "35–50",  price: 1200 },
    ],
  },
  {
    id: "T005", name: "Kidney Function Test", code: "KFT",
    category: "Biochemistry", turnaround: "4 hrs", active: true,
    sampleType: "Venous Blood", container: "SST/Gel Tube (Yellow)",
    parameters: [
      { id: "p1", name: "Urea",       unit: "mmol/L",           refMale: "2.5–7.8",  refFemale: "2.5–7.8", price: 1800 },
      { id: "p2", name: "Creatinine", unit: "μmol/L",           refMale: "62–106",   refFemale: "44–97",   price: 1800 },
      { id: "p3", name: "Sodium",     unit: "mEq/L",            refMale: "136–145",  refFemale: "136–145", price: 1400 },
      { id: "p4", name: "Potassium",  unit: "mEq/L",            refMale: "3.5–5.0",  refFemale: "3.5–5.0", price: 1400 },
      { id: "p5", name: "eGFR",       unit: "mL/min/1.73m²",    refMale: ">90",      refFemale: ">90",      price: 1100 },
    ],
  },
  {
    id: "T006", name: "Lipid Profile", code: "LP",
    category: "Biochemistry", turnaround: "4 hrs", active: true,
    sampleType: "Venous Blood", container: "SST/Gel Tube (Yellow)",
    parameters: [
      { id: "p1", name: "Total Cholesterol", unit: "mmol/L", refMale: "<5.2",  refFemale: "<5.2",  price: 1800 },
      { id: "p2", name: "HDL Cholesterol",   unit: "mmol/L", refMale: ">1.0",  refFemale: ">1.3",  price: 1700 },
      { id: "p3", name: "LDL Cholesterol",   unit: "mmol/L", refMale: "<3.4",  refFemale: "<3.4",  price: 1700 },
      { id: "p4", name: "Triglycerides",     unit: "mmol/L", refMale: "<1.7",  refFemale: "<1.7",  price: 1300 },
    ],
  },
  {
    id: "T007", name: "Fasting Blood Glucose", code: "FBG",
    category: "Biochemistry", turnaround: "1 hr", active: true,
    sampleType: "Venous Blood", container: "Fluoride Tube (Grey)",
    parameters: [
      { id: "p1", name: "Fasting Blood Glucose", unit: "mmol/L", refMale: "3.9–5.6", refFemale: "3.9–5.6", price: 2000 },
    ],
  },
  {
    id: "T008", name: "HbA1c", code: "HBA1C",
    category: "Biochemistry", turnaround: "4 hrs", active: true,
    sampleType: "Venous Blood", container: "EDTA Tube (Purple)",
    parameters: [
      { id: "p1", name: "HbA1c", unit: "%", refMale: "<5.7", refFemale: "<5.7", price: 5500 },
    ],
  },
  {
    id: "T009", name: "Malaria Parasite", code: "MP",
    category: "Parasitology", turnaround: "1 hr", active: true,
    sampleType: "Venous Blood", container: "EDTA Tube (Purple)",
    parameters: [
      { id: "p1", name: "Malaria Parasite", unit: "", refMale: "Not Seen", refFemale: "Not Seen", price: 1500 },
      { id: "p2", name: "Species",          unit: "", refMale: "—",        refFemale: "—",        price: 1000 },
    ],
  },
  {
    id: "T010", name: "Malaria RDT", code: "MRDT",
    category: "Parasitology", turnaround: "30 min", active: true,
    sampleType: "Capillary Blood", container: "Plain Tube (Red)",
    parameters: [
      { id: "p1", name: "PfHRP2 Antigen", unit: "", refMale: "Non-Reactive", refFemale: "Non-Reactive", price: 2000 },
    ],
  },
  {
    id: "T011", name: "Urinalysis", code: "UA",
    category: "Microbiology", turnaround: "1 hr", active: true,
    sampleType: "Urine", container: "Urine Cup",
    parameters: [
      { id: "p1", name: "Appearance", unit: "", refMale: "Clear/Yellow", refFemale: "Clear/Yellow", price: 700 },
      { id: "p2", name: "pH",         unit: "", refMale: "4.6–8.0",      refFemale: "4.6–8.0",      price: 700 },
      { id: "p3", name: "Glucose",    unit: "", refMale: "Negative",     refFemale: "Negative",     price: 1050 },
      { id: "p4", name: "Protein",    unit: "", refMale: "Negative",     refFemale: "Negative",     price: 1050 },
    ],
  },
  {
    id: "T012", name: "HIV I & II Screening", code: "HIV",
    category: "Serology", turnaround: "1 hr", active: true,
    sampleType: "Venous Blood", container: "Plain Tube (Red)",
    parameters: [
      { id: "p1", name: "HIV I Antibody",  unit: "", refMale: "Non-Reactive", refFemale: "Non-Reactive", price: 2000 },
      { id: "p2", name: "HIV II Antibody", unit: "", refMale: "Non-Reactive", refFemale: "Non-Reactive", price: 2000 },
    ],
  },
  {
    id: "T013", name: "HBsAg", code: "HBSAG",
    category: "Serology", turnaround: "1 hr", active: true,
    sampleType: "Venous Blood", container: "Plain Tube (Red)",
    parameters: [
      { id: "p1", name: "HBsAg", unit: "", refMale: "Non-Reactive", refFemale: "Non-Reactive", price: 3500 },
    ],
  },
  {
    id: "T014", name: "Thyroid Function Test", code: "TFT",
    category: "Endocrinology", turnaround: "24 hrs", active: true,
    sampleType: "Venous Blood", container: "SST/Gel Tube (Yellow)",
    parameters: [
      { id: "p1", name: "TSH",     unit: "μIU/mL", refMale: "0.27–4.20", refFemale: "0.27–4.20", price: 4500 },
      { id: "p2", name: "Free T3", unit: "pmol/L", refMale: "3.1–6.8",   refFemale: "3.1–6.8",   price: 4000 },
      { id: "p3", name: "Free T4", unit: "pmol/L", refMale: "12.0–22.0", refFemale: "12.0–22.0", price: 3500 },
    ],
  },
  {
    id: "T015", name: "Widal Test", code: "WIDAL",
    category: "Serology", turnaround: "2 hrs", active: true,
    sampleType: "Venous Blood", container: "Plain Tube (Red)",
    parameters: [
      { id: "p1", name: "S. typhi O", unit: "titre", refMale: "<1:80", refFemale: "<1:80", price: 1500 },
      { id: "p2", name: "S. typhi H", unit: "titre", refMale: "<1:80", refFemale: "<1:80", price: 1500 },
    ],
  },
];
