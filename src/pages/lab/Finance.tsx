import { StatCard } from "@/components/lab/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import { transactions, monthlyRevenueData } from "@/data/mockData";
import { useState } from "react";

const testRevenue = [
  { name: 'Full Blood Count', value: 1260000 },
  { name: 'Liver Function', value: 855000 },
  { name: 'Malaria', value: 390000 },
  { name: 'Urinalysis', value: 487200 },
  { name: 'Glucose', value: 396800 },
  { name: 'Others', value: 960000 },
];

const COLORS = ['hsl(174,62%,35%)', 'hsl(152,69%,45%)', 'hsl(199,89%,48%)', 'hsl(38,92%,50%)', 'hsl(270,60%,55%)', 'hsl(0,72%,55%)'];

export default function Finance() {
  const [period, setPeriod] = useState("6months");

  const totalRevenue = monthlyRevenueData.reduce((s, d) => s + d.revenue, 0);
  const totalExpenses = monthlyRevenueData.reduce((s, d) => s + d.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  const todayRevenue = transactions.filter(t => t.type === 'Revenue' && t.date === '2024-06-17').reduce((s, t) => s + t.amount, 0);
  const todayExpenses = transactions.filter(t => t.type === 'Expense' && t.date === '2024-06-17').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Finance</h2>
          <p className="text-sm text-muted-foreground">Revenue and expense tracking</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Revenue" value={`₦${(todayRevenue / 1000).toFixed(0)}k`} icon={DollarSign} trend={24} variant="success" trendLabel="vs yesterday" />
        <StatCard title="Today's Expenses" value={`₦${(todayExpenses / 1000).toFixed(0)}k`} icon={ArrowDownRight} trend={-5} variant="destructive" trendLabel="vs yesterday" />
        <StatCard title="Monthly Revenue" value={`₦${(totalRevenue / 1000000).toFixed(1)}M`} icon={TrendingUp} trend={9} variant="info" trendLabel="6-month total" />
        <StatCard title="Net Profit" value={`₦${(netProfit / 1000000).toFixed(1)}M`} subtitle={`${profitMargin}% margin`} icon={TrendingDown} trend={12} variant="primary" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Revenue vs Expenses</CardTitle>
            <CardDescription>6-month financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 62%, 35%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(174, 62%, 35%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: number) => [`₦${v.toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(174, 62%, 35%)" strokeWidth={2.5} fill="url(#revGrad2)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="hsl(0, 72%, 55%)" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Revenue by Test</CardTitle>
            <CardDescription>Top performing tests</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={testRevenue} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {testRevenue.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: number) => [`₦${v.toLocaleString()}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {testRevenue.slice(0, 4).map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                  </div>
                  <span className="font-medium">₦{(item.value / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
            <Badge variant="outline" className="text-xs">{transactions.length} transactions</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(txn => (
                  <TableRow key={txn.id} className="hover:bg-muted/20">
                    <TableCell className="pl-6 font-mono text-xs text-muted-foreground">{txn.reference}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          txn.type === 'Revenue' ? 'bg-success/15' : 'bg-destructive/15'
                        }`}>
                          {txn.type === 'Revenue'
                            ? <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                            : <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                          }
                        </div>
                        <span className="text-sm">{txn.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">{txn.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{txn.date}</TableCell>
                    <TableCell className={`text-right pr-6 font-semibold ${
                      txn.type === 'Revenue' ? 'text-success' : 'text-destructive'
                    }`}>
                      {txn.type === 'Revenue' ? '+' : '-'}₦{txn.amount.toLocaleString()}
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
