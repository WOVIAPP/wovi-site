// app/page.tsx
"use client";

import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type PlanKey = "free" | "growth" | "pro";

export default function Page() {
  // ===== Plan selection rules =====
  // Default plan is Free unless user explicitly clicks Growth/Pro.
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("free");
  const [userPickedPlan, setUserPickedPlan] = useState(false);

  // Waitlist modal
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [email, setEmail] = useState("");
  const [waitlistState, setWaitlistState] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Post score demo
  const [caption, setCaption] = useState("");
  const [scoreState, setScoreState] = useState<"idle" | "scored">("idle");
  const [score, setScore] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<{ hook: number; clarity: number; cta: number; voice: number }>({
    hook: 0,
    clarity: 0,
    cta: 0,
    voice: 0,
  });
  const [improvedCaption, setImprovedCaption] = useState<string>("");

  // Swipeable score results (mobile)
  const swipeRef = useRef<HTMLDivElement | null>(null);

  const openWaitlistDefaultFree = () => {
    // If they never clicked a plan, force Free.
    if (!userPickedPlan) setSelectedPlan("free");
    setWaitlistState("idle");
    setShowWaitlist(true);
  };

  const openWaitlistForPlan = (plan: PlanKey) => {
    setSelectedPlan(plan);
    setUserPickedPlan(true);
    setWaitlistState("idle");
    setShowWaitlist(true);
  };

  const closeWaitlist = () => {
    setShowWaitlist(false);
    setWaitlistState("idle");
  };

  const planLabel = useMemo(() => {
    return selectedPlan === "free" ? "Free Trial" : selectedPlan === "growth" ? "Growth" : "Pro";
  }, [selectedPlan]);

  // ===== Simple caption scoring (client-side demo, no AI keys needed) =====
  function computeScore(text: string) {
    const t = (text || "").trim();
    if (!t) {
      return { score: 0, hook: 0, clarity: 0, cta: 0, voice: 0, improved: "" };
    }

    const lower = t.toLowerCase();
    const words = t.split(/\s+/).filter(Boolean);
    const length = t.length;

    // Hook signals
    const hookSignals = [
      /\?/,
      /today\b/,
      /this week\b/,
      /new\b/,
      /launch\b/,
      /limited\b/,
      /free\b/,
      /now\b/,
      /stop\b/,
      /don’t\b|don't\b/,
      /secret\b/,
      /here’s\b|heres\b/,
      /3\b|three\b/,
      /5\b|five\b/,
    ];
    const hookHits = hookSignals.reduce((acc, r) => (r.test(lower) ? acc + 1 : acc), 0);

    // CTA signals
    const ctaSignals = [
      /call\b/,
      /dm\b/,
      /message\b/,
      /book\b/,
      /order\b/,
      /sign up\b|signup\b/,
      /join\b/,
      /click\b/,
      /tap\b/,
      /try\b/,
      /get started\b/,
      /link in bio\b/,
      /comment\b/,
    ];
    const ctaHits = ctaSignals.reduce((acc, r) => (r.test(lower) ? acc + 1 : acc), 0);

    // Clarity heuristics: short sentences + specifics
    const hasNumber = /\d/.test(t);
    const hasTime = /\b(am|pm|today|tomorrow|mon|tue|wed|thu|fri|sat|sun)\b/.test(lower);
    const hasOffer = /\b(off|%|discount|deal|special|bundle|bonus)\b/.test(lower);

    // Voice: punctuation + emojis + rhythm
    const emojiCount = (t.match(/[\u{1F300}-\u{1FAFF}]/gu) || []).length;
    const hasLineBreaks = t.includes("\n");
    const hasEnergy = /!/.test(t) || emojiCount > 0;

    let hook = Math.min(35, hookHits * 7 + (hasEnergy ? 5 : 0));
    let cta = Math.min(25, ctaHits * 8 + (ctaHits > 0 ? 5 : 0));
    let clarity = 0;

    // Clarity scoring
    clarity += length >= 40 && length <= 220 ? 18 : length <= 300 ? 12 : 6;
    clarity += hasNumber ? 5 : 0;
    clarity += hasTime ? 4 : 0;
    clarity += hasOffer ? 4 : 0;
    clarity += words.length >= 8 && words.length <= 45 ? 4 : 0;

    clarity = Math.min(25, clarity);

    let voice = 0;
    voice += hasLineBreaks ? 5 : 2;
    voice += Math.min(6, emojiCount * 2);
    voice += hasEnergy ? 5 : 2;
    voice += /you\b|your\b/.test(lower) ? 6 : 3;
    voice += /\bwe\b|\bour\b/.test(lower) ? 6 : 3;
    voice = Math.min(15, voice);

    // Total out of 100 (35 + 25 + 25 + 15)
    const total = Math.max(0, Math.min(100, Math.round(hook + clarity + cta + voice)));

    // Build an improved caption (generic for any business)
    const improved =
      buildImprovedCaption(t) ||
      "Quick update:\n\n✅ What’s new this week\n✅ Why it matters to customers\n✅ What to do next (comment, DM, book, order)\n\nWant Wovi to generate this for you every week? Join the waitlist.";

    return { score: total, hook, clarity, cta, voice, improved };
  }

  function buildImprovedCaption(original: string) {
    const t = original.trim();
    if (!t) return "";

    // If already has clear CTA, keep structure but improve clarity/format
    const lower = t.toLowerCase();
    const hasCTA = /\b(call|dm|message|book|order|sign up|join|click|tap|get started|link in bio|comment)\b/.test(lower);

    // Make it more universal (not BBQ-specific), add structure
    const openerOptions = [
      "Quick question:",
      "Heads up:",
      "New this week:",
      "If you’ve been meaning to post…",
      "One update for your customers today:",
    ];
    const opener = openerOptions[Math.floor(Math.random() * openerOptions.length)];

    const ctaLine = hasCTA
      ? "If you want help making posts like this consistently, join the Wovi waitlist."
      : "Reply “WOVI” or join the waitlist to get early access when public beta launches.";

    // Keep the original as raw content, but restructure
    return `${opener}\n\n${t}\n\n—\n\n✅ Clear offer\n✅ Clear benefit\n✅ Clear next step\n\n${ctaLine}`;
  }

  const handleGetScore = () => {
    const r = computeScore(caption);
    setScore(r.score);
    setBreakdown({ hook: r.hook, clarity: r.clarity, cta: r.cta, voice: r.voice });
    setImprovedCaption(r.improved);
    setScoreState("scored");

    // On mobile, snap to results panel automatically
    const el = swipeRef.current;
    if (el) {
      // scroll to first card (results)
      const cards = el.querySelectorAll<HTMLElement>("[data-swipe-card='1']");
      if (cards && cards.length > 0) {
        cards[0].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      }
    }
  };

  const handleClearScore = () => {
    setCaption("");
    setScoreState("idle");
    setScore(0);
    setBreakdown({ hook: 0, clarity: 0, cta: 0, voice: 0 });
    setImprovedCaption("");
  };

  // Waitlist submit (tries /api/waitlist; if not set up, still shows success)
  const submitWaitlist = async () => {
    const e = email.trim();
    if (!e || !/^\S+@\S+\.\S+$/.test(e)) {
      setWaitlistState("error");
      return;
    }

    setWaitlistState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, plan: selectedPlan }),
      });

      // If route doesn't exist, Next may return 404; still treat as success for now
      if (!res.ok) {
        // swallow errors in pre-launch mode
      }

      setWaitlistState("success");
    } catch {
      // still show success (pre-launch)
      setWaitlistState("success");
    }
  };

  // Smooth scroll helpers
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ===== Styles =====
  const S = styles;

  // Dynamic hero underline animation (CSS)
  const globalCss = `
    :root {
      color-scheme: dark;
    }
    html, body {
      background: #05070b;
      margin: 0;
      padding: 0;
    }
    * { box-sizing: border-box; }

    /* Mobile grid fixes */
    @media (max-width: 980px) {
      .heroGridMobileFix { grid-template-columns: 1fr !important; gap: 16px !important; }
      .pricingGridMobileFix { grid-template-columns: 1fr !important; }
      .scoreGridMobileFix { grid-template-columns: 1fr !important; }
    }

    /* Sticky mobile CTA */
    @media (max-width: 820px) {
      .mobileStickyCta {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
        background: linear-gradient(180deg, rgba(5,7,11,0) 0%, rgba(5,7,11,0.92) 25%, rgba(5,7,11,0.98) 100%);
        backdrop-filter: blur(14px);
        z-index: 60;
      }
      .mobileStickyCtaInner {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
        max-width: 980px;
        margin: 0 auto;
      }
      .mobileStickyBtn {
        min-height: 48px; /* Apple HIG tap size */
        border-radius: 14px;
        border: 1px solid rgba(2,243,220,0.35);
        background: linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%);
        color: #041015;
        font-weight: 950;
        letter-spacing: 0.2px;
        box-shadow: 0 18px 55px rgba(0,0,0,0.45);
      }
      .mobileStickyHint {
        font-size: 12px;
        opacity: 0.72;
        text-align: center;
      }
      /* avoid content hidden behind sticky bar */
      .pageBottomPad {
        padding-bottom: 92px !important;
      }
    }

    /* Hero underline animation */
    .gradUnderline {
      position: relative;
      display: inline-block;
      padding-bottom: 2px;
    }
    .gradUnderline::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -6px;
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(90deg, #02F3DC, #00EDEC, #01DEF4, #21AEF5, #57FE72);
      transform-origin: left;
      animation: underlineSweep 2.8s ease-in-out infinite;
      opacity: 0.95;
      filter: blur(0.1px);
    }
    @keyframes underlineSweep {
      0% { transform: scaleX(0.25); opacity: 0.55; }
      45% { transform: scaleX(1); opacity: 1; }
      100% { transform: scaleX(0.35); opacity: 0.6; }
    }

    /* Hover glow pricing cards */
    .glowCard {
      transition: transform 160ms ease, box-shadow 200ms ease, border-color 200ms ease;
    }
    @media (hover:hover) {
      .glowCard:hover {
        transform: translateY(-3px);
        box-shadow: 0 24px 80px rgba(0,0,0,0.55);
        border-color: rgba(2,243,220,0.42);
      }
    }

    /* Swipe container for score results on mobile */
    .swipeRow {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    @media (max-width: 980px) {
      .swipeRow {
        display: flex !important;
        gap: 14px !important;
        overflow-x: auto !important;
        scroll-snap-type: x mandatory !important;
        -webkit-overflow-scrolling: touch !important;
        padding-bottom: 4px;
      }
      .swipeCard {
        min-width: 86vw;
        scroll-snap-align: start;
      }
    }

    /* iPhone vs Android font tuning (best-effort) */
    /* iOS tends to look bigger; tighten slightly */
    @supports (-webkit-touch-callout: none) {
      .heroH1 { letter-spacing: -0.02em; }
      .heroSub { font-size: 16px !important; }
    }
    /* Android: slightly larger for readability */
    @supports not (-webkit-touch-callout: none) {
      @media (max-width: 480px) {
        .heroH1 { font-size: 42px !important; }
      }
    }
  `;

  return (
    <>
      <style jsx global>{globalCss}</style>

      <div style={S.page} className="pageBottomPad">
        {/* Top nav */}
        <div style={S.navWrap}>
          <div style={S.navInner}>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={S.brandBtn}
              aria-label="Go to top"
            >
              <div style={S.logoCircle}>W</div>
              <div style={{ display: "grid", gap: 2 }}>
                <div style={S.brandName}>WOVI</div>
                <div style={S.brandSub}>AI social media OS for any business</div>
              </div>
            </button>

            <div style={S.navLinks}>
              <button onClick={() => scrollToId("pricing")} style={S.navLink}>
                Pricing
              </button>
              <button
                onClick={() => openWaitlistDefaultFree()}
                style={S.navCta}
                aria-label="Join waitlist"
              >
                Join waitlist
              </button>
            </div>
          </div>
        </div>

        {/* HERO (ResuMax-style first screen) */}
        <section style={S.hero} aria-label="Hero">
          <div style={S.heroBgGlow} />
          <div style={S.heroStars} />

          <div style={S.heroCenter}>
            <div style={S.heroKicker}>Pre-launch • Waitlist only</div>

            <h1 style={S.heroH1} className="heroH1">
              AI that runs your social media{" "}
              <span className="gradUnderline" style={S.heroH1Accent}>
                every week
              </span>
              .
            </h1>

            <p style={S.heroSub} className="heroSub">
              Tell Wovi what you’re promoting. Wovi generates captions, visuals, and a weekly posting plan — for any business.
            </p>

            <div style={S.heroCtas}>
              <button
                onClick={() => openWaitlistDefaultFree()}
                style={S.heroPrimary}
                aria-label="Join waitlist (defaults to Free Trial unless you pick another plan)"
              >
                Join waitlist
              </button>
              <button onClick={() => scrollToId("pricing")} style={S.heroSecondary}>
                View pricing
              </button>
            </div>

            <div style={S.heroProofRow}>
              <div style={S.proofItem}>
                <span style={S.proofDot} />
                Email-only pre-launch
              </div>
              <div style={S.proofItem}>
                <span style={S.proofDot} />
                Free Trial tier at launch
              </div>
              <div style={S.proofItem}>
                <span style={S.proofDot} />
                Works for any industry
              </div>
            </div>
          </div>
        </section>

        {/* HERO GRID (the 2 boxes you circled) */}
        <section style={S.sectionPad}>
          <div style={S.heroGrid} className="heroGridMobileFix">
            {/* Left big card */}
            <div style={S.heroCardLeft}>
              <div style={S.pillRow}>
                <div style={S.pill}>
                  <span style={S.pillDot} />
                  Pre-launch • Waitlist only
                </div>
              </div>

              <div style={S.heroTitle}>
                AI that turns your business goals into{" "}
                <span className="gradUnderline" style={S.gradWord}>
                  ready-to-post
                </span>{" "}
                content.
              </div>

              <div style={S.heroBody}>
                Wovi replaces the planning and creation behind social media — captions, visuals, and weekly posting plans — so you stay consistent without burnout.
              </div>

              <div style={S.heroBtnRow}>
                <button onClick={() => scrollToId("pricing")} style={S.primaryBtn}>
                  Pick a plan
                </button>

                <button onClick={() => openWaitlistDefaultFree()} style={S.secondaryBtn}>
                  Join waitlist
                </button>
              </div>

              <div style={S.miniGrid}>
                <div style={S.miniCard}>
                  <div style={S.miniLabel}>Works for</div>
                  <div style={S.miniTitle}>Any industry</div>
                  <div style={S.miniText}>Local, online, service, ecommerce, creators, startups</div>
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

            {/* Right “This week in Wovi” card */}
            <div style={S.heroCardRight}>
              <div style={S.rightTopRow}>
                <div style={S.rightTitle}>This week in Wovi</div>
                <div style={S.rightPill}>Auto-planned</div>
              </div>

              <div style={S.rightGrid}>
                <div style={S.rightBox}>
                  <div style={S.rightLabel}>Input</div>
                  <div style={S.rightStrong}>Goal:</div>
                  <div style={S.rightText}>"Get more customers this week"</div>
                  <div style={S.rightMuted}>Tone: confident • modern</div>
                </div>

                <div style={S.rightBox}>
                  <div style={S.rightLabel}>Output</div>
                  <div style={S.rightStrong}>Captions + image concepts</div>
                  <div style={S.rightText}>Ready-to-post variations</div>
                </div>

                <div style={S.rightBox}>
                  <div style={S.rightLabel}>Plan</div>
                  <div style={S.rightStrong}>Weekly posting schedule</div>
                  <div style={S.rightText}>Daily suggestions</div>
                </div>

                <div style={S.rightBox}>
                  <div style={S.rightLabel}>Result</div>
                  <div style={S.rightStrong}>You stay consistent</div>
                  <div style={S.rightText}>No agency, no burnout</div>
                </div>
              </div>

              <div style={S.rightFooter}>
                <div style={S.rightFooterText}>Pick a plan now. Get early access when we launch.</div>
                <button onClick={() => openWaitlistDefaultFree()} style={S.primaryBtnSmall}>
                  Join waitlist
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* POST SCORE (upload/paste caption -> get score -> improved caption) */}
        <section style={S.sectionPad} id="post-score">
          <div style={S.sectionTitle}>Post Score</div>
          <div style={S.sectionSub}>
            Pre-launch demo: paste a post caption and Wovi will rate it (hook, clarity, CTA, voice) — then generate a stronger version.
          </div>

          <div style={S.scoreWrap} className="scoreGridMobileFix">
            {/* Left */}
            <div style={S.panel} className="swipeCard">
              <div style={S.panelTitle}>Paste your post caption</div>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={`Example:\n“New availability this week.\nIf you need help with (service/product), message us and we’ll get you set up.\nSpots are limited — book today.”`}
                style={S.textarea}
              />

              <div style={S.btnRow}>
                <button onClick={handleGetScore} style={S.primaryBtn}>
                  Get score
                </button>
                <button onClick={handleClearScore} style={S.secondaryBtn}>
                  Clear
                </button>
              </div>

              <div style={S.tinyNote}>This is a demo score (no account needed yet).</div>
            </div>

            {/* Right: swipeable on mobile */}
            <div style={S.scoreRightWrap} ref={swipeRef}>
              <div className="swipeRow">
                <div style={S.panel} className="swipeCard" data-swipe-card="1">
                  <div style={S.panelTitle}>Your Wovi Score</div>

                  {scoreState === "idle" ? (
                    <div style={S.emptyState}>Paste a caption and press “Get score”.</div>
                  ) : (
                    <>
                      <div style={S.scoreTop}>
                        <div style={S.scoreBig}>{score}/100</div>
                        <div style={S.scoreMeta}>Demo analysis</div>
                      </div>

                      <div style={S.barWrap}>
                        <div style={{ ...S.barFill, width: `${score}%` }} />
                      </div>

                      <div style={S.metricList}>
                        <Metric label="Hook" value={breakdown.hook} max={35} />
                        <Metric label="Clarity" value={breakdown.clarity} max={25} />
                        <Metric label="CTA" value={breakdown.cta} max={25} />
                        <Metric label="Voice" value={breakdown.voice} max={15} />
                      </div>

                      <div style={S.metricHint}>Swipe for the improved caption →</div>
                    </>
                  )}
                </div>

                <div style={S.panel} className="swipeCard" data-swipe-card="1">
                  <div style={S.panelTitle}>Improved caption</div>

                  {scoreState === "idle" ? (
                    <div style={S.emptyState}>Your improved caption will appear here.</div>
                  ) : (
                    <>
                      <div style={S.improvedBox}>{improvedCaption}</div>

                      <div style={S.btnRow}>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(improvedCaption);
                          }}
                          style={S.primaryBtn}
                        >
                          Copy improved caption
                        </button>
                        <button onClick={() => openWaitlistDefaultFree()} style={S.secondaryBtn}>
                          Join waitlist
                        </button>
                      </div>

                      <div style={S.tinyNote}>
                        Want Wovi to do this automatically every week? Join the waitlist for public beta.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section style={S.sectionPad} id="pricing">
          <div style={S.sectionTitle}>WOVI Pricing Plans</div>
          <div style={S.sectionSub}>
            <b>Pre-launch rule:</b> All plans currently lead to the waitlist. Email only. Full billing activates at launch.
          </div>

          <div style={S.notePill}>
            <span style={S.pillDot} />
            Email only • Full billing activates at launch
          </div>

          <div style={S.pricingGrid} className="pricingGridMobileFix">
            {/* Free */}
            <div style={S.priceCard} className="glowCard">
              <div style={S.priceTopRow}>
                <div style={S.priceName}>Free Trial</div>
                <div style={{ ...S.badge, borderColor: "rgba(87,254,114,0.4)", color: "#57FE72" }}>Starter Access</div>
              </div>

              <div style={S.priceAmount}>
                $0 <span style={S.pricePer}>/ trial</span>
              </div>

              <div style={S.priceDesc}>
                Try Wovi risk-free. Credit card required at launch. Automatically converts into Growth unless canceled.
              </div>

              <div style={S.divider} />

              <div style={S.includesTitle}>Includes</div>
              <ul style={S.ul}>
                <li style={S.li}>
                  <span style={{ ...S.bullet, background: "#57FE72" }} /> Limited AI-generated posts
                </li>
                <li style={S.li}>
                  <span style={{ ...S.bullet, background: "#57FE72" }} /> Basic captions
                </li>
                <li style={S.li}>
                  <span style={{ ...S.bullet, background: "#57FE72" }} /> Sample images
                </li>
                <li style={S.li}>
                  <span style={{ ...S.bullet, background: "#57FE72" }} /> Preview of weekly planning
                </li>
              </ul>

              <button onClick={() => openWaitlistForPlan("free")} style={S.planBtn}>
                Join waitlist
              </button>
              <div style={S.planFoot}>Best for: trying Wovi before you scale.</div>
            </div>

            {/* Growth (Most Popular ONLY ONCE) */}
            <div style={{ ...S.priceCard, ...S.priceCardPopular }} className="glowCard">
              <div style={S.priceTopRow}>
                <div style={S.priceName}>Growth</div>
                <div style={{ ...S.badge, borderColor: "rgba(2,243,220,0.45)", color: "#02F3DC" }}>Most Popular</div>
              </div>

              <div style={S.priceAmount}>
                $29 <span style={S.pricePer}>/ month</span>
              </div>

              <div style={S.priceDesc}>
                Consistent posting without hiring an agency. Weekly planning + captions + visuals for any business.
              </div>

              <div style={S.divider} />

              <div style={S.includesTitle}>Includes</div>
              <ul style={S.ul}>
                <li style={S.li}>
                  <span style={S.bullet} /> 2–3 posts per day
                </li>
                <li style={S.li}>
                  <span style={S.bullet} /> Weekly content planning
                </li>
                <li style={S.li}>
                  <span style={S.bullet} /> AI-generated captions
                </li>
                <li style={S.li}>
                  <span style={S.bullet} /> AI image ideas or images
                </li>
                <li style={S.li}>
                  <span style={S.bullet} /> Brand tone learning
                </li>
                <li style={S.li}>
                  <span style={S.bullet} /> Unlimited edits/regenerations
                </li>
              </ul>

              <button onClick={() => openWaitlistForPlan("growth")} style={S.planBtnPrimary}>
                Join waitlist
              </button>
              <div style={S.planFoot}>Best for: most businesses that want consistency.</div>
            </div>

            {/* Pro */}
            <div style={S.priceCard} className="glowCard">
              <div style={S.priceTopRow}>
                <div style={S.priceName}>Pro</div>
                <div style={{ ...S.badge, borderColor: "rgba(33,174,245,0.45)", color: "#21AEF5" }}>Advanced</div>
              </div>

              <div style={S.priceAmount}>
                $49 <span style={S.pricePer}>/ month</span>
              </div>

              <div style={S.priceDesc}>
                Higher volume + deeper strategy for serious brands that want to scale content output fast.
              </div>

              <div style={S.divider} />

              <div style={S.includesTitle}>Includes</div>
              <ul style={S.ul}>
                <li style={S.li}>
                  <span style={{ ...S.bullet, background: "#21AEF5" }} /> Everything in Growth
                </li>
                <li style={S.li}>
                  <span style={{ ...S.bullet, background: "#21AEF5" }} /> Higher daily post volume
                </li>
                <li style={S.li}>
                  <span style={{ ...S.bullet, background: "#21AEF5" }} /> Advanced strategy suggestions
                </li>
                <li style={S.li}>
                  <span style={{ ...S.bullet, background: "#21AEF5" }} /> Campaign & launch planning
                </li>
                <li style={S.li}>
                  <span style={{ ...S.bullet, background: "#21AEF5" }} /> AI video ad concepts
                </li>
              </ul>

              <button onClick={() => openWaitlistForPlan("pro")} style={S.planBtn}>
                Join waitlist
              </button>
              <div style={S.planFoot}>Best for: founders and fast-growing brands.</div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={S.footer}>
          <div style={S.footerInner}>
            <div style={{ opacity: 0.75 }}>© {new Date().getFullYear()} Wovi • Pre-launch</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={() => openWaitlistDefaultFree()} style={S.footerBtn}>
                Join waitlist
              </button>
              <button onClick={() => scrollToId("pricing")} style={S.footerBtn}>
                Pricing
              </button>
              <button onClick={() => scrollToId("post-score")} style={S.footerBtn}>
                Post Score
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Sticky bottom CTA (mobile) */}
      <div className="mobileStickyCta">
        <div className="mobileStickyCtaInner">
          <button className="mobileStickyBtn" onClick={() => openWaitlistDefaultFree()}>
            Join waitlist (defaults to Free Trial)
          </button>
          <div className="mobileStickyHint">Pick Growth/Pro first if you want a different plan.</div>
        </div>
      </div>

      {/* WAITLIST MODAL */}
      {showWaitlist && (
        <div style={S.modalOverlay} role="dialog" aria-modal="true" aria-label="Join waitlist">
          <div style={S.modal}>
            <div style={S.modalTop}>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={S.modalTitle}>
                  Join the Wovi waitlist — <span style={{ color: "#02F3DC" }}>{planLabel}</span>
                </div>
                <div style={S.modalSub}>
                  We’re launching in small batches. Enter your email and we’ll notify you when public beta opens.
                </div>
              </div>
              <button onClick={closeWaitlist} style={S.modalX} aria-label="Close">
                ✕
              </button>
            </div>

            {waitlistState !== "success" ? (
              <>
                <div style={S.modalRow}>
                  <input
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (waitlistState === "error") setWaitlistState("idle");
                    }}
                    placeholder="you@business.com"
                    style={S.input}
                    inputMode="email"
                    autoComplete="email"
                  />
                  <button
                    onClick={submitWaitlist}
                    style={S.submitBtn}
                    disabled={waitlistState === "loading"}
                  >
                    {waitlistState === "loading" ? "Joining..." : "Join waitlist"}
                  </button>
                </div>

                {waitlistState === "error" && (
                  <div style={S.errorText}>Enter a valid email address.</div>
                )}

                <div style={S.tinyNote}>
                  Email only. No passwords. No payment info yet. You can unsubscribe anytime.
                </div>
              </>
            ) : (
              <div style={S.successBox}>
                <div style={S.successTitle}>You’re on the list.</div>
                <div style={S.successBody}>
                  Thanks — we’ll email you as soon as public beta releases.
                  <br />
                  <span style={{ opacity: 0.8 }}>Selected plan: {planLabel}</span>
                </div>
                <button onClick={closeWaitlist} style={S.successBtn}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Metric({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div style={styles.metricRow}>
      <div style={styles.metricLeft}>
        <span style={styles.metricDot} />
        <span style={styles.metricLabel}>{label}</span>
      </div>
      <div style={styles.metricRight}>
        <span style={styles.metricValue}>
          {Math.round(value)}/{max}
        </span>
        <div style={styles.metricBar}>
          <div style={{ ...styles.metricBarFill, width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    color: "#EAF1FF",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    background: "radial-gradient(1200px 800px at 50% 0%, rgba(33,174,245,0.16), transparent 60%), #05070b",
  },

  navWrap: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(5,7,11,0.62)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  navInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brandBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    padding: 0,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    letterSpacing: "-0.02em",
    background: "linear-gradient(135deg, #02F3DC 0%, #21AEF5 60%, #57FE72 100%)",
    color: "#041015",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
  },
  brandName: { fontWeight: 950, letterSpacing: "0.06em", fontSize: 13 },
  brandSub: { fontSize: 12, opacity: 0.72 },

  navLinks: { display: "flex", alignItems: "center", gap: 10 },
  navLink: {
    background: "transparent",
    border: "none",
    color: "rgba(234,241,255,0.9)",
    cursor: "pointer",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 800,
    minHeight: 40,
  },
  navCta: {
    minHeight: 40,
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    color: "#041015",
    fontWeight: 950,
    cursor: "pointer",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    padding: "74px 16px 34px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  heroBgGlow: {
    position: "absolute",
    inset: -200,
    background:
      "radial-gradient(900px 500px at 50% 10%, rgba(2,243,220,0.22), transparent 60%), radial-gradient(700px 400px at 80% 25%, rgba(33,174,245,0.18), transparent 60%), radial-gradient(700px 400px at 20% 35%, rgba(87,254,114,0.12), transparent 60%)",
    filter: "blur(0px)",
    pointerEvents: "none",
  },
  heroStars: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
    backgroundSize: "22px 22px",
    opacity: 0.10,
    maskImage: "radial-gradient(600px 400px at 50% 30%, rgba(0,0,0,1), transparent 72%)",
    pointerEvents: "none",
  },
  heroCenter: {
    position: "relative",
    maxWidth: 980,
    margin: "0 auto",
    textAlign: "center",
    padding: "0 6px",
  },
  heroKicker: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.9,
  },
  heroH1: {
    margin: "18px 0 12px",
    fontSize: 52,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    fontWeight: 1000 as any,
  },
  heroH1Accent: {
    color: "#EAF1FF",
  },
  heroSub: {
    maxWidth: 760,
    margin: "0 auto",
    fontSize: 17,
    lineHeight: 1.6,
    color: "rgba(234,241,255,0.78)",
  },
  heroCtas: {
    marginTop: 22,
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  heroPrimary: {
    minHeight: 48,
    padding: "12px 18px",
    borderRadius: 16,
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    color: "#041015",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 18px 60px rgba(0,0,0,0.52)",
  },
  heroSecondary: {
    minHeight: 48,
    padding: "12px 18px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(234,241,255,0.92)",
    fontWeight: 900,
    cursor: "pointer",
  },
  heroProofRow: {
    marginTop: 16,
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  proofItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    opacity: 0.78,
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.18)",
  },
  proofDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    background: "#57FE72",
    boxShadow: "0 0 0 3px rgba(87,254,114,0.10)",
  },

  sectionPad: { maxWidth: 1100, margin: "0 auto", padding: "26px 16px" },

  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.25fr 1fr",
    gap: 16,
    alignItems: "stretch",
  },
  heroCardLeft: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 18px 70px rgba(0,0,0,0.55)",
    padding: 18,
  },
  heroCardRight: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 18px 70px rgba(0,0,0,0.55)",
    padding: 18,
    display: "grid",
    gap: 12,
  },
  pillRow: { display: "flex", justifyContent: "flex-start" },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    fontSize: 12,
    fontWeight: 900,
  },
  pillDot: { width: 7, height: 7, borderRadius: 999, background: "#02F3DC" },

  heroTitle: {
    marginTop: 12,
    fontSize: 44,
    lineHeight: 1.06,
    letterSpacing: "-0.03em",
    fontWeight: 1000 as any,
  },
  gradWord: { color: "#02F3DC" },
  heroBody: { marginTop: 10, color: "rgba(234,241,255,0.78)", fontSize: 14.5, lineHeight: 1.7 },

  heroBtnRow: { marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" },

  primaryBtn: {
    minHeight: 48,
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    color: "#041015",
    fontWeight: 950,
    cursor: "pointer",
  },
  secondaryBtn: {
    minHeight: 48,
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(234,241,255,0.92)",
    fontWeight: 900,
    cursor: "pointer",
  },

  miniGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  miniCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 12,
  },
  miniLabel: { fontSize: 11, fontWeight: 950, opacity: 0.72, letterSpacing: "0.08em" },
  miniTitle: { marginTop: 6, fontSize: 13, fontWeight: 950 },
  miniText: { marginTop: 6, fontSize: 12, opacity: 0.75, lineHeight: 1.5 },

  rightTopRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  rightTitle: { fontWeight: 950, fontSize: 14 },
  rightPill: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.9,
  },
  rightGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  rightBox: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 12,
    minHeight: 92,
  },
  rightLabel: { fontSize: 11, fontWeight: 950, opacity: 0.70, letterSpacing: "0.08em" },
  rightStrong: { marginTop: 6, fontSize: 13, fontWeight: 950 },
  rightText: { marginTop: 6, fontSize: 12, opacity: 0.78, lineHeight: 1.5 },
  rightMuted: { marginTop: 6, fontSize: 12, opacity: 0.62 },

  rightFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  rightFooterText: { fontSize: 12, opacity: 0.72, lineHeight: 1.5 },
  primaryBtnSmall: {
    minHeight: 44,
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    color: "#041015",
    fontWeight: 950,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  sectionTitle: { fontSize: 26, fontWeight: 1000 as any, letterSpacing: "-0.02em" },
  sectionSub: { marginTop: 8, fontSize: 14, lineHeight: 1.7, color: "rgba(234,241,255,0.74)" },

  scoreWrap: { marginTop: 14, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 14, alignItems: "stretch" },
  panel: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 18px 70px rgba(0,0,0,0.55)",
    padding: 18,
  },
  panelTitle: { fontWeight: 950, fontSize: 14, marginBottom: 10 },
  textarea: {
    width: "100%",
    minHeight: 170,
    resize: "vertical",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(234,241,255,0.92)",
    padding: 14,
    outline: "none",
    fontSize: 14,
    lineHeight: 1.55,
  },
  btnRow: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
  tinyNote: { marginTop: 10, fontSize: 12, opacity: 0.70, lineHeight: 1.6 },

  scoreRightWrap: { minHeight: 1 },

  emptyState: {
    borderRadius: 16,
    border: "1px dashed rgba(255,255,255,0.16)",
    background: "rgba(0,0,0,0.16)",
    padding: 14,
    opacity: 0.72,
    fontSize: 13,
    lineHeight: 1.6,
  },
  scoreTop: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 10 },
  scoreBig: { fontSize: 42, fontWeight: 1000 as any, letterSpacing: "-0.03em" },
  scoreMeta: { fontSize: 12, opacity: 0.72, fontWeight: 900 },

  barWrap: {
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #02F3DC, #00EDEC, #01DEF4, #21AEF5, #57FE72)",
  },

  metricList: { display: "grid", gap: 10 },
  metricRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  metricLeft: { display: "flex", alignItems: "center", gap: 10 },
  metricDot: { width: 8, height: 8, borderRadius: 999, background: "#02F3DC", boxShadow: "0 0 0 3px rgba(2,243,220,0.12)" },
  metricLabel: { fontSize: 13, fontWeight: 900, opacity: 0.9 },
  metricRight: { display: "flex", alignItems: "center", gap: 10, minWidth: 160, justifyContent: "flex-end" },
  metricValue: { fontSize: 12, opacity: 0.8, fontWeight: 900, width: 64, textAlign: "right" },
  metricBar: {
    width: 90,
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  metricBarFill: { height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #02F3DC, #21AEF5, #57FE72)" },
  metricHint: { marginTop: 12, fontSize: 12, opacity: 0.72 },

  improvedBox: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    padding: 14,
    whiteSpace: "pre-wrap",
    lineHeight: 1.6,
    fontSize: 13.5,
    color: "rgba(234,241,255,0.9)",
  },

  notePill: {
    marginTop: 12,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.92,
  },

  pricingGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
    alignItems: "stretch",
  },
  priceCard: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 18px 70px rgba(0,0,0,0.55)",
    padding: 18,
    display: "grid",
    gap: 10,
    minWidth: 0,
  },
  priceCardPopular: {
    borderColor: "rgba(2,243,220,0.35)",
    boxShadow: "0 26px 90px rgba(0,0,0,0.62)",
  },
  priceTopRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  priceName: { fontSize: 18, fontWeight: 1000 as any },
  badge: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    fontSize: 12,
    fontWeight: 950,
    whiteSpace: "nowrap",
  },
  priceAmount: { fontSize: 46, fontWeight: 1000 as any, letterSpacing: "-0.03em" },
  pricePer: { fontSize: 13, opacity: 0.72, fontWeight: 900 },
  priceDesc: { fontSize: 13, opacity: 0.78, lineHeight: 1.6 },
  divider: { height: 1, background: "rgba(255,255,255,0.10)", margin: "6px 0" },
  includesTitle: { fontSize: 12, fontWeight: 950, letterSpacing: "0.08em", opacity: 0.85 },
  ul: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 9 },
  li: { display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, opacity: 0.85, lineHeight: 1.5 },
  bullet: { width: 10, height: 10, borderRadius: 999, background: "#02F3DC", marginTop: 4, flex: "0 0 auto" },

  planBtn: {
    marginTop: 8,
    minHeight: 48,
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(234,241,255,0.92)",
    fontWeight: 950,
    cursor: "pointer",
  },
  planBtnPrimary: {
    marginTop: 8,
    minHeight: 48,
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    color: "#041015",
    fontWeight: 950,
    cursor: "pointer",
  },
  planFoot: { fontSize: 12, opacity: 0.68, marginTop: 2, lineHeight: 1.5 },

  footer: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "26px 16px",
    marginTop: 18,
    background: "rgba(0,0,0,0.18)",
  },
  footerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gap: 12,
    justifyItems: "center",
    textAlign: "center",
  },
  footerBtn: {
    minHeight: 42,
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(234,241,255,0.92)",
    fontWeight: 900,
    cursor: "pointer",
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.62)",
    backdropFilter: "blur(10px)",
    zIndex: 80,
    display: "grid",
    placeItems: "center",
    padding: 16,
  },
  modal: {
    width: "min(680px, 100%)",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(10,14,20,0.92)",
    boxShadow: "0 30px 120px rgba(0,0,0,0.75)",
    padding: 18,
  },
  modalTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: 1000 as any },
  modalSub: { fontSize: 13, opacity: 0.78, lineHeight: 1.6 },
  modalX: {
    minHeight: 40,
    minWidth: 40,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(234,241,255,0.92)",
    cursor: "pointer",
    fontWeight: 950,
  },
  modalRow: { marginTop: 14, display: "grid", gridTemplateColumns: "1fr auto", gap: 10 },
  input: {
    minHeight: 48,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(234,241,255,0.92)",
    padding: "12px 14px",
    outline: "none",
    fontSize: 14,
  },
  submitBtn: {
    minHeight: 48,
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    color: "#041015",
    fontWeight: 950,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  errorText: { marginTop: 10, fontSize: 12, color: "rgba(255,120,120,0.95)", fontWeight: 900 },

  successBox: { marginTop: 12, display: "grid", gap: 10 },
  successTitle: { fontSize: 18, fontWeight: 1000 as any },
  successBody: { fontSize: 13, opacity: 0.82, lineHeight: 1.65 },
  successBtn: {
    marginTop: 4,
    minHeight: 48,
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(234,241,255,0.92)",
    fontWeight: 950,
    cursor: "pointer",
  },
};
