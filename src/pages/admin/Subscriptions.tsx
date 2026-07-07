import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CreditCard, CheckCircle, AlertTriangle, Clock, TrendingUp,
  MoreVertical, DollarSign, RefreshCw, XCircle
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

type SubStatus = "Active" | "Expiring" | "Expired" | "Cancelled";
type PlanType = "Enterprise" | "Pro" | "Basic";

interface Subscription {
  id: string;
  labName: string;
  plan: PlanType;
  amount: number;
  status: SubStatus;
  startDate: string;
  expiryDate: string;
  daysLeft: number;
  autoRenew: boolean;
  paymentMethod: string;
}

const initialSubs: Subscription[] = [
  { id: "SUB-001", labName: "HealthFirst Laboratories", plan: "Enterprise", amount: 250000, status: "Active", startDate: "2024-01-15", expiryDate: "2025-01-15", daysLeft: 213, autoRenew: true, paymentMethod: "Card" },
  { id: "SUB-002", labName: "AccuMed Diagnostics", plan: "Pro", amount: 120000, status: "Active", startDate: "2023-12-20", expiryDate: "2024-12-20", daysLeft: 186, autoRenew: true, paymentMethod: "Transfer" },
  { id: "SUB-003", labName: "CityDiag Ikeja", plan: "Enterprise", amount: 250000, status: "Expiring", startDate: "2023-06-20", expiryDate: "2024-06-20", daysLeft: 3, autoRenew: false, paymentMethod: "Card" },
  { id: "SUB-004", labName: "BioTest Lagos", plan: "Pro", amount: 120000, status: "Active", startDate: "2024-03-01", expiryDate: "2025-03-01", daysLeft: 258, autoRenew: true, paymentMethod: "POS" },
  { id: "SUB-005", labName: "NovaDiag Abuja", plan: "Basic", amount: 50000, status: "Active", startDate: "2024-07-15", expiryDate: "2025-07-15", daysLeft: 392, autoRenew: true, paymentMethod: "Transfer" },
  { id: "SUB-006", labName: "MedPath Kano", plan: "Basic", amount: 50000, status: "Active", startDate: "2024-06-10", expiryDate: "2024-07-10", daysLeft: 23, autoRenew: false, paymentMethod: "Cash" },
  { id: "SUB-007", labName: "QuickScan Ibadan", plan: "Pro", amount: 120000, status: "Expired", startDate: "2023-03-20", expiryDate: "2024-03-20", daysLeft: 0, autoRenew: false, paymentMethod: "Card" },
];

const monthlyRev = [
  { month: "Jan", amount: 840000 },
  { month: "Feb", amount: 960000 },
  { month: "Mar", amount: 840000 },
  { month: "Apr", amount: 1200000 },
  { month: "May", amount: 1320000 },
  { month: "Jun", amount: 1440000 },
];

const plans = [
  { name: "Basic", price: 50000, features: ["1 Branch", "5 Staff", "1,000 Tests/mo", "Email Support"], color: "border-border" },
  { name: "Pro", price: 120000, features: ["3 Branches", "20 Staff", "5,000 Tests/mo", "WhatsApp + SMS", "Priority Support"], color: "border-info/50", badge: "Popular" },
  { name: "Enterprise", price: 250000, features: ["Unlimited Branches", "Unlimited Staff", "Unlimited Tests", "API Access", "Dedicated Support", "Custom Reports"], color: "border-primary/60", badge: "Best Value" },
];

const statusColor: Record<SubStatus, string> = {
  Active: "bg-success/10 text-success border-success/30",
  Expiring: "bg-warning/10 text-warning border-warning/30",
  Expired: "bg-destructive/10 text-destructive border-destructive/30",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

export default function Subscriptions() {
  const { toast } = useToast();
  const [subs, setSubs] = useState<Subscription[]>(initialSubs);
  const [activeTab, setActiveTab] = useState("All");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [newPlan, setNewPlan] = useState<PlanType | "">("");

  const filtered = subs.filter(s => activeTab === "All" || s.status === activeTab);
  const tabCounts = ["All", "Active", "Expiring", "Expired"].map(t => ({
    t, c: t === "All" ? subs.length : subs.filter(s => s.status === t).length
  }));

  const totalMRR = subs.filter(s => s.status === "Active" || s.status === "Expiring").reduce((acc, s) => acc + s.amount, 0);
  const expiringCount = subs.filter(s => s.status === "Expiring").length;

  const handleUpgrade = () => {
    if (!selectedSub || !newPlan) return;
    const planPrices: Record<PlanType, number> = { Basic: 50000, Pro: 120000, Enterprise: 250000 };
    setSubs(prev => prev.map(s => s.id === selectedSub.id ? { ...s, plan: newPlan as PlanType, amount: planPrices[newPlan as PlanType] } : s));
    toast({ title: "Plan Updated", description: `${selectedSub.labName} moved to ${newPlan} plan.` });
    setUpgradeOpen(false);
    setSelectedSub(null);
    setNewPlan("");
  };

  const handleRenew = (id: string) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: "Active", daysLeft: 365 } : s));
    toast({ title: "Subscription Renewed", description: "Subscription renewed for 12 months." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Subscriptions</h2>
        <p className="text-sm text-muted-foreground">Manage lab subscription plans and billing</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Monthly Revenue</p>
          <p className="text-2xl font-bold text-success mt-1">₦{(totalMRR / 1000000).toFixed(1)}M</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Active Subs</p>
          <p className="text-2xl font-bold text-primary mt-1">{subs.filter(s => s.status === "Active").length}</p>
        </Card>
        <Card className="shadow-card p-4 border-warning/30">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-warning" />Expiring Soon</p>
          <p className="text-2xl font-bold text-warning mt-1">{expiringCount}</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Expired</p>
          <p className="text-2xl font-bold text-destructive mt-1">{subs.filter(s => s.status === "Expired").length}</p>
        </Card>
      </div>

      {/* Plans + Revenue chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Plans cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map(plan => (
            <Card key={plan.name} className={`shadow-card border-2 ${plan.color} relative`}>
              {plan.badge && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge className={`text-[10px] px-2 ${plan.name === "Enterprise" ? "bg-primary text-primary-foreground" : "bg-info text-white"}`}>{plan.badge}</Badge>
                </div>
              )}
              <CardHeader className="pt-6 pb-2">
                <CardTitle className="text-base font-bold">{plan.name}</CardTitle>
                <p className="text-2xl font-bold text-primary">₦{(plan.price / 1000).toFixed(0)}k<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">
                  {subs.filter(s => s.plan === plan.name && (s.status === "Active" || s.status === "Expiring")).length} active labs
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue chart */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle>
            <CardDescription>Subscription revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRev} margin={{ left: -15, right: 0, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`₦${(v / 1000).toFixed(0)}k`, "Revenue"]} />
                <Bar dataKey="amount" fill="hsl(152 69% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions table */}
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
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden sm:table-cell">Amount/Mo</TableHead>
                  <TableHead className="hidden md:table-cell">Expiry</TableHead>
                  <TableHead className="hidden lg:table-cell">Days Left</TableHead>
                  <TableHead className="hidden md:table-cell">Auto-Renew</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(sub => (
                  <TableRow key={sub.id} className={`hover:bg-muted/20 transition-colors ${sub.status === "Expiring" ? "bg-warning/5" : ""}`}>
                    <TableCell className="pl-6">
                      <p className="text-sm font-medium">{sub.labName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{sub.id}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs border ${
                        sub.plan === "Enterprise" ? "border-primary/40 text-primary bg-primary/5" :
                        sub.plan === "Pro" ? "border-info/40 text-info bg-info/5" : "border-border"
                      }`}>{sub.plan}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-semibold text-sm">₦{sub.amount.toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{sub.expiryDate}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {sub.daysLeft > 0 ? (
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min((sub.daysLeft / 365) * 100, 100)} className={`h-1.5 w-16 ${sub.daysLeft <= 30 ? "[&>div]:bg-warning" : ""}`} />
                          <span className={`text-xs font-medium ${sub.daysLeft <= 30 ? "text-warning" : "text-muted-foreground"}`}>{sub.daysLeft}d</span>
                        </div>
                      ) : <span className="text-xs text-destructive font-medium">Expired</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={`text-xs gap-1 ${sub.autoRenew ? "border-success/30 text-success" : "border-border text-muted-foreground"}`}>
                        {sub.autoRenew ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {sub.autoRenew ? "On" : "Off"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs border ${statusColor[sub.status]}`}>{sub.status}</Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex gap-1 justify-end">
                        {(sub.status === "Expired" || sub.status === "Expiring") && (
                          <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleRenew(sub.id)}>
                            <RefreshCw className="w-3 h-3" />Renew
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedSub(sub); setUpgradeOpen(true); }}>Change Plan</DropdownMenuItem>
                            <DropdownMenuItem>View History</DropdownMenuItem>
                            <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Change plan dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Change Subscription Plan</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{selectedSub?.labName}</p>
            <p className="text-xs">Current plan: <Badge variant="outline" className="ml-1">{selectedSub?.plan}</Badge></p>
            <div className="space-y-1.5">
              <Label>New Plan</Label>
              <Select value={newPlan} onValueChange={v => setNewPlan(v as PlanType)}>
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
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>Cancel</Button>
            <Button onClick={handleUpgrade} disabled={!newPlan || newPlan === selectedSub?.plan}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
