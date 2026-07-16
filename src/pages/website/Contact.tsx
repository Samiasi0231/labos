import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, CheckCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactCards = [
  { icon: Mail, title: "Email Us", value: "hello@ezralabs.ng", sub: "We reply within 24 hours", href: "mailto:hello@ezralabs.ng" },
  { icon: Phone, title: "Call Us", value: "+234 801 234 5678", sub: "Mon – Fri, 8 AM – 6 PM WAT", href: "tel:+2348012345678" },
  { icon: MapPin, title: "Visit Us", value: "14 Admiralty Way, Lekki Phase 1", sub: "Lagos, Nigeria", href: "#" },
  { icon: Clock, title: "Office Hours", value: "Mon – Fri: 8 AM – 6 PM", sub: "Sat: 9 AM – 2 PM (Support only)", href: "#" },
];

const subjects = [
  "Sales Inquiry", "Technical Support", "Billing Question", "Feature Request",
  "Partnership", "Demo Request", "Press & Media", "Other"
];

export default function Contact() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", lab: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Missing required fields", description: "Please fill in your name, email, and message.", variant: "destructive" });
      return;
    }
    setSubmitted(true);
  };

  const p = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">Get In Touch</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5">We're here to help</h1>
          <p className="text-lg text-white/70">Have questions about Ezralabs? Our team is ready to assist you with demos, pricing, technical support, and anything in between.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {contactCards.map(c => (
            <a key={c.title} href={c.href} className="block group">
              <Card className="shadow-card border hover:border-primary/30 transition-all group-hover:shadow-elegant h-full">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <c.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold mb-1">{c.title}</p>
                  <p className="text-sm text-foreground font-medium">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* Contact form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold mb-2">Send us a message</h2>
            <p className="text-muted-foreground mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>

            {submitted ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold">Message Sent!</h3>
                <p className="text-muted-foreground">Thank you, <strong>{form.name}</strong>. We've received your message and will respond to <strong>{form.email}</strong> within 24 hours.</p>
                <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", lab: "", subject: "", message: "" }); }}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Full Name *</Label>
                    <Input placeholder="Dr. Adaeze Okonkwo" value={form.name} onChange={p("name")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email Address *</Label>
                    <Input type="email" placeholder="you@lab.ng" value={form.email} onChange={p("email")} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Phone Number</Label>
                    <Input placeholder="+234 801 234 5678" value={form.phone} onChange={p("phone")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Laboratory Name</Label>
                    <Input placeholder="HealthFirst Diagnostics" value={form.lab} onChange={p("lab")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Select value={form.subject} onValueChange={v => setForm(prev => ({ ...prev, subject: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Message *</Label>
                  <Textarea
                    placeholder="Tell us about your laboratory, what you're looking for, or any questions you have..."
                    className="min-h-[140px]"
                    value={form.message}
                    onChange={p("message")}
                  />
                </div>
                <Button type="submit" size="lg" className="gap-2 w-full sm:w-auto">
                  <Send className="w-4 h-4" />Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card border">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-semibold mb-4">What happens next?</h3>
                <div className="space-y-4">
                  {[
                    { step: "1", text: "Our team reviews your message within 2 hours during working hours." },
                    { step: "2", text: "A dedicated Ezralabs specialist is assigned to your inquiry." },
                    { step: "3", text: "We reach out via email (or phone if you prefer) with a tailored response." },
                    { step: "4", text: "If you want a demo, we schedule a 30-minute live walkthrough." },
                  ].map(item => (
                    <div key={item.step} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">{item.step}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border bg-primary/5 border-primary/20">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-semibold mb-2 text-primary">Need immediate help?</h3>
                <p className="text-sm text-muted-foreground mb-4">For urgent technical support, existing customers can call our dedicated support line.</p>
                <p className="text-lg font-bold text-primary">+234 901 234 5678</p>
                <p className="text-xs text-muted-foreground mt-1">Available Mon – Sat, 7 AM – 8 PM WAT</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
