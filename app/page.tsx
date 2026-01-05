// app/page.tsx
import Link from "next/link";

const TIERS = [
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
      "AI image ideas (or images later)",
      "Brand tone learning",
      "Unlimited edits / regenerations",
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

export default function Page() {
  return (
    <main style={S.page}>
      {/* Futuristic gradient background */}
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
          <div style={S.brand}>
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
            <Link href="/waitlist" style={S.topCta}>
              Join waitlist
            </Link>
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
              <Link href="/waitlist" style={S.secondaryBtn}>
                Join waitlist
              </Link>
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

          {/* Right preview card */}
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
                <Link href="/waitlist" style={S.previewBtn}>
                  Join waitlist
                </Link>
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
                <b>Pre-launch rule:</b> All plans currently lead to the waitlist.
                View pricing now — activate at launch.
              </p>
            </div>

            <div style={S.notice}>
              <div style={S.noticeDot} />
              Email only · No accounts · No cards (yet)
            </div>
          </div>

          <div style={S.tierGrid}>
            {TIERS.map((t) => (
              <div
                key={t.id}
                style={{
                  ...S.tierCard,
                  ...(t.highlight ? S.tierCardHighlight : {}),
                  borderColor: t.highlight ? "rgba(2,243,220,0.55)" : "rgba(255,255,255,0.14)",
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

                <Link
                  href={`/waitlist?plan=${encodeURIComponent(t.id)}`}
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
                </Link>

                <div style={S.smallMuted}>
                  Pre-launch: choosing a plan takes you to the waitlist.
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Billing rules */}
        <section style={S.section}>
          <div style={S.sectionHeadSimple}>
            <h2 style={S.h2}>Billing rules (when live)</h2>
            <p style={S.p}>
              Stripe subscriptions at launch. Monthly billing. Cancel anytime. Upgrade or downgrade anytime.
              No contracts.
            </p>
          </div>

          <div style={S.rulesGrid}>
            {[
              "All plans require a credit card",
              "Free Trial still requires a card",
              "Monthly recurring billing",
              "Cancel anytime",
              "Upgrade or downgrade anytime",
              "No contracts",
            ].map((x) => (
              <div key={x} style={S.ruleCard}>
                <span style={S.ruleDot} />
                {x}
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section style={S.section}>
          <div style={S.sectionHeadSimple}>
            <h2 style={S.h2}>How Wovi works</h2>
            <p style={S.p}>
              Tell Wovi what matters this week. Wovi creates the content and plan. You stay consistent.
            </p>
          </div>

          <div style={S.steps}>
            <div style={S.stepCard}>
              <div style={S.stepNum}>1</div>
              <div>
                <div style={S.stepTitle}>Tell Wovi your goals</div>
                <div style={S.stepBody}>
                  Promotions, events, offers, announcements, brand tone, industry.
                </div>
              </div>
            </div>
            <div style={S.stepCard}>
              <div style={S.stepNum}>2</div>
              <div>
                <div style={S.stepTitle}>Wovi generates content</div>
                <div style={S.stepBody}>
                  Captions, image ideas (or images), weekly plan, daily post suggestions.
                </div>
              </div>
            </div>
            <div style={S.stepCard}>
              <div style={S.stepNum}>3</div>
              <div>
                <div style={S.stepTitle}>You post consistently</div>
                <div style={S.stepBody}>
                  No burnout. No guessing. No agencies.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={S.ctaSection}>
          <div style={S.ctaCard}>
            <div>
              <div style={S.ctaKicker}>Waitlist flow (right now)</div>
              <div style={S.ctaTitle}>Pick a plan now. Get early access when we launch.</div>
              <div style={S.ctaBody}>
                Clicking any plan redirects to the waitlist. Enter email only. You’ll get notified at launch.
              </div>
            </div>
            <Link href="/waitlist" style={S.ctaBtn}>
              Go to waitlist
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={S.footer}>
          <div>© {new Date().getFullYear()} WOVI</div>
          <div style={S.footerLinks}>
            <a href="#pricing" style={S.footerLink}>
              Pricing
            </a>
            <Link href="/waitlist" style={S.footerLink}>
              Waitlist
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
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
  brand: { display: "flex", alignItems: "center", gap: 10 },
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
    textDecoration: "none",
    color: "#eaf0ff",
    fontWeight: 900,
    fontSize: 13,
    padding: "12px 16px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
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
  previewFoot: {
    marginTop: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  previewBtn: {
    textDecoration: "none",
    color: "#041015",
    fontWeight: 950,
    fontSize: 12,
    padding: "10px 12px",
    borderRadius: 14,
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
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
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  sectionHeadSimple: { marginBottom: 10 },
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
  tierGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  tierCard: {
    borderRadius: 22,
    padding: 16,
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.14)",
    display: "flex",
    flexDirection: "column",
    minHeight: 520,
  },
  tierCardHighlight: {
    boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
  },
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
    textDecoration: "none",
    display: "block",
    textAlign: "center",
    fontWeight: 950,
    fontSize: 13,
    padding: "12px 14px",
    borderRadius: 16,
  },
  tierBtnHighlight: {
    boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
  },
  smallMuted: { marginTop: 10, fontSize: 12, opacity: 0.7 },
  rulesGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  ruleCard: {
    borderRadius: 18,
    padding: 14,
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    fontWeight: 900,
    opacity: 0.92,
  },
  ruleDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 35%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 0 22px rgba(2,243,220,0.55)",
    flex: "0 0 10px",
  },
  steps: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  stepCard: {
    borderRadius: 18,
    padding: 14,
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  stepNum: {
    width: 34,
    height: 34,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    flex: "0 0 34px",
  },
  stepTitle: { fontWeight: 950, fontSize: 13 },
  stepBody: { marginTop: 6, fontSize: 13, opacity: 0.78, lineHeight: 1.6 },
  ctaSection: { marginTop: 18 },
  ctaCard: {
    borderRadius: 26,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2,243,220,0.14), rgba(33,174,245,0.12), rgba(87,254,114,0.12))",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 32px 90px rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  ctaKicker: { fontSize: 12, fontWeight: 950, opacity: 0.8 },
  ctaTitle: { marginTop: 6, fontSize: 18, fontWeight: 950, letterSpacing: -0.2 },
  ctaBody: { marginTop: 8, fontSize: 13, opacity: 0.82, lineHeight: 1.6, maxWidth: 760 },
  ctaBtn: {
    textDecoration: "none",
    color: "#041015",
    fontWeight: 950,
    fontSize: 13,
    padding: "12px 14px",
    borderRadius: 16,
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    whiteSpace: "nowrap",
  },
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
  footerLinks: { display: "flex", gap: 14 },
  footerLink: { textDecoration: "none", color: "#eaf0ff", opacity: 0.85 },
};

/*
COPY/PASTE INSTRUCTIONS:
1) Open: app/page.tsx
2) Delete everything
3) Paste this entire file
4) Save (Ctrl+S)
5) Terminal:
   git add .
   git commit -m "Modern futuristic homepage"
   git push
*/
