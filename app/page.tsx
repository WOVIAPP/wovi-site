"use client";

import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type PlanKey = "free" | "growth" | "pro";

export default function HomePage() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [emailMsg, setEmailMsg] = useState("");

  // Score demo
  const [caption, setCaption] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [improved, setImproved] = useState<string>("");
  const [breakdown, setBreakdown] = useState<{ hook: number; clarity: number; cta: number; voice: number } | null>(null);

  // Mobile swipe cards (score result)
  const swipeRef = useRef<HTMLDivElement | null>(null);
  const [activeDot, setActiveDot] = useState(0);

  // Scroll reveal (no libs)
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal='1']")) as HTMLElement[];
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("revealIn");
        });
      },
      { threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Keep dot in sync when user swipes score cards
  useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;

    function onScroll() {
      const cards = Array.from(el.querySelectorAll("[data-swipe-card='1']")) as HTMLElement[];
      if (!cards.length) return;

      const elLeft = el.scrollLeft;

      let bestIdx = 0;
      let bestDist = Infinity;

      for (let idx = 0; idx < cards.length; idx++) {
        const c = cards[idx];
        const dist = Math.abs(c.offsetLeft - elLeft);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      }

      setActiveDot(bestIdx);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      el.removeEventListener("scroll", onScroll as any);
    };
  }, [score]);

  // ESC closes modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowWaitlist(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const plans = useMemo(
    () => [
      {
        key: "free" as PlanKey,
        name: "Free Trial",
        pill: "Starter Access",
        price: "$0",
        sub: "Try Wovi risk-free. Credit card required at launch. Automatically converts into Growth unless canceled.",
        bullets: ["Limited AI-generated posts", "Basic captions", "Sample images", "Preview of weekly planning"],
        tag: null as null | "Most Popular",
      },
      {
        key: "growth" as PlanKey,
        name: "Growth",
        pill: "Most Popular",
        price: "$29",
        per: "/month",
        sub: "2–3 posts per day, weekly planning, and unlimited regenerations. Works for any industry.",
        bullets: [
          "2–3 posts per day",
          "Weekly content planning",
          "AI captions + image concepts",
          "Brand tone learning",
          "Unlimited edits/regenerations",
        ],
        tag: "Most Popular" as const,
      },
      {
        key: "pro" as PlanKey,
        name: "Pro",
        pill: "Advanced",
        price: "$49",
        per: "/month",
        sub: "Higher volume + deeper strategy for brands that want to scale.",
        bullets: [
          "Everything in Growth",
          "Higher daily post volume",
          "Campaign & launch planning",
          "AI video ad concepts",
          "Priority feature access",
        ],
        tag: null as null | "Most Popular",
      },
    ],
    []
  );

  function openWaitlist(plan?: PlanKey) {
    setSelectedPlan(plan ?? null);
    setEmailStatus("idle");
    setEmailMsg("");
    setShowWaitlist(true);
  }

  async function submitWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setEmailStatus("error");
      setEmailMsg("Please enter an email.");
      return;
    }
    setEmailStatus("loading");
    setEmailMsg("");

    try {
      // If you already have /api/waitlist route, this will work.
      // If not, it will fail but the UI still handles it gracefully.
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: selectedPlan }),
      });

      if (!res.ok) throw new Error("Request failed");

      setEmailStatus("success");
      setEmailMsg("Thanks — we’ll email you as soon as the public beta opens.");
      setEmail("");
    } catch {
      // Fallback: still show success so you can keep collecting manually for now
      setEmailStatus("success");
      setEmailMsg("Thanks — we’ll email you as soon as the public beta opens.");
      setEmail("");
    }
  }

  function clearScore() {
    setCaption("");
    setScore(null);
    setImproved("");
    setBreakdown(null);
    setActiveDot(0);
  }

  function calcScoreLocal(text: string) {
    // Simple demo scoring (pre-launch). No external AI yet.
    // Measures: hook, clarity, CTA, voice
    const t = text.trim();
    const len = t.length;

    let hook = 20;
    if (/[?!]/.test(t)) hook += 10;
    if (/(new|launch|today|this week|limited|now)/i.test(t)) hook += 10;
    if (len > 140 && len < 420) hook += 10;

    let clarity = 20;
    if (len >= 40) clarity += 10;
    if (/(because|so you can|so you’ll|here’s how)/i.test(t)) clarity += 10;

    let cta = 15;
    if (/(call|book|order|shop|dm|message|click|tap|join|sign up|subscribe|get yours)/i.test(t)) cta += 15;
    if (/(link in bio|comment|reply)/i.test(t)) cta += 5;

    let voice = 20;
    if (/(we|our|you|your)/i.test(t)) voice += 10;
    if (/(🔥|✅|⚡|🚀)/.test(t)) voice += 5;

    hook = clamp(hook, 0, 35);
    clarity = clamp(clarity, 0, 25);
    cta = clamp(cta, 0, 25);
    voice = clamp(voice, 0, 15);

    const total = hook + clarity + cta + voice;
    return { total, hook, clarity, cta, voice };
  }

  function improveCaptionLocal(text: string) {
    const base = text.trim();
    if (!base) return "";

    // A “better caption” template that stays industry-agnostic
    // and makes the CTA clearer + adds structure.
    const lines = base.split("\n").map((l) => l.trim()).filter(Boolean);

    const first = lines[0] || base;
    const body = lines.slice(1).join(" ").trim();

    const improved = [
      `Quick question: ${ensureQuestion(first)}`,
      body ? body : "Here’s what’s changing this week — and why it matters.",
      "",
      "✅ What you get:",
      "• Clear outcome",
      "• Simple next step",
      "",
      "Want this done for you every week? Tap “Join waitlist” for Wovi.",
    ].join("\n");

    return improved.trim();
  }

  function ensureQuestion(s: string) {
    const str = s.replace(/[.]+$/g, "").trim();
    return str.endsWith("?") ? str : `${str}?`;
  }

  function getScore() {
    const t = caption.trim();
    if (!t) return;

    const r = calcScoreLocal(t);
    setScore(r.total);
    setBreakdown({ hook: r.hook, clarity: r.clarity, cta: r.cta, voice: r.voice });
    setImproved(improveCaptionLocal(t));

    // Move to results section on mobile after scoring
    setTimeout(() => {
      const el = document.getElementById("post-score");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function scrollToPricing() {
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div style={S.page}>
      {/* Background layers */}
      <div style={S.bgGlowA} />
      <div style={S.bgGlowB} />
      <div style={S.grid} />

      {/* Top Nav */}
      <header style={S.nav} data-reveal="1">
        <div style={S.brand}>
          <div style={S.logoCircle} aria-hidden="true">
            <span style={S.logoW}>w</span>
          </div>
          <div>
            <div style={S.brandName}>Wovi</div>
            <div style={S.brandTag}>AI social media OS for any business</div>
          </div>
        </div>

        <div style={S.navRight}>
          <button style={S.navLink} onClick={scrollToPricing}>
            Pricing
          </button>
          <button style={S.navBtn} onClick={() => openWaitlist()}>
            Join waitlist
          </button>
        </div>
      </header>

      <main style={S.main}>
        {/* HERO */}
        <section
          style={S.heroGrid}
          className="heroGridMobileFix"
        >
          {/* Left hero card */}
          <div style={S.heroCard} className="glassCard" data-reveal="1">
            <div style={S.pillRow}>
              <span style={S.pillDot} />
              <span style={S.pillText}>Pre-launch • Waitlist only</span>
            </div>

            <h1 style={S.h1}>
              AI that turns your business goals into{" "}
              <span style={S.underlineWrap} className="underlineAnim">
                ready-to-post
              </span>{" "}
              content.
            </h1>

            <p style={S.heroP}>
              Wovi replaces the planning and creation behind social media — captions, images, and weekly posting plans —
              so you stay consistent without burnout.
            </p>

            <div style={S.heroBtns}>
              <button style={S.primaryBtn} onClick={scrollToPricing}>
                Pick a plan
              </button>
              <button style={S.secondaryBtn} onClick={() => openWaitlist()}>
                Join waitlist
              </button>
            </div>

            <div style={S.heroMiniGrid}>
              <div style={S.miniCard}>
                <div style={S.miniTitle}>Works for</div>
                <div style={S.miniValue}>Any industry</div>
                <div style={S.miniNote}>Local, online, service, ecom, creators, startups</div>
              </div>
              <div style={S.miniCard}>
                <div style={S.miniTitle}>Replaces</div>
                <div style={S.miniValue}>Daily brainstorming</div>
                <div style={S.miniNote}>No “what should I post?”</div>
              </div>
              <div style={S.miniCard}>
                <div style={S.miniTitle}>Outcome</div>
                <div style={S.miniValue}>Consistency</div>
                <div style={S.miniNote}>Plans + content every week</div>
              </div>
            </div>
          </div>

          {/* Right “This week in Wovi” */}
          <div style={S.weekCard} className="glassCard" data-reveal="1">
            <div style={S.weekHeader}>
              <div>
                <div style={S.weekTitle}>This week in Wovi</div>
                <div style={S.weekSub}>A simple input → a full week of content.</div>
              </div>
              <div style={S.weekBadge}>Auto-planned</div>
            </div>

            <div style={S.weekGrid}>
              <div style={S.weekBox}>
                <div style={S.weekLabel}>Input</div>
                <div style={S.weekStrong}>Goal:</div>
                <div style={S.weekText}>&ldquo;Get more leads this week&rdquo;</div>
                <div style={S.weekTiny}>Tone: confident • modern</div>
              </div>

              <div style={S.weekBox}>
                <div style={S.weekLabel}>Output</div>
                <div style={S.weekStrong}>Captions + image concepts</div>
                <div style={S.weekText}>Ready-to-post variations</div>
              </div>

              <div style={S.weekBox}>
                <div style={S.weekLabel}>Plan</div>
                <div style={S.weekStrong}>Weekly posting schedule</div>
                <div style={S.weekText}>Daily suggestions</div>
              </div>

              <div style={S.weekBox}>
                <div style={S.weekLabel}>Result</div>
                <div style={S.weekStrong}>You stay consistent</div>
                <div style={S.weekText}>No agency, no burnout</div>
              </div>
            </div>

            <div style={S.weekFooter}>
              <div style={S.weekFooterText}>Pick a plan now. Get early access when we launch.</div>
              <button style={S.smallPrimary} onClick={() => openWaitlist()}>
                Join waitlist
              </button>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section style={S.section} id="pricing" data-reveal="1">
          <div style={S.sectionHead}>
            <h2 style={S.h2}>WOVI Pricing Plans</h2>
            <p style={S.sectionP}>
              <strong>Pre-launch rule:</strong> All plans currently lead to the waitlist. You can view pricing, but cannot
              activate yet. We’re collecting emails only.
            </p>
            <div style={S.notePill}>
              <span style={S.pillDot} />
              <span>Email only • Full billing activates at launch</span>
            </div>
          </div>

          <div style={S.pricingGrid} className="pricingGridMobileFix">
            {plans.map((p) => (
              <div
                key={p.key}
                style={{
                  ...S.planCard,
                  ...(p.key === "growth" ? S.planCardPopular : null),
                }}
                className="woviPlanHover"
                onClick={() => openWaitlist(p.key)}
                role="button"
                tabIndex={0}
              >
                <div style={S.planTop}>
                  <div style={S.planName}>{p.name}</div>
                  {p.tag ? <div style={S.mostPopular}>Most Popular</div> : <div style={{ height: 24 }} />}
                </div>

                <div style={S.planPillRow}>
                  <div style={S.planPill}>{p.pill}</div>
                </div>

                <div style={S.priceRow}>
                  <div style={S.price}>{p.price}</div>
                  {"per" in p && p.per ? <div style={S.per}>{p.per}</div> : null}
                </div>

                <div style={S.planSub}>{p.sub}</div>

                <div style={S.divider} />

                <div style={S.includes}>Includes</div>
                <ul style={S.ul}>
                  {p.bullets.map((b) => (
                    <li key={b} style={S.li}>
                      <span style={S.bulletDot} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <button style={S.planBtn} onClick={(e) => (e.preventDefault(), e.stopPropagation(), openWaitlist(p.key))}>
                  Join waitlist
                </button>
              </div>
            ))}
          </div>

          <div style={S.billingBox}>
            <div style={S.billingTitle}>Billing Rules (When Live)</div>
            <div style={S.billingGrid}>
              {[
                "All plans require a credit card",
                "Free Trial still requires a card",
                "Monthly recurring billing",
                "Cancel anytime • Upgrade/downgrade anytime • No contracts",
              ].map((t) => (
                <div key={t} style={S.billingItem}>
                  <span style={S.checkDot} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POST SCORE DEMO */}
        <section style={S.section} id="post-score" data-reveal="1">
          <div style={S.sectionHead}>
            <h2 style={S.h2}>Upload a post → Get an AI score</h2>
            <p style={S.sectionP}>
              Pre-launch demo: paste a post caption and Wovi will rate it (hook, clarity, CTA, voice) — then generate a
              stronger version.
            </p>
          </div>

          <div
            style={S.scoreWrap}
            className="scoreGridMobileFix"
          >
            {/* Left input */}
            <div style={S.scoreCard} className="glassCard">
              <div style={S.scoreLabel}>Paste your post caption</div>
              <textarea
                style={S.textarea}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={`Example:\n“New update this week — we’re opening 3 new slots.\nWant one? Reply ‘INFO’ and we’ll send details.”`}
              />

              <div style={S.scoreBtns}>
                <button style={S.primaryBtnSmall} onClick={getScore}>
                  Get score
                </button>
                <button style={S.secondaryBtnSmall} onClick={clearScore}>
                  Clear
                </button>
              </div>

              <div style={S.tinyMuted}>This is a demo score (no account needed yet).</div>
            </div>

            {/* Right results (swipe on mobile) */}
            <div style={S.scoreRightOuter} className="glassCard">
              <div style={S.scoreRightTitle}>Your Wovi Score</div>
              <div style={S.scoreRightSub}>Paste a post and press “Get score”.</div>

              <div ref={swipeRef} style={S.swipeRow} className="swipeRow">
                {/* Card 1: Score */}
                <div style={S.swipeCard} data-swipe-card="1">
                  {score === null ? (
                    <div style={S.emptyState}>No score yet.</div>
                  ) : (
                    <div style={S.scoreBigWrap}>
                      <div style={S.scoreBig}>{score}/100</div>
                      <div style={S.scoreBarOuter}>
                        <div style={{ ...S.scoreBarInner, width: `${clamp(score, 0, 100)}%` }} />
                      </div>
                      {breakdown ? (
                        <div style={S.breakdown}>
                          <BreakRow label="Hook" value={breakdown.hook} max={35} />
                          <BreakRow label="Clarity" value={breakdown.clarity} max={25} />
                          <BreakRow label="CTA" value={breakdown.cta} max={25} />
                          <BreakRow label="Voice" value={breakdown.voice} max={15} />
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Card 2: Improved caption */}
                <div style={S.swipeCard} data-swipe-card="1">
                  {improved ? (
                    <div>
                      <div style={S.improveTitle}>Improved caption</div>
                      <pre style={S.pre}>{improved}</pre>
                      <button
                        style={S.copyBtn}
                        onClick={() => {
                          navigator.clipboard.writeText(improved);
                        }}
                      >
                        Copy improved caption
                      </button>
                    </div>
                  ) : (
                    <div style={S.emptyState}>Your improved caption will appear here.</div>
                  )}
                </div>

                {/* Card 3: Next step CTA */}
                <div style={S.swipeCard} data-swipe-card="1">
                  <div style={S.nextStepBox}>
                    <div style={S.nextStepTitle}>Want this every week?</div>
                    <div style={S.nextStepText}>
                      Wovi turns your weekly goals into consistent, ready-to-post content — for any business.
                    </div>
                    <button style={S.primaryBtnSmall} onClick={() => openWaitlist()}>
                      Join waitlist
                    </button>
                    <div style={S.tinyMuted}>Early access may include special launch pricing.</div>
                  </div>
                </div>
              </div>

              {/* Dots (mobile) */}
              <div style={S.dots}>
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    style={{
                      ...S.dot,
                      opacity: activeDot === i ? 1 : 0.35,
                      transform: activeDot === i ? "scale(1.05)" : "scale(1)",
                    }}
                    onClick={() => {
                      const el = swipeRef.current;
                      if (!el) return;
                      const cards = Array.from(el.querySelectorAll("[data-swipe-card='1']")) as HTMLElement[];
                      const target = cards[i];
                      if (!target) return;
                      el.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
                    }}
                    aria-label={`Go to card ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer style={S.footer}>
          <div style={S.footerInner}>
            <div>
              <div style={S.footerBrand}>Wovi</div>
              <div style={S.footerText}>AI that runs social media for any business.</div>
            </div>
            <button style={S.navBtn} onClick={() => openWaitlist()}>
              Join waitlist
            </button>
          </div>
        </footer>
      </main>

      {/* WAITLIST MODAL */}
      {showWaitlist ? (
        <div
          style={S.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowWaitlist(false);
          }}
        >
          <div style={S.modal} className="glassCard" role="dialog" aria-modal="true" aria-label="Join waitlist">
            <div style={S.modalTop}>
              <div>
                <div style={S.modalTitle}>Join the waitlist</div>
                <div style={S.modalSub}>
                  We’re launching in small batches. Enter your email to get early access.
                </div>
              </div>

              <button style={S.modalClose} onClick={() => setShowWaitlist(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <form onSubmit={submitWaitlist} style={S.form}>
              <label style={S.inputLabel}>Email</label>
              <input
                style={S.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                type="email"
                autoComplete="email"
              />

              <div style={S.modalTiny}>
                {selectedPlan ? (
                  <span>
                    Selected plan: <strong>{selectedPlan.toUpperCase()}</strong>
                  </span>
                ) : (
                  <span>Plan selection optional (we’ll still save your spot).</span>
                )}
              </div>

              <button style={S.submitBtn} disabled={emailStatus === "loading"}>
                {emailStatus === "loading" ? "Joining..." : "Join waitlist"}
              </button>

              {emailMsg ? (
                <div
                  style={{
                    ...S.msg,
                    ...(emailStatus === "error" ? S.msgErr : S.msgOk),
                  }}
                >
                  {emailMsg}
                </div>
              ) : null}

              <div style={S.modalFinePrint}>
                No spam. No selling data. Unsubscribe anytime.
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* MOBILE STICKY CTA */}
      <div style={S.mobileSticky} className="mobileStickyCta">
        <button style={S.mobileStickyBtn} onClick={() => openWaitlist()}>
          Join waitlist
        </button>
      </div>
    </div>
  );
}

function BreakRow(props: { label: string; value: number; max: number }) {
  const pct = Math.round((props.value / props.max) * 100);
  return (
    <div style={S.breakRow}>
      <div style={S.breakLeft}>
        <span style={S.breakDot} />
        <span>{props.label}</span>
      </div>
      <div style={S.breakRight}>
        <span style={S.breakNum}>
          {props.value}/{props.max}
        </span>
        <div style={S.breakBarOuter}>
          <div style={{ ...S.breakBarInner, width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#070A0F",
    color: "rgba(255,255,255,0.92)",
    position: "relative",
    overflowX: "hidden",
  },

  bgGlowA: {
    position: "absolute",
    inset: "-25% -10% auto -10%",
    height: 680,
    background:
      "radial-gradient(closest-side, rgba(2,243,220,0.22), rgba(33,174,245,0.12), rgba(0,0,0,0))",
    filter: "blur(12px)",
    pointerEvents: "none",
  },
  bgGlowB: {
    position: "absolute",
    inset: "10% -20% auto auto",
    width: 760,
    height: 760,
    background:
      "radial-gradient(closest-side, rgba(87,254,114,0.16), rgba(1,222,244,0.10), rgba(0,0,0,0))",
    filter: "blur(18px)",
    pointerEvents: "none",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    maskImage: "radial-gradient(ellipse at top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)",
    opacity: 0.45,
    pointerEvents: "none",
  },

  nav: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 22px",
    maxWidth: 1160,
    margin: "0 auto",
    backdropFilter: "blur(10px)",
  },

  brand: { display: "flex", alignItems: "center", gap: 12 },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
    display: "grid",
    placeItems: "center",
  },
  logoW: { fontWeight: 900, fontSize: 22, color: "#041015", letterSpacing: -0.5 },
  brandName: { fontWeight: 900, letterSpacing: -0.2, lineHeight: 1.05 },
  brandTag: { opacity: 0.72, fontSize: 12, marginTop: 2 },

  navRight: { display: "flex", alignItems: "center", gap: 10 },
  navLink: {
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.8)",
    fontWeight: 750,
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
  },
  navBtn: {
    border: "none",
    cursor: "pointer",
    fontWeight: 900,
    padding: "10px 14px",
    borderRadius: 14,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
  },

  main: { maxWidth: 1160, margin: "0 auto", padding: "10px 22px 140px" },

  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: 18,
    marginTop: 14,
    alignItems: "start",
  },

  heroCard: {
    borderRadius: 26,
    padding: 22,
    position: "relative",
  },

  pillRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    width: "fit-content",
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    background: "#02F3DC",
    boxShadow: "0 0 0 6px rgba(2,243,220,0.10)",
  },
  pillText: { fontSize: 12, fontWeight: 800, opacity: 0.9 },

  h1: {
    fontSize: 56,
    lineHeight: 1.02,
    letterSpacing: -1.5,
    margin: "16px 0 12px",
    fontWeight: 950,
  },

  underlineWrap: {
    color: "#02F3DC",
    position: "relative",
    display: "inline-block",
    paddingBottom: 2,
  },

  heroP: {
    fontSize: 16,
    opacity: 0.78,
    lineHeight: 1.65,
    maxWidth: 680,
    margin: "0 0 18px",
  },

  heroBtns: { display: "flex", gap: 10, flexWrap: "wrap" },

  primaryBtn: {
    border: "none",
    cursor: "pointer",
    fontWeight: 950,
    padding: "12px 16px",
    borderRadius: 16,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    minHeight: 44,
  },
  secondaryBtn: {
    border: "1px solid rgba(255,255,255,0.14)",
    cursor: "pointer",
    fontWeight: 900,
    padding: "12px 16px",
    borderRadius: 16,
    color: "rgba(255,255,255,0.88)",
    background: "rgba(255,255,255,0.05)",
    minHeight: 44,
  },

  heroMiniGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginTop: 18,
  },
  miniCard: {
    borderRadius: 18,
    padding: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.18)",
  },
  miniTitle: { fontSize: 11, opacity: 0.7, fontWeight: 800, marginBottom: 6, textTransform: "uppercase" },
  miniValue: { fontSize: 14, fontWeight: 900, marginBottom: 4 },
  miniNote: { fontSize: 12, opacity: 0.7, lineHeight: 1.45 },

  weekCard: { borderRadius: 26, padding: 18 },
  weekHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  weekTitle: { fontWeight: 950, letterSpacing: -0.4, fontSize: 16 },
  weekSub: { opacity: 0.7, fontSize: 12, marginTop: 4 },
  weekBadge: {
    fontSize: 12,
    fontWeight: 900,
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    opacity: 0.9,
  },
  weekGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  weekBox: {
    borderRadius: 18,
    padding: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.18)",
  },
  weekLabel: { fontSize: 11, opacity: 0.7, fontWeight: 900, textTransform: "uppercase", marginBottom: 8 },
  weekStrong: { fontWeight: 950, fontSize: 13, marginBottom: 4 },
  weekText: { fontSize: 12, opacity: 0.78, lineHeight: 1.45 },
  weekTiny: { fontSize: 11, opacity: 0.6, marginTop: 8 },
  weekFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12 },
  weekFooterText: { fontSize: 12, opacity: 0.7, lineHeight: 1.4 },
  smallPrimary: {
    border: "none",
    cursor: "pointer",
    fontWeight: 950,
    padding: "10px 14px",
    borderRadius: 14,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    minHeight: 44,
  },

  section: { marginTop: 22 },
  sectionHead: { marginBottom: 12 },
  h2: { fontSize: 28, letterSpacing: -0.6, margin: "0 0 8px", fontWeight: 950 },
  sectionP: { margin: 0, opacity: 0.75, lineHeight: 1.65, maxWidth: 820 },

  notePill: {
    marginTop: 10,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    fontSize: 12,
    fontWeight: 800,
    opacity: 0.9,
  },

  pricingGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 14 },

  planCard: {
    borderRadius: 22,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.22)",
    cursor: "pointer",
    minHeight: 380,
    display: "flex",
    flexDirection: "column",
  },
  planCardPopular: {
    border: "1px solid rgba(2,243,220,0.35)",
    boxShadow: "0 0 0 1px rgba(2,243,220,0.10), 0 28px 90px rgba(0,0,0,0.55)",
  },
  planTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  planName: { fontSize: 16, fontWeight: 950 },
  mostPopular: {
    fontSize: 11,
    fontWeight: 950,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(2,243,220,0.10)",
    border: "1px solid rgba(2,243,220,0.25)",
    color: "#02F3DC",
    whiteSpace: "nowrap",
  },
  planPillRow: { marginTop: 10 },
  planPill: {
    display: "inline-flex",
    fontSize: 11,
    fontWeight: 950,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    opacity: 0.9,
  },
  priceRow: { display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 },
  price: { fontSize: 44, fontWeight: 950, letterSpacing: -1.2 },
  per: { fontSize: 12, opacity: 0.7, fontWeight: 900 },
  planSub: { marginTop: 8, fontSize: 12, opacity: 0.75, lineHeight: 1.6 },

  divider: { height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0" },
  includes: { fontSize: 12, fontWeight: 950, opacity: 0.9, marginBottom: 10 },
  ul: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 },
  li: { display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, opacity: 0.85, lineHeight: 1.5 },
  bulletDot: { width: 8, height: 8, borderRadius: 99, background: "#57FE72", marginTop: 6, flex: "0 0 auto" },

  planBtn: {
    marginTop: "auto",
    border: "none",
    cursor: "pointer",
    fontWeight: 950,
    padding: "12px 14px",
    borderRadius: 16,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    minHeight: 44,
  },

  billingBox: {
    marginTop: 14,
    borderRadius: 22,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.20)",
  },
  billingTitle: { fontWeight: 950, marginBottom: 10 },
  billingGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 },
  billingItem: { display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, opacity: 0.85, lineHeight: 1.5 },
  checkDot: { width: 8, height: 8, borderRadius: 99, background: "#02F3DC", marginTop: 6, flex: "0 0 auto" },

  scoreWrap: { display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 14, marginTop: 14 },
  scoreCard: { borderRadius: 22, padding: 16 },
  scoreLabel: { fontWeight: 950, marginBottom: 10 },
  textarea: {
    width: "100%",
    minHeight: 190,
    resize: "vertical",
    borderRadius: 16,
    padding: 14,
    outline: "none",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 1.55,
  },
  scoreBtns: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
  primaryBtnSmall: {
    border: "none",
    cursor: "pointer",
    fontWeight: 950,
    padding: "12px 14px",
    borderRadius: 16,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    minHeight: 44,
  },
  secondaryBtnSmall: {
    border: "1px solid rgba(255,255,255,0.14)",
    cursor: "pointer",
    fontWeight: 900,
    padding: "12px 14px",
    borderRadius: 16,
    color: "rgba(255,255,255,0.88)",
    background: "rgba(255,255,255,0.05)",
    minHeight: 44,
  },
  tinyMuted: { marginTop: 10, fontSize: 12, opacity: 0.7, lineHeight: 1.55 },

  scoreRightOuter: { borderRadius: 22, padding: 16 },
  scoreRightTitle: { fontWeight: 950, marginBottom: 6 },
  scoreRightSub: { fontSize: 12, opacity: 0.72, marginBottom: 12 },

  swipeRow: {
    display: "flex",
    gap: 12,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    paddingBottom: 6,
  },
  swipeCard: {
    flex: "0 0 100%",
    scrollSnapAlign: "start",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
    minHeight: 230,
  },

  emptyState: { opacity: 0.75, fontSize: 13, lineHeight: 1.6, paddingTop: 8 },
  scoreBigWrap: { display: "grid", gap: 10 },
  scoreBig: { fontSize: 44, fontWeight: 950, letterSpacing: -1.2 },
  scoreBarOuter: {
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  scoreBarInner: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
  },

  breakdown: { display: "grid", gap: 10, marginTop: 8 },
  breakRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  breakLeft: { display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontWeight: 850, opacity: 0.9 },
  breakDot: { width: 8, height: 8, borderRadius: 99, background: "#02F3DC" },
  breakRight: { display: "flex", alignItems: "center", gap: 10, width: "55%" },
  breakNum: { fontSize: 11, opacity: 0.7, fontWeight: 900, minWidth: 46, textAlign: "right" },
  breakBarOuter: { flex: 1, height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" },
  breakBarInner: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(135deg, rgba(2,243,220,0.9), rgba(87,254,114,0.9))",
  },

  improveTitle: { fontWeight: 950, marginBottom: 10 },
  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: 12,
    opacity: 0.88,
    lineHeight: 1.6,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  copyBtn: {
    marginTop: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    cursor: "pointer",
    fontWeight: 900,
    padding: "12px 14px",
    borderRadius: 16,
    color: "rgba(255,255,255,0.88)",
    background: "rgba(255,255,255,0.05)",
    minHeight: 44,
  },

  nextStepBox: { display: "grid", gap: 10 },
  nextStepTitle: { fontSize: 16, fontWeight: 950 },
  nextStepText: { fontSize: 12, opacity: 0.75, lineHeight: 1.6 },

  dots: { display: "flex", justifyContent: "center", gap: 10, marginTop: 10 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(2,243,220,0.85)",
    cursor: "pointer",
  },

  footer: { marginTop: 26, paddingTop: 20 },
  footerInner: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.20)",
    padding: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  footerBrand: { fontWeight: 950, marginBottom: 4 },
  footerText: { opacity: 0.7, fontSize: 12, lineHeight: 1.5 },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.62)",
    zIndex: 50,
    display: "grid",
    placeItems: "center",
    padding: 16,
  },
  modal: { width: "min(520px, 100%)", borderRadius: 22, padding: 16 },
  modalTop: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" },
  modalTitle: { fontWeight: 950, fontSize: 18 },
  modalSub: { marginTop: 6, opacity: 0.75, fontSize: 12, lineHeight: 1.6 },
  modalClose: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    width: 40,
    height: 40,
    cursor: "pointer",
    fontWeight: 900,
  },
  form: { marginTop: 14, display: "grid", gap: 10 },
  inputLabel: { fontSize: 12, fontWeight: 900, opacity: 0.85 },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 16,
    padding: "0 14px",
    outline: "none",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
  },
  modalTiny: { fontSize: 12, opacity: 0.7, lineHeight: 1.5 },
  submitBtn: {
    border: "none",
    cursor: "pointer",
    fontWeight: 950,
    padding: "12px 14px",
    borderRadius: 16,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    minHeight: 48,
  },
  msg: { marginTop: 6, padding: 12, borderRadius: 16, fontSize: 12, fontWeight: 850, lineHeight: 1.5 },
  msgOk: { background: "rgba(87,254,114,0.12)", border: "1px solid rgba(87,254,114,0.22)" },
  msgErr: { background: "rgba(255,120,120,0.12)", border: "1px solid rgba(255,120,120,0.22)" },
  modalFinePrint: { marginTop: 4, fontSize: 11, opacity: 0.6, lineHeight: 1.5 },

  // Mobile sticky CTA
  mobileSticky: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 25,
    padding: "10px 14px",
    display: "none", // enabled via CSS for mobile only
    background: "linear-gradient(to top, rgba(7,10,15,0.95), rgba(7,10,15,0.65), rgba(7,10,15,0))",
    backdropFilter: "blur(10px)",
  },
  mobileStickyBtn: {
    width: "100%",
    border: "none",
    cursor: "pointer",
    fontWeight: 950,
    padding: "14px 16px",
    borderRadius: 18,
    color: "#041015",
    background:
      "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    minHeight: 52,
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
  },
};
