import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { social } from "@/data/social";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { Instagram, Mail, MessageCircle, Send } from "lucide-react";

export function ContactSection() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", category: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: connect to a real backend/Formspree/etc.
    const subject = encodeURIComponent(`Project Inquiry — ${form.category}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCategory: ${form.category}\n\n${form.message}`,
    );
    window.open(`mailto:${social.email}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
  };

  return (
    <section id="contact" className="py-28 md:py-36">
      <div className="mx-auto max-w-[1800px] px-6 md:px-14">
        <Reveal>
          <SectionLabel>{t.contact.label}</SectionLabel>
        </Reveal>

        <div className="mt-14 grid gap-20 lg:grid-cols-[1fr_1fr]">
          {/* Left: big title + links */}
          <div className="flex flex-col justify-between gap-12">
            <Reveal>
              <h2 className="font-display type-section text-foreground leading-tight">
                {t.contact.title.map((line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? (
                      <em className="text-accent not-italic">{line}</em>
                    ) : (
                      line
                    )}
                  </span>
                ))}
              </h2>
            </Reveal>

            {/* Categories */}
            <Reveal delay={100}>
              <div className="flex flex-wrap gap-2">
                {t.contact.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-sm border border-accent/40 px-4 py-1.5 type-meta text-accent/80"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Social links */}
            <Reveal delay={150}>
              <div className="flex flex-col gap-3">
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-sm border border-border p-4 transition-colors hover:border-accent/50 hover:bg-surface"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-accent">
                    <Instagram className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="type-meta text-muted-foreground">{t.contact.instagram}</p>
                    <p className="text-foreground">{social.handle}</p>
                  </div>
                  <Send className="ms-auto h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>

                <a
                  href={`mailto:${social.email}`}
                  className="group flex items-center gap-3 rounded-sm border border-border p-4 transition-colors hover:border-accent/50 hover:bg-surface"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-accent">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="type-meta text-muted-foreground">{t.contact.email}</p>
                    <p className="text-foreground">{social.email}</p>
                  </div>
                  <Send className="ms-auto h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>

                <a
                  href={social.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-sm border border-border p-4 transition-colors hover:border-accent/50 hover:bg-surface"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-accent">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="type-meta text-muted-foreground">{t.contact.whatsapp}</p>
                    <p className="text-foreground">WhatsApp</p>
                  </div>
                  <Send className="ms-auto h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right: form */}
          <Reveal delay={100}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {sent ? (
                <div className="flex flex-1 items-center justify-center py-20 text-center">
                  <div>
                    <p className="font-display text-2xl text-accent">✓</p>
                    <p className="mt-3 font-display text-xl text-foreground">
                      {t.contact.cta}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="type-meta text-muted-foreground">
                        {t.contact.email === "Email" ? "Name" : "الاسم"}
                      </label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                        className="rounded-sm border border-border bg-surface px-4 py-3 text-foreground placeholder-muted-foreground/40 focus:border-accent focus:outline-none transition-colors"
                        placeholder={t.contact.email === "Email" ? "Your name" : "اسمك"}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="type-meta text-muted-foreground">{t.contact.email}</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        required
                        className="rounded-sm border border-border bg-surface px-4 py-3 text-foreground placeholder-muted-foreground/40 focus:border-accent focus:outline-none transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-2">
                    <label className="type-meta text-muted-foreground">
                      {t.contact.email === "Email" ? "Category" : "التصنيف"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {t.contact.categories.map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setForm((f) => ({ ...f, category: c }))}
                          className={`rounded-sm border px-4 py-1.5 type-meta transition-colors ${
                            form.category === c
                              ? "border-accent bg-accent text-background"
                              : "border-border text-muted-foreground hover:border-foreground"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label className="type-meta text-muted-foreground">
                      {t.contact.email === "Email" ? "Message" : "الرسالة"}
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      required
                      rows={5}
                      className="rounded-sm border border-border bg-surface px-4 py-3 text-foreground placeholder-muted-foreground/40 focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder={
                        t.contact.email === "Email"
                          ? "Tell me about your project..."
                          : "أخبرني عن مشروعك..."
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 flex items-center justify-center gap-2 rounded-sm bg-accent px-8 py-4 type-meta text-background transition-all hover:bg-foreground"
                  >
                    {t.contact.cta}
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
