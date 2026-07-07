import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText, Download, CheckCircle, AlertCircle,
  TrendingUp, TrendingDown, Minus, Calendar
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";

const timeline = [
  {
    year: "2024", entries: [
      { month: "Jun 17", test: "Full Blood Count", result: "Normal", lab: "HealthFirst", status: "ready" as const },
      { month: "Jun 05", test: "Blood Glucose", result: "Normal (5.6 mmol/L)", lab: "HealthFirst", status: "ok" as const },
      { month: "May 20", test: "Liver Function Test", result: "Mild ALT elevation", lab: "HealthFirst", status: "warn" as const },
      { month: "Apr 28", test: "Malaria Parasite", result: "Not Detected", lab: "HealthFirst", status: "ok" as const },
    ],
  },
  {
    year: "2023", entries: [
      { month: "Nov 10", test: "Full Blood Count", result: "Normal", lab: "HealthFirst", status: "ok" as const },
      { month: "Sep 02", test: "HIV Screening", result: "Non-Reactive", lab: "HealthFirst", status: "ok" as const },
      { month: "Jul 14", test: "Urinalysis", result: "Normal", lab: "HealthFirst", status: "ok" as const },
      { month: "Mar 22", test: "Thyroid Function Test", result: "Normal (TSH: 2.1)", lab: "HealthFirst", status: "ok" as const },
    ],
  },
];

const glucoseTrend = [
  { date: "Mar '23", value: 5.4 },
  { date: "Jul '23", value: 5.7 },
  { date: "Nov '23", value: 5.5 },
  { date: "Apr '24", value: 5.8 },
  { date: "Jun '24", value: 5.6 },
];

const hbTrend = [
  { date: "Mar '23", value: 12.8 },
  { date: "Jul '23", value: 13.4 },
  { date: "Nov '23", value: 13.1 },
  { date: "Apr '24", value: 13.0 },
  { date: "Jun '24", value: 13.2 },
];

const statusConfig = {
  ok: { color: "text-success", bg: "bg-success/10", icon: CheckCircle, badge: "border-success/30 text-success" },
  warn: { color: "text-warning", bg: "bg-warning/10", icon: AlertCircle, badge: "border-warning/30 text-warning" },
  ready: { color: "text-primary", bg: "bg-primary/10", icon: FileText, badge: "border-primary/30 text-primary" },
};

export default function HealthHistory() {
  const totalTests = timeline.reduce((s, y) => s + y.entries.length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Health History</h2>
          <p className="text-sm text-muted-foreground">{totalTests} tests recorded across 2 years</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />Export Records
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tests", value: totalTests, color: "text-primary" },
          { label: "Normal Results", value: timeline.flatMap(y => y.entries).filter(e => e.status === "ok").length, color: "text-success" },
          { label: "Needs Follow-up", value: timeline.flatMap(y => y.entries).filter(e => e.status === "warn").length, color: "text-warning" },
          { label: "Labs Visited", value: 1, color: "text-info" },
        ].map(s => (
          <Card key={s.label} className="shadow-card p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Blood Glucose Trend</CardTitle>
            <CardDescription>All readings over time · Normal: 3.9–5.6 mmol/L</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={glucoseTrend} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[4, 8]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`${v} mmol/L`]} />
                <ReferenceLine y={5.6} stroke="hsl(38 92% 50%)" strokeDasharray="4 4" label={{ value: "Upper limit", position: "insideTopRight", fontSize: 10, fill: "hsl(38 92% 50%)" }} />
                <Line type="monotone" dataKey="value" stroke="hsl(174 62% 35%)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Haemoglobin Trend</CardTitle>
            <CardDescription>All readings over time · Normal (F): 12.0–16.0 g/dL</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={hbTrend} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[10, 17]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`${v} g/dL`]} />
                <ReferenceLine y={12} stroke="hsl(38 92% 50%)" strokeDasharray="4 4" label={{ value: "Lower limit", position: "insideBottomRight", fontSize: 10, fill: "hsl(38 92% 50%)" }} />
                <Line type="monotone" dataKey="value" stroke="hsl(152 69% 45%)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {timeline.map(yearGroup => (
          <div key={yearGroup.year}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{yearGroup.year}</h3>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{yearGroup.entries.length} tests</span>
            </div>
            <div className="space-y-3 ml-4 pl-7 border-l-2 border-border">
              {yearGroup.entries.map((entry, i) => {
                const cfg = statusConfig[entry.status];
                return (
                  <div key={i} className="relative flex items-start gap-4 pb-3">
                    <div className={`absolute -left-[33px] w-4 h-4 rounded-full border-2 border-background flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${entry.status === "ok" ? "bg-success" : entry.status === "warn" ? "bg-warning" : "bg-primary"}`} />
                    </div>
                    <div className="flex-1 flex items-center gap-4 p-3 bg-muted/20 rounded-xl border border-border hover:border-primary/30 transition-colors">
                      <div className="w-2 h-full min-h-[24px] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{entry.test}</p>
                          <Badge variant="outline" className={`text-[10px] px-1.5 border ${cfg.badge}`}>
                            {entry.status === "ok" ? "Normal" : entry.status === "warn" ? "Follow-up" : "New"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.result}</p>
                        <p className="text-xs text-muted-foreground">{entry.month} · {entry.lab}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
