"use client";

import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type Score = {
  total: number; // 0-100
  breakdown: { label: string; score: number; max: number; note: string }[];
  improved: string;
};

export default function HomePage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("Growth");

  const [caption, setCaption] = useState("");
  const [loadingScore, setLoadingScore] = useState(false);
  const [score, setScore] = useState<Score | null>(null);

  // swipe dots
  const swipeRef = useRef<HTMLDivElement | null>(null);
  const [activeDot, setActiveDot] = useState(0);

  // Close modal with ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setWaitlistOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const prettyPlan = useMemo(() => {
    if (selectedPlan === "Free Trial") return "Free Trial";
    if (selectedPlan === "Pro") return "Pro";
    return "Growth";
  }, [selectedPlan]);

  function openWaitlist(plan?: string) {
    if (plan) setSelectedPlan(plan);
    setWaitlistDone(false);
    setWaitlistError(null);
    setWaitlistOpen(true);
  }

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  async function submitWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setWaitlistError(null);

    const v = email.trim();
    if (!validateEmail(v)) {
      setWaitlistError("Please enter a real email.");
      return;
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v, plan: prettyPlan }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      setWaitlistDone(true);
      setEmail("");
    } catch (err: any) {
      setWaitlistError("Something went wrong. Try again in 10 seconds.");
    }
  }

  // Demo scoring (no external AI yet). Still looks/feels “AI.”
  async function getScore() {
    setLoadingScore(true);
    setScore(null);

    // simulate latency
    await new Promise((r) => setTimeout(r, 650));

    const raw = caption.trim();
    if (!raw) {
      setLoadingScore(false);
      setScore({
        total: 0,
        breakdown: [
          { label: "Hook", score: 0, max: 25, note: "Add a stronger first line that stops the scroll." },
          { label: "Clarity", score: 0, max: 25, note: "Make the offer / point obvious in 1 sentence." },
          { label: "CTA", score: 0, max: 25, note: "Tell people exactly what to do next." },
          { label: "Voice", score: 0, max: 25, note: "Match your brand tone (confident / modern)." },
        ],
        improved: "Paste a caption first — then press “Get score”.",
      });
      return;
    }

    // Simple heuristic scoring
    const words = raw.split(/\s+/).filter(Boolean);
    const hasQuestion = raw.includes("?");
    const hasCTA =
      /(comment|dm|message|call|book|order|tap|click|link|shop|buy|reserve|subscribe|follow)/i.test(raw);
    const hasNumbers = /\d/.test(raw);
    const firstLine = raw.split("\n")[0] || raw;

    const hook = Math.min(
      25,
      Math.max(
        8,
        (hasQuestion ? 6 : 0) +
          (firstLine.length < 70 ? 8 : 4) +
          (/(you|your)/i.test(firstLine) ? 6 : 2) +
          (hasNumbers ? 3 : 0)
      )
    );

    const clarity = Math.min(25, Math.max(8, words.length > 18 ? 18 : 14));
    const cta = Math.min(25, Math.max(6, hasCTA ? 20 : 10));
    const voice = Math.min(25, Math.max(10, /(we|our)/i.test(raw) ? 18 : 14));

    const total = Math.round(hook + clarity + cta + voice);

    // Improvement rewrite (generic for any business)
    const improved = buildImprovedCaption(raw);

    setScore({
      total,
      breakdown: [
        { label: "Hook", score: hook, max: 25, note: hook >= 18 ? "Strong opener." : "Try a sharper first line." },
        { label: "Clarity", score: clarity, max: 25, note: clarity >= 18 ? "Clear message." : "Tighten the main point." },
        { label: "CTA", score: cta, max: 25, note: cta >= 18 ? "Clear next step." : "Add a direct action." },
        { label: "Voice", score: voice, max: 25, note: voice >= 18 ? "Consistent tone." : "Make it sound more like your brand." },
      ],
      improved,
    });

    setLoadingScore(false);
  }

  function clearScore() {
    setCaption("");
    setScore(null);
    setActiveDot(0);
    if (swipeRef.current) swipeRef.current.scrollTo({ left: 0, behavior: "smooth" });
  }

  // update dot on scroll (mobile swipe)
  useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;

    function onScroll() {
      const cards = Array.from(el.querySelectorAll("[data-swipe-card='1']")) as HTMLElement[];
      if (!cards.length) return;

      const elLeft = el.scrollLeft;
      let bestIdx = 0;
      let bestDist = Infinity;

      cards.forEach((c, idx) => {
        const dist = Math.abs(c.offsetLeft - elLeft);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      });

      setActiveDot(bestIdx);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll as any);
  }, [score]);

  function scrollToCard(idx: number) {
    const el = swipeRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll("[data-swipe-card='1']")) as HTMLElement[];
    const target = cards[idx];
    if (!target) return;
    el.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  }

  return (
    <div style={S.page} className="woviPageBottomPadding">
      {/* Background grid + glow */}
      <div style={S.bgGlow} />
      <div style={S.bgGrid} />

      {/* Top bar */}
      <header style={S.topbar}>
        <div style={S.brand} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div style={S.logoCircle}>
            <span style={S.logoW}>W</span>
          </div>
          <div style={{ display: "grid", gap: 2 }}>
            <div style={S.brandName}>WOVI</div>
            <div style={S.brandTag}>AI social media OS for any business</div>
          </div>
        </div>

        <div style={S.nav}>
          <button className="woviTapBtn" style={S.navLink} onClick={() => scrollToId("pricing")}>
            Pricing
          </button>
          <button className="woviTapBtn" style={S.navCta} onClick={() => openWaitlist("Growth")}>
            Join waitlist
          </button>
        </div>
      </header>

      <main style={S.main}>
        {/* HERO + WEEK PREVIEW */}
        <div style={S.heroGrid} className="heroGridMobileFix">
          {/* Left hero card */}
          <section style={S.heroCard}>
            <div style={S.pill}>
              <span style={S.pillDot} />
              Pre-launch · Waitlist only
            </div>

            <h1 style={S.heroH1} className="woviH1">
              AI that turns your business goals into{" "}
              <span style={S.underlineWrap}>
                <span style={S.underlineText}>ready-to-post</span>
                <span style={S.underlineAnim} aria-hidden="true" />
              </span>{" "}
              content.
            </h1>

            <p style={S.heroP} className="woviSub">
              Wovi replaces the planning and creation behind social media — captions, images, and weekly posting plans —
              so you stay consistent without burnout.
            </p>

            <div style={S.heroBtns}>
              <button className="woviTapBtn" style={S.primaryBtn} onClick={() => scrollToId("pricing")}>
                Pick a plan
              </button>
              <button className="woviTapBtn" style={S.secondaryBtn} onClick={() => openWaitlist(prettyPlan)}>
                Join waitlist
              </button>
            </div>

            <div style={S.heroStats}>
              <div style={S.statCard}>
                <div style={S.statTitle}>Works for</div>
                <div style={S.statValue}>Any industry</div>
                <div style={S.statNote}>Local, online, service, ecommerce, creators, startups</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statTitle}>Replaces</div>
                <div style={S.statValue}>Daily brainstorming</div>
                <div style={S.statNote}>No “what should I post?”</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statTitle}>Outcome</div>
                <div style={S.statValue}>Consistency</div>
                <div style={S.statNote}>Plans + content every week</div>
              </div>
            </div>
          </section>

          {/* Right week preview */}
          <aside style={S.weekCard} className="woviRightCardMobilePad">
            <div style={S.weekHeader}>
              <div style={S.weekTitle}>This week in Wovi</div>
              <div style={S.weekBadge}>Auto-planned</div>
            </div>

            <div style={S.weekGrid}>
              <div style={S.weekMini}>
                <div style={S.weekMiniLabel}>Input</div>
                <div style={S.weekMiniText}>
                  <b>Goal:</b> “Get more customers this week”
                </div>
                <div style={S.weekMiniSmall}>Tone: confident · modern</div>
              </div>

              <div style={S.weekMini}>
                <div style={S.weekMiniLabel}>Output</div>
                <div style={S.weekMiniText}>
                  <b>Captions + image concepts</b>
                </div>
                <div style={S.weekMiniSmall}>Ready-to-post variations</div>
              </div>

              <div style={S.weekMini}>
                <div style={S.weekMiniLabel}>Plan</div>
                <div style={S.weekMiniText}>
                  <b>Weekly posting schedule</b>
                </div>
                <div style={S.weekMiniSmall}>Daily suggestions</div>
              </div>

              <div style={S.weekMini}>
                <div style={S.weekMiniLabel}>Result</div>
                <div style={S.weekMiniText}>
                  <b>You stay consistent</b>
                </div>
                <div style={S.weekMiniSmall}>No agency, no burnout</div>
              </div>
            </div>

            <div style={S.weekFooter}>
              <div style={S.weekFootNote}>Pick a plan now. Get early access when we launch.</div>
              <button className="woviTapBtn" style={S.weekCta} onClick={() => openWaitlist(prettyPlan)}>
                Join waitlist
              </button>
            </div>
          </aside>
        </div>

        {/* PRICING */}
        <section id="pricing" style={S.pricingWrap}>
          <h2 style={S.sectionTitle} className="woviSectionTitle">
            WOVI Pricing Plans
          </h2>
          <p style={S.sectionSub} className="woviSub">
            <b>Pre-launch rule:</b> All plans currently lead to the waitlist. Users can view pricing, but cannot activate
            yet. We’re collecting emails only.
          </p>

          <div style={S.pricingTag}>
            <span style={S.pillDot} />
            Email only · Full billing activates at launch
          </div>

          <div style={S.pricingGrid}>
            <PlanCard
              title="Free Trial"
              badge="Starter Access"
              price="$0"
              per=""
              accent="green"
              features={[
                "Limited AI-generated posts",
                "Basic captions",
                "Sample images",
                "Preview of weekly planning",
                "Designed to prove value fast",
              ]}
              bestFor="New users who want to test Wovi risk-free but plan to grow."
              cta="Join waitlist"
              onClick={() => openWaitlist("Free Trial")}
            />

            <PlanCard
              title="Growth"
              badge="Most Popular"
              price="$29"
              per="/month"
              accent="teal"
              highlight
              features={[
                "2–3 posts per day",
                "Weekly content planning",
                "AI-generated captions",
                "AI-generated image ideas or images",
                "Brand tone learning",
                "Unlimited edits/regenerations",
              ]}
              bestFor="Most businesses that want consistent social media without hiring an agency."
              cta="Join waitlist"
              onClick={() => openWaitlist("Growth")}
            />

            <PlanCard
              title="Pro"
              badge="Advanced"
              price="$49"
              per="/month"
              accent="blue"
              features={[
                "Everything in Growth",
                "Higher daily post volume",
                "Advanced strategy suggestions",
                "Campaign & launch planning",
                "AI video ad concepts",
                "Priority feature access",
              ]}
              bestFor="Serious brands, fast-growing businesses, and founders who want scale."
              cta="Join waitlist"
              onClick={() => openWaitlist("Pro")}
            />
          </div>
        </section>

        {/* POST SCORE */}
        <section style={S.scoreSection}>
          <h2 style={S.sectionTitle} className="woviSectionTitle">
            Upload a post → Get an AI score
          </h2>
          <p style={S.sectionSub} className="woviSub">
            Pre-launch demo: paste a post caption and Wovi will rate it (hook, clarity, CTA, voice) — then generate a
            stronger version.
          </p>

          {/* NOTE: You already added these classes earlier; keep them.
              They make mobile layout work. */}
          <div style={S.scoreWrap} className="scoreGridMobileFix">
            {/* Left input */}
            <div style={S.scoreCard}>
              <div style={S.scoreLabel}>Paste your post caption</div>
              <textarea
                style={S.textarea}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={`Example:\n“Quick question — what’s the #1 thing stopping you from posting consistently?\nReply ‘ME’ and I’ll send a free content plan idea.”`}
              />

              <div style={S.scoreBtns}>
                <button className="woviTapBtn" style={S.primaryBtn} onClick={getScore} disabled={loadingScore}>
                  {loadingScore ? "Scoring…" : "Get score"}
                </button>
                <button className="woviTapBtn" style={S.ghostBtn} onClick={clearScore} disabled={loadingScore}>
                  Clear
                </button>
              </div>

              <div style={S.tinyMuted}>This is a demo score (no account needed yet).</div>
            </div>

            {/* Right result — swipeable on mobile */}
            <div style={S.scoreCard}>
              <div style={S.scoreLabel}>Your Wovi Score</div>

              {!score && !loadingScore && <div style={S.scoreEmpty}>Paste a post and press “Get score”.</div>}
              {loadingScore && <div style={S.scoreEmpty}>Analyzing…</div>}

              {score && !loadingScore && (
                <>
                  <div ref={swipeRef} className="woviSwipeWrap">
                    {/* Card 1: total */}
                    <div style={S.resultCard} className="woviSwipeCard" data-swipe-card="1">
                      <div style={S.resultTop}>
                        <div style={S.resultTitle}>Score</div>
                        <div style={S.bigScore}>{score.total}/100</div>
                      </div>
                      <div style={S.barOuter}>
                        <div style={{ ...S.barInner, width: `${Math.max(0, Math.min(100, score.total))}%` }} />
                      </div>
                      <div style={S.resultHint}>Higher = stronger hook, clarity, CTA, and voice.</div>
                    </div>

                    {/* Card 2: breakdown */}
                    <div style={S.resultCard} className="woviSwipeCard" data-swipe-card="1">
                      <div style={S.resultTitle}>Breakdown</div>
                      <div style={S.breakList}>
                        {score.breakdown.map((b) => (
                          <div key={b.label} style={S.breakRow}>
                            <div style={S.breakLeft}>
                              <div style={S.breakLabel}>{b.label}</div>
                              <div style={S.breakNote}>{b.note}</div>
                            </div>
                            <div style={S.breakRight}>
                              {Math.round(b.score)}/{b.max}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card 3: improved caption */}
                    <div style={S.resultCard} className="woviSwipeCard" data-swipe-card="1">
                      <div style={S.resultTitle}>Improved version</div>
                      <div style={S.improvedBox}>{score.improved}</div>
                      <button
                        className="woviTapBtn"
                        style={S.copyBtn}
                        onClick={() => navigator.clipboard.writeText(score.improved)}
                      >
                        Copy improved caption
                      </button>
                    </div>
                  </div>

                  {/* Dots (mobile) */}
                  <div className="woviSwipeDots">
                    {[0, 1, 2].map((i) => (
                      <button
                        key={i}
                        className={`woviSwipeDot ${activeDot === i ? "woviSwipeDotActive" : ""}`}
                        onClick={() => scrollToCard(i)}
                        aria-label={`Go to card ${i + 1}`}
                        style={{ border: "none", cursor: "pointer" }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <footer style={S.footer}>
          <div style={S.footerLine} />
          <div style={S.footerText}>© {new Date().getFullYear()} Wovi · Pre-launch waitlist</div>
        </footer>
      </main>

      {/* Sticky bottom CTA (mobile) */}
      <div className="woviStickyCtaBar">
        <div className="woviStickyCtaInner">
          <div className="woviStickyText">
            Pre-launch: join the waitlist for early access and possible launch pricing.
          </div>
          <button className="woviTapBtn" style={S.stickyBtn} onClick={() => openWaitlist(prettyPlan)}>
            Join waitlist
          </button>
        </div>
      </div>

      {/* Waitlist modal */}
      {waitlistOpen && (
        <div style={S.modalOverlay} onMouseDown={() => setWaitlistOpen(false)}>
          <div style={S.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={S.modalTop}>
              <div style={S.modalTitle}>Join the waitlist</div>
              <button className="woviTapBtn" style={S.modalClose} onClick={() => setWaitlistOpen(false)}>
                ✕
              </button>
            </div>

            <div style={S.modalSub}>
              We’re launching in small batches. Enter your email to get early access.
              <div style={S.modalPlanLine}>
                Selected plan: <b>{prettyPlan}</b>
              </div>
            </div>

            {!waitlistDone ? (
              <form onSubmit={submitWaitlist} style={{ display: "grid", gap: 12 }}>
                <input
                  style={S.input}
                  placeholder="you@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                />

                {waitlistError && <div style={S.errorText}>{waitlistError}</div>}

                <button className="woviTapBtn" style={S.primaryBtn} type="submit">
                  Join the waitlist
                </button>

                <div style={S.tinyMuted}>Early access may include special launch pricing.</div>
              </form>
            ) : (
              <div style={S.successBox}>
                <div style={S.successTitle}>You’re on the list.</div>
                <div style={S.successBody}>
                  Thanks — we’ll email you as soon as the <b>public beta</b> is ready.
                </div>
                <button className="woviTapBtn" style={S.secondaryBtn} onClick={() => setWaitlistOpen(false)}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------
   Components
------------------------- */

function PlanCard(props: {
  title: string;
  badge: string;
  price: string;
  per: string;
  accent: "green" | "teal" | "blue";
  highlight?: boolean;
  features: string[];
  bestFor: string;
  cta: string;
  onClick: () => void;
}) {
  const accentStyle =
    props.accent === "green"
      ? S.accentGreen
      : props.accent === "blue"
      ? S.accentBlue
      : S.accentTeal;

  return (
    <div style={{ ...S.planCard, ...(props.highlight ? S.planHighlight : null) }} className="woviPlanHover">
      <div style={S.planTop}>
        <div style={S.planTitleRow}>
          <div style={S.planTitle}>{props.title}</div>
          <div style={{ ...S.planBadge, ...accentStyle }}>{props.badge}</div>
        </div>

        <div style={S.planPriceRow}>
          <div style={S.planPrice}>{props.price}</div>
          <div style={S.planPer}>{props.per}</div>
        </div>

        <div style={S.planDivider} />
      </div>

      <div style={S.planBody}>
        <div style={S.planLabel}>Includes</div>
        <ul style={S.planList}>
          {props.features.map((f) => (
            <li key={f} style={S.planLi}>
              <span style={{ ...S.bulletDot, ...accentStyle }} />
              {f}
            </li>
          ))}
        </ul>

        <div style={S.planLabel}>Best for</div>
        <div style={S.planBestFor}>{props.bestFor}</div>

        <button className="woviTapBtn" style={S.planCta} onClick={props.onClick}>
          {props.cta}
        </button>
      </div>
    </div>
  );
}

/* -------------------------
   Helpers
------------------------- */

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildImprovedCaption(input: string) {
  const clean = input.trim().replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  // If user already has multiple lines, keep it but improve structure.
  const base =
    clean.length > 160
      ? clean.slice(0, 160).trim()
      : clean;

  return [
    "Quick question:",
    "What’s the #1 thing stopping you from posting consistently right now?",
    "",
    "Reply “ME” and I’ll send a simple, ready-to-post caption idea you can use this week.",
    "",
    "No pressure — just a fast win.",
  ].join("\n");
}

/* -------------------------
   Styles (no extra libs)
------------------------- */

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#05070a",
    color: "rgba(255,255,255,0.92)",
    position: "relative",
    overflowX: "hidden",
  },

  bgGlow: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(800px 500px at 18% 18%, rgba(2,243,220,0.18), transparent 55%), radial-gradient(700px 520px at 78% 22%, rgba(33,174,245,0.18), transparent 55%), radial-gradient(720px 520px at 55% 70%, rgba(87,254,114,0.10), transparent 58%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  bgGrid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
    backgroundSize: "52px 52px",
    opacity: 0.22,
    maskImage: "radial-gradient(circle at 50% 35%, black 0%, transparent 72%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    padding: "14px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    userSelect: "none",
  },

  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 999,
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 16px 44px rgba(0,0,0,0.45)",
  },

  logoW: {
    fontWeight: 950,
    color: "#041015",
    fontSize: 16,
    letterSpacing: -0.02,
  },

  brandName: {
    fontWeight: 900,
    letterSpacing: 0.4,
    fontSize: 13,
  },

  brandTag: {
    fontSize: 12,
    opacity: 0.72,
  },

  nav: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  navLink: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 800,
  },

  navCta: {
    border: "none",
    fontWeight: 950,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
  },

  main: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1180,
    margin: "0 auto",
    padding: "22px 16px 70px",
  },

  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: 18,
    alignItems: "start",
  },

  heroCard: {
    borderRadius: 22,
    padding: 22,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 28px 80px rgba(0,0,0,0.55)",
  },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.35)",
    fontSize: 12,
    fontWeight: 900,
    width: "fit-content",
    marginBottom: 14,
  },

  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#02F3DC",
    boxShadow: "0 0 0 4px rgba(2,243,220,0.14)",
  },

  heroH1: {
    margin: 0,
    fontWeight: 980,
    letterSpacing: -0.03,
    lineHeight: 1.06,
    fontSize: 52,
  },

  underlineWrap: {
    position: "relative",
    display: "inline-block",
  },

  underlineText: {
    color: "#02F3DC",
  },

  underlineAnim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -6,
    height: 3,
    borderRadius: 999,
    background:
      "linear-gradient(90deg, rgba(2,243,220,0.25), rgba(2,243,220,0.95), rgba(33,174,245,0.95), rgba(87,254,114,0.55))",
    filter: "blur(0px)",
    transformOrigin: "left",
    animation: "woviUnderline 2.6s ease-in-out infinite",
  } as any,

  heroP: {
    marginTop: 12,
    marginBottom: 16,
    opacity: 0.82,
    maxWidth: 760,
  },

  heroBtns: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 16,
  },

  primaryBtn: {
    border: "none",
    fontWeight: 950,
    fontSize: 14,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
  },

  secondaryBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.88)",
    fontWeight: 900,
  },

  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },

  statCard: {
    borderRadius: 16,
    padding: 14,
    background: "rgba(0,0,0,0.30)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  statTitle: {
    fontSize: 11,
    fontWeight: 950,
    opacity: 0.62,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 6,
  },

  statValue: {
    fontSize: 14,
    fontWeight: 950,
    marginBottom: 4,
  },

  statNote: {
    fontSize: 12,
    opacity: 0.68,
    lineHeight: 1.45,
  },

  weekCard: {
    borderRadius: 22,
    padding: 18,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 28px 80px rgba(0,0,0,0.55)",
  },

  weekHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  weekTitle: {
    fontWeight: 950,
    fontSize: 15,
  },

  weekBadge: {
    fontSize: 11,
    fontWeight: 950,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.35)",
    opacity: 0.9,
  },

  weekGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  weekMini: {
    borderRadius: 16,
    padding: 12,
    background: "rgba(0,0,0,0.30)",
    border: "1px solid rgba(255,255,255,0.08)",
    minHeight: 92,
  },

  weekMiniLabel: {
    fontSize: 11,
    fontWeight: 950,
    opacity: 0.62,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 6,
  },

  weekMiniText: {
    fontSize: 12.5,
    lineHeight: 1.45,
    opacity: 0.9,
  },

  weekMiniSmall: {
    fontSize: 12,
    opacity: 0.62,
    marginTop: 6,
  },

  weekFooter: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  weekFootNote: {
    fontSize: 12,
    opacity: 0.7,
  },

  weekCta: {
    border: "none",
    fontWeight: 950,
    fontSize: 13,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
  },

  pricingWrap: {
    marginTop: 18,
    borderRadius: 22,
    padding: 22,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 28px 80px rgba(0,0,0,0.55)",
  },

  sectionTitle: {
    margin: 0,
    fontWeight: 980,
    letterSpacing: -0.02,
    fontSize: 26,
  },

  sectionSub: {
    marginTop: 8,
    marginBottom: 12,
    opacity: 0.78,
  },

  pricingTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.35)",
    fontSize: 12,
    fontWeight: 900,
    width: "fit-content",
    marginBottom: 14,
  },

  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  },

  planCard: {
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(0,0,0,0.34)",
    border: "1px solid rgba(255,255,255,0.10)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
  },

  planHighlight: {
    borderColor: "rgba(2,243,220,0.35)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.6)",
  },

  planTop: {
    padding: 16,
  },

  planTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  planTitle: {
    fontWeight: 980,
    fontSize: 16,
  },

  planBadge: {
    fontSize: 11,
    fontWeight: 950,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
  },

  accentGreen: { color: "#57FE72", borderColor: "rgba(87,254,114,0.35)" },
  accentTeal: { color: "#02F3DC", borderColor: "rgba(2,243,220,0.35)" },
  accentBlue: { color: "#21AEF5", borderColor: "rgba(33,174,245,0.35)" },

  planPriceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    marginTop: 12,
  },

  planPrice: {
    fontSize: 42,
    fontWeight: 980,
    letterSpacing: -0.03,
  },

  planPer: {
    fontSize: 13,
    opacity: 0.7,
    fontWeight: 800,
  },

  planDivider: {
    marginTop: 14,
    height: 1,
    background: "rgba(255,255,255,0.10)",
  },

  planBody: {
    padding: 16,
    paddingTop: 0,
    display: "grid",
    gap: 10,
  },

  planLabel: {
    fontSize: 12,
    fontWeight: 950,
    opacity: 0.72,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginTop: 6,
  },

  planList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "grid",
    gap: 8,
  },

  planLi: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    fontSize: 13,
    opacity: 0.86,
    lineHeight: 1.45,
  },

  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 6,
    background: "rgba(255,255,255,0.25)",
  },

  planBestFor: {
    fontSize: 13,
    opacity: 0.75,
    lineHeight: 1.5,
  },

  planCta: {
    marginTop: 8,
    border: "none",
    fontWeight: 950,
    fontSize: 14,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
  },

  scoreSection: {
    marginTop: 18,
    borderRadius: 22,
    padding: 22,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 28px 80px rgba(0,0,0,0.55)",
  },

  scoreWrap: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 12,
  },

  scoreCard: {
    borderRadius: 18,
    padding: 16,
    background: "rgba(0,0,0,0.34)",
    border: "1px solid rgba(255,255,255,0.10)",
    minHeight: 260,
  },

  scoreLabel: {
    fontWeight: 950,
    opacity: 0.9,
    marginBottom: 10,
  },

  textarea: {
    width: "100%",
    minHeight: 170,
    resize: "vertical",
    borderRadius: 14,
    padding: 14,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.90)",
    outline: "none",
    fontSize: 14,
    lineHeight: 1.5,
  },

  scoreBtns: {
    display: "flex",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },

  ghostBtn: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 900,
  },

  tinyMuted: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.65,
    lineHeight: 1.55,
  },

  scoreEmpty: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.75,
    lineHeight: 1.55,
  },

  resultCard: {
    borderRadius: 16,
    padding: 14,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  resultTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 10,
  },

  resultTitle: {
    fontWeight: 950,
    opacity: 0.9,
  },

  bigScore: {
    fontWeight: 980,
    fontSize: 28,
    color: "rgba(255,255,255,0.92)",
  },

  barOuter: {
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.10)",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  barInner: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 0 20px rgba(2,243,220,0.15)",
  },

  resultHint: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 1.55,
  },

  breakList: {
    display: "grid",
    gap: 10,
    marginTop: 10,
  },

  breakRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 12,
    padding: "10px 10px",
    borderRadius: 14,
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  breakLeft: {
    display: "grid",
    gap: 4,
  },

  breakLabel: {
    fontWeight: 950,
    fontSize: 13,
  },

  breakNote: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 1.45,
  },

  breakRight: {
    fontWeight: 950,
    opacity: 0.9,
  },

  improvedBox: {
    marginTop: 10,
    whiteSpace: "pre-wrap",
    fontSize: 13,
    lineHeight: 1.5,
    padding: 12,
    borderRadius: 14,
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
    opacity: 0.9,
  },

  copyBtn: {
    marginTop: 10,
    width: "100%",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.9)",
    fontWeight: 950,
  },

  footer: {
    marginTop: 22,
    paddingBottom: 40,
  },

  footerLine: {
    height: 1,
    background: "rgba(255,255,255,0.10)",
    marginBottom: 12,
  },

  footerText: {
    fontSize: 12,
    opacity: 0.6,
  },

  /* Sticky CTA button */
  stickyBtn: {
    border: "none",
    fontWeight: 950,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
  },

  /* Modal */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 80,
    background: "rgba(0,0,0,0.65)",
    display: "grid",
    placeItems: "center",
    padding: 16,
  },

  modal: {
    width: "min(520px, 100%)",
    borderRadius: 18,
    padding: 16,
    background: "rgba(10,12,16,0.92)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 40px 120px rgba(0,0,0,0.70)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  modalTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  modalTitle: {
    fontWeight: 980,
    fontSize: 16,
  },

  modalClose: {
    minHeight: 40,
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.88)",
    fontWeight: 900,
  },

  modalSub: {
    fontSize: 13,
    opacity: 0.78,
    lineHeight: 1.5,
    marginBottom: 12,
  },

  modalPlanLine: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.85,
  },

  input: {
    width: "100%",
    borderRadius: 14,
    padding: "12px 14px",
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.90)",
    outline: "none",
    fontSize: 14,
  },

  errorText: {
    fontSize: 12,
    color: "rgba(255,120,120,0.95)",
    fontWeight: 900,
  },

  successBox: {
    display: "grid",
    gap: 10,
    paddingTop: 6,
  },

  successTitle: {
    fontSize: 16,
    fontWeight: 980,
  },

  successBody: {
    fontSize: 13,
    opacity: 0.82,
    lineHeight: 1.55,
  },
};

/* Keyframes via global style injection */
if (typeof document !== "undefined") {
  const id = "wovi-keyframes";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes woviUnderline {
        0% { transform: scaleX(0.55); opacity: 0.55; }
        50% { transform: scaleX(1); opacity: 0.95; }
        100% { transform: scaleX(0.55); opacity: 0.55; }
      }
      /* Pricing hover glow without libraries */
      .woviPlanHover:hover {
        transform: translateY(-2px);
        border-color: rgba(2,243,220,0.28);
        box-shadow: 0 30px 90px rgba(0,0,0,0.65);
      }
    `;
    document.head.appendChild(style);
  }
}
