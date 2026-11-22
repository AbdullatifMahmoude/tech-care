import { useState, type FormEvent } from 'react';
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { SITE_CONFIG } from '../../data/siteConfig';
import { submitContactForm } from '../../services/contactService';
import type { ContactPayload } from '../../types/techcare';
import { SpatialItem3D, SpatialSection3D } from '../motion/Spatial3D';

export function ContactSection() {
  const [form, setForm] = useState<ContactPayload>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: 'Doctor',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ referenceId: string; message: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please enter your first name, email address, and message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitContactForm(form);
      setReceipt({ referenceId: res.referenceId, message: res.message });
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: 'Doctor',
        message: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SpatialSection3D
      id="contact"
      variant="split-converge"
      className="relative z-10 scroll-mt-20 py-14 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-margin-desktop"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:gap-14 lg:grid-cols-12" style={{ transformStyle: 'preserve-3d' }}>
        {/* Left Minimal Contact Column with Hairline Rows */}
        <div className="lg:col-span-5 space-y-6" style={{ transformStyle: 'preserve-3d' }}>
          <SpatialItem3D preset="left-lead" stagger={0} className="space-y-3">
            <span className="font-label-technical text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              05 / Contact
            </span>
            <h2 className="font-headline-lg text-3xl md:text-4xl font-semibold tracking-tight text-on-surface">
              Let&apos;s build a smarter healthcare experience.
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {SITE_CONFIG.contactSubtitle}
            </p>
          </SpatialItem3D>

          <div className="border-t editorial-rule" style={{ transformStyle: 'preserve-3d' }}>
            <SpatialItem3D preset="cascade-item" stagger={0.08}>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-3.5 border-b editorial-rule py-3.5 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span className="break-all sm:break-normal text-sm font-medium text-on-surface">{SITE_CONFIG.email}</span>
              </a>
            </SpatialItem3D>

            <SpatialItem3D preset="cascade-item" stagger={0.14}>
              <a
                href={SITE_CONFIG.phoneHref}
                className="flex items-center gap-3.5 border-b editorial-rule py-3.5 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0 text-secondary" />
                <span className="text-sm font-medium text-on-surface">{SITE_CONFIG.phone}</span>
              </a>
            </SpatialItem3D>

            <SpatialItem3D preset="cascade-item" stagger={0.2}>
              <div className="flex items-center gap-3.5 border-b editorial-rule py-3.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm font-medium text-on-surface">{SITE_CONFIG.location}</span>
              </div>
            </SpatialItem3D>
          </div>

          <div className="space-y-3 pt-1" style={{ transformStyle: 'preserve-3d' }}>
            <SpatialItem3D preset="cascade-item" stagger={0.25}>
              <a
                href={SITE_CONFIG.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-3 text-xs font-bold text-primary transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-on-primary"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </SpatialItem3D>

            <SpatialItem3D preset="cascade-item" stagger={0.3}>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-on-surface-variant">
                {SITE_CONFIG.socials
                  .filter((s) => s.id !== 'whatsapp')
                  .map((s) => (
                    <a
                      key={s.id}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary"
                    >
                      {s.label}
                    </a>
                  ))}
              </div>
            </SpatialItem3D>
          </div>
        </div>

        {/* Right Architectural Form Plane with Underline Inputs */}
        <div className="lg:col-span-7" style={{ transformStyle: 'preserve-3d' }}>
          <SpatialItem3D preset="right-lead" stagger={0.12}>
            <div className="editorial-frame editorial-bracket p-6 sm:p-8">
              <div className="mb-6">
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">Send a message</h3>
                <p className="mt-1 text-xs text-on-surface-variant">We usually respond as soon as possible.</p>
              </div>

              {receipt ? (
                <div className="border-s-2 border-primary ps-5 py-3 space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                  <h4 className="font-headline-sm text-lg font-bold text-on-surface">Message Logged</h4>
                  <p className="text-sm text-on-surface-variant">{receipt.message}</p>
                  <p className="font-mono text-xs text-primary">Reference: {receipt.referenceId}</p>
                  <button
                    type="button"
                    onClick={() => setReceipt(null)}
                    className="mt-3 rounded-full bg-primary px-5 py-2 text-xs font-bold text-on-primary cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-first-name" className="block text-[11px] font-semibold uppercase tracking-wider text-outline">
                        First Name *
                      </label>
                      <input
                        id="contact-first-name"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder="First Name"
                        className="editorial-input text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-last-name" className="block text-[11px] font-semibold uppercase tracking-wider text-outline">
                        Last Name
                      </label>
                      <input
                        id="contact-last-name"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="Last Name"
                        className="editorial-input text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-email" className="block text-[11px] font-semibold uppercase tracking-wider text-outline">
                        Email *
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="doctor@clinic.org"
                        className="editorial-input text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-[11px] font-semibold uppercase tracking-wider text-outline">
                        Phone
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+20 1XX XXX XXXX"
                        className="editorial-input text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-[11px] font-semibold uppercase tracking-wider text-outline">
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value as ContactPayload['subject'] })}
                      className="editorial-input text-sm"
                    >
                      <option value="Doctor">Doctor</option>
                      <option value="Medical Student">Medical Student</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-[11px] font-semibold uppercase tracking-wider text-outline">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={3}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your clinic or medical partnership inquiry..."
                      className="editorial-input resize-none text-sm"
                    />
                  </div>

                  {error && (
                    <p className="border-s-2 border-error ps-3 py-1 text-xs text-error">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary-glow inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:-translate-y-0.5 hover:bg-primary-fixed disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </SpatialItem3D>
        </div>
      </div>
    </SpatialSection3D>
  );
}
