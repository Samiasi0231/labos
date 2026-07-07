import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft, ArrowRight, CheckCircle, FlaskConical, Layers,
  TestTube, UserSquare, ClipboardList, AlertTriangle, Search,
  ChevronDown, ChevronRight as ChevronRightIcon
} from "lucide-react";
import { patients, staffMembers } from "@/data/mockData";
import { catalogTests, ALL_CATEGORIES, categoryColors, type CatalogTest, type TestCategory } from "@/data/catalogData";
import { useToast } from "@/hooks/use-toast";

// ── Types ───────────────────────────────────────────────────────────────
interface SampleEntry {
  testId: string;
  sampleType: string;
  container: string;
  volume: string;
  collectedBy: string;
  collectionTime: string;
  condition: string;
}

interface Assignment {
  testId: string;
  assignedTo: string;
  priority: "Normal" | "Urgent";
  notes: string;
}

// ── Constants ────────────────────────────────────────────────────────────
const SAMPLE_TYPES = [
  "Venous Blood", "Capillary Blood", "Urine", "Stool",
  "Swab", "CSF", "Sputum", "Other",
];
const CONTAINERS = [
  "EDTA Tube (Purple)", "SST/Gel Tube (Yellow)", "Plain Tube (Red)",
  "Fluoride Tube (Grey)", "Sodium Citrate Tube (Blue)",
  "Urine Cup", "Stool Container", "Swab", "Sputum Container", "Other",
];
const CONDITIONS = [
  "Acceptable", "Hemolyzed", "Lipemic", "Insufficient Volume", "Clotted",
];

/** Fallback sample suggestion from category (for custom tests without sampleType set) */
function suggestFromCategory(category: TestCategory): { sampleType: string; container: string } {
  const map: Record<TestCategory, { sampleType: string; container: string }> = {
    Haematology:   { sampleType: "Venous Blood", container: "EDTA Tube (Purple)" },
    Biochemistry:  { sampleType: "Venous Blood", container: "SST/Gel Tube (Yellow)" },
    Parasitology:  { sampleType: "Venous Blood", container: "EDTA Tube (Purple)" },
    Microbiology:  { sampleType: "Urine",        container: "Urine Cup" },
    Serology:      { sampleType: "Venous Blood", container: "Plain Tube (Red)" },
    Endocrinology: { sampleType: "Venous Blood", container: "SST/Gel Tube (Yellow)" },
  };
  return map[category];
}

function getSampleDefault(test: CatalogTest): { sampleType: string; container: string } {
  if (test.sampleType && test.container) {
    return { sampleType: test.sampleType, container: test.container };
  }
  return suggestFromCategory(test.category);
}

const steps = [
  { num: 1, label: "Select Tests",        icon: FlaskConical },
  { num: 2, label: "Sample Collection",   icon: TestTube },
  { num: 3, label: "Assign Professionals", icon: UserSquare },
];

export default function InitiateTestOrder() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const patient = patients.find(p => p.id === patientId);

  // ── Wizard state ─────────────────────────────────────────────────────
  const [step, setStep]   = useState(1);
  const [done, setDone]   = useState(false);

  // Phase 1 — test + parameter selection
  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());
  const [selectedParams, setSelectedParams] = useState<Record<string, Set<string>>>({});
  const [catFilter,      setCatFilter]      = useState<"All" | TestCategory>("All");
  const [search,         setSearch]         = useState("");
  const [expandedTest,   setExpandedTest]   = useState<Set<string>>(new Set());

  // Phase 2 — sample collection
  const [samples, setSamples] = useState<Record<string, SampleEntry>>({});

  // Phase 3 — professional assignment
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});

  // ── Derived ───────────────────────────────────────────────────────────
  const selectedTests = catalogTests.filter(t => selectedIds.has(t.id));

  /** Price for one test based only on its selected params */
  const testSelectedPrice = (test: CatalogTest): number =>
    test.parameters
      .filter(p => selectedParams[test.id]?.has(p.id))
      .reduce((s, p) => s + p.price, 0);

  const totalAmount      = selectedTests.reduce((s, t) => s + testSelectedPrice(t), 0);
  const totalParamsCount = selectedTests.reduce((s, t) => s + (selectedParams[t.id]?.size ?? 0), 0);

  const filteredTests = catalogTests.filter(t => {
    const matchCat = catFilter === "All" || t.category === catFilter;
    const matchQ   = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  const scientists = staffMembers.filter(s => s.role === "Scientist" || s.role === "Technician");

  // ── Handlers ─────────────────────────────────────────────────────────
  const toggleTest = (id: string) => {
    const test = catalogTests.find(t => t.id === id);
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
        setSelectedParams(pp => { const np = { ...pp }; delete np[id]; return np; });
      } else {
        n.add(id);
        // Auto-select all params when test is selected
        if (test) {
          setSelectedParams(pp => ({
            ...pp,
            [id]: new Set(test.parameters.map(p => p.id)),
          }));
        }
      }
      return n;
    });
  };

  const toggleParam = (testId: string, paramId: string) => {
    setSelectedParams(prev => {
      const existing = new Set(prev[testId] ?? []);
      if (existing.has(paramId)) existing.delete(paramId);
      else existing.add(paramId);
      return { ...prev, [testId]: existing };
    });
  };

  const selectAllParams = (testId: string) => {
    const test = catalogTests.find(t => t.id === testId);
    if (!test) return;
    setSelectedParams(prev => ({ ...prev, [testId]: new Set(test.parameters.map(p => p.id)) }));
  };

  const deselectAllParams = (testId: string) => {
    setSelectedParams(prev => ({ ...prev, [testId]: new Set() }));
  };

  const toggleExpand = (id: string) => {
    setExpandedTest(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const initSamples = () => {
    const next: Record<string, SampleEntry> = {};
    selectedTests.forEach(t => {
      const def = getSampleDefault(t);
      next[t.id] = samples[t.id] ?? {
        testId: t.id,
        sampleType:     def.sampleType,
        container:      def.container,
        volume:         "",
        collectedBy:    "Dr. Nnenna Okafor",
        collectionTime: new Date().toISOString().slice(0, 16),
        condition:      "Acceptable",
      };
    });
    setSamples(next);
  };

  const initAssignments = () => {
    const next: Record<string, Assignment> = {};
    selectedTests.forEach(t => {
      next[t.id] = assignments[t.id] ?? { testId: t.id, assignedTo: "", priority: "Normal", notes: "" };
    });
    setAssignments(next);
  };

  const updateSample     = (testId: string, key: keyof SampleEntry, value: string) =>
    setSamples(prev => ({ ...prev, [testId]: { ...prev[testId], [key]: value } }));

  const updateAssignment = (testId: string, key: keyof Assignment, value: string) =>
    setAssignments(prev => ({ ...prev, [testId]: { ...prev[testId], [key]: value as "Normal" | "Urgent" } }));

  // ── Navigation guards ─────────────────────────────────────────────────
  const goToStep2 = () => {
    if (selectedIds.size === 0) {
      toast({ title: "No tests selected", description: "Select at least one test to continue.", variant: "destructive" }); return;
    }
    const emptyParamTest = selectedTests.find(t => (selectedParams[t.id]?.size ?? 0) === 0);
    if (emptyParamTest) {
      toast({ title: "No parameters selected", description: `Select at least one parameter for "${emptyParamTest.name}".`, variant: "destructive" }); return;
    }
    initSamples(); setStep(2);
  };

  const goToStep3 = () => {
    const missing = selectedTests.find(t => !samples[t.id]?.sampleType || !samples[t.id]?.container);
    if (missing) {
      toast({ title: "Incomplete sample info", description: `Fill Sample Type and Container for ${missing.name}.`, variant: "destructive" }); return;
    }
    initAssignments(); setStep(3);
  };

  const submitOrder = () => {
    const unassigned = selectedTests.find(t => !assignments[t.id]?.assignedTo);
    if (unassigned) {
      toast({ title: "Unassigned test", description: `Assign ${unassigned.name} to a professional.`, variant: "destructive" }); return;
    }
    setDone(true);
  };

  // ── Patient not found ─────────────────────────────────────────────────
  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertTriangle className="w-10 h-10 text-warning" />
        <p className="text-lg font-semibold">Patient not found</p>
        <Button variant="outline" onClick={() => navigate("/lab/patients")}>Back to Patients</Button>
      </div>
    );
  }

  // ── Confirmation screen ───────────────────────────────────────────────
  if (done) {
    const orderId = `ORD-${String(Math.floor(Math.random() * 900) + 100)}`;
    return (
      <div className="max-w-2xl mx-auto py-12 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <Badge className="mb-3 bg-success/10 text-success border-success/30">Order Created</Badge>
          <h2 className="text-2xl font-bold mb-1">Test Order Confirmed</h2>
          <p className="text-muted-foreground">Order <span className="font-mono font-semibold text-primary">{orderId}</span> has been created and routed to the assigned professionals.</p>
        </div>

        <Card className="shadow-card border mb-6">
          <CardContent className="pt-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Patient</p><p className="font-semibold">{patient.name}</p></div>
              <div><p className="text-muted-foreground text-xs">Patient ID</p><p className="font-mono font-semibold">{patient.id}</p></div>
              <div><p className="text-muted-foreground text-xs">Order Date</p><p className="font-semibold">{new Date().toLocaleDateString("en-NG")}</p></div>
              <div><p className="text-muted-foreground text-xs">Total Amount</p><p className="font-bold text-primary text-lg">₦{totalAmount.toLocaleString()}</p></div>
            </div>
            <Separator />
            <p className="text-sm font-semibold">Ordered Tests ({selectedTests.length})</p>
            <div className="space-y-2">
              {selectedTests.map(t => {
                const paramCount = selectedParams[t.id]?.size ?? 0;
                return (
                  <div key={t.id} className="py-2 px-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{t.name}</p>
                      <span className="text-sm font-semibold text-primary">₦{testSelectedPrice(t).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {paramCount} of {t.parameters.length} params · {samples[t.id]?.sampleType} · {assignments[t.id]?.assignedTo}
                      {assignments[t.id]?.priority === "Urgent" && <span className="ml-1 text-destructive font-medium">· URGENT</span>}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm font-semibold">Total ({totalParamsCount} parameters)</span>
              <span className="text-xl font-extrabold text-primary">₦{totalAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1 gap-2" onClick={() => navigate("/lab/tests")}>
            <ClipboardList className="w-4 h-4" />View Test Orders
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate("/lab/patients")}>
            Order for Another Patient
          </Button>
        </div>
      </div>
    );
  }

  // ── Wizard ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Patient banner */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary">{patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
        </div>
        <div>
          <p className="font-semibold text-sm">{patient.name}</p>
          <p className="text-xs text-muted-foreground">{patient.id} · {patient.gender} · DOB: {patient.dob}</p>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto gap-1.5 text-muted-foreground" onClick={() => navigate("/lab/patients")}>
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              step === s.num ? "gradient-primary text-white shadow-glow" : step > s.num ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            }`}>
              {step > s.num ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.num}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${step > s.num ? "bg-success" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* ── PHASE 1: Select Tests & Parameters ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold">Select Tests & Parameters</h3>
            <p className="text-sm text-muted-foreground">Choose tests from the catalog. Expand any test to select or deselect individual parameters.</p>
          </div>

          {/* Search + category chips */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tests..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["All", ...ALL_CATEGORIES] as const).map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat as "All" | TestCategory)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                  catFilter === cat ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40"
                }`}>
                {cat}
                {cat !== "All" && <span className="text-[10px] opacity-60">{catalogTests.filter(t => t.category === cat).length}</span>}
              </button>
            ))}
          </div>

          {/* Test cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTests.map(test => {
              const selected  = selectedIds.has(test.id);
              const expanded  = expandedTest.has(test.id);
              const params    = selectedParams[test.id];
              const paramCount = params?.size ?? 0;
              const price      = selected ? testSelectedPrice(test) : test.parameters.reduce((s, p) => s + p.price, 0);

              return (
                <Card key={test.id} className={`shadow-card transition-all border-2 ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <CardContent className="pt-4 pb-4">
                    {/* Test header row */}
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selected} onChange={() => toggleTest(test.id)}
                        className="w-4 h-4 mt-0.5 accent-primary flex-shrink-0 cursor-pointer" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm">{test.name}</span>
                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{test.code}</code>
                          <Badge variant="outline" className={`text-[10px] border ${categoryColors[test.category]}`}>{test.category}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span>{test.parameters.length} parameters · TAT: {test.turnaround}</span>
                          {test.sampleType && <span className="text-primary/70">· {test.sampleType}</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-base font-bold ${selected ? "text-primary" : "text-foreground"}`}>
                              ₦{price.toLocaleString()}
                            </span>
                            {selected && paramCount < test.parameters.length && (
                              <span className="ml-1.5 text-xs text-muted-foreground">({paramCount}/{test.parameters.length} params)</span>
                            )}
                          </div>
                          <button onClick={e => { e.stopPropagation(); toggleExpand(test.id); }}
                            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRightIcon className="w-3.5 h-3.5" />}
                            {expanded ? "Hide" : "View"} params
                          </button>
                        </div>

                        {/* Expanded parameter list */}
                        {expanded && (
                          <div className="mt-3 border border-border rounded-lg overflow-hidden">
                            {selected && (
                              <div className="flex items-center gap-3 px-3 py-1.5 bg-primary/5 border-b border-border">
                                <span className="text-[10px] font-semibold text-primary">{paramCount}/{test.parameters.length} selected</span>
                                <button onClick={() => selectAllParams(test.id)} className="text-[10px] text-primary hover:underline">All</button>
                                <button onClick={() => deselectAllParams(test.id)} className="text-[10px] text-muted-foreground hover:underline">None</button>
                              </div>
                            )}
                            <div className="grid grid-cols-4 bg-muted/40 px-2 py-1.5 text-[10px] font-semibold text-muted-foreground">
                              {selected && <span />}
                              <span className={selected ? "col-span-2" : "col-span-2"}>Parameter</span>
                              <span>Reference (M/F)</span>
                              <span className="text-right">Price</span>
                            </div>
                            {test.parameters.map(p => {
                              const isParamSelected = selected ? (params?.has(p.id) ?? false) : false;
                              return (
                                <div key={p.id} className={`grid px-2 py-1.5 text-[10px] border-t border-border transition-colors
                                  ${selected ? "grid-cols-4" : "grid-cols-3"}
                                  ${selected && isParamSelected ? "hover:bg-primary/5" : "hover:bg-muted/10"}
                                  ${selected && !isParamSelected ? "opacity-50" : ""}
                                `}>
                                  {selected && (
                                    <input type="checkbox" checked={isParamSelected}
                                      onChange={() => toggleParam(test.id, p.id)}
                                      className="w-3 h-3 accent-primary cursor-pointer mt-0.5" />
                                  )}
                                  <span className="font-medium col-span-1 truncate">{p.name}</span>
                                  <span className="text-muted-foreground text-[9px]">{p.refMale} / {p.refFemale}</span>
                                  <span className={`text-right font-medium ${isParamSelected ? "text-primary" : "text-muted-foreground"}`}>
                                    ₦{p.price.toLocaleString()}
                                  </span>
                                </div>
                              );
                            })}
                            {selected && (
                              <div className="flex justify-between items-center px-2 py-1.5 bg-muted/20 border-t border-border text-[10px]">
                                <span className="text-muted-foreground">Subtotal ({paramCount} params)</span>
                                <span className="font-bold text-primary">₦{testSelectedPrice(test).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredTests.length === 0 && (
              <div className="col-span-2 py-12 text-center text-muted-foreground text-sm">No tests found.</div>
            )}
          </div>

          {/* Running total bar */}
          <div className="sticky bottom-0 bg-card border-t border-border pt-4 pb-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span><span className="font-bold text-foreground">{selectedIds.size}</span> tests</span>
                <span><span className="font-bold text-foreground">{totalParamsCount}</span> parameters</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-extrabold text-primary">₦{totalAmount.toLocaleString()}</p>
                </div>
                <Button size="lg" className="gap-2" onClick={goToStep2} disabled={selectedIds.size === 0}>
                  Sample Collection <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PHASE 2: Sample Collection ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold">Sample Collection</h3>
            <p className="text-sm text-muted-foreground">Log collection details for each test. Sample type pre-filled from catalog.</p>
          </div>

          <div className="space-y-4">
            {selectedTests.map(test => (
              <Card key={test.id} className="shadow-card border">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <TestTube className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{test.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] border ${categoryColors[test.category]}`}>{test.category}</Badge>
                        <span className="text-xs text-muted-foreground">TAT: {test.turnaround}</span>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="font-bold text-primary text-sm">₦{testSelectedPrice(test).toLocaleString()}</span>
                      <p className="text-[10px] text-muted-foreground">{selectedParams[test.id]?.size ?? 0} params</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sample Type *</Label>
                      <Select value={samples[test.id]?.sampleType} onValueChange={v => updateSample(test.id, "sampleType", v)}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select sample type" /></SelectTrigger>
                        <SelectContent>{SAMPLE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Container *</Label>
                      <Select value={samples[test.id]?.container} onValueChange={v => updateSample(test.id, "container", v)}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select container" /></SelectTrigger>
                        <SelectContent>{CONTAINERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Volume (optional)</Label>
                      <div className="flex gap-2 items-center">
                        <Input className="h-9 text-sm" placeholder="e.g. 5" value={samples[test.id]?.volume} onChange={e => updateSample(test.id, "volume", e.target.value)} />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">mL</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sample Condition</Label>
                      <Select value={samples[test.id]?.condition} onValueChange={v => updateSample(test.id, "condition", v)}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Collected By</Label>
                      <Input className="h-9 text-sm" value={samples[test.id]?.collectedBy} onChange={e => updateSample(test.id, "collectedBy", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Collection Time</Label>
                      <Input type="datetime-local" className="h-9 text-sm" value={samples[test.id]?.collectionTime} onChange={e => updateSample(test.id, "collectionTime", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" className="gap-2" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4" />Back to Tests
            </Button>
            <Button size="lg" className="gap-2" onClick={goToStep3}>
              Assign Professionals <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── PHASE 3: Assign to Professionals ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold">Assign to Professionals</h3>
            <p className="text-sm text-muted-foreground">Assign each test individually to a scientist or technician.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {selectedTests.map(test => (
                <Card key={test.id} className="shadow-card border">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{test.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedParams[test.id]?.size ?? 0} of {test.parameters.length} params · {test.turnaround}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] border ${categoryColors[test.category]}`}>{test.category}</Badge>
                      <span className="font-bold text-primary text-sm">₦{testSelectedPrice(test).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Assign To *</Label>
                        <Select value={assignments[test.id]?.assignedTo} onValueChange={v => updateAssignment(test.id, "assignedTo", v)}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select professional" /></SelectTrigger>
                          <SelectContent>
                            {scientists.map(s => (
                              <SelectItem key={s.id} value={s.name}>
                                {s.name} ({s.role}){s.status !== "Active" ? " · On Leave" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Priority</Label>
                        <Select value={assignments[test.id]?.priority} onValueChange={v => updateAssignment(test.id, "priority", v)}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label className="text-xs">Notes (optional)</Label>
                        <Textarea className="text-sm min-h-[60px] resize-none"
                          placeholder="Special instructions..."
                          value={assignments[test.id]?.notes}
                          onChange={e => updateAssignment(test.id, "notes", e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order summary sidebar */}
            <div>
              <Card className="shadow-card border sticky top-24">
                <CardContent className="pt-5 pb-5">
                  <p className="font-semibold mb-4 text-sm">Order Summary</p>
                  <div className="space-y-3">
                    {selectedTests.map(t => (
                      <div key={t.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium truncate flex-1 pr-2">{t.name}</span>
                          <span className="text-xs font-semibold text-primary">₦{testSelectedPrice(t).toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{selectedParams[t.id]?.size ?? 0}/{t.parameters.length} params</p>
                        {assignments[t.id]?.assignedTo
                          ? <p className="text-[10px] text-success">{assignments[t.id].assignedTo}</p>
                          : <p className="text-[10px] text-muted-foreground/60 italic">Not assigned</p>}
                        {assignments[t.id]?.priority === "Urgent" && (
                          <Badge className="text-[10px] px-1.5 bg-destructive/10 text-destructive border-destructive/30">URGENT</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>Tests</span><span>{selectedTests.length}</span></div>
                    <div className="flex justify-between"><span>Parameters</span><span>{totalParamsCount}</span></div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                    <span className="text-sm font-semibold">Total Amount</span>
                    <span className="text-xl font-extrabold text-primary">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" className="gap-2" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4" />Back to Samples
            </Button>
            <Button size="lg" className="gap-2 shadow-glow" onClick={submitOrder}>
              <CheckCircle className="w-4 h-4" />Create Test Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
