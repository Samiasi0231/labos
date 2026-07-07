import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ChevronRight } from "lucide-react";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: `LabOS Technologies Ltd. ("LabOS", "we", "us") is committed to protecting the privacy and security of all personal data processed through the LabOS platform. This Privacy Policy explains how we collect, use, store, and protect personal data in accordance with the Nigeria Data Protection Regulation (NDPR) 2019 and other applicable laws.

This policy applies to:
• Laboratory staff, owners, and administrators using the LabOS platform
• Patients whose data is entered by registered laboratories
• Visitors to our website (labos.ng)
• Doctors and other professionals with portal access

By using the Service, you acknowledge that you have read and understood this Privacy Policy.`,
  },
  {
    id: "data-collected",
    title: "2. Data We Collect",
    content: `We collect the following categories of personal data:

Account & Lab Data:
• Laboratory name, address, state, and contact information
• Laboratory owner name, email address, and phone number
• Staff member names, roles, and email addresses
• Subscription and billing information (excluding card numbers, which are handled by payment processors)

Patient Data (processed on behalf of laboratories):
• Patient name, date of birth, gender, and contact information
• Medical history and clinical notes
• Test requests, results, and laboratory reports
• Emergency contact details

Usage Data:
• Log data (IP addresses, browser type, pages visited, timestamps)
• Feature usage analytics (aggregated and anonymised)
• Error and performance monitoring data

We do NOT collect:
• Payment card numbers (handled securely by our payment processor)
• Biometric data
• Social media credentials`,
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Data",
    content: `We process personal data for the following purposes:

Provision of Service:
• To operate, maintain, and improve the LabOS platform
• To process test requests, generate results, and deliver reports
• To send result-ready notifications via email, SMS, or WhatsApp (as configured)

Account Management:
• To manage your subscription and billing
• To verify identity and authenticate users
• To respond to support requests

Communications:
• To send service announcements and product updates
• To respond to inquiries submitted through our website

Analytics & Improvement:
• To analyse aggregated, anonymised usage patterns to improve the platform
• To monitor system performance and detect security threats

Legal Compliance:
• To comply with applicable Nigerian laws and regulatory obligations
• To respond to lawful requests from law enforcement or regulatory authorities

We do NOT use patient data for marketing, advertising, or any purpose other than operating the Service on your behalf.`,
  },
  {
    id: "storage",
    title: "4. Data Storage & Security",
    content: `All data processed through LabOS is stored on secure cloud infrastructure within or accessible from Nigeria. We implement the following security measures:

• AES-256 encryption for all data at rest
• TLS 1.3 encryption for all data in transit
• Role-based access control (RBAC) ensuring users only access data relevant to their role
• Multi-factor authentication (MFA) support for all accounts
• IP whitelisting options for Enterprise subscribers
• Regular automated backups with point-in-time recovery
• Comprehensive audit logs tracking all data access and modifications
• Regular penetration testing and security audits

Data Retention:
• Active account data is retained for the duration of your subscription.
• After subscription termination, data is retained for 30 days to allow export, then permanently deleted.
• Audit logs are retained for 12 months for compliance purposes.`,
  },
  {
    id: "sharing",
    title: "5. Data Sharing & Disclosure",
    content: `We do not sell, rent, or trade any personal data. Data is shared only in the following circumstances:

With Your Consent:
• When you explicitly enable features such as doctor portal access or patient portal access.

Service Providers:
• We engage trusted third-party service providers (e.g., SMS gateways, payment processors, cloud hosting) who process data solely on our instructions under strict data processing agreements.

Legal Requirements:
• We may disclose data if required to do so by applicable Nigerian law, court order, or lawful request from regulatory authorities (e.g., NITDA, NDPC).

Business Transfers:
• In the event of a merger, acquisition, or sale of LabOS, user data may be transferred to the acquiring entity, subject to the same privacy protections.

We will notify affected laboratories of any material data sharing events where permitted by law.`,
  },
  {
    id: "patient-data",
    title: "6. Patient Data & NDPR Compliance",
    content: `Under the NDPR, laboratories using LabOS are considered Data Controllers for patient data they collect and enter into the platform. LabOS acts as a Data Processor on your behalf.

Laboratory Responsibilities (as Data Controller):
• Obtain appropriate patient consent before entering their data into LabOS.
• Inform patients about how their data is processed and their rights under NDPR.
• Appoint a Data Protection Officer (DPO) if required by NDPR.
• Conduct Data Protection Impact Assessments (DPIAs) for high-risk processing activities.

LabOS Responsibilities (as Data Processor):
• Process patient data only as instructed by the laboratory.
• Implement appropriate technical and organisational security measures.
• Notify laboratories of any confirmed data breaches within 72 hours of discovery.
• Provide assistance to laboratories in responding to data subject rights requests.
• Delete or return patient data upon termination of the service relationship.`,
  },
  {
    id: "cookies",
    title: "7. Cookies & Tracking",
    content: `LabOS uses essential cookies and similar technologies to operate the platform:

Essential Cookies (required):
• Session authentication cookies to maintain your logged-in state
• Security tokens to protect against CSRF attacks
• User preference cookies (e.g., language, sidebar state)

Analytics Cookies (optional, can be declined):
• Aggregated, anonymised usage analytics to improve the platform
• Error tracking to identify and resolve bugs faster

We do NOT use advertising cookies, cross-site tracking, or third-party marketing cookies.

You can manage cookie preferences in your browser settings. Declining non-essential cookies will not affect your ability to use the platform.`,
  },
  {
    id: "rights",
    title: "8. Your Data Rights",
    content: `Under the NDPR and applicable law, you have the following rights regarding your personal data:

• Right to Access: Request a copy of the personal data we hold about you.
• Right to Correction: Request correction of inaccurate or incomplete data.
• Right to Deletion: Request deletion of your personal data ("right to be forgotten").
• Right to Restriction: Request that we restrict processing of your data.
• Right to Data Portability: Request your data in a structured, machine-readable format.
• Right to Object: Object to certain types of processing, including profiling.
• Right to Withdraw Consent: Withdraw consent for any processing based solely on consent.

To exercise your rights, contact our Data Protection Officer:
Email: dpo@labos.ng
Response time: Within 30 days of receiving your request.

If you believe your data rights have been violated, you may lodge a complaint with the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng.`,
  },
  {
    id: "contact",
    title: "9. Contact & Updates",
    content: `Data Protection Officer:
Email: dpo@labos.ng
Address: 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria

General Privacy Inquiries:
Email: privacy@labos.ng
Phone: +234 801 234 5678

This Privacy Policy was last updated on June 18, 2026. We may update this policy from time to time. Material changes will be notified to registered laboratory accounts via email at least 14 days before the changes take effect.

Your continued use of the Service after the effective date of any changes constitutes acceptance of the updated policy.`,
  },
];

export default function Privacy() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">Legal</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-white/70 text-lg">Last updated: June 18, 2026 · NDPR Compliant</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* TOC */}
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
            <div className="flex items-start gap-3 p-5 bg-success/5 rounded-xl border border-success/20">
              <Shield className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-success mb-1">NDPR Compliant · AES-256 Encrypted · Never Sold</p>
                <p className="text-sm text-muted-foreground">Your laboratory data and patient records are protected under Nigeria's Data Protection Regulation. We are committed to the highest standards of data privacy and security.</p>
              </div>
            </div>

            {sections.map(section => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl font-bold mb-4 text-foreground">{section.title}</h2>
                {section.content.split("\n\n").map((para, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed mb-3 text-sm whitespace-pre-line">{para}</p>
                ))}
                <div className="h-px bg-border mt-8" />
              </section>
            ))}

            <div className="text-sm text-muted-foreground">
              <p>For privacy inquiries, contact our Data Protection Officer:</p>
              <p className="mt-1"><strong>Email:</strong> dpo@labos.ng</p>
              <p><strong>Address:</strong> 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
