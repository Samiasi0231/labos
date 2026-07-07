import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Building, Users, FlaskConical, DollarSign, Plus, TrendingUp } from "lucide-react";
import { branches } from "@/data/mockData";

const branchCompareData = branches.map(b => ({
  name: b.name.split(' – ')[0].replace(' Branch', ''),
  tests: b.testsThisMonth,
  revenue: Math.round(b.revenue / 1000),
}));

export default function Branches() {
  const totalRevenue = branches.reduce((s, b) => s + b.revenue, 0);
  const totalTests = branches.reduce((s, b) => s + b.testsThisMonth, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Branch Management</h2>
          <p className="text-sm text-muted-foreground">{branches.length} active branches</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" />Add Branch</Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Total Branches</p>
          <p className="text-2xl font-bold mt-1 text-primary">{branches.length}</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Total Staff</p>
          <p className="text-2xl font-bold mt-1">{branches.reduce((s, b) => s + b.staffCount, 0)}</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Tests This Month</p>
          <p className="text-2xl font-bold mt-1 text-info">{totalTests.toLocaleString()}</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Combined Revenue</p>
          <p className="text-2xl font-bold mt-1 text-success">₦{(totalRevenue / 1000000).toFixed(1)}M</p>
        </Card>
      </div>

      {/* Performance chart */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Branch Performance Comparison</CardTitle>
          <CardDescription>Tests conducted and revenue this month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={branchCompareData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${v}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar yAxisId="left" dataKey="tests" name="Tests" fill="hsl(174, 62%, 35%)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue (₦k)" fill="hsl(152, 69%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((branch, idx) => {
          const maxTests = Math.max(...branches.map(b => b.testsThisMonth));
          const pct = (branch.testsThisMonth / maxTests) * 100;
          return (
            <Card key={branch.id} className={`shadow-card hover:shadow-elevated transition-all duration-200 ${idx === 0 ? 'border-primary/30' : ''}`}>
              {idx === 0 && (
                <div className="px-5 pt-4 pb-0">
                  <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                    <TrendingUp className="w-3 h-3" />Top Performing
                  </Badge>
                </div>
              )}
              <CardContent className="pt-4 pb-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm truncate">{branch.name}</h3>
                      <Badge variant="outline" className="text-xs text-success border-success/30">{branch.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{branch.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-muted mx-auto flex items-center justify-center">
                      <FlaskConical className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-bold mt-1.5">{branch.testsThisMonth.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Tests</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-muted mx-auto flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-bold mt-1.5">₦{(branch.revenue / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-muted mx-auto flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-bold mt-1.5">{branch.staffCount}</p>
                    <p className="text-xs text-muted-foreground">Staff</p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Test Volume vs Top Branch</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{branch.manager}</span> · Manager
                  </div>
                  <Button variant="link" className="h-auto py-0 px-0 text-[12px]">Manage</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
