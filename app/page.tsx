/* ================================
   FILE: app/page.tsx
   ACTION: REPLACE the entire file with this
   ================================ */

"use client";

import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type PlanKey = "free" | "growth" | "pro";

export default function Page() {
  const S: Record<string, CSSProperties> = styles;

  // ---- Waitlist modal state ----
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("free"); // default to Free Trial
  const [email, setEmail] = useState("");
  const [joinState, setJoinState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ---- Post score demo state ----
  const [captionInput, setCaptionInput] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<{ hook: number; clarity: number; cta: number; voice: number } | null>(
    null
  );
  const [improvedCaption, setImprovedCaption] = useState<string>("");
  const [scoreHint, setScoreHint] = useState<string>("Paste a caption and press “Get score”.");

  // Swipe container ref (mobile)
  const swipeRef = useRef<HTMLDivElement | null>(null);

  // ---- Inject CSS string (keeps your current approach) ----
  const globalCss = useMemo(
    () => `
:root{
  color-scheme: dark;
}

html, body{
  background: #05070b;
  margin: 0;
  padding: 0;
}

*{ box-sizing: border-box; }

::selection{
  background: rgba(2,243,220,0.25);
}

/* background grid */
.woviBg{
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(1100px 700px at 20% 15%, rgba(2,243,220,0.16), transparent 60%),
    radial-gradient(900px 600px at 85% 20%, rgba(33,174,245,0.16), transparent 55%),
    radial-gradient(800px 560px at 65% 85%, rgba(87,254,114,0.12), transparent 55%),
    linear-gradient(180deg, #05070b 0%, #05070b 55%, #05070b 100%);
}

.woviGrid{
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 58px 58px;
  mask-image: radial-gradient(70% 70% at 55% 20%, black 50%, transparent 85%);
  opacity: 0.9;
}

.woviStars{
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 1px, transparent 1px),
    radial-gradient(circle at 60% 70%, rgba(255,255,255,0.06) 1px, transparent 1px),
    radial-gradient(circle at 80% 40%, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 240px 240px, 320px 320px, 420px 420px;
  opacity: 0.35;
  filter: blur(0.2px);
  mask-image: radial-gradient(70% 70% at 50% 30%, black 55%, transparent 90%);
}

/* animated underline for ready-to-post */
.readyUnderline{
  position: relative;
  display: inline-block;
}
.readyUnderline:after{
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -8px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%);
  background-size: 220% 100%;
  animation: glowflow 2.8s linear infinite;
  opacity: 0.95;
  box-shadow: 0 0 20px rgba(2,243,220,0.25);
}
@keyframes glowflow{
  0%{ background-position: 0% 50%; }
  100%{ background-position: 220% 50%; }
}

/* hover glow for pricing cards */
.planCard{
  transition: transform 160ms ease, box-shadow 220ms ease, border-color 220ms ease;
}
.planCard:hover{
  transform: translateY(-2px);
  box-shadow: 0 26px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07) inset;
  border-color: rgba(2,243,220,0.22) !important;
}

/* scroll reveal */
.reveal{
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 650ms ease, transform 650ms ease;
}
.reveal.revealed{
  opacity: 1;
  transform: translateY(0);
}

/* Modal */
.modalBackdrop{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.62);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 18px;
}
.modalPanel{
  width: min(720px, 96vw);
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.10);
  background: radial-gradient(900px 420px at 30% 10%, rgba(2,243,220,0.10), transparent 55%),
              radial-gradient(700px 420px at 80% 0%, rgba(33,174,245,0.10), transparent 60%),
              rgba(10,12,16,0.85);
  box-shadow: 0 35px 120px rgba(0,0,0,0.72);
  overflow: hidden;
}
.modalHeader{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.modalBody{
  padding: 16px;
}
.modalClose{
  appearance: none;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.9);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
}
.modalClose:active{
  transform: translateY(1px);
}

/* Sticky mobile CTA */
@media (max-width: 820px) {
  .mobileStickyCta{
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
    background: linear-gradient(180deg, rgba(5,7,11,0) 0%, rgba(5,7,11,0.92) 25%, rgba(5,7,11,0.98) 100%);
    backdrop-filter: blur(14px);
    z-index: 60;
  }
  .mobileStickyCtaInner{
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    max-width: 980px;
    margin: 0 auto;
  }
  .mobileStickyBtn{
    min-height: 48px; /* Apple HIG tap size */
    border-radius: 14px;
    border: 1px solid rgba(2,243,220,0.35);
    background: linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%);
    color: #041015;
    font-weight: 950;
    font-size: 14px;
    letter-spacing: 0.2px;
    box-shadow: 0 18px 55px rgba(0,0,0,0.45);
    cursor: pointer;
  }
  .mobileStickySub{
    font-size: 12px;
    opacity: 0.75;
    text-align: center;
  }
}

/* Mobile grid fixes */
@media (max-width: 980px) {
  .heroGridMobileFix{ grid-template-columns: 1fr !important; gap: 16px !important; }
  .pricingGridMobileFix{ grid-template-columns: 1fr !important; }
  .scoreGridMobileFix{ grid-template-columns: 1fr !important; }
}

/* ===== Post Score mobile fix (prevents overflow) ===== */
.postScoreMobileFix,
.postScoreMobileFix *{
  max-width: 100%;
}

html, body{
  overflow-x: hidden;
}

@media (max-width: 980px){
  .postScoreMobileFix{
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }

  .postScoreMobileFix .swipeRow{
    display: flex !important;
    overflow-x: auto !important;
    scroll-snap-type: x mandatory !important;
    -webkit-overflow-scrolling: touch !important;
    gap: 12px !important;
    padding-bottom: 8px !important;
  }

  .postScoreMobileFix .swipeCard{
    flex: 0 0 88% !important;
    min-width: 88% !important;
    scroll-snap-align: start !important;
  }

  .postScoreMobileFix textarea{
    width: 100% !important;
  }
}

/* iPhone vs Android font tuning (safe, light touch) */
@supports (-webkit-touch-callout: none) {
  /* iOS */
  .iosH1{ font-size: clamp(34px, 7.8vw, 54px) !important; line-height: 1.05 !important; }
}
@supports not (-webkit-touch-callout: none) {
  /* most Android */
  .androidH1{ font-size: clamp(32px, 7.2vw, 52px) !important; line-height: 1.08 !important; }
}
`,
    []
  );

  // Inject <style>
  useEffect(() => {
    const id = "wovi-inline-css";
    let tag = document.getElementById(id) as HTMLStyleElement | null;
    if (!tag) {
      tag = document.createElement("style");
      tag.id = id;
      document.head.appendChild(tag);
    }
    tag.textContent = globalCss;
  }, [globalCss]);

  // Scroll reveal
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("revealed");
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Swipe tracking (optional)
  useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;

    function onScroll() {
      // no-op (kept here for future indicators)
      void 0;
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ---- Helpers ----
  function openWaitlist(plan?: PlanKey) {
    setSelectedPlan(plan ?? "free");
    setWaitlistOpen(true);
    setJoinState("idle");
    setErrorMsg("");
  }

  async function submitWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setJoinState("loading");
    setErrorMsg("");

    // simple email check
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      setJoinState("error");
      setErrorMsg("Please enter a valid email.");
      return;
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), plan: selectedPlan }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Request failed");
      }

      setJoinState("success");
    } catch (err: any) {
      setJoinState("error");
      setErrorMsg("Could not join right now. Please try again.");
    }
  }

  function clearScore() {
    setCaptionInput("");
    setScore(null);
    setScoreBreakdown(null);
    setImprovedCaption("");
    setScoreHint("Paste a caption and press “Get score”.");
  }

  function getScore() {
    const txt = captionInput.trim();
    if (!txt) {
      setScore(null);
      setScoreBreakdown(null);
      setImprovedCaption("");
      setScoreHint("Add a caption first.");
      return;
    }

    // Very lightweight heuristic demo (no AI calls yet).
    // You can replace with a real API later.
    const hasQuestion = /\?/.test(txt);
    const hasEmoji = /[\u{1F300}-\u{1FAFF}]/u.test(txt);
    const hasCTA = /(call|dm|message|book|shop|order|tap|click|link|visit|subscribe|sign up|join)/i.test(txt);
    const length = txt.length;

    const hook = Math.max(10, Math.min(35, (hasQuestion ? 22 : 16) + (hasEmoji ? 4 : 0) + (length < 90 ? 8 : 0)));
    const clarity = Math.max(10, Math.min(25, length >= 50 && length <= 240 ? 20 : 14));
    const cta = Math.max(5, Math.min(25, hasCTA ? 20 : 10));
    const voice = Math.max(5, Math.min(15, hasEmoji ? 12 : 9));

    const total = Math.max(0, Math.min(100, hook + clarity + cta + voice));
    setScore(total);
    setScoreBreakdown({ hook, clarity, cta, voice });

    // Improve caption (simple rewrite)
    const improved = buildImprovedCaption(txt);
    setImprovedCaption(improved);

    setScoreHint("Scored. Scroll/swipe to view results.");
  }

  function buildImprovedCaption(original: string) {
    const base = original.replace(/\s+/g, " ").trim();
    const ctaLine = "Want help turning posts into customers? Join the Wovi waitlist.";
    const hookLine = "Quick question:";
    const cleaned = base.endsWith(".") || base.endsWith("!") || base.endsWith("?") ? base : base + ".";
    return `${hookLine} ${cleaned}\n\n${ctaLine}`;
  }

  // ---- UI labels ----
  const planTitle: Record<PlanKey, string> = {
    free: "Free Trial",
    growth: "Growth",
    pro: "Pro",
  };

  const planPrice: Record<PlanKey, string> = {
    free: "$0",
    growth: "$29",
    pro: "$49",
  };

  const planPill: Record<PlanKey, { label: string; color: string }> = {
    free: { label: "Starter Access", color: "#57FE72" },
    growth: { label: "Most Popular", color: "#02F3DC" },
    pro: { label: "Advanced", color: "#21AEF5" },
  };

  // Determine iOS (for small font tweak class)
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  return (
    <>
      {/* Background */}
      <div className="woviBg">
        <div className="woviGrid" />
        <div className="woviStars" />
      </div>

      {/* Page */}
      <div style={S.page}>
        {/* Top bar */}
        <header style={S.topbar}>
          <div style={S.brand}>
            <div style={S.logoCircle} aria-hidden>
              <span style={S.logoW}>w</span>
            </div>
            <div>
              <div style={S.brandName}>WOVI</div>
              <div style={S.brandTag}>AI social media OS for any business</div>
            </div>
          </div>

          <nav style={S.nav}>
            <button
              style={S.navLinkBtn}
              onClick={() => {
                const el = document.getElementById("pricing");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Pricing
            </button>
            <button style={S.primaryPill} onClick={() => openWaitlist("free")}>
              Join waitlist
            </button>
          </nav>
        </header>

        {/* Hero */}
        <section style={S.hero} className="reveal">
          <div style={S.heroGrid} className="heroGridMobileFix">
            {/* Left hero card */}
            <div style={S.heroCard}>
              <div style={S.preLaunchPill}>
                <span style={S.pillDot} />
                Pre-launch · Waitlist only
              </div>

              <h1 style={S.h1} className={`${isIOS ? "iosH1" : "androidH1"}`}>
                AI that turns your business goals into{" "}
                <span style={S.accent} className="readyUnderline">
                  ready-to-post
                </span>{" "}
                content.
              </h1>

              <p style={S.lede}>
                Wovi replaces the planning and creation behind social media — captions, visuals, and weekly posting plans — so
                you stay consistent without burnout.
              </p>

              <div style={S.heroCtas}>
                <button style={S.ctaPrimary} onClick={() => openWaitlist(selectedPlan)}>
                  Pick a plan
                </button>
                <button style={S.ctaGhost} onClick={() => openWaitlist("free")}>
                  Join waitlist
                </button>
              </div>

              <div style={S.heroMiniGrid}>
                <div style={S.miniCard}>
                  <div style={S.miniTitle}>Works for</div>
                  <div style={S.miniBig}>Any industry</div>
                  <div style={S.miniSmall}>Local, online, service, ecom, creators, startups</div>
                </div>
                <div style={S.miniCard}>
                  <div style={S.miniTitle}>Replaces</div>
                  <div style={S.miniBig}>Daily brainstorming</div>
                  <div style={S.miniSmall}>No “what should I post?”</div>
                </div>
                <div style={S.miniCard}>
                  <div style={S.miniTitle}>Outcome</div>
                  <div style={S.miniBig}>Consistency</div>
                  <div style={S.miniSmall}>Plans + content every week</div>
                </div>
              </div>
            </div>

            {/* Right hero card */}
            <div style={S.weekCard}>
              <div style={S.weekHead}>
                <div style={S.weekTitle}>This week in Wovi</div>
                <div style={S.weekBadge}>Auto-planned</div>
              </div>

              <div style={S.weekGrid}>
                <div style={S.weekBox}>
                  <div style={S.weekLabel}>INPUT</div>
                  <div style={S.weekKvp}>
                    <div style={S.weekK}>Goal:</div>
                    <div style={S.weekV}>&ldquo;Get more leads this week&rdquo;</div>
                  </div>
                  <div style={S.weekMuted}>Tone: confident · modern</div>
                </div>
                <div style={S.weekBox}>
                  <div style={S.weekLabel}>OUTPUT</div>
                  <div style={S.weekStrong}>Captions + image concepts</div>
                  <div style={S.weekMuted}>Ready-to-post variations</div>
                </div>
                <div style={S.weekBox}>
                  <div style={S.weekLabel}>PLAN</div>
                  <div style={S.weekStrong}>Weekly posting schedule</div>
                  <div style={S.weekMuted}>Daily suggestions</div>
                </div>
                <div style={S.weekBox}>
                  <div style={S.weekLabel}>RESULT</div>
                  <div style={S.weekStrong}>You stay consistent</div>
                  <div style={S.weekMuted}>No agency, no burnout</div>
                </div>
              </div>

              <div style={S.weekFooter}>
                <div style={S.weekFootText}>Pick a plan now. Get early access when we launch.</div>
                <button style={S.weekBtn} onClick={() => openWaitlist("free")}>
                  Join waitlist
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Post Score */}
        <section style={S.section} className="reveal">
          <h2 style={S.h2}>Post Score</h2>
          <p style={S.sub}>
            Pre-launch demo: paste a post caption and Wovi will rate it (hook, clarity, CTA, voice) — then generate a stronger
            version.
          </p>

          <div style={S.scoreWrap} className="scoreGridMobileFix postScoreMobileFix">
            {/* left input */}
            <div style={S.scoreCard}>
              <div style={S.scoreTitle}>Paste your post caption</div>

              <textarea
                style={S.textarea}
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                placeholder={`Example:\n“New availability this week.\nIf you need help with (service/product), message us and we’ll get you set up.\nSpots are limited — book today.”`}
              />

              <div style={S.scoreBtns}>
                <button style={S.scoreBtnPrimary} onClick={getScore}>
                  Get score
                </button>
                <button style={S.scoreBtnGhost} onClick={clearScore}>
                  Clear
                </button>
              </div>

              <div style={S.scoreTiny}>This is a demo score (no account needed yet).</div>
            </div>

            {/* right results (swipe on mobile) */}
            <div style={S.scoreRight}>
              <div style={S.scoreHint}>{scoreHint}</div>

              <div ref={swipeRef} className="swipeRow" style={S.swipeRow}>
                {/* Score card */}
                <div className="swipeCard" data-swipe-card="1" style={S.resultCard}>
                  <div style={S.resultTitle}>Your Wovi Score</div>

                  {score === null ? (
                    <div style={S.resultEmpty}>Paste a caption and press “Get score”.</div>
                  ) : (
                    <>
                      <div style={S.bigScoreRow}>
                        <div style={S.bigScore}>{score}/100</div>
                        <div style={S.bigScoreMeta}>
                          <div style={S.bigScoreLabel}>Overall</div>
                          <div style={S.bigScoreSub}>Higher = stronger distribution potential</div>
                        </div>
                      </div>

                      <div style={S.barWrap}>
                        <div style={{ ...S.barFill, width: `${Math.max(2, Math.min(100, score))}%` }} />
                      </div>

                      {scoreBreakdown && (
                        <div style={S.breakList}>
                          <div style={S.breakRow}>
                            <span style={S.breakDot} />
                            Hook <span style={S.breakNum}>{scoreBreakdown.hook}/35</span>
                          </div>
                          <div style={S.breakRow}>
                            <span style={S.breakDot} />
                            Clarity <span style={S.breakNum}>{scoreBreakdown.clarity}/25</span>
                          </div>
                          <div style={S.breakRow}>
                            <span style={S.breakDot} />
                            CTA <span style={S.breakNum}>{scoreBreakdown.cta}/25</span>
                          </div>
                          <div style={S.breakRow}>
                            <span style={S.breakDot} />
                            Voice <span style={S.breakNum}>{scoreBreakdown.voice}/15</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Improved caption */}
                <div className="swipeCard" data-swipe-card="1" style={S.resultCard}>
                  <div style={S.resultTitle}>Improved caption</div>
                  {improvedCaption ? (
                    <>
                      <pre style={S.improvedPre}>{improvedCaption}</pre>
                      <button
                        style={S.copyBtn}
                        onClick={() => {
                          navigator.clipboard.writeText(improvedCaption).catch(() => {});
                        }}
                      >
                        Copy
                      </button>
                    </>
                  ) : (
                    <div style={S.resultEmpty}>Your improved caption will appear here.</div>
                  )}
                </div>
              </div>

              <div style={S.swipeNote}>Tip: swipe left/right to view results.</div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={S.section} className="reveal">
          <div style={S.pricingHead}>
            <h2 style={S.h2}>WOVI Pricing Plans</h2>
            <div style={S.pricingRule}>
              Pre-launch rule: All plans currently lead to the waitlist. Users can view pricing, but cannot activate yet.
              We’re collecting emails only.
            </div>

            <div style={S.emailOnlyPill}>
              <span style={S.pillDot} />
              Email only · Full billing activates at launch
            </div>
          </div>

          <div style={S.pricingGrid} className="pricingGridMobileFix">
            {/* Free */}
            <div style={S.planCard} className="planCard">
              <div style={S.planTop}>
                <div style={S.planName}>Free Trial</div>
                <div style={{ ...S.planPill, borderColor: "rgba(87,254,114,0.30)", color: "#57FE72" }}>Starter Access</div>
              </div>

              <div style={S.planPriceRow}>
                <div style={S.planPrice}>$0</div>
                <div style={S.planPer}>/trial</div>
              </div>

              <div style={S.planDesc}>
                Try Wovi risk-free. Credit card required at launch. Automatically converts into Growth unless canceled.
              </div>

              <div style={S.planLine} />

              <div style={S.planInc}>Includes</div>
              <ul style={S.ul}>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#57FE72" }} />
                  Limited AI-generated posts
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#57FE72" }} />
                  Basic captions
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#57FE72" }} />
                  Sample images
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#57FE72" }} />
                  Preview of weekly planning
                </li>
              </ul>

              <button style={S.planBtn} onClick={() => openWaitlist("free")}>
                Join waitlist (Free Trial)
              </button>
            </div>

            {/* Growth */}
            <div style={{ ...S.planCard, ...S.planCardHighlight }} className="planCard">
              <div style={S.planTop}>
                <div style={S.planName}>Growth</div>
                <div style={{ ...S.planPill, borderColor: "rgba(2,243,220,0.35)", color: "#02F3DC" }}>Most Popular</div>
              </div>

              <div style={S.planPriceRow}>
                <div style={S.planPrice}>$29</div>
                <div style={S.planPer}>/month</div>
              </div>

              <div style={S.planDesc}>
                Consistent posting without hiring an agency. Weekly planning + captions + visuals for any business.
              </div>

              <div style={S.planLine} />

              <div style={S.planInc}>Includes</div>
              <ul style={S.ul}>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#02F3DC" }} />
                  2–3 posts per day
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#02F3DC" }} />
                  Weekly content planning
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#02F3DC" }} />
                  AI-generated captions
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#02F3DC" }} />
                  AI image ideas or images
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#02F3DC" }} />
                  Brand tone learning
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#02F3DC" }} />
                  Unlimited edits/regenerations
                </li>
              </ul>

              <button style={S.planBtn} onClick={() => openWaitlist("growth")}>
                Join waitlist (Growth)
              </button>
            </div>

            {/* Pro */}
            <div style={S.planCard} className="planCard">
              <div style={S.planTop}>
                <div style={S.planName}>Pro</div>
                <div style={{ ...S.planPill, borderColor: "rgba(33,174,245,0.35)", color: "#21AEF5" }}>Advanced</div>
              </div>

              <div style={S.planPriceRow}>
                <div style={S.planPrice}>$49</div>
                <div style={S.planPer}>/month</div>
              </div>

              <div style={S.planDesc}>
                Higher volume + deeper strategy for serious brands that want to scale content output fast.
              </div>

              <div style={S.planLine} />

              <div style={S.planInc}>Includes</div>
              <ul style={S.ul}>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#21AEF5" }} />
                  Everything in Growth
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#21AEF5" }} />
                  Higher daily post volume
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#21AEF5" }} />
                  Advanced strategy suggestions
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#21AEF5" }} />
                  Campaign & launch planning
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#21AEF5" }} />
                  AI video ad concepts
                </li>
                <li style={S.li}>
                  <span style={{ ...S.liDot, background: "#21AEF5" }} />
                  Priority feature access
                </li>
              </ul>

              <button style={S.planBtn} onClick={() => openWaitlist("pro")}>
                Join waitlist (Pro)
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={S.footer}>
          <div style={S.footerInner}>
            <div style={S.footerLeft}>
              <div style={S.footerBrand}>WOVI</div>
              <div style={S.footerMuted}>Pre-launch · collecting emails only</div>
            </div>
            <div style={S.footerRight}>
              <button style={S.footerBtn} onClick={() => openWaitlist("free")}>
                Join waitlist
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Sticky mobile CTA (defaults to Free Trial unless user picked another plan) */}
      <div className="mobileStickyCta">
        <div className="mobileStickyCtaInner">
          <button className="mobileStickyBtn" onClick={() => openWaitlist(selectedPlan ?? "free")}>
            Join waitlist (defaults to Free Trial)
          </button>
          <div className="mobileStickySub">Pick Growth/Pro first if you want a different plan.</div>
        </div>
      </div>

      {/* Waitlist Modal */}
      {waitlistOpen && (
        <div
          className="modalBackdrop"
          onClick={() => {
            setWaitlistOpen(false);
            setJoinState("idle");
            setErrorMsg("");
          }}
        >
          <div
            className="modalPanel"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modalHeader">
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 950, letterSpacing: 0.2 }}>Join the waitlist</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  Selected plan: <span style={{ fontWeight: 900 }}>{planTitle[selectedPlan]}</span>
                </div>
              </div>

              <button className="modalClose" onClick={() => setWaitlistOpen(false)}>
                Close
              </button>
            </div>

            <div className="modalBody">
              {joinState !== "success" ? (
                <>
                  <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.6, marginBottom: 12 }}>
                    We’re launching in small batches. Enter your email to get early access when public beta releases.
                  </div>

                  <form onSubmit={submitWaitlist} style={{ display: "grid", gap: 10 }}>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      style={{
                        height: 48,
                        borderRadius: 14,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.92)",
                        padding: "0 14px",
                        outline: "none",
                        fontSize: 14,
                      }}
                    />

                    {joinState === "error" && (
                      <div style={{ fontSize: 12, color: "rgba(255,120,150,1)", fontWeight: 900 }}>{errorMsg}</div>
                    )}

                    <button
                      type="submit"
                      disabled={joinState === "loading"}
                      style={{
                        height: 48,
                        borderRadius: 14,
                        border: "1px solid rgba(2,243,220,0.35)",
                        background:
                          "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
                        color: "#041015",
                        fontWeight: 950,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      {joinState === "loading" ? "Joining..." : "Join the waitlist"}
                    </button>

                    <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.6 }}>
                      No spam. Unsubscribe anytime. Early access may include special launch pricing.
                    </div>
                  </form>
                </>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 950 }}>You’re on the list.</div>
                  <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.7 }}>
                    Thanks — we’ll email you as soon as public beta releases.
                  </div>
                  <button
                    style={{
                      marginTop: 8,
                      height: 44,
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.92)",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                    onClick={() => setWaitlistOpen(false)}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================================
   INLINE STYLES (no tailwind)
   ================================ */
const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    color: "rgba(255,255,255,0.92)",
    padding: "18px 18px 96px",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Apple Color Emoji","Segoe UI Emoji"',
  },

  topbar: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 4px 18px",
  },

  brand: { display: "flex", alignItems: "center", gap: 12 },

  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: "linear-gradient(135deg, #02F3DC 0%, #21AEF5 55%, #57FE72 100%)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.55)",
    display: "grid",
    placeItems: "center",
  },

  logoW: { fontWeight: 950, color: "#041015", fontSize: 18, textTransform: "lowercase" },

  brandName: { fontWeight: 950, letterSpacing: 0.6 },
  brandTag: { fontSize: 12, opacity: 0.72, marginTop: 2 },

  nav: { display: "flex", alignItems: "center", gap: 10 },

  navLinkBtn: {
    appearance: "none",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.9)",
    padding: "10px 12px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
    minHeight: 40,
  },

  primaryPill: {
    appearance: "none",
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    color: "#041015",
    padding: "10px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 13,
    minHeight: 40,
  },

  hero: { maxWidth: 1180, margin: "0 auto", padding: "6px 0 10px" },

  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 18,
    alignItems: "stretch",
  },

  heroCard: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background:
      "radial-gradient(900px 520px at 20% 10%, rgba(2,243,220,0.10), transparent 55%), radial-gradient(900px 520px at 80% 0%, rgba(33,174,245,0.10), transparent 60%), rgba(12,14,18,0.72)",
    boxShadow: "0 35px 120px rgba(0,0,0,0.68)",
    padding: 22,
  },

  preLaunchPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.92,
    marginBottom: 14,
  },

  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#02F3DC",
    boxShadow: "0 0 18px rgba(2,243,220,0.35)",
  },

  h1: {
    margin: 0,
    fontSize: "clamp(36px, 5vw, 54px)",
    lineHeight: 1.04,
    letterSpacing: -0.6,
  },

  accent: { color: "#02F3DC" },

  lede: { marginTop: 12, marginBottom: 16, opacity: 0.85, lineHeight: 1.7, fontSize: 14.5 },

  heroCtas: { display: "flex", gap: 10, flexWrap: "wrap" },

  ctaPrimary: {
    minHeight: 48,
    borderRadius: 14,
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    color: "#041015",
    fontWeight: 950,
    padding: "12px 16px",
    cursor: "pointer",
  },

  ctaGhost: {
    minHeight: 48,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    padding: "12px 16px",
    cursor: "pointer",
  },

  heroMiniGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },

  miniCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    padding: 12,
  },

  miniTitle: { fontSize: 11, opacity: 0.7, fontWeight: 900, letterSpacing: 0.4 },
  miniBig: { marginTop: 4, fontSize: 13, fontWeight: 950 },
  miniSmall: { marginTop: 6, fontSize: 12, opacity: 0.7, lineHeight: 1.5 },

  weekCard: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background:
      "radial-gradient(760px 420px at 15% 10%, rgba(87,254,114,0.08), transparent 55%), radial-gradient(760px 420px at 85% 10%, rgba(2,243,220,0.10), transparent 55%), rgba(12,14,18,0.62)",
    boxShadow: "0 35px 120px rgba(0,0,0,0.68)",
    padding: 16,
  },

  weekHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  weekTitle: { fontWeight: 950 },
  weekBadge: {
    fontSize: 12,
    fontWeight: 900,
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    opacity: 0.9,
  },

  weekGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

  weekBox: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    padding: 12,
    minHeight: 92,
  },

  weekLabel: { fontSize: 11, opacity: 0.7, fontWeight: 950, letterSpacing: 0.4, marginBottom: 6 },
  weekKvp: { display: "flex", gap: 8, alignItems: "baseline" },
  weekK: { fontSize: 12, opacity: 0.75, fontWeight: 900 },
  weekV: { fontSize: 12.5, fontWeight: 800 },
  weekStrong: { fontSize: 13, fontWeight: 950 },
  weekMuted: { marginTop: 6, fontSize: 12, opacity: 0.7, lineHeight: 1.5 },

  weekFooter: {
    marginTop: 12,
    display: "flex",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  weekFootText: { fontSize: 12, opacity: 0.75 },

  weekBtn: {
    minHeight: 44,
    borderRadius: 14,
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #21AEF5 60%, #57FE72 100%)",
    color: "#041015",
    fontWeight: 950,
    padding: "10px 14px",
    cursor: "pointer",
  },

  section: { maxWidth: 1180, margin: "0 auto", padding: "28px 0 0" },

  h2: { margin: 0, fontSize: 26, letterSpacing: -0.2 },
  sub: { marginTop: 10, marginBottom: 16, fontSize: 13.5, opacity: 0.78, lineHeight: 1.6 },

  scoreWrap: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" },

  scoreCard: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(12,14,18,0.62)",
    boxShadow: "0 35px 120px rgba(0,0,0,0.55)",
    padding: 16,
  },

  scoreTitle: { fontWeight: 950, marginBottom: 10 },

  textarea: {
    width: "100%",
    minHeight: 150,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.92)",
    padding: 14,
    outline: "none",
    resize: "vertical",
    lineHeight: 1.6,
    fontSize: 13.5,
  },

  scoreBtns: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },

  scoreBtnPrimary: {
    minHeight: 44,
    borderRadius: 14,
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #21AEF5 60%, #57FE72 100%)",
    color: "#041015",
    fontWeight: 950,
    padding: "10px 14px",
    cursor: "pointer",
  },

  scoreBtnGhost: {
    minHeight: 44,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    padding: "10px 14px",
    cursor: "pointer",
  },

  scoreTiny: { marginTop: 10, fontSize: 12, opacity: 0.65 },

  scoreRight: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(12,14,18,0.62)",
    boxShadow: "0 35px 120px rgba(0,0,0,0.55)",
    padding: 16,
    overflow: "hidden",
  },

  scoreHint: { fontSize: 12.5, opacity: 0.8, marginBottom: 12 },

  swipeRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  resultCard: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
    minHeight: 180,
  },

  resultTitle: { fontWeight: 950, marginBottom: 10 },

  resultEmpty: { fontSize: 13, opacity: 0.65, lineHeight: 1.6, marginTop: 10 },

  bigScoreRow: { display: "flex", gap: 12, alignItems: "center", marginBottom: 12 },
  bigScore: { fontSize: 34, fontWeight: 950, letterSpacing: -0.3 },
  bigScoreMeta: { display: "grid", gap: 2 },
  bigScoreLabel: { fontSize: 12, opacity: 0.75, fontWeight: 900 },
  bigScoreSub: { fontSize: 12, opacity: 0.65 },

  barWrap: {
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginBottom: 12,
  },

  barFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #ff4d4d 0%, #ffd24d 35%, #02F3DC 70%, #57FE72 100%)",
    width: "2%",
  },

  breakList: { display: "grid", gap: 8 },

  breakRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    fontSize: 13,
    opacity: 0.9,
    padding: "8px 10px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(255,255,255,0.02)",
  },

  breakDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#02F3DC",
    boxShadow: "0 0 16px rgba(2,243,220,0.25)",
    marginRight: 8,
  },

  breakNum: { fontWeight: 950, opacity: 0.85 },

  improvedPre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: 13,
    lineHeight: 1.6,
    margin: 0,
    opacity: 0.92,
  },

  copyBtn: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    padding: "10px 14px",
    cursor: "pointer",
    width: "100%",
  },

  swipeNote: { marginTop: 10, fontSize: 12, opacity: 0.65 },

  pricingHead: { display: "grid", gap: 10, marginBottom: 14 },

  pricingRule: { fontSize: 13.5, opacity: 0.78, lineHeight: 1.6 },

  emailOnlyPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 900,
    width: "fit-content",
  },

  pricingGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },

  planCard: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(12,14,18,0.62)",
    boxShadow: "0 35px 120px rgba(0,0,0,0.55)",
    padding: 16,
    display: "grid",
    gap: 12,
  },

  planCardHighlight: {
    borderColor: "rgba(2,243,220,0.22)",
    boxShadow: "0 35px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(2,243,220,0.18) inset",
  },

  planTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },

  planName: { fontWeight: 950, fontSize: 16 },

  planPill: {
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 900,
  },

  planPriceRow: { display: "flex", alignItems: "baseline", gap: 8 },
  planPrice: { fontSize: 40, fontWeight: 950, letterSpacing: -0.6 },
  planPer: { opacity: 0.75, fontWeight: 900 },

  planDesc: { fontSize: 13.5, opacity: 0.78, lineHeight: 1.6 },

  planLine: { height: 1, background: "rgba(255,255,255,0.08)" },

  planInc: { fontWeight: 950, opacity: 0.9 },

  ul: { margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 },

  li: { display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, opacity: 0.85, lineHeight: 1.55 },

  liDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 5,
    flex: "0 0 auto",
    boxShadow: "0 0 18px rgba(2,243,220,0.25)",
  },

  planBtn: {
    minHeight: 48,
    borderRadius: 14,
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #00EDEC 25%, #01DEF4 45%, #21AEF5 70%, #57FE72 100%)",
    color: "#041015",
    fontWeight: 950,
    padding: "12px 16px",
    cursor: "pointer",
    width: "100%",
  },

  footer: { maxWidth: 1180, margin: "0 auto", padding: "34px 0 10px" },

  footerInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: "14px 14px",
  },

  footerLeft: { display: "grid", gap: 3 },
  footerBrand: { fontWeight: 950, letterSpacing: 0.5 },
  footerMuted: { fontSize: 12, opacity: 0.7 },

  footerRight: { display: "flex", alignItems: "center", gap: 10 },
  footerBtn: {
    minHeight: 44,
    borderRadius: 14,
    border: "1px solid rgba(2,243,220,0.35)",
    background: "linear-gradient(135deg, #02F3DC 0%, #21AEF5 60%, #57FE72 100%)",
    color: "#041015",
    fontWeight: 950,
    padding: "10px 14px",
    cursor: "pointer",
  },
};
