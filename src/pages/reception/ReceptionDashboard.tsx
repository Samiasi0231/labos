import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/lab/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/lab/StatusBadge";
import {
  Users, DollarSign, CalendarDays, TestTube,
  UserPlus, ReceiptText, ArrowRight, Clock, CheckCircle, AlertCircle
} from "lucide-react";
import { patients, transactions, tests } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const todayAppointments = [
  { id: 'APT-001', patient: 'Oluwaseun Fashola', type: 'Blood Test', time: '08:30', status: 'Completed' as const },
  { id: 'APT-002', patient: 'Chioma Obi', type: 'HIV Screening', time: '09:00', status: 'Completed' as const },
  { id: 'APT-003', patient: 'Musa Ibrahim', type: 'Urinalysis', time: '09:45', status: 'In Progress' as const },
  { id: 'APT-004', patient: 'New Patient', type: 'Full Blood Count', time: '10:30', status: 'Pending' as const },
  { id: 'APT-005', patient: 'Aisha Mahmoud', type: 'Thyroid Test', time: '11:00', status: 'Pending' as const },
  { id: 'APT-006', patient: 'Tunde Adeyemi', type: 'Lipid Profile', time: '11:30', status: 'Pending' as const },
];

const hourlyTraffic = [
  { hour: '8am', patients: 4 },
  { hour: '9am', patients: 8 },
  { hour: '10am', patients: 6 },
  { hour: '11am', patients: 10 },
  { hour: '12pm', patients: 5 },
  { hour: '1pm', patients: 3 },
  { hour: '2pm', patients: 7 },
  { hour: '3pm', patients: 9 },
  { hour: '4pm', patients: 4 },
];

const todayRevenue = transactions.filter(t => t.type === 'Revenue' && t.date === '2024-06-17').reduce((s, t) => s + t.amount, 0);

export default function ReceptionDashboard() {
  const navigate = useNavigate();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="gradient-hero rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Tuesday, June 17, 2024 · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <h2 className="text-2xl font-bold mt-1">{greeting}, Kemi</h2>
            <p className="text-white/70 text-sm mt-1">
              <span className="text-white font-semibold">{todayAppointments.filter(a => a.status === 'Pending').length} patients</span> waiting ·{' '}
              <span className="text-white font-semibold">{todayAppointments.filter(a => a.status === 'Completed').length} seen</span> today
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => navigate('/reception/register')}>
              <UserPlus className="w-4 h-4 mr-2" />New Patient
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => navigate('/reception/billing')}>
              <ReceiptText className="w-4 h-4 mr-2" />Create Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Today's Revenue" value={`₦${(todayRevenue / 1000).toFixed(0)}k`} icon={DollarSign} trend={24} variant="success" trendLabel="vs yesterday" />
        <StatCard title="Patients Today" value={todayAppointments.length} subtitle={`${todayAppointments.filter(a => a.status === 'Completed').length} completed`} icon={Users} trend={12} variant="info" />
        <StatCard title="Appointments" value={todayAppointments.filter(a => a.status === 'Pending').length} subtitle="Pending today" icon={CalendarDays} variant="warning" />
        <StatCard title="Samples Collected" value={8} subtitle="Today" icon={TestTube} trend={5} variant="primary" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Today's schedule */}
        <Card className="lg:col-span-3 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Today's Schedule</CardTitle>
                <CardDescription>Appointment timeline for June 17</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary text-xs gap-1" onClick={() => navigate('/reception/appointments')}>
                Manage <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {todayAppointments.map(apt => (
              <div key={apt.id} className={`flex items-center gap-4 py-3 px-3 rounded-xl border transition-colors ${
                apt.status === 'In Progress' ? 'border-primary/30 bg-primary/5' :
                apt.status === 'Completed' ? 'border-border bg-muted/20' : 'border-border hover:bg-muted/20'
              }`}>
                <div className="text-center w-14 flex-shrink-0">
                  <p className={`text-sm font-bold ${apt.status === 'Completed' ? 'text-muted-foreground' : 'text-foreground'}`}>{apt.time}</p>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  apt.status === 'Completed' ? 'bg-success' :
                  apt.status === 'In Progress' ? 'bg-primary animate-pulse-glow' : 'bg-border'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${apt.status === 'Completed' ? 'line-through text-muted-foreground' : ''}`}>{apt.patient}</p>
                  <p className="text-xs text-muted-foreground">{apt.type}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {apt.status === 'Completed' && <CheckCircle className="w-4 h-4 text-success" />}
                  {apt.status === 'In Progress' && <Clock className="w-4 h-4 text-primary" />}
                  {apt.status === 'Pending' && <AlertCircle className="w-4 h-4 text-muted-foreground/40" />}
                  <StatusBadge status={apt.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hourly traffic */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Patient Traffic</CardTitle>
              <CardDescription>Hourly walk-ins today</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={hourlyTraffic} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="patients" fill="hsl(174, 62%, 35%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: 'Register Patient', icon: UserPlus, path: '/reception/register', variant: 'default' as const },
                { label: 'Schedule Appt', icon: CalendarDays, path: '/reception/appointments', variant: 'outline' as const },
                { label: 'Create Invoice', icon: ReceiptText, path: '/reception/billing', variant: 'outline' as const },
                { label: 'Log Sample', icon: TestTube, path: '/reception/samples', variant: 'outline' as const },
              ].map(action => (
                <Button key={action.label} variant={action.variant} className="h-14 flex-col gap-1.5 text-xs" onClick={() => navigate(action.path)}>
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recent patients */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Registrations</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {patients.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.id} · {p.registeredAt}</p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">{p.gender}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
