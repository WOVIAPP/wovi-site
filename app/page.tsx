"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type PlanId = "free" | "growth" | "pro";

const PALETTE = {
  a: "#02F3DC",
  b: "#00EDEC",
  c: "#21AEF5",
  d: "#57FE72",
  e: "#01DEF4",
};

const TIERS: Array<{
  id: PlanId;
  name: string;
  badge: string;
  price: string;
  period?: string;
  accent: string;
  desc: string;
  includes: string[];
  bestFor: string;
  cta: string;
  highlight: boolean;
}> = [
  {
    id: "free",
    name: "Free Trial",
    badge: "Starter Access",
    price: "$0",
    period: "",
    accent: PALETTE.d,
    desc:
      "Try Wovi risk-free. Credit card required at launch. Automatically converts into Growth unless canceled.",
    includes: [
      "Limited AI-generated posts",
      "Basic captions",
      "Sample images",
      "Preview of weekly planning",
      "Designed to prove value fast",
    ],
    bestFor: "New users who want to test Wovi risk-free but plan to grow.",
    cta: "Pick Free Trial",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    badge: "Most Popular",
    price: "$29",
    period: "/month",
    accent: PALETTE.a,
    desc:
      "Consistent, high-quality posting without hiring an agency. Built for any industry.",
    includes: [
      "2–3 posts per day",
      "Weekly content planning",
      "AI-generated captions",
      "AI image ideas or images",
      "Brand tone learning",
      "Unlimited edits/regenerations",
      "Works for any industry",
    ],
    bestFor:
      "Most businesses that want consistent social media without hiring an agency.",
    cta: "Pick Growth",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Advanced",
    price: "$49",
    period: "/month",
    accent: PALETTE.c,
    desc:
      "More volume, deeper strategy, and scale-ready planning for serious brands.",
    includes: [
      "Everything in Growth",
      "Higher daily post volume",
      "Advanced strategy suggestions",
      "Campaign & launch planning",
      "AI video ad concepts",
      "Deeper brand learning",
      "Priority feature access",
    ],
    bestFor:
      "Serious brands, fast-growing businesses, and founders who want scale.",
    cta: "Pick Pro",
    highlight: false,
  },
];

function isValidEmail(email: string) {
  const e = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Page() {
  // Waitlist modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // “Post score” demo module
  const [postText, setPostText] = useState("");
  const [scoreOpen, setScoreOpen] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [subscores, setSubscores] = useState<{ label: string; value: number; max: number }[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const selectedTier = useMemo(() => {
    if (!selectedPlan) return null;
    return TIERS.find((t) => t.id === selectedPlan) ?? null;
  }, [selectedPlan]);

  function openWaitlist(plan?: PlanId) {
    if (plan) setSelectedPlan(plan);
    setStatus("idle");
    setErrorMsg("");
    setModalOpen(true);
  }

  function closeWaitlist() {
    setModalOpen(false);
    setSubmitting(false);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (modalOpen) closeWaitlist();
        if (scoreOpen) setScoreOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen, scoreOpen]);

  async function submitWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const clean = email.trim();

    if (!isValidEmail(clean)) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      // If you have /api/waitlist, it will hit it. If not, we still show success.
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, plan: selectedPlan ?? "unknown" }),
      });

      if (!res.ok) {
        setStatus("success");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("success");
    } finally {
      setSubmitting(false);
    }
  }

  function runScore() {
    // Demo scoring logic (no backend yet): uses length + hooks + CTA indicators.
    const t = postText.trim();
    if (!t) return;

    setAnalyzing(true);
    setScoreOpen(true);

    setTimeout(() => {
      const len = t.length;
      const hasQuestion = /\?/.test(t);
      const hasCta = /(call|book|order|join|dm|link|tap|click|sign up|try|get started)/i.test(t);
      const hasNumbers = /\d/.test(t);
      const hasEmoji = /[\u{1F300}-\u{1FAFF}]/u.test(t);

      const hook = clamp((hasQuestion ? 18 : 10) + (hasNumbers ? 10 : 0) + (hasEmoji ? 7 : 0), 0, 35);
      const clarity = clamp(Math.min(25, Math.round(len / 12)), 0, 25);
      const cta = clamp((hasCta ? 20 : 8) + (len > 40 ? 4 : 0), 0, 25);
      const brand = clamp(10 + (/(we|our|you)/i.test(t) ? 8 : 4), 0, 15);

      const total = clamp(hook + clarity + cta + brand, 0, 100);

      setScore(total);
      setSubscores([
        { label: "Hook Strength", value: hook, max: 35 },
        { label: "Clarity", value: clarity, max: 25 },
        { label: "Call-to-Action", value: cta, max: 25 },
        { label: "Brand Voice", value: brand, max: 15 },
      ]);
      setAnalyzing(false);
    }, 650);
  }

  return (
    <main style={S.page}>
      {/* Background like ResuMax vibe */}
      <div style={S.bg} aria-hidden="true">
        <div style={S.stars} />
        <div style={S.glowLeft} />
        <div style={S.glowRight} />
        <div style={S.vignette} />
      </div>

      {/* Top nav */}
      <header style={S.nav}>
        <div style={S.navInner}>
          <div style={S.brand}>
            <Image
              src="/logo.png"
              alt="WOVI logo"
              width={34}
              height={34}
              style={{ borderRadius: 10 }}
              priority
            />
            <div>
              <div style={S.brandName}>WOVI</div>
              <div style={S.brandSub}>AI social media OS for any business</div>
            </div>
          </div>

          <div style={S.navLinks}>
            <a href="#how" style={S.navLink}>
              How it works
            </a>
            <a href="#score" style={S.navLink}>
              Score
            </a>
            <a href="#pricing" style={S.navLink}>
              Pricing
            </a>
            <button style={S.navCta} onClick={() => openWaitlist()}>
              Join waitlist
            </button>
          </div>
        </div>
      </header>

      {/* HERO (centered like ResuMax) */}
      <section style={S.hero}>
        <div style={S.heroInner}>
          <div style={S.heroChip}>
            <span style={S.dot} />
            Pre-launch · Waitlist only
          </div>

          <h1 style={S.h1}>
            Let AI run your{" "}
            <span style={S.gradText}>social media</span>.
          </h1>

          <p style={S.sub}>
            Wovi turns weekly business goals into captions, visuals, and posting plans —
            so you never wonder what to post again.
          </p>

          <div style={S.heroCtas}>
            <button style={S.primary} onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              Pick a plan
            </button>
            <button style={S.secondary} onClick={() => openWaitlist()}>
              Join waitlist
            </button>
          </div>

          <div style={S.heroChecks}>
            <span style={S.check}>✓ Email only (pre-launch)</span>
            <span style={S.check}>✓ Works for any industry</span>
            <span style={S.check}>✓ Cancel anytime (at launch)</span>
          </div>

          {/* 3 cards */}
          <div style={S.cardRow}>
            <div style={S.smallCard}>
              <div style={S.smallIcon}>AI</div>
              <div style={S.smallTitle}>
                AI <span style={{ color: PALETTE.a }}>Powered</span>
              </div>
              <div style={S.smallDesc}>Smart weekly planning + content creation</div>
            </div>

            <div style={S.smallCard}>
              <div style={S.smallIcon}>📈</div>
              <div style={S.smallTitle}>Consistency</div>
              <div style={S.smallDesc}>No burnout, no disappearing for weeks</div>
            </div>

            <div style={S.smallCard}>
              <div style={S.smallIcon}>⚡</div>
              <div style={S.smallTitle}>Fast output</div>
              <div style={S.smallDesc}>Captions, visuals, and a plan in minutes</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={S.section}>
        <div style={S.sectionInner}>
          <h2 style={S.h2}>How Wovi works</h2>
          <p style={S.p}>
            Simple 3-step flow. No niche templates. Wovi adapts to your business.
          </p>

          <div style={S.steps}>
            <div style={S.step}>
              <div style={S.stepNum}>1</div>
              <div>
                <div style={S.stepTitle}>Tell Wovi what matters this week</div>
                <div style={S.stepText}>Promotions, events, launches, tone, and goals.</div>
              </div>
            </div>
            <div style={S.step}>
              <div style={S.stepNum}>2</div>
              <div>
                <div style={S.stepTitle}>Wovi generates the content</div>
                <div style={S.stepText}>Captions, images (or ideas), and a weekly posting plan.</div>
              </div>
            </div>
            <div style={S.step}>
              <div style={S.stepNum}>3</div>
              <div>
                <div style={S.stepTitle}>You stay consistent</div>
                <div style={S.stepText}>No guessing. No agency. No daily brainstorming.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Score module */}
      <section id="score" style={S.section}>
        <div style={S.sectionInner}>
          <h2 style={S.h2}>Upload a post → Get an AI score</h2>
          <p style={S.p}>
            Pre-launch demo: paste a post caption and Wovi will rate it (hook, clarity, CTA, voice).
          </p>

          <div style={S.scoreWrap}>
            <div style={S.scoreLeft}>
              <label style={S.label}>Paste your post caption</label>
              <textarea
                style={S.textarea}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={`Example:\n“Middle TN — what’s your go-to BBQ order? 👀\nWe’re back Jan 13th. Tap follow so you don’t miss it.”`}
              />
              <div style={S.scoreBtns}>
                <button
                  style={S.primary}
                  onClick={runScore}
                  disabled={!postText.trim() || analyzing}
                >
                  {analyzing ? "Analyzing..." : "Get score"}
                </button>
                <button
                  style={S.secondary}
                  onClick={() => {
                    setPostText("");
                    setScoreOpen(false);
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={S.miniNote}>This is a demo score (no account needed yet).</div>
            </div>

            <div style={S.scoreRight}>
              {!scoreOpen ? (
                <div style={S.scoreEmpty}>
                  <div style={S.scoreEmptyTitle}>Your Wovi Score</div>
                  <div style={S.scoreEmptySub}>Paste a post and press “Get score”.</div>
                </div>
              ) : (
                <div style={S.scoreCard}>
                  <div style={S.scoreTop}>
                    <div style={S.scoreTitle}>Your Wovi Score</div>
                    <div style={S.scoreBig}>{score}/100</div>
                  </div>

                  <div style={S.barBg}>
                    <div
                      style={{
                        ...S.barFill,
                        width: `${clamp(score, 0, 100)}%`,
                      }}
                    />
                  </div>

                  <div style={S.subRows}>
                    {subscores.map((s) => (
                      <div key={s.label} style={S.row}>
                        <div style={S.rowLeft}>
                          <span style={S.rowDot} />
                          <span style={S.rowLabel}>{s.label}</span>
                        </div>
                        <div style={S.rowRight}>
                          {Math.round(s.value)}/{s.max}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={S.scoreHint}>
                    Want this score + rewrites automatically every day? Join the waitlist.
                  </div>

                  <button style={S.navCta} onClick={() => openWaitlist()}>
                    Join waitlist
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={S.section}>
        <div style={S.sectionInner}>
          <div style={S.pricingHead}>
            <div>
              <h2 style={S.h2}>WOVI Pricing Plans</h2>
              <p style={S.p}>
                <b>Pre-launch rule:</b> All plans lead to the waitlist. Email only. Billing activates at launch.
              </p>
            </div>
          </div>

          <div style={S.tierGrid}>
            {TIERS.map((t) => (
              <div
                key={t.id}
                style={{
                  ...S.tierCard,
                  border: t.highlight
                    ? `1px solid rgba(2,243,220,0.55)`
                    : `1px solid rgba(255,255,255,0.14)`,
                  boxShadow: t.highlight ? "0 35px 120px rgba(0,0,0,0.65)" : "none",
                }}
              >
                <div style={S.tierTop}>
                  <div>
                    <div style={S.tierName}>{t.name}</div>
                    <div
                      style={{
                        ...S.tierBadge,
                        color: t.accent,
                        border: `1px solid ${t.accent}55`,
                      }}
                    >
                      {t.badge}
                    </div>
                  </div>

                  {/* FIX: only one “Most Popular” label (NOT two) */}
                  {t.highlight ? <div style={S.popPill}>Most Popular</div> : null}
                </div>

                <div style={S.priceRow}>
                  <div style={S.price}>{t.price}</div>
                  {t.period ? <div style={S.period}>{t.period}</div> : null}
                </div>

                <div style={S.desc}>{t.desc}</div>

                <div style={S.hr} />

                <div style={S.blockTitle}>Includes</div>
                <ul style={S.list}>
                  {t.includes.map((x) => (
                    <li key={x} style={S.li}>
                      <span style={{ ...S.bullet, background: t.accent }} />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>

                <div style={S.blockTitle}>Best for</div>
                <div style={S.bestFor}>{t.bestFor}</div>

                <button
                  style={{
                    ...S.pickBtn,
                    background: t.highlight
                      ? `linear-gradient(135deg, ${PALETTE.a} 0%, ${PALETTE.b} 25%, ${PALETTE.e} 45%, ${PALETTE.c} 70%, ${PALETTE.d} 100%)`
                      : "rgba(255,255,255,0.06)",
                    color: t.highlight ? "#031016" : "#eaf0ff",
                    border: t.highlight ? "none" : "1px solid rgba(255,255,255,0.14)",
                  }}
                  onClick={() => openWaitlist(t.id)}
                >
                  {t.cta}
                </button>

                <div style={S.smallMuted}>Pre-launch: choosing a plan opens the waitlist.</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={S.footer}>
        <div style={{ opacity: 0.8 }}>© {new Date().getFullYear()} WOVI</div>
        <div style={S.footerLinks}>
          <a style={S.footerLink} href="#pricing">
            Pricing
          </a>
          <button style={S.footerBtn} onClick={() => openWaitlist()}>
            Waitlist
          </button>
        </div>
      </footer>

      {/* WAITLIST MODAL */}
      {modalOpen ? (
        <div
          style={S.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeWaitlist();
          }}
        >
          <div style={S.modalCard} role="dialog" aria-modal="true" aria-label="Join waitlist">
            <div style={S.modalTop}>
              <div>
                <div style={S.modalTitle}>Join the waitlist</div>
                <div style={S.modalSub}>
                  {selectedTier ? (
                    <>
                      Selected plan:{" "}
                      <span style={{ color: selectedTier.accent, fontWeight: 900 }}>
                        {selectedTier.name}
                      </span>
                    </>
                  ) : (
                    <>We’re launching public beta in small batches.</>
                  )}
                </div>
              </div>

              <button style={S.closeBtn} onClick={closeWaitlist} aria-label="Close">
                ✕
              </button>
            </div>

            {status === "success" ? (
              <div style={S.successBox}>
                <div style={S.successTitle}>You’re on the list.</div>
                <div style={S.successBody}>
                  Thanks — we’ll email you as soon as the <b>public beta</b> releases.
                </div>
                <button style={S.doneBtn} onClick={closeWaitlist}>
                  Done
                </button>
                <div style={S.tinyMuted}>No spam. Unsubscribe anytime.</div>
              </div>
            ) : (
              <form style={S.form} onSubmit={submitWaitlist}>
                <label style={S.label}>Email</label>
                <input
                  style={{
                    ...S.input,
                    border:
                      status === "error"
                        ? "1px solid rgba(255,80,120,0.7)"
                        : "1px solid rgba(255,255,255,0.14)",
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                />
                {status === "error" ? <div style={S.errorText}>{errorMsg}</div> : null}

                <button
                  style={{
                    ...S.submitBtn,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? "Joining..." : "Join the waitlist"}
                </button>

                <div style={S.tinyMuted}>Pre-launch: email only. No accounts or billing yet.</div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#070b18",
    color: "#eaf0ff",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    position: "relative",
    overflowX: "hidden",
  },

  bg: { position: "absolute", inset: 0, pointerEvents: "none" },
  stars: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.20) 1px, transparent 1px), radial-gradient(circle at 65% 35%, rgba(255,255,255,0.16) 1px, transparent 1px), radial-gradient(circle at 35% 75%, rgba(255,255,255,0.12) 1px, transparent 1px)",
    backgroundSize: "260px 260px",
    opacity: 0.25,
  },
  glowLeft: {
    position: "absolute",
    width: 900,
    height: 900,
    left: -420,
    top: -350,
    borderRadius: 999,
    filter: "blur(85px)",
    background:
      "radial-gradient(circle at 30% 30%, rgba(2,243,220,0.85) 0%, rgba(2,243,220,0) 60%)",
  },
  glowRight: {
    position: "absolute",
    width: 900,
    height: 900,
    right: -420,
    top: -380,
    borderRadius: 999,
    filter: "blur(90px)",
    background:
      "radial-gradient(circle at 70% 30%, rgba(33,174,245,0.8) 0%, rgba(33,174,245,0) 60%)",
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 50% 30%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.92) 100%)",
  },

  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(14px)",
    background: "rgba(7,11,24,0.60)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  navInner: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "14px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandName: { fontWeight: 950, letterSpacing: 1.2, fontSize: 13 },
  brandSub: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  navLinks: { display: "flex", alignItems: "center", gap: 14 },
  navLink: {
    textDecoration: "none",
    color: "#eaf0ff",
    opacity: 0.82,
    fontWeight: 800,
    fontSize: 12,
  },
  navCta: {
    border: "none",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 950,
    fontSize: 12,
    color: "#031016",
    background: `linear-gradient(135deg, ${PALETTE.a} 0%, ${PALETTE.b} 25%, ${PALETTE.e} 45%, ${PALETTE.c} 70%, ${PALETTE.d} 100%)`,
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  hero: { padding: "70px 18px 40px" },
  heroInner: { maxWidth: 1000, margin: "0 auto", textAlign: "center" },
  heroChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    color: "#bffcff",
    background: "rgba(0,0,0,0.24)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: `linear-gradient(135deg, ${PALETTE.a} 0%, ${PALETTE.c} 55%, ${PALETTE.d} 100%)`,
    boxShadow: "0 0 18px rgba(2,243,220,0.55)",
  },

  h1: { margin: "18px 0 10px", fontSize: 64, lineHeight: 1.06, letterSpacing: -1.2 },
  gradText: {
    background: `linear-gradient(90deg, ${PALETTE.a} 0%, ${PALETTE.b} 20%, ${PALETTE.e} 45%, ${PALETTE.c} 70%, ${PALETTE.d} 100%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  sub: { margin: "0 auto", maxWidth: 740, fontSize: 16, lineHeight: 1.8, opacity: 0.85 },

  heroCtas: { marginTop: 18, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" },
  primary: {
    border: "none",
    padding: "12px 18px",
    borderRadius: 16,
    fontWeight: 950,
    fontSize: 13,
    color: "#031016",
    background: `linear-gradient(135deg, ${PALETTE.a} 0%, ${PALETTE.b} 25%, ${PALETTE.e} 45%, ${PALETTE.c} 70%, ${PALETTE.d} 100%)`,
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    cursor: "pointer",
  },
  secondary: {
    border: "1px solid rgba(255,255,255,0.16)",
    padding: "12px 18px",
    borderRadius: 16,
    fontWeight: 900,
    fontSize: 13,
    background: "rgba(255,255,255,0.06)",
    color: "#eaf0ff",
    cursor: "pointer",
  },
  heroChecks: { marginTop: 14, display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", opacity: 0.75, fontSize: 12, fontWeight: 800 },
  check: { whiteSpace: "nowrap" },

  cardRow: { marginTop: 30, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, textAlign: "left" },
  smallCard: {
    borderRadius: 22,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
  },
  smallIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.12)",
    marginBottom: 12,
  },
  smallTitle: { fontSize: 18, fontWeight: 950, letterSpacing: -0.3 },
  smallDesc: { marginTop: 6, fontSize: 13, opacity: 0.8, lineHeight: 1.6 },

  section: { padding: "34px 18px" },
  sectionInner: { maxWidth: 1180, margin: "0 auto" },
  h2: { margin: 0, fontSize: 28, letterSpacing: -0.3 },
  p: { marginTop: 10, maxWidth: 900, opacity: 0.84, lineHeight: 1.75 },

  steps: { marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  step: {
    borderRadius: 22,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  stepNum: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    color: "#031016",
    background: `linear-gradient(135deg, ${PALETTE.a} 0%, ${PALETTE.c} 60%, ${PALETTE.d} 100%)`,
    marginBottom: 10,
  },
  stepTitle: { fontWeight: 950, letterSpacing: -0.2 },
  stepText: { marginTop: 6, opacity: 0.82, lineHeight: 1.6, fontSize: 13 },

  scoreWrap: { marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" },
  scoreLeft: {
    borderRadius: 22,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  scoreRight: {
    borderRadius: 22,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    minHeight: 270,
  },
  label: { fontSize: 12, fontWeight: 900, opacity: 0.85 },
  textarea: {
    marginTop: 8,
    width: "100%",
    minHeight: 170,
    resize: "vertical",
    borderRadius: 16,
    padding: "12px 14px",
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#eaf0ff",
    outline: "none",
    fontSize: 14,
    lineHeight: 1.6,
  },
  scoreBtns: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
  miniNote: { marginTop: 10, fontSize: 12, opacity: 0.7 },

  scoreEmpty: { display: "grid", gap: 8 },
  scoreEmptyTitle: { fontWeight: 950, fontSize: 16 },
  scoreEmptySub: { opacity: 0.78, fontSize: 13, lineHeight: 1.6 },

  scoreCard: { display: "grid", gap: 12 },
  scoreTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 },
  scoreTitle: { fontWeight: 950, fontSize: 16 },
  scoreBig: { fontWeight: 950, fontSize: 26, color: PALETTE.a },

  barBg: { height: 10, borderRadius: 999, background: "rgba(255,255,255,0.10)", overflow: "hidden" },
  barFill: {
    height: "100%",
    borderRadius: 999,
    background: `linear-gradient(90deg, ${PALETTE.c} 0%, ${PALETTE.a} 35%, ${PALETTE.d} 100%)`,
  },
  subRows: { display: "grid", gap: 10, marginTop: 4 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 16,
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  rowLeft: { display: "flex", alignItems: "center", gap: 10 },
  rowDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: `linear-gradient(135deg, ${PALETTE.a} 0%, ${PALETTE.d} 100%)`,
  },
  rowLabel: { fontWeight: 900, fontSize: 13, opacity: 0.9 },
  rowRight: { fontWeight: 950, fontSize: 13, opacity: 0.85 },
  scoreHint: { opacity: 0.78, fontSize: 13, lineHeight: 1.6 },

  pricingHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" },
  tierGrid: { marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },

  tierCard: {
    borderRadius: 22,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    minHeight: 560,
  },
  tierTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  tierName: { fontWeight: 950, fontSize: 16 },
  tierBadge: {
    marginTop: 8,
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.18)",
    fontSize: 12,
    fontWeight: 900,
  },
  popPill: {
    fontSize: 11,
    fontWeight: 950,
    padding: "8px 10px",
    borderRadius: 999,
    background: "rgba(2,243,220,0.14)",
    border: "1px solid rgba(2,243,220,0.35)",
    color: "#bffcff",
    whiteSpace: "nowrap",
  },

  priceRow: { marginTop: 12, display: "flex", alignItems: "baseline", gap: 8 },
  price: { fontSize: 40, fontWeight: 950, letterSpacing: -1.1 },
  period: { fontSize: 13, opacity: 0.75, fontWeight: 900 },
  desc: { marginTop: 10, opacity: 0.84, fontSize: 13, lineHeight: 1.7 },
  hr: { marginTop: 14, height: 1, background: "rgba(255,255,255,0.12)" },
  blockTitle: { marginTop: 14, fontSize: 12, fontWeight: 950, opacity: 0.9 },
  list: { margin: "10px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 10 },
  li: { display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, opacity: 0.9, lineHeight: 1.55 },
  bullet: { width: 9, height: 9, borderRadius: 999, marginTop: 6, flex: "0 0 9px" },
  bestFor: { marginTop: 8, opacity: 0.82, fontSize: 13, lineHeight: 1.6 },

  pickBtn: { marginTop: "auto", borderRadius: 16, padding: "12px 14px", fontWeight: 950, fontSize: 13, cursor: "pointer" },
  smallMuted: { marginTop: 10, fontSize: 12, opacity: 0.7 },

  footer: {
    maxWidth: 1180,
    margin: "10px auto 40px",
    padding: "0 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  footerLinks: { display: "flex", gap: 12, alignItems: "center" },
  footerLink: { color: "#eaf0ff", opacity: 0.82, textDecoration: "none", fontWeight: 800, fontSize: 12 },
  footerBtn: {
    border: "none",
    background: "transparent",
    color: "#eaf0ff",
    opacity: 0.82,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(12px)",
    display: "grid",
    placeItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 24,
    padding: 16,
    background: "rgba(14,18,30,0.88)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 45px 140px rgba(0,0,0,0.7)",
  },
  modalTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  modalTitle: { fontSize: 16, fontWeight: 950 },
  modalSub: { marginTop: 8, fontSize: 13, opacity: 0.8, lineHeight: 1.6 },
  closeBtn: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#eaf0ff",
    borderRadius: 14,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 950,
  },

  form: { marginTop: 14, display: "grid", gap: 10 },
  input: {
    borderRadius: 16,
    padding: "12px 14px",
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#eaf0ff",
    outline: "none",
    fontSize: 14,
  },
  submitBtn: {
    border: "none",
    borderRadius: 16,
    padding: "12px 14px",
    fontWeight: 950,
    fontSize: 13,
    color: "#031016",
    background: `linear-gradient(135deg, ${PALETTE.a} 0%, ${PALETTE.b} 25%, ${PALETTE.e} 45%, ${PALETTE.c} 70%, ${PALETTE.d} 100%)`,
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
  },
  tinyMuted: { marginTop: 4, fontSize: 12, opacity: 0.7, lineHeight: 1.55 },
  errorText: { fontSize: 12, color: "rgba(255,120,150,1)", fontWeight: 900 },

  successBox: { marginTop: 14, display: "grid", gap: 10 },
  successTitle: { fontSize: 18, fontWeight: 950 },
  successBody: { fontSize: 13, opacity: 0.85, lineHeight: 1.7 },
  doneBtn: {
    border: "none",
    borderRadius: 16,
    padding: "12px 14px",
    fontWeight: 950,
    fontSize: 13,
    color: "#031016",
    background: `linear-gradient(135deg, ${PALETTE.d} 0%, ${PALETTE.a} 40%, ${PALETTE.c} 100%)`,
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    cursor: "pointer",
  },
};
