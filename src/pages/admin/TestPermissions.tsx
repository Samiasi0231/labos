import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Plus, Search, FlaskConical, ChevronDown, ChevronRight,
  Pencil, Trash2, MoreHorizontal, Shield, Check, X,
  ShieldCheck, Building2, ClipboardList, PlusCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TestCategory = "Haematology" | "Biochemistry" | "Parasitology" | "Microbiology" | "Serology" | "Endocrinology";

interface TestParam {
  id: string;
  name: string;
  unit: string;
  refMale: string;
  refFemale: string;
  method?: string;
}

interface GlobalTest {
  id: string;
  name: string;
  code: string;
  category: TestCategory;
  amount: number;
  turnaround: string;
  parameters: TestParam[];
  active: boolean;
}

interface LabPermission {
  labId: string;
  labName: string;
  plan: "Enterprise" | "Pro" | "Basic";
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  allCategories: boolean;
  allowedCategories: TestCategory[];
}

const ALL_CATEGORIES: TestCategory[] = ["Haematology", "Biochemistry", "Parasitology", "Microbiology", "Serology", "Endocrinology"];

const categoryColors: Record<TestCategory, string> = {
  Haematology: "bg-red-500/10 text-red-600 border-red-200",
  Biochemistry: "bg-blue-500/10 text-blue-600 border-blue-200",
  Parasitology: "bg-green-500/10 text-green-600 border-green-200",
  Microbiology: "bg-purple-500/10 text-purple-600 border-purple-200",
  Serology: "bg-orange-500/10 text-orange-600 border-orange-200",
  Endocrinology: "bg-pink-500/10 text-pink-600 border-pink-200",
};

const initialTests: GlobalTest[] = [
  {
    id: "T001", name: "Full Blood Count", code: "FBC", category: "Haematology", amount: 3500, turnaround: "2 hrs", active: true,
    parameters: [
      { id: "p1", name: "Haemoglobin", unit: "g/dL", refMale: "13.0–18.0", refFemale: "12.0–16.0", method: "Cyanmethaemoglobin" },
      { id: "p2", name: "White Blood Cells", unit: "×10⁹/L", refMale: "4.0–11.0", refFemale: "4.0–11.0" },
      { id: "p3", name: "Red Blood Cells", unit: "×10¹²/L", refMale: "4.2–6.0", refFemale: "3.8–5.2" },
      { id: "p4", name: "Platelets", unit: "×10⁹/L", refMale: "150–400", refFemale: "150–400" },
      { id: "p5", name: "Packed Cell Volume", unit: "%", refMale: "40–54", refFemale: "36–46" },
      { id: "p6", name: "MCV", unit: "fL", refMale: "80–100", refFemale: "80–100" },
      { id: "p7", name: "MCH", unit: "pg", refMale: "27–33", refFemale: "27–33" },
      { id: "p8", name: "MCHC", unit: "g/dL", refMale: "32–36", refFemale: "32–36" },
      { id: "p9", name: "Neutrophils", unit: "%", refMale: "40–75", refFemale: "40–75" },
      { id: "p10", name: "Lymphocytes", unit: "%", refMale: "20–45", refFemale: "20–45" },
    ],
  },
  {
    id: "T002", name: "Erythrocyte Sedimentation Rate", code: "ESR", category: "Haematology", amount: 1500, turnaround: "1 hr", active: true,
    parameters: [
      { id: "p1", name: "ESR", unit: "mm/hr", refMale: "0–15", refFemale: "0–20", method: "Westergren" },
    ],
  },
  {
    id: "T003", name: "Blood Group & Genotype", code: "BGG", category: "Haematology", amount: 2500, turnaround: "1 hr", active: true,
    parameters: [
      { id: "p1", name: "Blood Group", unit: "", refMale: "ABO/Rh", refFemale: "ABO/Rh" },
      { id: "p2", name: "Haemoglobin Genotype", unit: "", refMale: "AA/AS/AC/SS/SC", refFemale: "AA/AS/AC/SS/SC" },
    ],
  },
  {
    id: "T004", name: "Liver Function Test", code: "LFT", category: "Biochemistry", amount: 8000, turnaround: "4 hrs", active: true,
    parameters: [
      { id: "p1", name: "Total Bilirubin", unit: "μmol/L", refMale: "5–21", refFemale: "5–21", method: "Diazo method" },
      { id: "p2", name: "Direct Bilirubin", unit: "μmol/L", refMale: "0–8", refFemale: "0–8" },
      { id: "p3", name: "ALT (SGPT)", unit: "U/L", refMale: "7–56", refFemale: "7–45" },
      { id: "p4", name: "AST (SGOT)", unit: "U/L", refMale: "10–40", refFemale: "10–40" },
      { id: "p5", name: "Alkaline Phosphatase", unit: "U/L", refMale: "44–147", refFemale: "44–147" },
      { id: "p6", name: "GGT", unit: "U/L", refMale: "8–61", refFemale: "7–45" },
      { id: "p7", name: "Total Protein", unit: "g/L", refMale: "60–83", refFemale: "60–83" },
      { id: "p8", name: "Albumin", unit: "g/L", refMale: "35–50", refFemale: "35–50" },
      { id: "p9", name: "Globulin", unit: "g/L", refMale: "20–36", refFemale: "20–36" },
    ],
  },
  {
    id: "T005", name: "Kidney Function Test", code: "KFT", category: "Biochemistry", amount: 7500, turnaround: "4 hrs", active: true,
    parameters: [
      { id: "p1", name: "Urea", unit: "mmol/L", refMale: "2.5–7.8", refFemale: "2.5–7.8" },
      { id: "p2", name: "Creatinine", unit: "μmol/L", refMale: "62–106", refFemale: "44–97" },
      { id: "p3", name: "Uric Acid", unit: "μmol/L", refMale: "200–430", refFemale: "150–360" },
      { id: "p4", name: "Sodium", unit: "mEq/L", refMale: "136–145", refFemale: "136–145" },
      { id: "p5", name: "Potassium", unit: "mEq/L", refMale: "3.5–5.0", refFemale: "3.5–5.0" },
      { id: "p6", name: "Chloride", unit: "mEq/L", refMale: "98–107", refFemale: "98–107" },
      { id: "p7", name: "eGFR", unit: "mL/min/1.73m²", refMale: ">90", refFemale: ">90" },
    ],
  },
  {
    id: "T006", name: "Lipid Profile", code: "LP", category: "Biochemistry", amount: 6500, turnaround: "4 hrs", active: true,
    parameters: [
      { id: "p1", name: "Total Cholesterol", unit: "mmol/L", refMale: "<5.2", refFemale: "<5.2" },
      { id: "p2", name: "HDL Cholesterol", unit: "mmol/L", refMale: ">1.0", refFemale: ">1.3" },
      { id: "p3", name: "LDL Cholesterol", unit: "mmol/L", refMale: "<3.4", refFemale: "<3.4" },
      { id: "p4", name: "Triglycerides", unit: "mmol/L", refMale: "<1.7", refFemale: "<1.7" },
      { id: "p5", name: "VLDL", unit: "mmol/L", refMale: "0.1–1.0", refFemale: "0.1–1.0" },
    ],
  },
  {
    id: "T007", name: "Fasting Blood Glucose", code: "FBG", category: "Biochemistry", amount: 2000, turnaround: "1 hr", active: true,
    parameters: [
      { id: "p1", name: "Fasting Blood Glucose", unit: "mmol/L", refMale: "3.9–5.6", refFemale: "3.9–5.6", method: "Glucose Oxidase" },
    ],
  },
  {
    id: "T008", name: "HbA1c", code: "HBA1C", category: "Biochemistry", amount: 5500, turnaround: "4 hrs", active: true,
    parameters: [
      { id: "p1", name: "HbA1c", unit: "%", refMale: "<5.7", refFemale: "<5.7", method: "HPLC/Immunoassay" },
      { id: "p2", name: "Estimated Average Glucose", unit: "mmol/L", refMale: "<7.0", refFemale: "<7.0" },
    ],
  },
  {
    id: "T009", name: "Malaria Parasite (Thick & Thin Film)", code: "MP", category: "Parasitology", amount: 2500, turnaround: "1 hr", active: true,
    parameters: [
      { id: "p1", name: "Malaria Parasite", unit: "", refMale: "Not Seen", refFemale: "Not Seen", method: "Giemsa Stain" },
      { id: "p2", name: "Species", unit: "", refMale: "—", refFemale: "—" },
      { id: "p3", name: "Parasite Count", unit: "/μL", refMale: "—", refFemale: "—" },
    ],
  },
  {
    id: "T010", name: "Malaria Rapid Diagnostic Test", code: "MRDT", category: "Parasitology", amount: 2000, turnaround: "30 min", active: true,
    parameters: [
      { id: "p1", name: "PfHRP2 Antigen", unit: "", refMale: "Non-Reactive", refFemale: "Non-Reactive" },
    ],
  },
  {
    id: "T011", name: "Stool Microscopy & Culture", code: "SMC", category: "Parasitology", amount: 3000, turnaround: "48 hrs", active: true,
    parameters: [
      { id: "p1", name: "Consistency", unit: "", refMale: "Formed", refFemale: "Formed" },
      { id: "p2", name: "Colour", unit: "", refMale: "Brown", refFemale: "Brown" },
      { id: "p3", name: "Ova & Cysts", unit: "", refMale: "Not Seen", refFemale: "Not Seen" },
      { id: "p4", name: "Pus Cells", unit: "/HPF", refMale: "0–5", refFemale: "0–5" },
    ],
  },
  {
    id: "T012", name: "Urinalysis", code: "UA", category: "Microbiology", amount: 3500, turnaround: "1 hr", active: true,
    parameters: [
      { id: "p1", name: "Appearance", unit: "", refMale: "Clear/Yellow", refFemale: "Clear/Yellow" },
      { id: "p2", name: "pH", unit: "", refMale: "4.6–8.0", refFemale: "4.6–8.0" },
      { id: "p3", name: "Specific Gravity", unit: "", refMale: "1.005–1.030", refFemale: "1.005–1.030" },
      { id: "p4", name: "Glucose", unit: "", refMale: "Negative", refFemale: "Negative" },
      { id: "p5", name: "Protein", unit: "", refMale: "Negative", refFemale: "Negative" },
      { id: "p6", name: "Blood", unit: "", refMale: "Negative", refFemale: "Negative" },
      { id: "p7", name: "Leucocytes", unit: "", refMale: "Negative", refFemale: "Negative" },
      { id: "p8", name: "Nitrites", unit: "", refMale: "Negative", refFemale: "Negative" },
    ],
  },
  {
    id: "T013", name: "Urine M/C/S", code: "UMCS", category: "Microbiology", amount: 5500, turnaround: "72 hrs", active: true,
    parameters: [
      { id: "p1", name: "Microscopy", unit: "", refMale: "No significant growth", refFemale: "No significant growth" },
      { id: "p2", name: "Culture", unit: "", refMale: "No growth", refFemale: "No growth" },
      { id: "p3", name: "Pus Cells", unit: "/HPF", refMale: "0–5", refFemale: "0–5" },
    ],
  },
  {
    id: "T014", name: "HBsAg (Hepatitis B Surface Antigen)", code: "HBSAG", category: "Serology", amount: 3500, turnaround: "1 hr", active: true,
    parameters: [
      { id: "p1", name: "HBsAg", unit: "", refMale: "Non-Reactive", refFemale: "Non-Reactive", method: "Rapid Immunochromatography" },
    ],
  },
  {
    id: "T015", name: "Hepatitis C Antibody", code: "HCV", category: "Serology", amount: 3500, turnaround: "1 hr", active: true,
    parameters: [
      { id: "p1", name: "HCV Antibody", unit: "", refMale: "Non-Reactive", refFemale: "Non-Reactive" },
    ],
  },
  {
    id: "T016", name: "HIV I & II Screening", code: "HIV", category: "Serology", amount: 4000, turnaround: "1 hr", active: true,
    parameters: [
      { id: "p1", name: "HIV I Antibody", unit: "", refMale: "Non-Reactive", refFemale: "Non-Reactive" },
      { id: "p2", name: "HIV II Antibody", unit: "", refMale: "Non-Reactive", refFemale: "Non-Reactive" },
    ],
  },
  {
    id: "T017", name: "Widal Test", code: "WIDAL", category: "Serology", amount: 3000, turnaround: "2 hrs", active: true,
    parameters: [
      { id: "p1", name: "S. typhi O", unit: "titre", refMale: "<1:80", refFemale: "<1:80" },
      { id: "p2", name: "S. typhi H", unit: "titre", refMale: "<1:80", refFemale: "<1:80" },
      { id: "p3", name: "S. paratyphi A", unit: "titre", refMale: "<1:80", refFemale: "<1:80" },
      { id: "p4", name: "S. paratyphi B", unit: "titre", refMale: "<1:80", refFemale: "<1:80" },
    ],
  },
  {
    id: "T018", name: "Thyroid Function Test", code: "TFT", category: "Endocrinology", amount: 12000, turnaround: "24 hrs", active: true,
    parameters: [
      { id: "p1", name: "TSH", unit: "μIU/mL", refMale: "0.27–4.20", refFemale: "0.27–4.20", method: "ELISA/CLIA" },
      { id: "p2", name: "Free T3 (fT3)", unit: "pmol/L", refMale: "3.1–6.8", refFemale: "3.1–6.8" },
      { id: "p3", name: "Free T4 (fT4)", unit: "pmol/L", refMale: "12.0–22.0", refFemale: "12.0–22.0" },
    ],
  },
  {
    id: "T019", name: "Prostate Specific Antigen", code: "PSA", category: "Endocrinology", amount: 8000, turnaround: "24 hrs", active: true,
    parameters: [
      { id: "p1", name: "Total PSA", unit: "ng/mL", refMale: "0–4.0", refFemale: "—" },
      { id: "p2", name: "Free PSA", unit: "ng/mL", refMale: "—", refFemale: "—" },
    ],
  },
  {
    id: "T020", name: "H. pylori Antigen Test", code: "HPYLORI", category: "Serology", amount: 4500, turnaround: "1 hr", active: true,
    parameters: [
      { id: "p1", name: "H. pylori Antigen", unit: "", refMale: "Non-Reactive", refFemale: "Non-Reactive", method: "Stool Antigen" },
    ],
  },
];

const initialPermissions: LabPermission[] = [
  { labId: "LAB001", labName: "HealthFirst Laboratories", plan: "Enterprise", canCreate: true, canEdit: true, canDelete: true, allCategories: true, allowedCategories: [] },
  { labId: "LAB002", labName: "MedLab Diagnostics", plan: "Pro", canCreate: true, canEdit: true, canDelete: false, allCategories: false, allowedCategories: ["Haematology", "Biochemistry"] },
  { labId: "LAB003", labName: "CityPath Laboratory", plan: "Pro", canCreate: false, canEdit: true, canDelete: false, allCategories: false, allowedCategories: ["Haematology"] },
  { labId: "LAB004", labName: "BioChem Diagnostics", plan: "Basic", canCreate: false, canEdit: false, canDelete: false, allCategories: false, allowedCategories: [] },
  { labId: "LAB005", labName: "Precision Labs Nigeria", plan: "Enterprise", canCreate: true, canEdit: true, canDelete: true, allCategories: true, allowedCategories: [] },
  { labId: "LAB006", labName: "Sunshine Health Lab", plan: "Basic", canCreate: false, canEdit: true, canDelete: false, allCategories: false, allowedCategories: ["Haematology", "Parasitology"] },
  { labId: "LAB007", labName: "NovaMed Pathology", plan: "Pro", canCreate: true, canEdit: true, canDelete: false, allCategories: true, allowedCategories: [] },
];

const planColors = {
  Enterprise: "bg-primary/10 text-primary border-primary/30",
  Pro: "bg-info/10 text-info border-info/30",
  Basic: "bg-muted text-muted-foreground border-border",
};

export default function TestPermissions() {
  const { toast } = useToast();
  const [tests, setTests] = useState<GlobalTest[]>(initialTests);
  const [perms, setPerms] = useState<LabPermission[]>(initialPermissions);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("All");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAddTest, setShowAddTest] = useState(false);
  const [editTest, setEditTest] = useState<GlobalTest | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<GlobalTest | null>(null);
  const [permSearch, setPermSearch] = useState("");

  const newTestDefault: Omit<GlobalTest, "id"> = {
    name: "", code: "", category: "Haematology", amount: 0, turnaround: "2 hrs", active: true, parameters: [],
  };
  const [newTest, setNewTest] = useState<Omit<GlobalTest, "id">>(newTestDefault);
  const [newParam, setNewParam] = useState({ name: "", unit: "", refMale: "", refFemale: "", method: "" });

  const filteredTests = tests.filter(t => {
    const matchCat = catFilter === "All" || t.category === catFilter;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredPerms = perms.filter(p => p.labName.toLowerCase().includes(permSearch.toLowerCase()));

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const togglePerm = (labId: string, field: "canCreate" | "canEdit" | "canDelete") => {
    setPerms(prev => prev.map(p => p.labId === labId ? { ...p, [field]: !p[field] } : p));
  };

  const toggleAllCategories = (labId: string) => {
    setPerms(prev => prev.map(p => p.labId === labId ? { ...p, allCategories: !p.allCategories } : p));
  };

  const savePerms = () => toast({ title: "Permissions saved", description: "Lab access settings have been updated." });

  const handleAddTest = () => {
    if (!newTest.name || !newTest.code) { toast({ title: "Required fields missing", variant: "destructive" }); return; }
    const t: GlobalTest = { ...newTest, id: `T${Date.now()}` };
    setTests(prev => [...prev, t]);
    setNewTest(newTestDefault);
    setShowAddTest(false);
    toast({ title: "Test added", description: `${t.name} added to catalog.` });
  };

  const handleDeleteTest = () => {
    if (!deleteConfirm) return;
    setTests(prev => prev.filter(t => t.id !== deleteConfirm.id));
    setDeleteConfirm(null);
    toast({ title: "Test deleted", description: `${deleteConfirm.name} removed from catalog.` });
  };

  const addParamToNew = () => {
    if (!newParam.name) return;
    setNewTest(prev => ({ ...prev, parameters: [...prev.parameters, { ...newParam, id: `np${Date.now()}` }] }));
    setNewParam({ name: "", unit: "", refMale: "", refFemale: "", method: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Test Catalog & Lab Permissions</h2>
        <p className="text-sm text-muted-foreground">Manage the global test catalog and control which labs can create, edit, or delete tests</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold text-primary">{tests.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Tests</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold">{ALL_CATEGORIES.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Categories</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold text-success">{perms.filter(p => p.canCreate || p.canEdit).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Labs with Edit Access</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold text-warning">{perms.filter(p => !p.canCreate && !p.canEdit && !p.canDelete).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Read-Only Labs</p>
        </Card>
      </div>

      <Tabs defaultValue="catalog">
        <TabsList className="gap-1">
          <TabsTrigger value="catalog" className="gap-2">
            <FlaskConical className="w-3.5 h-3.5" />Test Catalog
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="w-3.5 h-3.5" />Lab Permissions
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: CATALOG ── */}
        <TabsContent value="catalog" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search tests..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {ALL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button className="gap-2 flex-shrink-0" onClick={() => setShowAddTest(true)}>
              <Plus className="w-4 h-4" />Add Test
            </Button>
          </div>

          <Card className="shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Test Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount (₦)</TableHead>
                  <TableHead>Params</TableHead>
                  <TableHead>TAT</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map(test => (
                  <>
                    <TableRow key={test.id} className="cursor-pointer hover:bg-muted/20" onClick={() => toggleExpand(test.id)}>
                      <TableCell className="py-3">
                        {expanded.has(test.id) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      </TableCell>
                      <TableCell className="font-medium py-3">{test.name}</TableCell>
                      <TableCell className="py-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{test.code}</code></TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={`text-xs border ${categoryColors[test.category]}`}>{test.category}</Badge>
                      </TableCell>
                      <TableCell className="py-3 font-semibold">₦{test.amount.toLocaleString()}</TableCell>
                      <TableCell className="py-3 text-sm">{test.parameters.length}</TableCell>
                      <TableCell className="py-3 text-sm text-muted-foreground">{test.turnaround}</TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={`text-xs ${test.active ? "border-success/30 text-success" : "border-muted text-muted-foreground"}`}>
                          {test.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => setEditTest(test)}><Pencil className="w-3.5 h-3.5" />Edit Test</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteConfirm(test)}><Trash2 className="w-3.5 h-3.5" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expanded.has(test.id) && (
                      <TableRow key={`${test.id}-params`} className="bg-muted/10">
                        <TableCell colSpan={9} className="pb-4 pt-2 px-6">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Reference Parameters</p>
                          <div className="border border-border rounded-xl overflow-hidden">
                            <div className="grid grid-cols-5 bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
                              <span className="col-span-2">Parameter</span>
                              <span>Unit</span>
                              <span>Male Range</span>
                              <span>Female Range</span>
                            </div>
                            <div className="divide-y divide-border">
                              {test.parameters.map(p => (
                                <div key={p.id} className="grid grid-cols-5 px-3 py-2 text-xs">
                                  <span className="col-span-2 font-medium">{p.name}</span>
                                  <span className="text-muted-foreground font-mono">{p.unit || "—"}</span>
                                  <span className="text-muted-foreground">{p.refMale}</span>
                                  <span className="text-muted-foreground">{p.refFemale}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── TAB 2: PERMISSIONS ── */}
        <TabsContent value="permissions" className="mt-4 space-y-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary">Permission Matrix</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Control which lab owners can create new tests, edit existing test names/amounts/parameters, or delete tests from the catalog. 
                Enterprise labs get full access by default. Changes apply immediately.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search labs..." className="pl-9" value={permSearch} onChange={e => setPermSearch(e.target.value)} />
            </div>
          </div>

          <Card className="shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Laboratory</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <Plus className="w-3.5 h-3.5 mb-0.5 text-success" />
                      <span>Create</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <Pencil className="w-3.5 h-3.5 mb-0.5 text-info" />
                      <span>Edit</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <Trash2 className="w-3.5 h-3.5 mb-0.5 text-destructive" />
                      <span>Delete</span>
                    </div>
                  </TableHead>
                  <TableHead>Category Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPerms.map(perm => (
                  <TableRow key={perm.labId}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{perm.labName}</p>
                          <p className="text-xs text-muted-foreground">{perm.labId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs border ${planColors[perm.plan]}`}>{perm.plan}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={perm.canCreate} onCheckedChange={() => togglePerm(perm.labId, "canCreate")} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={perm.canEdit} onCheckedChange={() => togglePerm(perm.labId, "canEdit")} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={perm.canDelete} onCheckedChange={() => togglePerm(perm.labId, "canDelete")} />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={perm.allCategories}
                            onCheckedChange={() => toggleAllCategories(perm.labId)}
                            className="scale-75"
                          />
                          <span className="text-xs font-medium">{perm.allCategories ? "All Categories" : "Restricted"}</span>
                        </div>
                        {!perm.allCategories && (
                          <div className="flex flex-wrap gap-1">
                            {ALL_CATEGORIES.map(cat => {
                              const allowed = perm.allowedCategories.includes(cat);
                              return (
                                <button
                                  key={cat}
                                  onClick={() => setPerms(prev => prev.map(p => p.labId === perm.labId ? {
                                    ...p,
                                    allowedCategories: allowed
                                      ? p.allowedCategories.filter(c => c !== cat)
                                      : [...p.allowedCategories, cat]
                                  } : p))}
                                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                                    allowed ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"
                                  }`}
                                >
                                  {cat.slice(0, 5)}…
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex justify-end">
            <Button className="gap-2" onClick={savePerms}>
              <ShieldCheck className="w-4 h-4" />Save All Permissions
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── ADD TEST DIALOG ── */}
      <Dialog open={showAddTest} onOpenChange={setShowAddTest}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Add New Test</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Test Name *</Label>
                <Input placeholder="e.g. Full Blood Count" value={newTest.name} onChange={e => setNewTest(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input placeholder="e.g. FBC" value={newTest.code} onChange={e => setNewTest(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={newTest.category} onValueChange={v => setNewTest(p => ({ ...p, category: v as TestCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ALL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Amount (₦)</Label>
                <Input type="number" placeholder="0" value={newTest.amount || ""} onChange={e => setNewTest(p => ({ ...p, amount: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Turnaround Time</Label>
              <Select value={newTest.turnaround} onValueChange={v => setNewTest(p => ({ ...p, turnaround: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["30 min", "1 hr", "2 hrs", "4 hrs", "6 hrs", "24 hrs", "48 hrs", "72 hrs"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Separator />
            <p className="text-sm font-semibold">Parameters</p>
            {newTest.parameters.length > 0 && (
              <div className="space-y-1">
                {newTest.parameters.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded-lg">
                    <span className="font-medium flex-1">{p.name}</span>
                    <span className="text-muted-foreground">{p.unit}</span>
                    <span className="text-muted-foreground">M: {p.refMale}</span>
                    <span className="text-muted-foreground">F: {p.refFemale}</span>
                    <button onClick={() => setNewTest(prev => ({ ...prev, parameters: prev.parameters.filter((_, j) => j !== i) }))} className="text-destructive hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 bg-muted/20 rounded-xl space-y-3 border border-dashed border-border">
              <p className="text-xs text-muted-foreground font-medium">Add Parameter</p>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Parameter name" className="text-xs h-8" value={newParam.name} onChange={e => setNewParam(p => ({ ...p, name: e.target.value }))} />
                <Input placeholder="Unit (e.g. g/dL)" className="text-xs h-8" value={newParam.unit} onChange={e => setNewParam(p => ({ ...p, unit: e.target.value }))} />
                <Input placeholder="Male range" className="text-xs h-8" value={newParam.refMale} onChange={e => setNewParam(p => ({ ...p, refMale: e.target.value }))} />
                <Input placeholder="Female range" className="text-xs h-8" value={newParam.refFemale} onChange={e => setNewParam(p => ({ ...p, refFemale: e.target.value }))} />
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs w-full" onClick={addParamToNew}>
                <PlusCircle className="w-3.5 h-3.5" />Add Parameter
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTest(false)}>Cancel</Button>
            <Button onClick={handleAddTest} className="gap-2"><Check className="w-4 h-4" />Add Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ── */}
      <Dialog open={!!deleteConfirm} onOpenChange={v => !v && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive"><Trash2 className="w-4 h-4" />Delete Test</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <span className="font-semibold text-foreground">{deleteConfirm?.name}</span>? This action cannot be undone and will affect all labs using this test.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTest} className="gap-2"><Trash2 className="w-4 h-4" />Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
