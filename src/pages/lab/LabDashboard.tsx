import { useState } from "react";
import { StatCard } from "@/components/lab/StatCard";
import { StatusBadge } from "@/components/lab/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, FlaskConical, Clock, Package, Users,
  Plus, ArrowRight, Activity, CheckCircle, AlertTriangle
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { revenueChartData, testsByTypeData, activities, tests, patients } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

export default function LabDashboard() {
  const navigate = useNavigate();

  const pendingTests = tests.filter(t => t.status === 'Pending').length;
  const inProgressTests = tests.filter(t => t.status === 'In Progress').length;
  const todayRevenue = revenueChartData[revenueChartData.length - 1].revenue;
  const todayTests = revenueChartData[revenueChartData.length - 1].tests;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="gradient-hero rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Tuesday, June 17, 2024</p>
            <h2 className="text-2xl font-bold mt-1">Good morning, Dr. Okafor</h2>
            <p className="text-white/70 text-sm mt-1">
              You have <span className="text-white font-semibold">{pendingTests} pending tests</span> and{' '}
              <span className="text-white font-semibold">{inProgressTests} in progress</span> today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => navigate('/lab/register')}>
              <Plus className="w-4 h-4 mr-2" />Register Patient
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => navigate('/lab/tests')}>
              <FlaskConical className="w-4 h-4 mr-2" />New Test
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`₦${(todayRevenue / 1000).toFixed(0)}k`}
          subtitle="vs ₦385k yesterday"
          icon={DollarSign}
          trend={32}
          variant="success"
        />
        <StatCard
          title="Tests Today"
          value={todayTests}
          subtitle="22 completed"
          icon={FlaskConical}
          trend={14}
          variant="info"
        />
        <StatCard
          title="Pending Results"
          value={pendingTests + inProgressTests}
          subtitle={`${pendingTests} pending, ${inProgressTests} in progress`}
          icon={Clock}
          trend={-8}
          variant="warning"
        />
        <StatCard
          title="Low Stock Items"
          value={3}
          subtitle="Reagents need reorder"
          icon={Package}
          trend={undefined}
          variant="destructive"
        />
        <StatCard
          title="Active Staff"
          value={5}
          subtitle="1 on leave"
          icon={Users}
          trend={undefined}
          variant="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Revenue & Tests (Last 7 Days)</CardTitle>
                <CardDescription>Daily revenue and test volume</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">This Week</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 62%, 35%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(174, 62%, 35%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: number) => [`₦${v.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(174, 62%, 35%)" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tests by Type */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Tests by Type</CardTitle>
            <CardDescription>This month's breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={testsByTypeData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="hsl(152, 69%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  act.type === 'result' ? 'bg-success' :
                  act.type === 'patient' ? 'bg-primary' :
                  act.type === 'payment' ? 'bg-accent' :
                  act.type === 'test' ? 'bg-info' : 'bg-muted-foreground'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{act.user}</span>{' '}
                    <span className="text-muted-foreground">{act.action}</span>{' '}
                    <span className="font-medium">{act.subject}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Tests */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Today's Tests</CardTitle>
              <Button variant="link" className="h-auto py-0 px-0 text-[12px] gap-1" onClick={() => navigate('/lab/tests')}>
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {tests.slice(0, 5).map((test) => (
              <div key={test.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    test.priority === 'Urgent' ? 'bg-destructive/15' : 'bg-muted'
                  }`}>
                    {test.priority === 'Urgent'
                      ? <AlertTriangle className="w-4 h-4 text-destructive" />
                      : <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{test.patientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{test.testType}</p>
                  </div>
                </div>
                <StatusBadge status={test.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
