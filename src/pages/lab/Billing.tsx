import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ReceiptText, Plus, Search, Download, Printer,
  CheckCircle, Clock, XCircle, DollarSign
} from "lucide-react";
import { patients, transactions } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

type InvoiceStatus = 'Paid' | 'Pending' | 'Partial' | 'Cancelled';

interface InvoiceItem { test: string; price: number; }
interface Invoice {
  id: string; patientId: string; patientName: string;
  items: InvoiceItem[]; total: number; paid: number;
  status: InvoiceStatus; date: string; paymentMethod?: string;
}

const TEST_PRICES: Record<string, number> = {
  'Full Blood Count': 15000, 'Liver Function Test': 35000, 'Malaria Parasite': 8000,
  'Urinalysis': 6000, 'HIV Screening': 18000, 'Blood Glucose': 7500,
  'Hepatitis B': 12000, 'Kidney Function Test': 32000, 'Thyroid Function Test': 45000, 'Lipid Profile': 25000,
};

const TEST_LIST = Object.keys(TEST_PRICES);

const initialInvoices: Invoice[] = [
  { id: 'INV-2024-0891', patientId: 'PAT-001', patientName: 'Amara Okonkwo', items: [{ test: 'Full Blood Count', price: 15000 }], total: 15000, paid: 15000, status: 'Paid', date: '2024-06-17', paymentMethod: 'Card' },
  { id: 'INV-2024-0892', patientId: 'PAT-003', patientName: 'Fatima Bello', items: [{ test: 'Liver Function Test', price: 35000 }, { test: 'Malaria Parasite', price: 8000 }], total: 43000, paid: 0, status: 'Pending', date: '2024-06-17' },
  { id: 'INV-2024-0893', patientId: 'PAT-002', patientName: 'Emeka Chukwu', items: [{ test: 'Malaria Parasite', price: 8000 }], total: 8000, paid: 8000, status: 'Paid', date: '2024-06-17', paymentMethod: 'Cash' },
  { id: 'INV-2024-0894', patientId: 'PAT-004', patientName: 'Tunde Adeyemi', items: [{ test: 'Urinalysis', price: 6000 }], total: 6000, paid: 3000, status: 'Partial', date: '2024-06-17', paymentMethod: 'Cash' },
  { id: 'INV-2024-0895', patientId: 'PAT-010', patientName: 'Oluwaseun Fashola', items: [{ test: 'Kidney Function Test', price: 32000 }, { test: 'Blood Glucose', price: 7500 }], total: 39500, paid: 39500, status: 'Paid', date: '2024-06-17', paymentMethod: 'Transfer' },
];

const statusIcon = (s: InvoiceStatus) => {
  if (s === 'Paid') return <CheckCircle className="w-3.5 h-3.5 text-success" />;
  if (s === 'Pending') return <Clock className="w-3.5 h-3.5 text-warning" />;
  if (s === 'Partial') return <DollarSign className="w-3.5 h-3.5 text-info" />;
  return <XCircle className="w-3.5 h-3.5 text-muted-foreground" />;
};

const statusClass: Record<InvoiceStatus, string> = {
  Paid: 'bg-success/15 text-success border-success/30',
  Pending: 'bg-warning/15 text-warning border-warning/30',
  Partial: 'bg-info/15 text-info border-info/30',
  Cancelled: 'bg-muted text-muted-foreground border-border',
};

export default function Billing() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const [form, setForm] = useState({ patientId: '', tests: [''], paymentMethod: '' });

  const selectedTests = form.tests.filter(Boolean);
  const total = selectedTests.reduce((s, t) => s + (TEST_PRICES[t] ?? 0), 0);

  const addTestLine = () => setForm(p => ({ ...p, tests: [...p.tests, ''] }));
  const updateTest = (i: number, val: string) => setForm(p => ({ ...p, tests: p.tests.map((t, idx) => idx === i ? val : t) }));
  const removeTest = (i: number) => setForm(p => ({ ...p, tests: p.tests.filter((_, idx) => idx !== i) }));

  const filtered = invoices.filter(inv => {
    const matchTab = activeTab === 'All' || inv.status === activeTab;
    const matchSearch = inv.patientName.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleCreate = () => {
    if (!form.patientId || selectedTests.length === 0) {
      toast({ title: 'Missing Fields', description: 'Patient and at least one test are required.', variant: 'destructive' });
      return;
    }
    const patient = patients.find(p => p.id === form.patientId);
    const items = selectedTests.map(t => ({ test: t, price: TEST_PRICES[t] ?? 0 }));
    const newInv: Invoice = {
      id: `INV-2024-0${896 + invoices.length}`,
      patientId: form.patientId,
      patientName: patient?.name ?? '',
      items,
      total,
      paid: 0,
      status: 'Pending',
      date: '2024-06-17',
    };
    setInvoices([newInv, ...invoices]);
    setOpen(false);
    setForm({ patientId: '', tests: [''], paymentMethod: '' });
    toast({ title: 'Invoice Created', description: `Invoice ${newInv.id} for ₦${newInv.total.toLocaleString()} created.` });
  };

  const markPaid = (id: string, method: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Paid', paid: inv.total, paymentMethod: method } : inv));
    toast({ title: 'Payment Received', description: `Invoice ${id} marked as paid via ${method}.` });
    setReceiptOpen(false);
  };

  const tabCounts = ['All', 'Paid', 'Pending', 'Partial'].map(t => ({
    t, c: t === 'All' ? invoices.length : invoices.filter(i => i.status === t).length
  }));

  const todayCollected = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.paid, 0);
  const outstanding = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').reduce((s, i) => s + (i.total - i.paid), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Billing & Invoices</h2>
          <p className="text-sm text-muted-foreground">{invoices.length} invoices total</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Create Invoice</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Patient <span className="text-destructive">*</span></Label>
                <Select value={form.patientId} onValueChange={v => setForm(p => ({ ...p, patientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>
                    {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.id})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tests <span className="text-destructive">*</span></Label>
                {form.tests.map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <Select value={t} onValueChange={v => updateTest(i, v)}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Select test" /></SelectTrigger>
                      <SelectContent>
                        {TEST_LIST.map(tl => <SelectItem key={tl} value={tl}>{tl} – ₦{TEST_PRICES[tl].toLocaleString()}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {form.tests.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeTest(i)}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addTestLine} className="gap-1.5 text-xs h-8">
                  <Plus className="w-3 h-3" />Add Test
                </Button>
              </div>
              {total > 0 && (
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Total Amount</span>
                  <span className="text-lg font-bold text-primary">₦{total.toLocaleString()}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={v => setForm(p => ({ ...p, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    {['Cash', 'Card', 'Transfer', 'POS'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Collected Today</p>
          <p className="text-2xl font-bold mt-1 text-success">₦{(todayCollected / 1000).toFixed(0)}k</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className="text-2xl font-bold mt-1 text-destructive">₦{(outstanding / 1000).toFixed(0)}k</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Paid Invoices</p>
          <p className="text-2xl font-bold mt-1 text-primary">{invoices.filter(i => i.status === 'Paid').length}</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Pending Invoices</p>
          <p className="text-2xl font-bold mt-1 text-warning">{invoices.filter(i => i.status === 'Pending' || i.status === 'Partial').length}</p>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by patient name or invoice ID..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

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
                  <TableHead className="pl-6">Invoice ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Tests</TableHead>
                  <TableHead className="hidden sm:table-cell">Total</TableHead>
                  <TableHead className="hidden lg:table-cell">Paid</TableHead>
                  <TableHead className="hidden sm:table-cell">Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No invoices found.</TableCell></TableRow>
                ) : filtered.map(inv => (
                  <TableRow key={inv.id} className="hover:bg-muted/20">
                    <TableCell className="pl-6 font-mono text-xs text-primary">{inv.id}</TableCell>
                    <TableCell className="font-medium text-sm">{inv.patientName}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{inv.items.map(i => i.test).join(', ')}</TableCell>
                    <TableCell className="hidden sm:table-cell font-semibold">₦{inv.total.toLocaleString()}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">₦{inv.paid.toLocaleString()}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {inv.paymentMethod ? <Badge variant="outline" className="text-xs">{inv.paymentMethod}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs border gap-1 ${statusClass[inv.status]}`}>
                        {statusIcon(inv.status)}{inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelectedInvoice(inv); setReceiptOpen(true); }}>
                          <Printer className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        {(inv.status === 'Pending' || inv.status === 'Partial') && (
                          <Button size="sm" className="h-7 text-xs gap-1 bg-success hover:bg-success/90 text-success-foreground"
                            onClick={() => { setSelectedInvoice(inv); setReceiptOpen(true); }}>
                            <DollarSign className="w-3 h-3" />Pay
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment / Receipt dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-primary" />
              {selectedInvoice?.status === 'Paid' ? 'Receipt' : 'Receive Payment'}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-mono text-xs font-medium">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{selectedInvoice.patientName}</span>
                </div>
                <Separator />
                {selectedInvoice.items.map(item => (
                  <div key={item.test} className="flex justify-between">
                    <span className="text-muted-foreground">{item.test}</span>
                    <span>₦{item.price.toLocaleString()}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">₦{selectedInvoice.total.toLocaleString()}</span>
                </div>
                {selectedInvoice.paid > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Paid</span>
                    <span>₦{selectedInvoice.paid.toLocaleString()}</span>
                  </div>
                )}
              </div>
              {selectedInvoice.status !== 'Paid' && (
                <div className="space-y-1.5">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Cash', 'Card', 'Transfer', 'POS'].map(m => (
                      <Button key={m} variant="outline" size="sm" className="h-9"
                        onClick={() => markPaid(selectedInvoice.id, m)}>
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {selectedInvoice.status === 'Paid' && (
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg text-success text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Paid via {selectedInvoice.paymentMethod} on {selectedInvoice.date}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Printer className="w-3.5 h-3.5" />Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
