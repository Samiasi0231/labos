import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/lab/StatCard";
import { StatusBadge } from "@/components/lab/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList, FlaskConical, CheckCircle, Clock,
  AlertTriangle, ArrowRight, TrendingUp, Zap
} from "lucide-react";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { tests, results } from "@/data/mockData";

const myTests = tests.filter(t => t.assignedTo === 'Dr. Chidi Nwosu');
const myPending = myTests.filter(t => t.status === 'Pending');
const myInProgress = myTests.filter(t => t.status === 'In Progress');
const myCompleted = myTests.filter(t => t.status === 'Completed' || t.status === 'Approved');

const dailyOutput = [
  { day: 'Mon', completed: 8 },
  { day: 'Tue', completed: 12 },
  { day: 'Wed', completed: 9 },
  { day: 'Thu', completed: 15 },
  { day: 'Fri', completed: 11 },
  { day: 'Sat', completed: 14 },
  { day: 'Sun', completed: 6 },
];

const turnaroundData = [
  { name: 'FBC', avg: 45, target: 60 },
  { name: 'LFT', avg: 90, target: 120 },
  { name: 'Malaria', avg: 30, target: 45 },
  { name: 'Urinalysis', avg: 25, target: 30 },
  { name: 'Glucose', avg: 20, target: 30 },
];

const completionRate = Math.round((myCompleted.length / (myTests.length || 1)) * 100);
const radialData = [{ name: 'Completion', value: completionRate, fill: 'hsl(152, 69%, 45%)' }];

export default function ScientistDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="gradient-hero rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Tuesday, June 17, 2024</p>
            <h2 className="text-2xl font-bold mt-1">Good morning, Dr. Nwosu</h2>
            <p className="text-white/70 text-sm mt-1">
              You have <span className="text-white font-semibold">{myPending.length} assigned tests</span> waiting and{' '}
              <span className="text-white font-semibold">{myInProgress.length} in progress</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => navigate('/scientist/assigned')}>
              <ClipboardList className="w-4 h-4 mr-2" />My Tests
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => navigate('/scientist/result-entry')}>
              <FlaskConical className="w-4 h-4 mr-2" />Enter Results
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned to Me" value={myTests.length} subtitle={`${myPending.length} waiting to start`} icon={ClipboardList} variant="info" />
        <StatCard title="In Progress" value={myInProgress.length} subtitle="Currently processing" icon={FlaskConical} trend={0} variant="warning" />
        <StatCard title="Completed Today" value={myCompleted.length} subtitle="Results submitted" icon={CheckCircle} trend={18} variant="success" />
        <StatCard title="Pending Review" value={results.filter(r => r.status === 'Submitted').length} subtitle="Awaiting approval" icon={Clock} variant="default" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily output */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Daily Test Output</CardTitle>
                <CardDescription>Tests completed per day this week</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs gap-1.5">
                <TrendingUp className="w-3 h-3" />+12% vs last week
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyOutput} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 69%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152, 69%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="completed" name="Tests Completed" stroke="hsl(152, 69%, 45%)" strokeWidth={2.5} fill="url(#outGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Gauge */}
        <Card className="shadow-card flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Today's Completion</CardTitle>
            <CardDescription>Assigned vs completed</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <ResponsiveContainer width={160} height={160}>
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="70%" outerRadius="90%"
                  startAngle={180} endAngle={-180}
                  data={radialData}
                  barSize={14}
                >
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'hsl(var(--muted))' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{completionRate}%</span>
                <span className="text-xs text-muted-foreground">completed</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full text-center text-sm">
              <div>
                <p className="font-bold text-warning">{myPending.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="font-bold text-info">{myInProgress.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div>
                <p className="font-bold text-success">{myCompleted.length}</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Turnaround & Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnaround Times */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Turnaround Time</CardTitle>
            <CardDescription>Average minutes vs target per test type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {turnaroundData.map(item => {
              const pct = Math.min((item.avg / item.target) * 100, 100);
              const good = item.avg <= item.target;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${good ? 'text-success' : 'text-destructive'}`}>{item.avg} min</span>
                      <span className="text-muted-foreground text-xs">/ {item.target} target</span>
                    </div>
                  </div>
                  <Progress value={pct} className={`h-2 ${good ? '[&>div]:bg-success' : '[&>div]:bg-destructive'}`} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Priority Queue */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Priority Queue</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-xs gap-1" onClick={() => navigate('/scientist/assigned')}>
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
            <CardDescription>Tests requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {myTests.filter(t => t.status !== 'Approved').slice(0, 5).map((test, idx) => (
              <div key={test.id} className={`flex items-center justify-between py-3 border-b border-border last:border-0 ${test.priority === 'Urgent' ? 'bg-destructive/5 -mx-1 px-1 rounded-lg' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    test.priority === 'Urgent' ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'
                  }`}>
                    {test.priority === 'Urgent' ? <AlertTriangle className="w-3.5 h-3.5" /> : (idx + 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{test.patientName}</p>
                    <p className="text-xs text-muted-foreground">{test.testType} · {test.sampleId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {test.priority === 'Urgent' && (
                    <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
                      <Zap className="w-3 h-3" />Urgent
                    </Badge>
                  )}
                  <StatusBadge status={test.status} />
                </div>
              </div>
            ))}
            {myTests.filter(t => t.status !== 'Approved').length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">All tests completed!</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
