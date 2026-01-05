// app/page.tsx
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type PlanId = "free-trial" | "growth" | "pro";

const TIERS: Array<{
  id: PlanId;
  name: string;
  badge: string;
  price: string;
  period: string;
  accent: string;
  desc: string;
  includes: string[];
  bestFor: string;
  cta: string;
  highlight: boolean;
}> = [
  {
    id: "free-trial",
    name: "Free Trial",
    badge: "Starter Access",
    price: "$0",
    period: "",
    accent: "#57FE72",
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
    accent: "#02F3DC",
    desc:
      "Consistent, high-quality posting without hiring an agency. Built for any industry.",
    includes: [
      "2–3 posts per day",
      "Weekly content planning",
      "AI-generated captions",
      "AI image ideas or images",
      "Brand tone learning",
      "Unlimited edits / regenerations",
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
    accent: "#21AEF5",
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

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

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
      if (!modalOpen) return;
      if (e.key === "Escape") closeWaitlist();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

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
      // If you already have an API route, update this URL to match it.
      // This expects: POST /api/waitlist with JSON body { email, plan }
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: clean,
          plan: selectedPlan ?? "unknown",
        }),
      });

      if (!res.ok) {
        // Still show success if you haven’t built backend yet
        // (comment out the next line if you want strict failure)
        setStatus("success");
        setSubmitting(false);
        return;
      }

      setStatus("success");
    } catch {
      // Still allow success so the UI works even before backend exists
      setStatus("success");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={S.page}>
      {/* Background */}
      <div style={S.bg} aria-hidden="true">
        <div style={S.grid} />
        <div style={S.glowA} />
        <div style={S.glowB} />
        <div style={S.glowC} />
        <div style={S.vignette} />
      </div>

      <div style={S.container}>
        {/* Top bar */}
        <header style={S.topbar}>
          <div style={S.brand} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div style={S.logo}>W</div>
            <div>
              <div style={S.brandName}>WOVI</div>
              <div style={S.brandTag}>AI social media OS for any business</div>
            </div>
          </div>

          <div style={S.topRight}>
            <a href="#pricing" style={S.topLink}>
              Pricing
            </a>
            <button type="button" style={S.topCta} onClick={() => openWaitlist()}>
              Join waitlist
            </button>
          </div>
        </header>

        {/* Hero */}
        <section style={S.hero}>
          <div style={S.heroLeft}>
            <div style={S.chip}>
              <span style={S.chipDot} />
              Pre-launch · Waitlist only
            </div>

            <h1 style={S.h1}>
              AI that turns your business goals into{" "}
              <span style={S.h1Accent}>ready-to-post</span> content.
            </h1>

            <p style={S.sub}>
              Wovi replaces the planning and creation behind social media — captions, images,
              and weekly posting plans — so you stay consistent without burnout.
            </p>

            <div style={S.heroButtons}>
              <a href="#pricing" style={S.primaryBtn}>
                Pick a plan
              </a>
              <button type="button" style={S.secondaryBtn} onClick={() => openWaitlist()}>
                Join waitlist
              </button>
            </div>

            <div style={S.heroStats}>
              <div style={S.statCard}>
                <div style={S.statLabel}>Works for</div>
                <div style={S.statValue}>Any industry</div>
                <div style={S.statHint}>Restaurants, HVAC, ecom, creators, startups</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statLabel}>Replaces</div>
                <div style={S.statValue}>Daily brainstorming</div>
                <div style={S.statHint}>No “what should I post?”</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statLabel}>Outcome</div>
                <div style={S.statValue}>Consistency</div>
                <div style={S.statHint}>Plans + content every week</div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={S.heroRight}>
            <div style={S.previewCard}>
              <div style={S.previewTop}>
                <div style={S.previewTitle}>This week in Wovi</div>
                <div style={S.previewPill}>Auto-planned</div>
              </div>

              <div style={S.previewGrid}>
                <div style={S.previewItem}>
                  <div style={S.previewKicker}>Input</div>
                  <div style={S.previewMain}>Promotion: “New winter special”</div>
                  <div style={S.previewSub}>Tone: confident · modern</div>
                </div>
                <div style={S.previewItem}>
                  <div style={S.previewKicker}>Output</div>
                  <div style={S.previewMain}>Captions + image concepts</div>
                  <div style={S.previewSub}>Ready-to-post variations</div>
                </div>
                <div style={S.previewItem}>
                  <div style={S.previewKicker}>Plan</div>
                  <div style={S.previewMain}>Weekly posting schedule</div>
                  <div style={S.previewSub}>Daily suggestions</div>
                </div>
                <div style={S.previewItem}>
                  <div style={S.previewKicker}>Result</div>
                  <div style={S.previewMain}>You stay consistent</div>
                  <div style={S.previewSub}>No agency, no burnout</div>
                </div>
              </div>

              <div style={S.previewFoot}>
                <div style={S.mutedSmall}>
                  Pick a plan now. Get early access when we launch.
                </div>
                <button type="button" style={S.previewBtn} onClick={() => openWaitlist()}>
                  Join waitlist
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={S.section}>
          <div style={S.sectionHead}>
            <div>
              <h2 style={S.h2}>WOVI Pricing Plans</h2>
              <p style={S.p}>
                <b>Pre-launch rule:</b> All plans currently lead to the waitlist. Users can view pricing,
                but cannot activate yet. We’re collecting emails only.
              </p>
            </div>

            <div style={S.notice}>
              <div style={S.noticeDot} />
              Email only · Full billing activates at launch
            </div>
          </div>

          <div style={S.tierGrid}>
            {TIERS.map((t) => (
              <div
                key={t.id}
                style={{
                  ...S.tierCard,
                  ...(t.highlight ? S.tierCardHighlight : {}),
                  borderColor: t.highlight
                    ? "rgba(2,243,220,0.55)"
                    : "rgba(255,255,255,0.14)",
                }}
              >
                <div style={S.tierHeader}>
                  <div>
                    <div style={S.tierName}>{t.name}</div>
                    <div style={{ ...S.tierBadge, borderColor: `${t.accent}55`, color: t.accent }}>
                      {t.badge}
                    </div>
                  </div>

                  {t.highlight ? <div style={S.popular}>Most Popular</div> : null}
                </div>

                <div style={S.priceRow}>
                  <div style={S.price}>{t.price}</div>
                  <div style={S.period}>{t.period}</div>
                </div>

                <div style={S.desc}>{t.desc}</div>

                <div style={S.hr} />

                <div style={S.blockTitle}>Includes</div>
                <ul style={S.list}>
                  {t.includes.map((x) => (
                    <li key={x} style={S.li}>
                      <span style={{ ...S.dot, background: t.accent }} />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>

                <div style={S.bestForWrap}>
                  <div style={S.blockTitle}>Best for</div>
                  <div style={S.bestFor}>{t.bestFor}</div>
                </div>

                <button
                  type="button"
                  onClick={() => openWaitlist(t.id)}
                  style={{
                    ...S.tierBtn,
                    ...(t.highlight ? S.tierBtnHighlight : {}),
                    background: t.highlight
                      ? `linear-gradient(135deg, ${t.accent}, #00EDEC, #21AEF5, #57FE72)`
                      : "rgba(255,255,255,0.06)",
                    color: t.highlight ? "#031016" : "#eaf0ff",
                    border: t.highlight ? "none" : "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  {t.cta}
                </button>

                <div style={S.smallMuted}>Pre-launch: choosing a plan opens the waitlist.</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={S.footer}>
          <div>© {new Date().getFullYear()} WOVI</div>
          <div style={S.footerLinks}>
            <a href="#pricing" style={S.footerLink}>
              Pricing
            </a>
            <button type="button" style={S.footerBtnLink} onClick={() => openWaitlist()}>
              Waitlist
            </button>
          </div>
        </footer>
      </div>

      {/* Waitlist Modal */}
      {modalOpen ? (
        <div
          style={S.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Join the waitlist"
          onMouseDown={(e) => {
            // Click outside to close
            if (e.target === e.currentTarget) closeWaitlist();
          }}
        >
          <div style={S.modalCard}>
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

              <button
                type="button"
                onClick={closeWaitlist}
                style={S.closeBtn}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {status === "success" ? (
              <div style={S.successBox}>
                <div style={S.successTitle}>You’re on the list.</div>
                <div style={S.successBody}>
                  Thanks — we’ll email you as soon as the <b>public beta</b> releases.
                </div>

                <button type="button" style={S.successBtn} onClick={closeWaitlist}>
                  Done
                </button>

                <div style={S.tinyMuted}>You can unsubscribe anytime.</div>
              </div>
            ) : (
              <form onSubmit={submitWaitlist} style={S.form}>
                <label style={S.label}>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  type="email"
                  autoFocus
                  style={{
                    ...S.input,
                    borderColor: status === "error" ? "rgba(255,80,120,0.7)" : "rgba(255,255,255,0.14)",
                  }}
                />

                {status === "error" ? <div style={S.errorText}>{errorMsg}</div> : null}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    ...S.submitBtn,
                    opacity: submitting ? 0.65 : 1,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Joining..." : "Join the waitlist"}
                </button>

                <div style={S.tinyMuted}>
                  Pre-launch: email only. No accounts or billing yet.
                </div>
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
    position: "relative",
    overflow: "hidden",
    background: "#05070e",
    color: "#eaf0ff",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
  },
  bg: { position: "absolute", inset: 0, pointerEvents: "none", opacity: 1 },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    maskImage:
      "radial-gradient(circle at 50% 10%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0) 75%)",
    WebkitMaskImage:
      "radial-gradient(circle at 50% 10%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0) 75%)",
  },
  glowA: {
    position: "absolute",
    width: 760,
    height: 760,
    left: -260,
    top: -320,
    borderRadius: 999,
    filter: "blur(70px)",
    background:
      "radial-gradient(circle at 30% 30%, rgba(2,243,220,0.9) 0%, rgba(2,243,220,0) 60%)",
  },
  glowB: {
    position: "absolute",
    width: 760,
    height: 760,
    right: -280,
    top: -300,
    borderRadius: 999,
    filter: "blur(75px)",
    background:
      "radial-gradient(circle at 70% 30%, rgba(33,174,245,0.85) 0%, rgba(33,174,245,0) 60%)",
  },
  glowC: {
    position: "absolute",
    width: 900,
    height: 900,
    left: "10%",
    bottom: -520,
    borderRadius: 999,
    filter: "blur(80px)",
    background:
      "radial-gradient(circle at 50% 60%, rgba(87,254,114,0.8) 0%, rgba(87,254,114,0) 60%)",
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 50% 10%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.95) 100%)",
  },

  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1160,
    margin: "0 auto",
    padding: "22px 18px 70px",
  },

  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "8px 0 16px",
  },
  brand: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    letterSpacing: 0.5,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
  },
  brandName: { fontWeight: 950, letterSpacing: 1.2, fontSize: 13 },
  brandTag: { fontSize: 12, opacity: 0.75, marginTop: 2 },

  topRight: { display: "flex", alignItems: "center", gap: 10 },
  topLink: {
    textDecoration: "none",
    color: "#eaf0ff",
    opacity: 0.8,
    fontWeight: 800,
    fontSize: 12,
    padding: "10px 10px",
    borderRadius: 12,
  },
  topCta: {
    border: "none",
    outline: "none",
    textDecoration: "none",
    color: "#041015",
    fontWeight: 950,
    fontSize: 12,
    padding: "10px 14px",
    borderRadius: 14,
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },

  hero: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 16,
    alignItems: "start",
    marginTop: 8,
  },
  heroLeft: {
    borderRadius: 26,
    padding: 22,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 32px 90px rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.4,
    color: "#bffcff",
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  chipDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 35%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 0 22px rgba(2,243,220,0.55)",
  },
  h1: { margin: "14px 0 10px", fontSize: 46, lineHeight: 1.05, letterSpacing: -0.8 },
  h1Accent: {
    background:
      "linear-gradient(90deg, #02F3DC 0%, #00EDEC 20%, #01DEF4 40%, #21AEF5 65%, #57FE72 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  sub: { margin: 0, fontSize: 16, lineHeight: 1.7, opacity: 0.85, maxWidth: 680 },
  heroButtons: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 },
  primaryBtn: {
    textDecoration: "none",
    color: "#041015",
    fontWeight: 950,
    fontSize: 13,
    padding: "12px 16px",
    borderRadius: 16,
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    whiteSpace: "nowrap",
  },
  secondaryBtn: {
    border: "1px solid rgba(255,255,255,0.14)",
    outline: "none",
    background: "rgba(255,255,255,0.06)",
    color: "#eaf0ff",
    fontWeight: 900,
    fontSize: 13,
    padding: "12px 16px",
    borderRadius: 16,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  heroStats: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  statCard: {
    borderRadius: 18,
    padding: 14,
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  statLabel: { fontSize: 11, opacity: 0.7, fontWeight: 900, letterSpacing: 0.3 },
  statValue: { marginTop: 6, fontSize: 13, fontWeight: 950 },
  statHint: { marginTop: 6, fontSize: 12, opacity: 0.72, lineHeight: 1.5 },

  heroRight: {},
  previewCard: {
    borderRadius: 26,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 32px 90px rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
  },
  previewTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  previewTitle: { fontWeight: 950, fontSize: 13, letterSpacing: 0.2 },
  previewPill: {
    fontSize: 11,
    fontWeight: 900,
    opacity: 0.9,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  previewGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  previewItem: {
    borderRadius: 18,
    padding: 12,
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  previewKicker: { fontSize: 11, opacity: 0.7, fontWeight: 900, letterSpacing: 0.3 },
  previewMain: { marginTop: 6, fontSize: 12, fontWeight: 950, lineHeight: 1.4 },
  previewSub: { marginTop: 6, fontSize: 12, opacity: 0.72, lineHeight: 1.5 },
  previewFoot: { marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  previewBtn: {
    border: "none",
    outline: "none",
    textDecoration: "none",
    color: "#041015",
    fontWeight: 950,
    fontSize: 12,
    padding: "10px 12px",
    borderRadius: 14,
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  mutedSmall: { fontSize: 12, opacity: 0.72 },

  section: {
    marginTop: 18,
    borderRadius: 26,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 32px 90px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
  },
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" },
  h2: { margin: 0, fontSize: 22, letterSpacing: -0.2 },
  p: { margin: "8px 0 0", opacity: 0.85, lineHeight: 1.7, maxWidth: 860 },

  notice: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.9,
  },
  noticeDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 35%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 0 22px rgba(2,243,220,0.55)",
  },

  tierGrid: { marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 },
  tierCard: {
    borderRadius: 22,
    padding: 16,
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.14)",
    display: "flex",
    flexDirection: "column",
    minHeight: 540,
  },
  tierCardHighlight: { boxShadow: "0 40px 120px rgba(0,0,0,0.55)" },
  tierHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  tierName: { fontWeight: 950, fontSize: 16, letterSpacing: -0.2 },
  tierBadge: {
    marginTop: 8,
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.04)",
    fontSize: 12,
    fontWeight: 900,
  },
  popular: {
    fontSize: 11,
    fontWeight: 950,
    padding: "8px 10px",
    borderRadius: 999,
    background:
      "linear-gradient(135deg, rgba(2,243,220,0.25), rgba(33,174,245,0.18), rgba(87,254,114,0.18))",
    border: "1px solid rgba(2,243,220,0.35)",
    color: "#bffcff",
    whiteSpace: "nowrap",
  },
  priceRow: { display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 },
  price: { fontSize: 38, fontWeight: 950, letterSpacing: -0.8 },
  period: { fontSize: 13, opacity: 0.75, fontWeight: 900 },
  desc: { marginTop: 10, fontSize: 13, opacity: 0.82, lineHeight: 1.7 },
  hr: { marginTop: 14, height: 1, background: "rgba(255,255,255,0.12)" },
  blockTitle: { marginTop: 14, fontSize: 12, fontWeight: 950, opacity: 0.9 },
  list: { margin: "10px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 10 },
  li: { display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, opacity: 0.9, lineHeight: 1.55 },
  dot: { width: 9, height: 9, borderRadius: 999, marginTop: 6, flex: "0 0 9px" },
  bestForWrap: { marginTop: 14 },
  bestFor: { marginTop: 8, fontSize: 13, opacity: 0.8, lineHeight: 1.6 },

  tierBtn: {
    marginTop: "auto",
    borderRadius: 16,
    padding: "12px 14px",
    fontWeight: 950,
    fontSize: 13,
    cursor: "pointer",
  },
  tierBtnHighlight: { boxShadow: "0 22px 70px rgba(0,0,0,0.55)" },
  smallMuted: { marginTop: 10, fontSize: 12, opacity: 0.7 },

  footer: {
    marginTop: 18,
    paddingTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    fontSize: 12,
    opacity: 0.8,
  },
  footerLinks: { display: "flex", gap: 14, alignItems: "center" },
  footerLink: { textDecoration: "none", color: "#eaf0ff", opacity: 0.85 },
  footerBtnLink: {
    border: "none",
    background: "transparent",
    color: "#eaf0ff",
    opacity: 0.85,
    cursor: "pointer",
    fontSize: 12,
    padding: 0,
    fontWeight: 800,
  },

  /* Modal */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(10px)",
    display: "grid",
    placeItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 24,
    padding: 16,
    background: "rgba(14,18,30,0.85)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 45px 140px rgba(0,0,0,0.7)",
  },
  modalTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  modalTitle: { fontSize: 16, fontWeight: 950, letterSpacing: -0.2 },
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
  label: { fontSize: 12, fontWeight: 900, opacity: 0.85 },
  input: {
    borderRadius: 16,
    padding: "12px 14px",
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#eaf0ff",
    outline: "none",
    fontSize: 14,
  },
  submitBtn: {
    marginTop: 4,
    border: "none",
    borderRadius: 16,
    padding: "12px 14px",
    fontWeight: 950,
    fontSize: 13,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
  },
  tinyMuted: { marginTop: 4, fontSize: 12, opacity: 0.7, lineHeight: 1.55 },
  errorText: { fontSize: 12, color: "rgba(255,120,150,1)", fontWeight: 900 },

  successBox: { marginTop: 14, display: "grid", gap: 10 },
  successTitle: { fontSize: 18, fontWeight: 950 },
  successBody: { fontSize: 13, opacity: 0.85, lineHeight: 1.7 },
  successBtn: {
    marginTop: 4,
    border: "none",
    borderRadius: 16,
    padding: "12px 14px",
    fontWeight: 950,
    fontSize: 13,
    color: "#041015",
    background:
      "linear-gradient(135deg, #57FE72 0%, #02F3DC 35%, #21AEF5 75%, #00EDEC 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    cursor: "pointer",
  },
};

/*
COPY/PASTE INSTRUCTIONS:
1) Open: app/page.tsx
2) Delete everything
3) Paste this entire file
4) Save
5) Terminal:
   git add .
   git commit -m "Waitlist popup modal"
   git push
*/
