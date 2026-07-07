import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText, CalendarDays, CheckCircle, Clock,
  ArrowRight, Heart, Droplets, Activity, AlertCircle,
  Download, TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const glucoseTrend = [
  { date: "Apr 15", value: 5.8 },
  { date: "Apr 28", value: 6.1 },
  { date: "May 10", value: 5.5 },
  { date: "May 24", value: 5.9 },
  { date: "Jun 05", value: 5.3 },
  { date: "Jun 17", value: 5.6 },
];

const recentResults = [
  { id: "RES-001", test: "Full Blood Count", date: "Jun 17, 2024", status: "Ready", abnormal: false },
  { id: "RES-002", test: "Blood Glucose (Fasting)", date: "Jun 05, 2024", status: "Released", abnormal: false },
  { id: "RES-003", test: "Liver Function Test", date: "May 20, 2024", status: "Released", abnormal: true },
  { id: "RES-004", test: "Malaria Parasite", date: "Apr 28, 2024", status: "Released", abnormal: false },
];

const upcomingAppts = [
  { test: "Kidney Function Test", date: "Jun 20, 2024", time: "09:00", lab: "HealthFirst Laboratories" },
  { test: "Full Blood Count Follow-up", date: "Jul 03, 2024", time: "10:30", lab: "HealthFirst Laboratories" },
];

const healthMetrics = [
  { label: "Blood Pressure", value: "118/76", unit: "mmHg", status: "normal", icon: Activity },
  { label: "Blood Glucose", value: "5.6", unit: "mmol/L", status: "normal", icon: Droplets },
  { label: "Haemoglobin", value: "13.2", unit: "g/dL", status: "low", icon: Heart },
  { label: "WBC Count", value: "7.4", unit: "×10⁹/L", status: "normal", icon: Activity },
];

const statusIcons = {
  normal: { icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
  low: { icon: TrendingDown, color: "text-warning", bg: "bg-warning/10" },
  high: { icon: TrendingUp, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function PatientDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome hero */}
      <div className="gradient-hero rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Tuesday, June 17, 2024</p>
            <h2 className="text-2xl font-bold mt-1">Hello, Amara</h2>
            <p className="text-white/70 text-sm mt-1">
              <span className="text-white font-semibold">1 new result</span> ready to view ·{" "}
              <span className="text-white font-semibold">2 upcoming</span> appointments
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => navigate("/patient/results")}>
              <FileText className="w-4 h-4 mr-2" />View Results
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => navigate("/patient/appointments")}>
              <CalendarDays className="w-4 h-4 mr-2" />Appointments
            </Button>
          </div>
        </div>
      </div>

      {/* New result alert */}
      <div className="flex items-center gap-4 p-4 border border-primary/30 bg-primary/5 rounded-xl">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-glow">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Full Blood Count result is ready</p>
          <p className="text-xs text-muted-foreground">Completed Jun 17, 2024 · HealthFirst Laboratories</p>
        </div>
        <Button size="sm" className="flex-shrink-0 gap-1.5" onClick={() => navigate("/patient/results")}>
          View <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Health metrics */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" /> Latest Health Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {healthMetrics.map(m => {
            const cfg = statusIcons[m.status as keyof typeof statusIcons];
            return (
              <Card key={m.label} className={`shadow-card border ${m.status !== "normal" ? "border-warning/30" : ""}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                      <m.icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <Badge variant="outline" className={`text-[10px] px-1.5 ${
                      m.status === "normal" ? "border-success/30 text-success" :
                      m.status === "low" ? "border-warning/30 text-warning" : "border-destructive/30 text-destructive"
                    }`}>
                      {m.status === "normal" ? "Normal" : m.status === "low" ? "Low" : "High"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground/70">{m.unit}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts + upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Glucose trend */}
        <Card className="lg:col-span-3 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Blood Glucose Trend</CardTitle>
                <CardDescription>Last 6 readings · Reference: 3.9–5.6 mmol/L</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs border-success/30 text-success bg-success/5">In Range</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={glucoseTrend} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[4, 8]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v: number) => [`${v} mmol/L`, "Glucose"]}
                />
                {/* Reference zone visualized as line */}
                <Line type="monotone" dataKey="value" stroke="hsl(174 62% 35%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(174 62% 35%)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming appointments */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Upcoming Appointments</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-xs gap-1" onClick={() => navigate("/patient/appointments")}>
                All <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppts.map((appt, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{appt.test}</p>
                  <p className="text-xs text-muted-foreground">{appt.date} · {appt.time}</p>
                  <p className="text-xs text-muted-foreground">{appt.lab}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-center text-muted-foreground">Bring a valid ID on your appointment day</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent results */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Test Results</CardTitle>
              <CardDescription>Your latest laboratory results</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary text-xs gap-1" onClick={() => navigate("/patient/results")}>
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentResults.map(r => (
            <div key={r.id} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate("/patient/results")}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                r.status === "Ready" ? "bg-primary/10" : "bg-muted"
              }`}>
                <FileText className={`w-4 h-4 ${r.status === "Ready" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{r.test}</p>
                  {r.abnormal && (
                    <Badge variant="outline" className="text-[10px] px-1.5 border-warning/30 text-warning bg-warning/5">
                      Attention needed
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className={`text-xs ${
                  r.status === "Ready" ? "border-primary/30 text-primary bg-primary/5" : "border-success/30 text-success"
                }`}>
                  {r.status === "Ready" ? <Clock className="w-3 h-3 mr-1 inline" /> : <CheckCircle className="w-3 h-3 mr-1 inline" />}
                  {r.status}
                </Badge>
                {r.status !== "Ready" && (
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
