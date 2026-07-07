import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2, Plus, Search, MapPin, Phone, Globe, CheckCircle,
  XCircle, Clock, Users, TestTube, MoreVertical
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type LabStatus = "Active" | "Suspended" | "Trial" | "Expired";
type LabPlan = "Enterprise" | "Pro" | "Basic";

interface Lab {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  plan: LabPlan;
  status: LabStatus;
  branches: number;
  staff: number;
  testsThisMonth: number;
  registeredDate: string;
  expiryDate: string;
}

const initialLabs: Lab[] = [
  { id: "LAB-001", name: "HealthFirst Laboratories", owner: "Dr. Nnenna Okafor", email: "admin@healthfirst.ng", phone: "+234 801 234 5678", city: "Lagos", state: "Lagos", plan: "Enterprise", status: "Active", branches: 4, staff: 32, testsThisMonth: 1840, registeredDate: "2022-01-15", expiryDate: "2025-01-15" },
  { id: "LAB-002", name: "AccuMed Diagnostics", owner: "Dr. Emeka Nwachukwu", email: "admin@accumed.ng", phone: "+234 802 345 6789", city: "Abuja", state: "FCT", plan: "Pro", status: "Active", branches: 2, staff: 18, testsThisMonth: 1230, registeredDate: "2022-06-20", expiryDate: "2024-12-20" },
  { id: "LAB-003", name: "CityDiag Ikeja", owner: "Dr. Ayo Adeleke", email: "info@citydiag.ng", phone: "+234 803 456 7890", city: "Ikeja", state: "Lagos", plan: "Enterprise", status: "Active", branches: 3, staff: 24, testsThisMonth: 1180, registeredDate: "2021-11-10", expiryDate: "2024-06-20" },
  { id: "LAB-004", name: "BioTest Lagos", owner: "Dr. Funke Oluwole", email: "hello@biotest.ng", phone: "+234 804 567 8901", city: "Victoria Island", state: "Lagos", plan: "Pro", status: "Active", branches: 1, staff: 12, testsThisMonth: 870, registeredDate: "2023-03-01", expiryDate: "2025-03-01" },
  { id: "LAB-005", name: "NovaDiag Abuja", owner: "Dr. Musa Aliyu", email: "info@novadiag.ng", phone: "+234 805 678 9012", city: "Wuse", state: "FCT", plan: "Basic", status: "Active", branches: 1, staff: 8, testsThisMonth: 540, registeredDate: "2023-07-15", expiryDate: "2025-07-15" },
  { id: "LAB-006", name: "MedPath Kano", owner: "Dr. Sadiya Umar", email: "admin@medpath.ng", phone: "+234 806 789 0123", city: "Kano", state: "Kano", plan: "Basic", status: "Trial", branches: 1, staff: 6, testsThisMonth: 120, registeredDate: "2024-06-10", expiryDate: "2024-07-10" },
  { id: "LAB-007", name: "QuickScan Ibadan", owner: "Dr. Seun Ogunleye", email: "info@quickscan.ng", phone: "+234 807 890 1234", city: "Ibadan", state: "Oyo", plan: "Pro", status: "Suspended", branches: 2, staff: 14, testsThisMonth: 0, registeredDate: "2022-09-20", expiryDate: "2024-03-20" },
];

const NIGERIAN_STATES = ["Lagos", "FCT", "Rivers", "Kano", "Oyo", "Enugu", "Kaduna", "Ogun", "Imo", "Anambra"];

const planColor: Record<LabPlan, string> = {
  Enterprise: "bg-primary/10 text-primary border-primary/30",
  Pro: "bg-info/10 text-info border-info/30",
  Basic: "bg-muted text-muted-foreground border-border",
};

const statusColor: Record<LabStatus, string> = {
  Active: "bg-success/10 text-success border-success/30",
  Trial: "bg-warning/10 text-warning border-warning/30",
  Suspended: "bg-destructive/10 text-destructive border-destructive/30",
  Expired: "bg-muted text-muted-foreground border-border",
};

export default function Labs() {
  const { toast } = useToast();
  const [labs, setLabs] = useState<Lab[]>(initialLabs);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", owner: "", email: "", phone: "", city: "", state: "", plan: "" as LabPlan | "" });

  const filtered = labs.filter(l => {
    const matchTab = activeTab === "All" || l.status === activeTab;
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.owner.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const tabCounts = ["All", "Active", "Trial", "Suspended"].map(t => ({
    t, c: t === "All" ? labs.length : labs.filter(l => l.status === t).length
  }));

  const toggleStatus = (id: string, action: string) => {
    const newStatus: LabStatus = action === "suspend" ? "Suspended" : action === "activate" ? "Active" : "Suspended";
    setLabs(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    toast({ title: "Lab Updated", description: `Lab ${id} status changed to ${newStatus}.` });
  };

  const handleCreate = () => {
    if (!form.name || !form.owner || !form.email || !form.plan) {
      toast({ title: "Missing Fields", variant: "destructive" });
      return;
    }
    const newLab: Lab = {
      id: `LAB-${String(labs.length + 1).padStart(3, "0")}`,
      name: form.name, owner: form.owner, email: form.email, phone: form.phone,
      city: form.city, state: form.state, plan: form.plan as LabPlan,
      status: "Trial", branches: 1, staff: 0, testsThisMonth: 0,
      registeredDate: "2024-06-17", expiryDate: "2024-07-17"
    };
    setLabs([newLab, ...labs]);
    setOpen(false);
    setForm({ name: "", owner: "", email: "", phone: "", city: "", state: "", plan: "" });
    toast({ title: "Lab Created", description: `${newLab.name} registered as ${newLab.id}.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Laboratories</h2>
          <p className="text-sm text-muted-foreground">{labs.length} labs registered on the platform</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Add Laboratory</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Register New Laboratory</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Lab Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. HealthFirst Laboratories" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Owner / Director <span className="text-destructive">*</span></Label>
                <Input placeholder="Dr. Full Name" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Email <span className="text-destructive">*</span></Label>
                  <Input type="email" placeholder="admin@lab.ng" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input placeholder="+234..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input placeholder="City" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Select value={form.state} onValueChange={v => setForm(p => ({ ...p, state: v }))}>
                    <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent>{NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Subscription Plan <span className="text-destructive">*</span></Label>
                <Select value={form.plan} onValueChange={v => setForm(p => ({ ...p, plan: v as LabPlan }))}>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic — ₦50k/month</SelectItem>
                    <SelectItem value="Pro">Pro — ₦120k/month</SelectItem>
                    <SelectItem value="Enterprise">Enterprise — ₦250k/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Register Lab</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search labs by name, owner, or city..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 pt-4 px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-auto gap-1">
              {tabCounts.map(({ t, c }) => (
                <TabsTrigger key={t} value={t} className="gap-2 text-xs">
                  {t} <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{c}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Laboratory</TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden sm:table-cell">Tests/Mo</TableHead>
                  <TableHead className="hidden lg:table-cell">Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Expiry</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">No labs found.</TableCell></TableRow>
                ) : filtered.map(lab => (
                  <TableRow key={lab.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{lab.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{lab.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{lab.owner}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lab.city}, {lab.state}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs border ${planColor[lab.plan]}`}>{lab.plan}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-semibold text-sm">{lab.testsThisMonth.toLocaleString()}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{lab.staff}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs border ${statusColor[lab.status]}`}>{lab.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{lab.expiryDate}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Info</DropdownMenuItem>
                          <DropdownMenuItem>Manage Plan</DropdownMenuItem>
                          {lab.status === "Active" && (
                            <DropdownMenuItem className="text-destructive" onClick={() => toggleStatus(lab.id, "suspend")}>
                              Suspend Lab
                            </DropdownMenuItem>
                          )}
                          {lab.status === "Suspended" && (
                            <DropdownMenuItem className="text-success" onClick={() => toggleStatus(lab.id, "activate")}>
                              Reactivate Lab
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
