import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, X, ArrowRight, HelpCircle } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "₦50,000",
    period: "/month",
    annualPrice: "₦480,000",
    annualSaving: "Save ₦120,000",
    desc: "Perfect for single-branch diagnostic labs getting started with digital management.",
    color: "border-border",
    badgeColor: "",
    highlighted: false,
    cta: "Start Free Trial",
    ctaPath: "/signup",
  },
  {
    name: "Pro",
    price: "₦120,000",
    period: "/month",
    annualPrice: "₦1,152,000",
    annualSaving: "Save ₦288,000",
    desc: "For growing labs with multiple branches, advanced features, and automation needs.",
    color: "border-primary ring-2 ring-primary/20",
    badgeColor: "bg-primary text-primary-foreground",
    highlighted: true,
    cta: "Start Free Trial",
    ctaPath: "/signup",
  },
  {
    name: "Enterprise",
    price: "₦250,000",
    period: "/month",
    annualPrice: "₦2,400,000",
    annualSaving: "Save ₦600,000",
    desc: "For hospital-grade labs, chains, and enterprises needing custom integrations and SLAs.",
    color: "border-border",
    badgeColor: "",
    highlighted: false,
    cta: "Contact Sales",
    ctaPath: "/contact",
  },
];

type BoolOrString = boolean | "—";

interface Feature {
  feature: string;
  basic: BoolOrString;
  pro: BoolOrString;
  enterprise: BoolOrString;
}

const comparisonTable: { category: string; features: Feature[] }[] = [
  {
    category: "Core Operations",
    features: [
      { feature: "Patient Registration & Management", basic: true, pro: true, enterprise: true },
      { feature: "Test Assignment & Tracking", basic: true, pro: true, enterprise: true },
      { feature: "Result Entry & Approval", basic: true, pro: true, enterprise: true },
      { feature: "Invoice & Receipt Generation", basic: true, pro: true, enterprise: true },
      { feature: "Sample Collection Tracking", basic: true, pro: true, enterprise: true },
    ],
  },
  {
    category: "Branches & Staff",
    features: [
      { feature: "Number of Branches", basic: "2", pro: "5", enterprise: "Unlimited" },
      { feature: "Staff Accounts", basic: "10", pro: "50", enterprise: "Unlimited" },
      { feature: "Role-Based Access Control", basic: true, pro: true, enterprise: true },
      { feature: "Multi-Branch Dashboard", basic: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "Communications",
    features: [
      { feature: "Email Notifications", basic: true, pro: true, enterprise: true },
      { feature: "SMS Notifications", basic: false, pro: true, enterprise: true },
      { feature: "WhatsApp Notifications", basic: false, pro: true, enterprise: true },
      { feature: "Patient Portal Access", basic: false, pro: true, enterprise: true },
      { feature: "Doctor Portal Access", basic: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "Analytics & AI",
    features: [
      { feature: "Basic Reporting", basic: true, pro: true, enterprise: true },
      { feature: "Advanced Analytics Dashboard", basic: false, pro: true, enterprise: true },
      { feature: "AI-Powered Insights", basic: false, pro: true, enterprise: true },
      { feature: "Revenue Forecasting", basic: false, pro: false, enterprise: true },
      { feature: "Custom Report Builder", basic: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Technical & Support",
    features: [
      { feature: "API Access", basic: false, pro: false, enterprise: true },
      { feature: "Custom Integrations (HIS/EMR)", basic: false, pro: false, enterprise: true },
      { feature: "Data Export (CSV/Excel/PDF)", basic: true, pro: true, enterprise: true },
      { feature: "Support Level", basic: "Email", pro: "Priority Email + Chat", enterprise: "Dedicated Account Manager" },
      { feature: "SLA Uptime Guarantee", basic: "99%", pro: "99.5%", enterprise: "99.9%" },
      { feature: "Onboarding Assistance", basic: "Self-serve", pro: "Guided Setup", enterprise: "White-glove Onboarding" },
    ],
  },
];

const faq = [
  { q: "Is there a free trial?", a: "Yes! All plans include a 30-day free trial. No credit card is required to start. You'll only be billed after the trial period ends if you choose to continue." },
  { q: "Can I change my plan later?", a: "Absolutely. You can upgrade or downgrade your plan at any time from within your account settings. Billing is prorated for mid-cycle changes." },
  { q: "How is payment collected?", a: "We accept bank transfer, card payment, and USSD. Monthly and annual billing cycles are both available. Annual plans come with up to 20% discount." },
  { q: "Is my patient data safe?", a: "Yes. LabOS is fully NDPR-compliant. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We never share patient data with third parties." },
  { q: "Can I add branches later?", a: "Yes. You can add branches to your existing plan at any time. Branch limits apply per subscription tier — upgrading your plan expands your branch allowance." },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  const renderCell = (val: BoolOrString) => {
    if (val === true) return <CheckCircle className="w-5 h-5 text-success mx-auto" />;
    if (val === false) return <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
    return <span className="text-sm font-medium">{val}</span>;
  };

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">Flexible Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5">Simple, transparent pricing</h1>
          <p className="text-lg text-white/70">Start free for 30 days. No hidden fees. Cancel anytime.</p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!annual ? "text-white" : "text-white/50"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`w-12 h-6 rounded-full transition-colors relative ${annual ? "bg-accent" : "bg-white/30"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${annual ? "left-6" : "left-0.5"}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-white" : "text-white/50"}`}>Annual <span className="ml-1 text-accent font-bold">Save 20%</span></span>
          </div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <Card key={plan.name} className={`relative shadow-card overflow-hidden ${plan.color}`}>
              {plan.highlighted && <div className="absolute top-0 inset-x-0 h-1 gradient-primary" />}
              <CardContent className="pt-7 pb-7">
                {plan.highlighted && <Badge className="mb-3 bg-primary/10 text-primary border-primary/30 text-xs">Most Popular</Badge>}
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-primary" : ""}`}>
                      {annual ? plan.annualPrice : plan.price}
                    </span>
                    {!annual && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  {annual && <p className="text-xs text-success mt-1 font-medium">{plan.annualSaving} with annual billing</p>}
                </div>
                <Button asChild className="w-full mb-6" variant={plan.highlighted ? "default" : "outline"} size="lg">
                  <Link to={plan.ctaPath}>{plan.cta}</Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center">30-day free trial · No credit card needed</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-muted/20 py-16 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">Feature Comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-border shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Basic</th>
                  <th className="text-center p-4 font-semibold text-primary">Pro</th>
                  <th className="text-center p-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map(group => (
                  <>
                    <tr key={group.category} className="bg-primary/5">
                      <td colSpan={4} className="px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wider">{group.category}</td>
                    </tr>
                    {group.features.map((row, i) => (
                      <tr key={row.feature} className={`border-b border-border ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="p-4 text-muted-foreground">{row.feature}</td>
                        <td className="p-4 text-center">{renderCell(row.basic)}</td>
                        <td className="p-4 text-center bg-primary/5">{renderCell(row.pro)}</td>
                        <td className="p-4 text-center">{renderCell(row.enterprise)}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faq.map(item => (
            <div key={item.q} className="border border-border rounded-xl p-5">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-2">{item.q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-3">Not sure which plan is right for you?</h2>
          <p className="text-white/70 mb-8">Talk to our team — we'll recommend the best plan for your lab's size and workflow.</p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold gap-2" asChild>
              <Link to="/signup">Start Free Trial <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" asChild>
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
