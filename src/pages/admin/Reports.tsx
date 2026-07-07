import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/lab/StatCard";
import { Download, BarChart3, TrendingUp, TestTube, Building2, Users } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell
} from "recharts";

const monthlyGrowth = [
  { month: "Jan", labs: 12, users: 198, tests: 9200 },
  { month: "Feb", labs: 14, users: 231, tests: 11400 },
  { month: "Mar", labs: 14, users: 246, tests: 12100 },
  { month: "Apr", labs: 16, users: 279, tests: 14300 },
  { month: "May", labs: 18, users: 315, tests: 16800 },
  { month: "Jun", labs: 21, users: 347, tests: 18200 },
];

const revenueByPlan = [
  { month: "Jan", Enterprise: 1500000, Pro: 1440000, Basic: 300000 },
  { month: "Feb", Enterprise: 1750000, Pro: 1680000, Basic: 300000 },
  { month: "Mar", Enterprise: 1750000, Pro: 1680000, Basic: 350000 },
  { month: "Apr", Enterprise: 2000000, Pro: 1920000, Basic: 400000 },
  { month: "May", Enterprise: 2250000, Pro: 2160000, Basic: 400000 },
  { month: "Jun", Enterprise: 2500000, Pro: 2280000, Basic: 450000 },
];

const testsByType = [
  { type: "Full Blood Count", count: 4820, pct: 26 },
  { type: "Malaria Test", count: 3640, pct: 20 },
  { type: "Urinalysis", count: 2910, pct: 16 },
  { type: "Liver Function", count: 2190, pct: 12 },
  { type: "HIV Screening", count: 1820, pct: 10 },
  { type: "Others", count: 2820, pct: 16 },
];

const PIE_COLORS = ["hsl(174 62% 35%)", "hsl(152 69% 45%)", "hsl(210 100% 56%)", "hsl(38 92% 50%)", "hsl(0 84% 60%)", "hsl(280 65% 60%)"];

const topStates = [
  { state: "Lagos", labs: 8, tests: 9200, pct: 50 },
  { state: "FCT", labs: 5, tests: 4600, pct: 25 },
  { state: "Kano", labs: 3, tests: 2100, pct: 12 },
  { state: "Oyo", labs: 3, tests: 1500, pct: 8 },
  { state: "Rivers", labs: 2, tests: 800, pct: 5 },
];

export default function Reports() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Platform-wide insights · June 2024</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />Export Report
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Tests (YTD)" value="81.8K" icon={TestTube} trend={22} variant="primary" trendLabel="vs last year" />
        <StatCard title="Platform Revenue" value="₦37.3M" icon={TrendingUp} trend={31} variant="success" trendLabel="YTD 2024" />
        <StatCard title="Lab Growth" value="+75%" icon={Building2} trend={75} variant="info" trendLabel="vs Jan 2024" />
        <StatCard title="User Growth" value="+75%" icon={Users} trend={75} variant="default" trendLabel="vs Jan 2024" />
      </div>

      {/* Growth trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Tests Processed</CardTitle>
            <CardDescription>Monthly test volume across all labs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyGrowth}>
                <defs>
                  <linearGradient id="repTestGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174 62% 35%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(174 62% 35%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`${v.toLocaleString()}`, "Tests"]} />
                <Area type="monotone" dataKey="tests" stroke="hsl(174 62% 35%)" strokeWidth={2.5} fill="url(#repTestGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Revenue by Plan</CardTitle>
            <CardDescription>Monthly stacked revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByPlan} margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`₦${(v / 1000000).toFixed(2)}M`]} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: "12px", color: "hsl(var(--foreground))" }}>{v}</span>} />
                <Bar dataKey="Enterprise" stackId="a" fill="hsl(174 62% 35%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Pro" stackId="a" fill="hsl(152 69% 45%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Basic" stackId="a" fill="hsl(210 100% 56%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Test distribution + geographic spread */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Tests by Type</CardTitle>
            <CardDescription>Distribution across all labs</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={testsByType} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="count">
                  {testsByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2 w-full">
              {testsByType.map((t, i) => (
                <div key={t.type} className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="flex-1 text-xs truncate text-muted-foreground">{t.type}</span>
                  <span className="font-semibold text-xs">{t.pct}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Geographic Distribution</CardTitle>
            <CardDescription>Labs and tests by state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topStates.map(s => (
              <div key={s.state} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.state}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 h-4">{s.labs} labs</Badge>
                  </div>
                  <span className="text-muted-foreground text-xs">{s.tests.toLocaleString()} tests · {s.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Lab growth line chart */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Platform Growth</CardTitle>
          <CardDescription>Labs, users, and monthly tests — Jan to Jun 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyGrowth} margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: "12px", color: "hsl(var(--foreground))" }}>{v}</span>} />
              <Line type="monotone" dataKey="labs" stroke="hsl(174 62% 35%)" strokeWidth={2.5} dot={{ r: 4 }} name="Labs" />
              <Line type="monotone" dataKey="users" stroke="hsl(152 69% 45%)" strokeWidth={2.5} dot={{ r: 4 }} name="Users" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
