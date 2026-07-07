import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, FlaskConical, FileText, DollarSign, Package, GitBranch,
  Stethoscope, BarChart3, Shield, MessageSquare, Bell, Globe,
  Zap, Clock, CheckCircle, ArrowRight, Brain, Code2, UserSquare,
  Smartphone, Printer, Upload, Lock
} from "lucide-react";

const modules = [
  {
    category: "Patient & Test Management",
    color: "bg-primary",
    icon: Users,
    features: [
      { icon: Users, title: "Patient Registration", desc: "Comprehensive patient profiles with demographics, medical history, emergency contacts, and photo capture." },
      { icon: FlaskConical, title: "Test Assignment", desc: "Quickly assign single or panel tests to patients with automatic pricing, turnaround time estimation, and queue management." },
      { icon: Stethoscope, title: "Doctor Referrals", desc: "Manage referring doctor network with portal access controls, so doctors can view their patients' results directly." },
      { icon: Printer, title: "Report Generation", desc: "Professional branded PDF reports with laboratory header, patient info, results, and doctor's interpretation." },
    ],
  },
  {
    category: "Scientific Workflow",
    color: "bg-accent",
    icon: FlaskConical,
    features: [
      { icon: FileText, title: "Structured Result Entry", desc: "Dynamic parameter forms per test type (FBC, LFT, KFT, etc.) with male/female reference ranges pre-loaded." },
      { icon: CheckCircle, title: "Quality Control", desc: "Multi-level approval workflow: Scientist enters → Pathologist reviews → Lab Manager approves → Result released." },
      { icon: Clock, title: "Turnaround Monitoring", desc: "Real-time TAT tracking per test with SLA alerts when processing exceeds expected timeframes." },
      { icon: Upload, title: "Bulk Result Upload", desc: "Import analyzer output directly — supports major analyzer protocols for seamless integration." },
    ],
  },
  {
    category: "Finance & Billing",
    color: "bg-success",
    icon: DollarSign,
    features: [
      { icon: DollarSign, title: "Invoice & Receipts", desc: "Generate professional invoices on test assignment with itemised billing, discounts, and tax calculations." },
      { icon: BarChart3, title: "Revenue Analytics", desc: "Daily, weekly, and monthly revenue dashboards with test-type breakdown, branch comparison, and trend charts." },
      { icon: CheckCircle, title: "Multi-Payment Support", desc: "Accept Cash, Card (POS), Bank Transfer, USSD, and HMO/Insurance payments with payment status tracking." },
      { icon: FileText, title: "Financial Reports", desc: "Export income statements, outstanding balances, and reconciliation reports for accounting and auditing." },
    ],
  },
  {
    category: "Operations & Inventory",
    color: "bg-warning",
    icon: Package,
    features: [
      { icon: Package, title: "Reagent Tracking", desc: "Monitor reagents, consumables, and equipment with real-time stock levels, expiry dates, and low-stock alerts." },
      { icon: UserSquare, title: "Staff Management", desc: "Employee profiles, role assignment, shift scheduling, and performance tracking for every team member." },
      { icon: GitBranch, title: "Branch Management", desc: "Operate multiple laboratory branches with consolidated reporting, inter-branch comparison, and central control." },
      { icon: Clock, title: "Sample Collection", desc: "Log sample collection details — container type, volume, condition, barcode — with status tracking to result." },
    ],
  },
  {
    category: "Communication & Notifications",
    color: "bg-info",
    icon: MessageSquare,
    features: [
      { icon: MessageSquare, title: "WhatsApp Notifications", desc: "Automatically send result-ready notifications directly to patient's WhatsApp with a secure PDF download link." },
      { icon: Bell, title: "SMS Alerts", desc: "SMS notifications for appointment reminders, result availability, and critical value alerts to doctors." },
      { icon: Smartphone, title: "Patient Portal", desc: "Patient-facing web portal to view results, appointment history, and download lab reports at any time." },
      { icon: Globe, title: "Doctor Portal", desc: "Dedicated web access for referring doctors to view their patients' results and track pending requests." },
    ],
  },
  {
    category: "AI & Advanced Analytics",
    color: "bg-primary",
    icon: Brain,
    features: [
      { icon: Brain, title: "AI-Powered Insights", desc: "Predictive analytics for patient volume, reagent depletion, and revenue forecasting using historical data." },
      { icon: BarChart3, title: "Business Intelligence", desc: "Comprehensive dashboards with 30+ metrics covering tests, revenue, staff performance, and patient trends." },
      { icon: Code2, title: "API Access", desc: "RESTful API for integrating LabOS with HIS, EMR, telehealth platforms, and custom hospital systems." },
      { icon: Shield, title: "Security & Compliance", desc: "NDPR-compliant data handling, AES-256 encryption, audit logs, IP whitelisting, and MFA enforcement." },
    ],
  },
];

export default function Features() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">Complete Feature Suite</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5">Every tool your lab needs</h1>
          <p className="text-lg text-white/70 leading-relaxed">
            LabOS is not just software — it's a complete laboratory operating system. Explore every module built to cover your entire diagnostic workflow.
          </p>
        </div>
      </section>

      {/* Modules */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {modules.map((mod, idx) => (
          <section key={mod.category}>
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 rounded-xl ${mod.color}/10 flex items-center justify-center`}>
                <mod.icon className={`w-5 h-5 text-${mod.color.replace("bg-", "")}`} />
              </div>
              <div>
                <Badge variant="outline" className="text-xs mb-1">{`0${idx + 1}`}</Badge>
                <h2 className="text-2xl font-bold">{mod.category}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {mod.features.map(f => (
                <Card key={f.title} className="shadow-card border hover:border-primary/20 transition-colors group">
                  <CardContent className="pt-5 pb-5">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                      <f.icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="bg-muted/30 border-t border-border py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-3">Ready to see it in action?</h2>
          <p className="text-muted-foreground mb-8">Start your free 30-day trial today. No credit card, no setup fees.</p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link to="/signup">Start Free Trial <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">Request Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
