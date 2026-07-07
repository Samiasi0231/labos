import { Link } from "react-router-dom";
import { FlaskConical, Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", path: "/features" },
    { label: "Pricing", path: "/pricing" },
    { label: "Sign Up", path: "/signup" },
    { label: "Sign In", path: "/signin" },
  ],
  Company: [
    { label: "About LabOS", path: "/" },
    { label: "Contact Us", path: "/contact" },
    { label: "Careers", path: "/contact" },
    { label: "Blog", path: "/" },
  ],
  Legal: [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms & Conditions", path: "/terms" },
    { label: "Cookie Policy", path: "/privacy" },
    { label: "NDPR Compliance", path: "/privacy" },
  ],
};

const contactInfo = [
  { icon: Mail, text: "hello@labos.ng" },
  { icon: Phone, text: "+234 801 234 5678" },
  { icon: MapPin, text: "Victoria Island, Lagos, Nigeria" },
];

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Lab</span>
                <span className="text-xl font-bold text-accent">OS</span>
              </div>
            </div>
            <p className="text-sm text-sidebar-muted leading-relaxed max-w-xs">
              Nigeria's most intelligent laboratory management system. Built for modern diagnostic labs that demand accuracy, speed, and insight.
            </p>
            <div className="space-y-2">
              {contactInfo.map(item => (
                <div key={item.text} className="flex items-center gap-2.5 text-sm text-sidebar-muted">
                  <item.icon className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-1">
              {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center text-sidebar-muted hover:text-accent transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-sm text-sidebar-muted hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-sidebar-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-sidebar-muted">
            &copy; {new Date().getFullYear()} LabOS Technologies Ltd. All rights reserved.
          </p>
          <p className="text-xs text-sidebar-muted">
            NDPR Compliant · ISO 27001 Ready · MLSCN Approved Standards
          </p>
        </div>
      </div>
    </footer>
  );
}
