import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/lab/StatusBadge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Plus, Clock, User, Stethoscope, Phone, CheckCircle, XCircle } from "lucide-react";
import { patients } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

type ApptStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  date: string;
  time: string;
  status: ApptStatus;
  phone: string;
  doctor?: string;
  notes?: string;
}

const initialAppointments: Appointment[] = [
  { id: 'APT-001', patientId: 'PAT-010', patientName: 'Oluwaseun Fashola', testType: 'Full Blood Count', date: '2024-06-17', time: '08:30', status: 'Completed', phone: '+234 810 123 4567' },
  { id: 'APT-002', patientId: 'PAT-007', patientName: 'Chioma Obi', testType: 'HIV Screening', date: '2024-06-17', time: '09:00', status: 'Completed', phone: '+234 807 890 1234' },
  { id: 'APT-003', patientId: 'PAT-008', patientName: 'Musa Ibrahim', testType: 'Kidney Function Test', date: '2024-06-17', time: '09:45', status: 'Confirmed', phone: '+234 808 901 2345' },
  { id: 'APT-004', patientId: 'PAT-004', patientName: 'Tunde Adeyemi', testType: 'Urinalysis', date: '2024-06-17', time: '10:30', status: 'Pending', phone: '+234 804 567 8901' },
  { id: 'APT-005', patientId: 'PAT-009', patientName: 'Aisha Mahmoud', testType: 'Thyroid Function Test', date: '2024-06-17', time: '11:00', status: 'Pending', phone: '+234 809 012 3456' },
  { id: 'APT-006', patientId: 'PAT-006', patientName: 'Biodun Lawal', testType: 'Lipid Profile', date: '2024-06-17', time: '11:30', status: 'Pending', phone: '+234 806 789 0123' },
  { id: 'APT-007', patientId: 'PAT-001', patientName: 'Amara Okonkwo', testType: 'Full Blood Count', date: '2024-06-18', time: '09:00', status: 'Confirmed', phone: '+234 801 234 5678' },
  { id: 'APT-008', patientId: 'PAT-003', patientName: 'Fatima Bello', testType: 'Liver Function Test', date: '2024-06-18', time: '10:00', status: 'Pending', phone: '+234 803 456 7890' },
];

const TEST_TYPES = ['Full Blood Count', 'Liver Function Test', 'Malaria Parasite', 'Urinalysis', 'HIV Screening', 'Blood Glucose', 'Hepatitis B', 'Kidney Function Test', 'Thyroid Function Test', 'Lipid Profile'];
const TIME_SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

const statusColors: Record<ApptStatus, string> = {
  Pending: 'bg-warning/15 text-warning border-warning/30',
  Confirmed: 'bg-info/15 text-info border-info/30',
  Completed: 'bg-success/15 text-success border-success/30',
  Cancelled: 'bg-muted text-muted-foreground border-border',
};

export default function Appointments() {
  const { toast } = useToast();
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [activeTab, setActiveTab] = useState('Today');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: '', testType: '', date: '2024-06-17', time: '', notes: '' });

  const tabs = ['Today', 'Tomorrow', 'All'];
  const filtered = appts.filter(a => {
    if (activeTab === 'Today') return a.date === '2024-06-17';
    if (activeTab === 'Tomorrow') return a.date === '2024-06-18';
    return true;
  });

  const updateStatus = (id: string, status: ApptStatus) => {
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast({ title: 'Status Updated', description: `Appointment marked as ${status}.` });
  };

  const handleBook = () => {
    if (!form.patientId || !form.testType || !form.time) {
      toast({ title: 'Missing Fields', description: 'Patient, test type, and time are required.', variant: 'destructive' });
      return;
    }
    const patient = patients.find(p => p.id === form.patientId);
    const newAppt: Appointment = {
      id: `APT-${String(appts.length + 1).padStart(3, '0')}`,
      patientId: form.patientId,
      patientName: patient?.name ?? '',
      testType: form.testType,
      date: form.date,
      time: form.time,
      status: 'Pending',
      phone: patient?.phone ?? '',
      notes: form.notes,
    };
    setAppts([...appts, newAppt]);
    setOpen(false);
    setForm({ patientId: '', testType: '', date: '2024-06-17', time: '', notes: '' });
    toast({ title: 'Appointment Booked', description: `${newAppt.patientName} scheduled for ${newAppt.date} at ${newAppt.time}.` });
  };

  const tabCounts = tabs.map(tab => ({
    tab,
    count: appts.filter(a => tab === 'Today' ? a.date === '2024-06-17' : tab === 'Tomorrow' ? a.date === '2024-06-18' : true).length
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Appointments</h2>
          <p className="text-sm text-muted-foreground">{appts.filter(a => a.date === '2024-06-17' && a.status === 'Pending').length} pending today</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Schedule Appointment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Schedule Appointment</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Patient <span className="text-destructive">*</span></Label>
                <Select value={form.patientId} onValueChange={v => setForm(p => ({ ...p, patientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Test Type <span className="text-destructive">*</span></Label>
                <Select value={form.testType} onValueChange={v => setForm(p => ({ ...p, testType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select test" /></SelectTrigger>
                  <SelectContent>
                    {TEST_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Time <span className="text-destructive">*</span></Label>
                  <Select value={form.time} onValueChange={v => setForm(p => ({ ...p, time: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Input placeholder="Any special instructions..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleBook}>Book Appointment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Today', val: appts.filter(a => a.date === '2024-06-17').length, color: 'text-foreground' },
          { label: 'Confirmed', val: appts.filter(a => a.date === '2024-06-17' && a.status === 'Confirmed').length, color: 'text-info' },
          { label: 'Pending', val: appts.filter(a => a.date === '2024-06-17' && a.status === 'Pending').length, color: 'text-warning' },
          { label: 'Completed', val: appts.filter(a => a.date === '2024-06-17' && a.status === 'Completed').length, color: 'text-success' },
        ].map(s => (
          <Card key={s.label} className="shadow-card p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs + list */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                {tabCounts.map(({ tab, count }) => (
                  <TabsTrigger key={tab} value={tab} className="gap-2 text-xs">
                    {tab} <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{count}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No appointments found.</div>
          ) : filtered.map(apt => (
            <div key={apt.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              apt.status === 'Completed' ? 'border-border bg-muted/10 opacity-70' :
              apt.status === 'Cancelled' ? 'border-border bg-muted/10 opacity-50' :
              apt.status === 'Confirmed' ? 'border-info/30 bg-info/5' :
              'border-border hover:border-primary/30 hover:bg-muted/20'
            }`}>
              <div className="text-center w-16 flex-shrink-0">
                <p className="text-lg font-bold leading-tight">{apt.time}</p>
                <p className="text-xs text-muted-foreground">{apt.date.slice(5)}</p>
              </div>
              <div className="w-px h-10 bg-border flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{apt.patientName}</p>
                  <Badge variant="outline" className="text-xs">{apt.patientId}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Stethoscope className="w-3 h-3" />{apt.testType}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{apt.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className={`text-xs border ${statusColors[apt.status]}`}>{apt.status}</Badge>
                {apt.status === 'Pending' && (
                  <Button size="sm" className="h-7 text-xs gap-1" onClick={() => updateStatus(apt.id, 'Confirmed')}>
                    <CheckCircle className="w-3 h-3" />Confirm
                  </Button>
                )}
                {apt.status === 'Confirmed' && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-success border-success/30" onClick={() => updateStatus(apt.id, 'Completed')}>
                    <CheckCircle className="w-3 h-3" />Mark Done
                  </Button>
                )}
                {(apt.status === 'Pending' || apt.status === 'Confirmed') && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => updateStatus(apt.id, 'Cancelled')}>
                    <XCircle className="w-3.5 h-3.5" />
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
