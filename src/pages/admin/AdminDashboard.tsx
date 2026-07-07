import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/lab/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2, Users, DollarSign, Activity, ArrowRight,
  TrendingUp, TestTube, AlertTriangle, CheckCircle, Globe
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const platformStats = [
  { month: "Jan", revenue: 4200000, labs: 12 },
  { month: "Feb", revenue: 5100000, labs: 14 },
  { month: "Mar", revenue: 4800000, labs: 14 },
  { month: "Apr", revenue: 6300000, labs: 16 },
  { month: "May", revenue: 7100000, labs: 18 },
  { month: "Jun", revenue: 8400000, labs: 21 },
];

const planDist = [
  { name: "Enterprise", value: 5, color: "hsl(174 62% 35%)" },
  { name: "Pro", value: 9, color: "hsl(152 69% 45%)" },
  { name: "Basic", value: 7, color: "hsl(210 100% 56%)" },
];

const recentActivity = [
  { type: "lab", text: "MedPath Laboratories registered", time: "2m ago", icon: Building2, color: "text-primary" },
  { type: "payment", text: "HealthFirst Lab renewed Enterprise plan — ₦480k", time: "1h ago", icon: DollarSign, color: "text-success" },
  { type: "alert", text: "CityDiag Ikeja subscription expires in 3 days", time: "2h ago", icon: AlertTriangle, color: "text-warning" },
  { type: "user", text: "New Lab Manager added at BioTest Lagos", time: "4h ago", icon: Users, color: "text-info" },
  { type: "lab", text: "AccuMed Abuja activated branch", time: "6h ago", icon: Building2, color: "text-primary" },
  { type: "payment", text: "NovaDiag downgraded to Pro plan", time: "8h ago", icon: DollarSign, color: "text-warning" },
];

const topLabs = [
  { name: "HealthFirst Laboratories", plan: "Enterprise", tests: 1840, revenue: 9200000, status: "Active" },
  { name: "AccuMed Diagnostics", plan: "Pro", tests: 1230, revenue: 6150000, status: "Active" },
  { name: "CityDiag Ikeja", plan: "Enterprise", tests: 1180, revenue: 5900000, status: "Active" },
  { name: "BioTest Lagos", plan: "Pro", tests: 870, revenue: 4350000, status: "Active" },
  { name: "NovaDiag Abuja", plan: "Basic", tests: 540, revenue: 2700000, status: "Active" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="gradient-hero rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-sm font-medium">Platform Overview · June 2024</span>
            </div>
            <h2 className="text-2xl font-bold">Super Admin Dashboard</h2>
            <p className="text-white/70 text-sm mt-1">
              <span className="text-white font-semibold">21 active labs</span> across{" "}
              <span className="text-white font-semibold">5 states</span> ·{" "}
              <span className="text-white font-semibold">₦8.4M</span> platform revenue this month
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => navigate("/admin/labs")}>
              <Building2 className="w-4 h-4 mr-2" />Manage Labs
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => navigate("/admin/reports")}>
              <TrendingUp className="w-4 h-4 mr-2" />View Reports
            </Button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Labs" value={21} icon={Building2} trend={16} trendLabel="vs last month" variant="primary" subtitle="Across 5 states" />
        <StatCard title="Platform Revenue" value="₦8.4M" icon={DollarSign} trend={18} trendLabel="vs last month" variant="success" subtitle="Jun 2024" />
        <StatCard title="Total Users" value="347" icon={Users} trend={22} variant="info" subtitle="Across all labs" />
        <StatCard title="Tests Processed" value="18.2K" icon={TestTube} trend={14} variant="default" subtitle="This month" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Platform Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue across all labs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={platformStats}>
                <defs>
                  <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174 62% 35%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(174 62% 35%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`₦${(v / 1000000).toFixed(2)}M`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(174 62% 35%)" strokeWidth={2.5} fill="url(#adminRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan distribution */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Subscription Plans</CardTitle>
            <CardDescription>Lab distribution by plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={planDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {planDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: "12px", color: "hsl(var(--foreground))" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-2">
              {planDist.map(p => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-muted-foreground">{p.name}</span>
                  </div>
                  <span className="font-semibold">{p.value} labs</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Top labs */}
        <Card className="lg:col-span-3 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Top Performing Labs</CardTitle>
                <CardDescription>By tests processed this month</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary text-xs gap-1" onClick={() => navigate("/admin/labs")}>
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topLabs.map((lab, i) => (
              <div key={lab.name} className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">#{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{lab.name}</p>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${
                      lab.plan === "Enterprise" ? "border-primary/40 text-primary" :
                      lab.plan === "Pro" ? "border-info/40 text-info" : "border-border"
                    }`}>{lab.plan}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <Progress value={(lab.tests / 1840) * 100} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground flex-shrink-0">{lab.tests.toLocaleString()} tests</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-success">₦{(lab.revenue / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <CardDescription>Platform-wide events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 ${act.color}`}>
                  <act.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-tight">{act.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
