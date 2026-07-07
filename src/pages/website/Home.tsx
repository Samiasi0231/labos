import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Users, FlaskConical, FileText, DollarSign,
  Package, GitBranch, Shield, Zap, CheckCircle, Star,
  BarChart3, Clock, Globe, ChevronRight
} from "lucide-react";

const stats = [
  { value: "500+", label: "Labs Onboarded" },
  { value: "2M+", label: "Tests Processed" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "7", label: "User Roles Supported" },
];

const features = [
  { icon: Users, title: "Patient Management", desc: "Register, search, and track patients with complete medical history and test records.", color: "bg-primary/10 text-primary" },
  { icon: FlaskConical, title: "Intelligent Test Results", desc: "Structured parameter entry with reference ranges, abnormal flagging, and one-click approvals.", color: "bg-accent/10 text-accent" },
  { icon: DollarSign, title: "Finance & Billing", desc: "Generate invoices, track payments, manage receipts, and view revenue analytics in real time.", color: "bg-success/10 text-success" },
  { icon: Package, title: "Inventory Control", desc: "Monitor reagents and consumables with low-stock alerts and expiry tracking.", color: "bg-warning/10 text-warning" },
  { icon: GitBranch, title: "Multi-Branch Support", desc: "Manage multiple laboratory branches from a single platform with consolidated reporting.", color: "bg-info/10 text-info" },
  { icon: BarChart3, title: "AI-Powered Insights", desc: "Predictive analytics, turnaround monitoring, and intelligent workflow recommendations.", color: "bg-primary/10 text-primary" },
];

const steps = [
  { step: "01", title: "Register Your Lab", desc: "Sign up in minutes with your lab's details. Choose your subscription plan and get instant access." },
  { step: "02", title: "Configure & Onboard", desc: "Set up your test catalog, staff accounts, branches, and notification preferences through an intuitive wizard." },
  { step: "03", title: "Go Live & Scale", desc: "Start processing tests, generating results, and serving patients from day one. Scale as you grow." },
];

const testimonials = [
  {
    name: "Dr. Adaeze Okonkwo", role: "Medical Director", lab: "HealthFirst Diagnostics, Lagos",
    quote: "LabOS transformed how we operate. Results that used to take 3 days now go out in hours. Our patients love the WhatsApp notifications.",
    rating: 5,
  },
  {
    name: "Engr. Bello Musa", role: "Lab Owner", lab: "BioChem Diagnostics, Abuja",
    quote: "The finance and inventory modules alone saved us ₦2M in the first quarter. The multi-branch view is exactly what we needed.",
    rating: 5,
  },
  {
    name: "Mrs. Chioma Eze", role: "Lab Manager", lab: "Precision Labs, Port Harcourt",
    quote: "Managing 4 branches used to be a nightmare. With LabOS, I have a real-time view of everything from my phone.",
    rating: 5,
  },
];

const plans = [
  { name: "Basic", price: "₦50,000", period: "/month", features: ["Up to 2 branches", "500 patients/month", "Core modules", "Email support"], cta: "Start Free Trial", highlighted: false },
  { name: "Pro", price: "₦120,000", period: "/month", features: ["Up to 5 branches", "Unlimited patients", "All modules + AI", "Priority support", "WhatsApp notifications"], cta: "Most Popular", highlighted: true },
  { name: "Enterprise", price: "₦250,000", period: "/month", features: ["Unlimited branches", "Unlimited patients", "Custom integrations", "Dedicated support", "SLA guarantee", "API access"], cta: "Contact Sales", highlighted: false },
];

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/20 px-4 py-1.5 text-sm">
            Trusted by 500+ Laboratories in Nigeria
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
            Nigeria's Smartest{" "}
            <span className="text-accent">Laboratory</span>{" "}
            Management System
          </h1>
          <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
            Streamline patient management, test processing, result delivery, and business operations — all in one powerful platform built for modern diagnostic labs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold gap-2 shadow-xl px-8" asChild>
              <Link to="/signup">Start Free 30-Day Trial <ArrowRight className="w-5 h-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8 gap-2" asChild>
              <Link to="/features">Explore Features <ChevronRight className="w-5 h-5" /></Link>
            </Button>
          </div>
          <p className="text-white/50 text-sm mt-6">No credit card required · Setup in 10 minutes · Cancel anytime</p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">Everything You Need</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for every role in your lab</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From the lab owner to the receptionist, LabOS has purpose-built tools for every member of your team.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <Card key={f.title} className="shadow-card hover:shadow-elegant transition-shadow border hover:border-primary/20 group">
                <CardContent className="pt-6 pb-6">
                  <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild className="gap-2">
              <Link to="/features">View All Features <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">Simple Onboarding</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get up and running in 3 steps</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">No technical expertise required. Our onboarding wizard guides you through every step.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-border" />
            {steps.map((s, i) => (
              <div key={s.step} className="text-center relative">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <span className="text-2xl font-extrabold text-white">{s.step}</span>
                </div>
                <h3 className="font-bold text-xl mb-3">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">Real Results</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by labs across Nigeria</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <Card key={t.name} className="shadow-card border hover:border-primary/20 transition-colors">
                <CardContent className="pt-6 pb-6 space-y-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} · {t.lab}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">Flexible Plans</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Start free for 30 days. No credit card required. Upgrade anytime as your lab grows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map(plan => (
              <Card key={plan.name} className={`shadow-card relative overflow-hidden ${plan.highlighted ? "border-primary ring-2 ring-primary/20" : "border"}`}>
                {plan.highlighted && (
                  <div className="absolute top-0 inset-x-0 h-1 gradient-primary" />
                )}
                <CardContent className="pt-6 pb-6">
                  {plan.highlighted && (
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 text-xs">Most Popular</Badge>
                  )}
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className={`text-3xl font-extrabold ${plan.highlighted ? "text-primary" : "text-foreground"}`}>{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                    <Link to={plan.name === "Enterprise" ? "/contact" : "/signup"}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center mt-8">
            <Link to="/pricing" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
              Compare all plans <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="py-12 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
            {[
              { icon: Shield, text: "NDPR Compliant" },
              { icon: Zap, text: "99.9% Uptime SLA" },
              { icon: Globe, text: "Pan-Nigeria Coverage" },
              { icon: Clock, text: "24/7 Support" },
              { icon: CheckCircle, text: "ISO 27001 Ready" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="gradient-hero py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your laboratory?</h2>
          <p className="text-white/70 text-lg mb-10">Join 500+ laboratories already running smarter with LabOS. Get started today — no credit card needed.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold gap-2 px-8 shadow-xl" asChild>
              <Link to="/signup">Create Free Account <ArrowRight className="w-5 h-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8" asChild>
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
