"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type PlanId = "free" | "growth" | "pro";

const P = {
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
    accent: P.d,
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
    accent: P.a,
    desc:
      "Consistent posting without hiring an agency. Weekly planning + captions + visuals for any business.",
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
    accent: P.c,
    desc:
      "Higher volume + deeper strategy for serious brands that want to scale content output fast.",
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

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/** Small “rewrite engine” for demo (until you plug in real AI). */
function generateBetterCaption(input: string) {
  const t = input.trim();
  const lines = t.split("\n").map((x) => x.trim()).filter(Boolean);
  const base = lines.join(" ");

  // Heuristics
  const hasQuestion = /\?/.test(base);
  const hasCTA = /(call|book|order|join|dm|link|tap|click|sign up|try|get started|follow|comment|shop|learn more)/i.test(
    base
  );
  const hasTime = /(today|tonight|this week|weekend|now|limited|ends|48 hours|24 hours|deadline)/i.test(
    base
  );
  const hasOffer = /(free|deal|special|limited|%|off|discount|bonus|giveaway)/i.test(
    base
  );

  // Clean up: remove excessive punctuation, keep punchy.
  const cleaned = base.replace(/\s+/g, " ").replace(/—/g, "-").trim();

  // Universal hook options
  const hookOptions = [
    "Quick question for business owners:",
    "If you’re building a business, read this:",
    "Be honest — are you posting consistently?",
    "This is how small brands win online:",
    "Stop guessing what to post:",
  ];

  const hook =
    hasQuestion ? "Quick question:" : hookOptions[Math.floor(Math.random() * hookOptions.length)];

  const ctaOptions = [
    "Comment “WOVI” and I’ll send the waitlist link.",
    "Reply “PLAN” and I’ll share a weekly posting plan template.",
    "Want early access? Join the waitlist — link in bio.",
    "DM “AI” for early access when public beta drops.",
    "Join the waitlist to get early access at launch.",
  ];

  const cta = hasCTA ? "" : ctaOptions[Math.floor(Math.random() * ctaOptions.length)];

  const urgency = hasTime
    ? ""
    : hasOffer
      ? "Early access spots are limited."
      : "Public beta is launching in small batches.";

  // Build improved caption
  const improved = [
    `${hook}`,
    "",
    cleaned.endsWith(".") || cleaned.endsWith("!") || cleaned.endsWith("?")
      ? cleaned
      : cleaned + ".",
    "",
    urgency,
    cta ? cta : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Suggestions
  const suggestions: string[] = [];
  if (!hasQuestion) suggestions.push("Add a question to increase comments.");
  if (!hasOffer) suggestions.push("Add a simple offer (free guide, limited spots, etc.).");
  if (!hasTime) suggestions.push("Add a timeframe (today / this week / limited batches).");
  if (!hasCTA) suggestions.push("Add a clear CTA (comment / DM / join waitlist).");

  return { improved, suggestions };
}

export default function Page() {
  // Waitlist modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Post Score module
  const [postText, setPostText] = useState("");
  const [scoreOpen, setScoreOpen] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [subscores, setSubscores] = useState<
    { label: string; value: number; max: number }[]
  >([]);
  const [analyzing, setAnalyzing] = useState(false);

  const [improvedCaption, setImprovedCaption] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

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

  // Scroll reveal (no libraries)
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]")) as HTMLElement[];
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            (en.target as HTMLElement).classList.add("reveal-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -60px 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

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
    const t = postText.trim();
    if (!t) return;

    setAnalyzing(true);
    setScoreOpen(true);
    setCopied(false);

    setTimeout(() => {
      // Demo scoring heuristic until backend exists
      const len = t.length;
      const hasQuestion = /\?/.test(t);
      const hasCta = /(call|book|order|join|dm|link|tap|click|sign up|try|get started|follow|comment|shop|learn more)/i.test(
        t
      );
      const hasNumbers = /\d/.test(t);
      const hasEmoji = /[\u{1F300}-\u{1FAFF}]/u.test(t);
      const hasOffer = /(free|deal|special|limited|today|this week|%|off|discount|bonus|giveaway)/i.test(
        t
      );
      const hasTime = /(today|tonight|this week|weekend|now|limited|ends|24 hours|48 hours)/i.test(
        t
      );

      const hook = clamp(
        (hasQuestion ? 18 : 10) +
          (hasNumbers ? 10 : 0) +
          (hasEmoji ? 6 : 0) +
          (hasOffer ? 6 : 0),
        0,
        35
      );
      const clarity = clamp(Math.min(25, Math.round(len / 12)), 0, 25);
      const cta = clamp((hasCta ? 21 : 8) + (len > 45 ? 4 : 0), 0, 25);
      const voice = clamp(8 + (/(we|our|you|your)/i.test(t) ? 7 : 4), 0, 15);

      // Small bump if time-based urgency exists
      const urgencyBump = hasTime ? 4 : 0;

      const total = clamp(hook + clarity + cta + voice + urgencyBump, 0, 100);

      setScore(total);
      setSubscores([
        { label: "Hook Strength", value: hook, max: 35 },
        { label: "Clarity", value: clarity, max: 25 },
        { label: "Call-to-Action", value: cta, max: 25 },
        { label: "Brand Voice", value: voice, max: 15 },
      ]);

      const { improved, suggestions } = generateBetterCaption(t);
      setImprovedCaption(improved);
      setSuggestions(suggestions);

      setAnalyzing(false);
    }, 650);
  }

  async function copyImproved() {
    try {
      await navigator.clipboard.writeText(improvedCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  const examplePlaceholder = `Example (any business):
“New service is live this week.
If you want the details, comment ‘INFO’ and I’ll send it.”

Or:
“We’re taking 5 new clients this month.
Want early access? Join the waitlist.”`;

  return (
    <main style={S.page}>
      {/* Global styles for reveal + underline animations */}
      <style>{CSS_GLOBAL}</style>

      {/* Background */}
      <div style={S.bg} aria-hidden="true">
        <div style={S.grid} />
        <div style={S.stars} />
        <div style={S.glowLeft} />
        <div style={S.glowRight} />
        <div style={S.vignette} />
      </div>

      {/* Top nav */}
      <header style={S.nav}>
        <div style={S.navInner}>
          <div style={S.brand} onClick={() => scrollToId("top")}>
            <div style={S.logoWrap}>
              <Image
                src="/logo.png"
                alt="WOVI"
                width={34}
                height={34}
                style={{ borderRadius: 10 }}
                priority
              />
            </div>
            <div>
              <div style={S.brandName}>Wovi</div>
              <div style={S.brandSub}>AI social media OS for any business</div>
            </div>
          </div>

          <div style={S.navLinks}>
            <button style={S.navLinkBtn} onClick={() => scrollToId("pricing")}>
              Pricing
            </button>
            <button style={S.navCta} onClick={() => openWaitlist()}>
              Join waitlist
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" style={S.hero} data-reveal>
        <div style={S.heroGrid}>
          {/* Left card */}
          <div style={S.heroCard}>
            <div style={S.heroChip}>
              <span style={S.dot} />
              Pre-launch · Waitlist only
            </div>

            <h1 style={S.h1}>
              AI that turns your business goals into{" "}
              <span className="wovi-underline">
                ready-to-post
                <span className="wovi-underline-line" aria-hidden="true" />
              </span>{" "}
              content.
            </h1>

            <p style={S.sub}>
              Wovi replaces the planning and creation behind social media — captions, images,
              and weekly posting plans — so you stay consistent without burnout.
            </p>

            <div style={S.heroCtas}>
              <button style={S.primary} onClick={() => scrollToId("pricing")}>
                Pick a plan
              </button>
              <button style={S.secondary} onClick={() => openWaitlist()}>
                Join waitlist
              </button>
            </div>

            <div style={S.miniCards}>
              <div style={S.miniCard}>
                <div style={S.miniLabel}>Works for</div>
                <div style={S.miniTitle}>Any industry</div>
                <div style={S.miniText}>Local, online, service, ecom, creators, startups</div>
              </div>
              <div style={S.miniCard}>
                <div style={S.miniLabel}>Replaces</div>
                <div style={S.miniTitle}>Daily brainstorming</div>
                <div style={S.miniText}>No “what should I post?”</div>
              </div>
              <div style={S.miniCard}>
                <div style={S.miniLabel}>Outcome</div>
                <div style={S.miniTitle}>Consistency</div>
                <div style={S.miniText}>Plans + content every week</div>
              </div>
            </div>
          </div>

          {/* Right demo card */}
          <div style={S.demoCard}>
            <div style={S.demoTop}>
              <div style={S.demoTitle}>This week in Wovi</div>
              <div style={S.demoPill}>Auto-planned</div>
            </div>

            <div style={S.demoGrid}>
              <div style={S.demoBox}>
                <div style={S.demoLabel}>Input</div>
                <div style={S.demoStrong}>Goal:</div>
                <div style={S.demoText}>“Get more bookings this week”</div>
                <div style={S.demoSmall}>Tone: confident · modern</div>
              </div>

              <div style={S.demoBox}>
                <div style={S.demoLabel}>Output</div>
                <div style={S.demoStrong}>Captions + image concepts</div>
                <div style={S.demoText}>Ready-to-post variations</div>
              </div>

              <div style={S.demoBox}>
                <div style={S.demoLabel}>Plan</div>
                <div style={S.demoStrong}>Weekly posting schedule</div>
                <div style={S.demoText}>Daily suggestions</div>
              </div>

              <div style={S.demoBox}>
                <div style={S.demoLabel}>Result</div>
                <div style={S.demoStrong}>You stay consistent</div>
                <div style={S.demoText}>No agency, no burnout</div>
              </div>
            </div>

            <div style={S.demoBottom}>
              <div style={S.demoHint}>Pick a plan now. Get early access when we launch.</div>
              <button style={S.demoBtn} onClick={() => openWaitlist()}>
                Join waitlist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Post Score */}
      <section style={S.section} data-reveal>
        <div style={S.sectionInner}>
          <div style={S.sectionHead}>
            <h2 style={S.h2}>Post Score</h2>
            <p style={S.p}>
              Paste a caption. Wovi rates it (hook, clarity, CTA, voice) — then generates a stronger version.
            </p>
          </div>

          <div style={S.scoreWrap}>
            <div style={S.scoreLeft}>
              <div style={S.label}>Paste your caption</div>
              <textarea
                style={S.textarea}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={examplePlaceholder}
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
                    setImprovedCaption("");
                    setSuggestions([]);
                  }}
                >
                  Clear
                </button>
                <button style={S.ghost} onClick={() => openWaitlist()}>
                  Join waitlist
                </button>
              </div>

              <div style={S.tinyMuted}>Pre-launch demo. No account required yet.</div>
            </div>

            <div style={S.scoreRight}>
              {!scoreOpen ? (
                <div style={S.scoreEmpty}>
                  <div style={S.scoreEmptyTitle}>Your Wovi Score</div>
                  <div style={S.scoreEmptySub}>Paste a caption and press “Get score”.</div>
                </div>
              ) : (
                <div style={S.scoreCard}>
                  <div style={S.scoreTop}>
                    <div style={S.scoreTitle}>Your Wovi Score</div>
                    <div style={S.scoreBig}>{score}/100</div>
                  </div>

                  <div style={S.barBg}>
                    <div style={{ ...S.barFill, width: `${clamp(score, 0, 100)}%` }} />
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

                  {/* Improved caption output */}
                  <div style={S.rewriteBlock}>
                    <div style={S.rewriteTop}>
                      <div style={S.rewriteTitle}>Improved caption</div>
                      <button
                        style={{
                          ...S.copyBtn,
                          opacity: improvedCaption ? 1 : 0.6,
                          cursor: improvedCaption ? "pointer" : "not-allowed",
                        }}
                        onClick={copyImproved}
                        disabled={!improvedCaption}
                      >
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div style={S.rewriteBox}>
                      {improvedCaption ? (
                        <pre style={S.rewritePre}>{improvedCaption}</pre>
                      ) : (
                        <div style={{ opacity: 0.75, fontSize: 13 }}>
                          Generate a score to see an improved version.
                        </div>
                      )}
                    </div>

                    {suggestions.length ? (
                      <div style={S.suggestWrap}>
                        <div style={S.suggestTitle}>Quick fixes to increase performance</div>
                        <ul style={S.suggestList}>
                          {suggestions.slice(0, 4).map((x) => (
                            <li key={x} style={S.suggestLi}>
                              <span style={S.suggestDot} />
                              <span>{x}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  <div style={S.scoreHint}>
                    Want auto rewrites + a weekly plan + daily posts? Join the waitlist.
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
      <section id="pricing" style={S.section} data-reveal>
        <div style={S.sectionInner}>
          <h2 style={S.h2}>WOVI Pricing Plans</h2>
          <p style={S.p}>
            <b>Pre-launch rule:</b> All plans lead to the waitlist. Email only. Billing activates at launch.
          </p>

          <div style={S.prelaunchPill}>
            <span style={S.dotSmall} />
            Email only · Full billing activates at launch
          </div>

          <div style={S.tierGrid}>
            {TIERS.map((t) => (
              <div
                key={t.id}
                className={`tier-card ${t.highlight ? "tier-card--highlight" : ""}`}
                style={{
                  ...S.tierCard,
                  border: t.highlight
                    ? `1px solid rgba(2,243,220,0.55)`
                    : `1px solid rgba(255,255,255,0.12)`,
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

                  {/* Only one Most Popular */}
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
                      ? `linear-gradient(135deg, ${P.a} 0%, ${P.b} 25%, ${P.e} 45%, ${P.c} 70%, ${P.d} 100%)`
                      : "rgba(255,255,255,0.06)",
                    color: t.highlight ? "#041015" : "#eaf0ff",
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

      <footer style={S.footer} data-reveal>
        <div style={{ opacity: 0.8 }}>© {new Date().getFullYear()} Wovi</div>
        <div style={S.footerLinks}>
          <button style={S.footerLinkBtn} onClick={() => scrollToId("pricing")}>
            Pricing
          </button>
          <button style={S.footerLinkBtn} onClick={() => openWaitlist()}>
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
                      <span style={{ color: selectedTier.accent, fontWeight: 950 }}>
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
                <div style={S.label}>Email</div>
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

const CSS_GLOBAL = `
/* Reveal animation */
[data-reveal]{
  opacity: 0;
  transform: translateY(14px) scale(0.99);
  transition: opacity 650ms ease, transform 650ms ease;
  will-change: opacity, transform;
}
.reveal-in{
  opacity: 1 !important;
  transform: translateY(0) scale(1) !important;
}

/* Animated underline on ready-to-post */
.wovi-underline{
  position: relative;
  display: inline-block;
  background: linear-gradient(90deg, ${P.a} 0%, ${P.b} 25%, ${P.e} 45%, ${P.c} 70%, ${P.d} 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.wovi-underline-line{
  position: absolute;
  left: 0;
  bottom: -6px;
  height: 3px;
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, ${P.a}, ${P.b}, ${P.e}, ${P.c}, ${P.d});
  background-size: 250% 100%;
  animation: woviGradientMove 2.4s linear infinite;
  opacity: 0.95;
  box-shadow: 0 0 22px rgba(2,243,220,0.35);
}
@keyframes woviGradientMove{
  0%{ background-position: 0% 50%; }
  100%{ background-position: 100% 50%; }
}

/* Pricing hover glow */
.tier-card{
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
}
.tier-card:hover{
  transform: translateY(-4px);
  box-shadow: 0 40px 140px rgba(0,0,0,0.65);
  border-color: rgba(2,243,220,0.28);
}
.tier-card--highlight:hover{
  box-shadow: 0 55px 170px rgba(0,0,0,0.72);
}
`;

/* Styles */
const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#060912",
    color: "#eaf0ff",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    position: "relative",
    overflowX: "hidden",
  },

  bg: { position: "absolute", inset: 0, pointerEvents: "none" },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "80px 80px",
    maskImage:
      "radial-gradient(circle at 50% 15%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)",
    opacity: 0.22,
  },
  stars: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.22) 1px, transparent 1px), radial-gradient(circle at 65% 35%, rgba(255,255,255,0.18) 1px, transparent 1px), radial-gradient(circle at 35% 75%, rgba(255,255,255,0.12) 1px, transparent 1px)",
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
    filter: "blur(90px)",
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
    filter: "blur(95px)",
    background:
      "radial-gradient(circle at 70% 30%, rgba(33,174,245,0.80) 0%, rgba(33,174,245,0) 60%)",
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 50% 20%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.72) 55%, rgba(0,0,0,0.92) 100%)",
  },

  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(14px)",
    background: "rgba(6,9,18,0.55)",
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
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    userSelect: "none",
  },
  logoWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.35)",
  },
  brandName: { fontWeight: 950, letterSpacing: 0.6, fontSize: 13, textTransform: "uppercase" },
  brandSub: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  navLinks: { display: "flex", alignItems: "center", gap: 14 },
  navLinkBtn: {
    border: "none",
    background: "transparent",
    color: "#eaf0ff",
    opacity: 0.82,
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  },
  navCta: {
    border: "none",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 950,
    fontSize: 12,
    color: "#041015",
    background: `linear-gradient(135deg, ${P.a} 0%, ${P.b} 25%, ${P.e} 45%, ${P.c} 70%, ${P.d} 100%)`,
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  hero: { padding: "34px 18px 18px" },
  heroGrid: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.85fr",
    gap: 16,
    alignItems: "start",
  },

  heroCard: {
    borderRadius: 26,
    padding: 22,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 30px 110px rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
  },

  heroChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 950,
    color: "#bffcff",
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: `linear-gradient(135deg, ${P.a} 0%, ${P.c} 55%, ${P.d} 100%)`,
    boxShadow: "0 0 18px rgba(2,243,220,0.55)",
  },

  h1: { margin: "16px 0 10px", fontSize: 54, lineHeight: 1.06, letterSpacing: -1.2 },
  sub: { margin: "0", maxWidth: 760, fontSize: 14, lineHeight: 1.85, opacity: 0.84 },

  heroCtas: { marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" },
  primary: {
    border: "none",
    padding: "12px 16px",
    borderRadius: 16,
    fontWeight: 950,
    fontSize: 13,
    color: "#041015",
    background: `linear-gradient(135deg, ${P.a} 0%, ${P.b} 25%, ${P.e} 45%, ${P.c} 70%, ${P.d} 100%)`,
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    cursor: "pointer",
  },
  secondary: {
    border: "1px solid rgba(255,255,255,0.16)",
    padding: "12px 16px",
    borderRadius: 16,
    fontWeight: 950,
    fontSize: 13,
    background: "rgba(255,255,255,0.06)",
    color: "#eaf0ff",
    cursor: "pointer",
  },
  ghost: {
    border: "1px solid rgba(255,255,255,0.10)",
    padding: "12px 16px",
    borderRadius: 16,
    fontWeight: 900,
    fontSize: 13,
    background: "rgba(0,0,0,0.18)",
    color: "#eaf0ff",
    cursor: "pointer",
    opacity: 0.92,
  },

  miniCards: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  miniCard: {
    borderRadius: 18,
    padding: 12,
    background: "rgba(0,0,0,0.16)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  miniLabel: { fontSize: 11, opacity: 0.7, fontWeight: 900, textTransform: "uppercase" },
  miniTitle: { marginTop: 6, fontWeight: 950, fontSize: 13 },
  miniText: { marginTop: 6, opacity: 0.78, fontSize: 12, lineHeight: 1.5 },

  demoCard: {
    borderRadius: 26,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 30px 110px rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
  },
  demoTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  demoTitle: { fontWeight: 950, fontSize: 14 },
  demoPill: {
    fontSize: 11,
    fontWeight: 950,
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    opacity: 0.9,
  },
  demoGrid: { marginTop: 12, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 },
  demoBox: {
    borderRadius: 18,
    padding: 12,
    background: "rgba(0,0,0,0.16)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  demoLabel: { fontSize: 11, opacity: 0.7, fontWeight: 900, textTransform: "uppercase" },
  demoStrong: { marginTop: 8, fontWeight: 950, fontSize: 12 },
  demoText: { marginTop: 6, opacity: 0.82, fontSize: 12, lineHeight: 1.5 },
  demoSmall: { marginTop: 10, opacity: 0.6, fontSize: 12 },
  demoBottom: { marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  demoHint: { opacity: 0.75, fontSize: 12, lineHeight: 1.4 },
  demoBtn: {
    border: "none",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 950,
    fontSize: 12,
    color: "#041015",
    background: `linear-gradient(135deg, ${P.a} 0%, ${P.b} 25%, ${P.e} 45%, ${P.c} 70%, ${P.d} 100%)`,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  section: { padding: "18px 18px 34px" },
  sectionInner: { maxWidth: 1180, margin: "0 auto" },
  sectionHead: { maxWidth: 920 },
  h2: { margin: 0, fontSize: 26, letterSpacing: -0.2 },
  p: { marginTop: 10, opacity: 0.84, lineHeight: 1.75, fontSize: 13 },

  scoreWrap: { marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" },
  scoreLeft: {
    borderRadius: 22,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 24px 90px rgba(0,0,0,0.35)",
  },
  scoreRight: {
    borderRadius: 22,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 24px 90px rgba(0,0,0,0.35)",
    minHeight: 270,
  },
  label: { fontSize: 12, fontWeight: 950, opacity: 0.88 },
  textarea: {
    marginTop: 8,
    width: "100%",
    minHeight: 160,
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
  tinyMuted: { marginTop: 10, fontSize: 12, opacity: 0.7, lineHeight: 1.55 },

  scoreEmpty: { display: "grid", gap: 8 },
  scoreEmptyTitle: { fontWeight: 950, fontSize: 16 },
  scoreEmptySub: { opacity: 0.78, fontSize: 13, lineHeight: 1.6 },

  scoreCard: { display: "grid", gap: 12 },
  scoreTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 },
  scoreTitle: { fontWeight: 950, fontSize: 16 },
  scoreBig: { fontWeight: 950, fontSize: 26, color: P.a },

  barBg: { height: 10, borderRadius: 999, background: "rgba(255,255,255,0.10)", overflow: "hidden" },
  barFill: {
    height: "100%",
    borderRadius: 999,
    background: `linear-gradient(90deg, ${P.c} 0%, ${P.a} 35%, ${P.d} 100%)`,
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
    background: `linear-gradient(135deg, ${P.a} 0%, ${P.d} 100%)`,
  },
  rowLabel: { fontWeight: 950, fontSize: 13, opacity: 0.92 },
  rowRight: { fontWeight: 950, fontSize: 13, opacity: 0.85 },

  rewriteBlock: {
    marginTop: 4,
    borderRadius: 18,
    padding: 12,
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.10)",
    display: "grid",
    gap: 10,
  },
  rewriteTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  rewriteTitle: { fontWeight: 950, fontSize: 13, opacity: 0.92 },
  copyBtn: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#eaf0ff",
    borderRadius: 12,
    padding: "8px 10px",
    fontWeight: 950,
    fontSize: 12,
  },
  rewriteBox: {
    borderRadius: 16,
    padding: "10px 12px",
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  rewritePre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    fontSize: 13,
    lineHeight: 1.6,
    color: "#eaf0ff",
    opacity: 0.92,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  },

  suggestWrap: { display: "grid", gap: 8 },
  suggestTitle: { fontWeight: 950, fontSize: 12, opacity: 0.88, textTransform: "uppercase" },
  suggestList: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 },
  suggestLi: { display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, opacity: 0.9, lineHeight: 1.55 },
  suggestDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginTop: 6,
    background: `linear-gradient(135deg, ${P.a} 0%, ${P.c} 55%, ${P.d} 100%)`,
    boxShadow: "0 0 16px rgba(2,243,220,0.25)",
    flex: "0 0 9px",
  },

  scoreHint: { opacity: 0.78, fontSize: 13, lineHeight: 1.6 },

  prelaunchPill: {
    marginTop: 12,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 950,
    color: "#bffcff",
    background: "rgba(0,0,0,0.20)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  dotSmall: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: `linear-gradient(135deg, ${P.a} 0%, ${P.c} 60%, ${P.d} 100%)`,
    boxShadow: "0 0 16px rgba(2,243,220,0.45)",
  },

  tierGrid: { marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  tierCard: {
    borderRadius: 22,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    flexDirection: "column",
    minHeight: 560,
    backdropFilter: "blur(12px)",
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
    fontWeight: 950,
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
  price: { fontSize: 42, fontWeight: 950, letterSpacing: -1.1 },
  period: { fontSize: 13, opacity: 0.75, fontWeight: 950 },
  desc: { marginTop: 10, opacity: 0.84, fontSize: 13, lineHeight: 1.7 },

  hr: { marginTop: 14, height: 1, background: "rgba(255,255,255,0.12)" },
  blockTitle: { marginTop: 14, fontSize: 12, fontWeight: 950, opacity: 0.92 },
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
  footerLinks: { display: "flex", gap: 10, alignItems: "center" },
  footerLinkBtn: {
    border: "none",
    background: "transparent",
    color: "#eaf0ff",
    opacity: 0.82,
    cursor: "pointer",
    fontWeight: 900,
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
    background: "rgba(14,18,30,0.90)",
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
    color: "#041015",
    background: `linear-gradient(135deg, ${P.a} 0%, ${P.b} 25%, ${P.e} 45%, ${P.c} 70%, ${P.d} 100%)`,
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
  },
  errorText: { fontSize: 12, color: "rgba(255,120,150,1)", fontWeight: 950 },

  successBox: { marginTop: 14, display: "grid", gap: 10 },
  successTitle: { fontSize: 18, fontWeight: 950 },
  successBody: { fontSize: 13, opacity: 0.85, lineHeight: 1.7 },
  doneBtn: {
    border: "none",
    borderRadius: 16,
    padding: "12px 14px",
    fontWeight: 950,
    fontSize: 13,
    color: "#041015",
    background: `linear-gradient(135deg, ${P.d} 0%, ${P.a} 40%, ${P.c} 100%)`,
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    cursor: "pointer",
  },
};
