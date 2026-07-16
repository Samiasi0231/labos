import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ChevronRight } from "lucide-react";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing, registering for, or using the Ezralabs platform ("Service"), you ("User" or "Laboratory") agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not access or use the Service.

These Terms apply to all users of the Service, including laboratory owners, managers, scientists, receptionists, doctors, and any other personnel granted access under a registered laboratory account.

Ezralabs Technologies Ltd. ("Ezralabs", "we", "us", or "our") reserves the right to update or modify these Terms at any time. We will notify registered users of material changes via email. Continued use of the Service after notification constitutes acceptance of the revised Terms.`,
  },
  {
    id: "services",
    title: "2. Description of Services",
    content: `Ezralabs provides a cloud-based laboratory management platform including, but not limited to:
    
• Patient registration and management tools
• Test assignment, tracking, and result entry systems
• Financial and billing management
• Inventory and reagent tracking
• Multi-branch management
• Staff and role-based access management
• Patient and doctor communication portals
• Analytics, reporting, and AI-powered insights
• API access for third-party integrations (Enterprise plan only)

The Service is made available on a subscription basis as described in our Pricing page. Feature availability varies by subscription plan.`,
  },
  {
    id: "accounts",
    title: "3. User Accounts & Registration",
    content: `To access the Service, laboratories must register and create an account by providing accurate, complete, and up-to-date information. You agree to:

• Provide truthful and accurate registration information including laboratory name, owner name, contact details, and address.
• Maintain the security and confidentiality of your account credentials.
• Notify Ezralabs immediately at security@ezralabs.ng of any unauthorized use of your account.
• Accept responsibility for all activities that occur under your account.

Ezralabs reserves the right to suspend or terminate any account that provides false information or violates these Terms. Each subscription may create multiple user accounts based on plan limits. The Laboratory Owner is responsible for all activity under their subscription.`,
  },
  {
    id: "payments",
    title: "4. Payments & Subscriptions",
    content: `Subscription fees are charged as follows:

• Monthly plans are billed at the start of each billing cycle.
• Annual plans are billed upfront and receive a 20% discount over the equivalent monthly rate.
• All fees are listed in Nigerian Naira (₦) and are exclusive of applicable taxes.
• Payment methods accepted include bank transfer, card payment, and USSD.

Free Trial: New accounts receive a 30-day free trial. No payment information is required during the trial. At the end of the trial, you will be prompted to select and pay for a subscription plan to continue access.

Refunds: Subscription fees are non-refundable except where required by applicable law. If you cancel during a billing period, your access continues until the end of that period.

Late Payment: Accounts with outstanding balances may be suspended after 7 days. Data is retained for 30 days after suspension before permanent deletion.`,
  },
  {
    id: "data",
    title: "5. Data Ownership & Patient Privacy",
    content: `All patient data, test data, and laboratory records entered into Ezralabs remain the property of the subscribing laboratory. Ezralabs processes such data solely as a Data Processor on your behalf, in accordance with our Privacy Policy and the Nigeria Data Protection Regulation (NDPR) 2019.

You, as the Laboratory Owner, are the Data Controller responsible for:
• Obtaining patient consent before entering their data into the platform.
• Ensuring your use of the platform complies with NDPR and applicable healthcare regulations.
• Notifying patients of how their data is used and stored.

Ezralabs will not share, sell, or disclose your laboratory's patient data to third parties without your explicit consent, except where required by law. We implement AES-256 encryption at rest and TLS 1.3 in transit for all patient data.`,
  },
  {
    id: "restrictions",
    title: "6. Prohibited Uses",
    content: `You agree NOT to use the Service to:

• Store or transmit fraudulent, inaccurate, or falsified patient or test data.
• Attempt to gain unauthorized access to other accounts or Ezralabs systems.
• Reverse engineer, decompile, or create derivative works of the platform.
• Share account credentials with unauthorized personnel.
• Use the platform for any unlawful purpose or in violation of Nigerian healthcare regulations.
• Overwhelm Ezralabs servers with automated requests (scraping, DDoS, etc.).
• Sublicense, resell, or commercialize access to the platform without written consent.

Violation of these restrictions may result in immediate account termination without refund.`,
  },
  {
    id: "uptime",
    title: "7. Service Availability & SLA",
    content: `Ezralabs targets the following uptime service levels based on subscription plan:

• Basic: 99% uptime (approximately 7.3 hours downtime/month maximum)
• Pro: 99.5% uptime (approximately 3.6 hours downtime/month maximum)
• Enterprise: 99.9% uptime (approximately 44 minutes downtime/month maximum)

Scheduled maintenance windows are typically announced 48 hours in advance and do not count against SLA calculations. In the event of SLA breach, Enterprise customers are eligible for service credits as outlined in their Service Agreement.`,
  },
  {
    id: "disclaimers",
    title: "8. Disclaimers & Limitation of Liability",
    content: `Ezralabs provides the platform as a management and administrative tool. It is NOT a diagnostic tool and does not provide medical advice. All clinical decisions, interpretations, and result approvals remain the sole responsibility of qualified medical personnel at your laboratory.

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
• Ezralabs provides the Service "as is" without warranties of any kind.
• Ezralabs shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
• Our total liability to you shall not exceed the fees paid in the 3 months preceding the claim.`,
  },
  {
    id: "termination",
    title: "9. Termination",
    content: `Either party may terminate this agreement at any time:

• You may cancel your subscription from within your account settings or by contacting support.
• Ezralabs may terminate or suspend access immediately if you violate these Terms, fail to pay subscription fees, or engage in fraudulent activity.

Upon termination, your access to the platform ceases. You have 30 days to export your data. After 30 days, data is permanently deleted unless required to be retained by law.`,
  },
  {
    id: "governing",
    title: "10. Governing Law & Disputes",
    content: `These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from or related to these Terms or the Service shall be subject to the exclusive jurisdiction of courts in Lagos State, Nigeria.

Before initiating legal proceedings, the parties agree to attempt good-faith resolution through direct negotiation for a period of 30 days.

Contact our legal team at: legal@ezralabs.ng`,
  },
];

export default function Terms() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">Legal</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Terms & Conditions</h1>
          <p className="text-white/70 text-lg">Last updated: June 18, 2026 · Effective: June 18, 2026</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* TOC Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-card">
                <CardContent className="pt-5 pb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contents</p>
                  <nav className="space-y-1">
                    {sections.map(s => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                      >
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        <span>{s.title}</span>
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-10">
            <div className="flex items-start gap-3 p-5 bg-muted/30 rounded-xl border border-border">
              <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-1">Please read these Terms carefully</p>
                <p className="text-sm text-muted-foreground">These Terms & Conditions govern your use of the Ezralabs platform. By registering or using the Service, you agree to be bound by them. If you have questions, contact us at <a href="mailto:legal@ezralabs.ng" className="text-primary hover:underline">legal@ezralabs.ng</a>.</p>
              </div>
            </div>

            {sections.map(section => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl font-bold mb-4 text-foreground">{section.title}</h2>
                <div className="prose prose-sm max-w-none">
                  {section.content.split("\n\n").map((para, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed mb-3 text-sm whitespace-pre-line">{para}</p>
                  ))}
                </div>
                <div className="h-px bg-border mt-8" />
              </section>
            ))}

            <div className="text-sm text-muted-foreground">
              <p>For questions regarding these Terms, contact Ezralabs Technologies Ltd.:</p>
              <p className="mt-1"><strong>Email:</strong> legal@ezralabs.ng</p>
              <p><strong>Address:</strong> 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
