"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"free" | "growth" | "pro">("free");

  // Smooth scroll helper
  const scrollToPricing = () => {
    const el = document.getElementById("pricing");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main style={S.page}>
      {/* ================= HEADER ================= */}
      <header style={S.header}>
        <div style={S.logo}>WOVI</div>
        <div style={S.headerBtns}>
          <button style={S.ghostBtn} onClick={scrollToPricing}>
            Pricing
          </button>
          <button
            style={S.primaryBtn}
            onClick={() => {
              setSelectedPlan("free");
              setShowWaitlist(true);
            }}
          >
            Join waitlist
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section style={S.hero}>
        <div style={S.heroCard}>
          <span style={S.badge}>Pre-launch · Waitlist only</span>

          <h1 style={S.h1}>
            AI that turns your business goals into{" "}
            <span style={S.gradientText}>ready-to-post</span> content.
          </h1>

          <p style={S.sub}>
            Wovi replaces the planning and creation behind social media — captions,
            visuals, and weekly posting plans — so you stay consistent without burnout.
          </p>

          <div style={S.heroBtns}>
            <button style={S.primaryBtn} onClick={scrollToPricing}>
              Pick a plan
            </button>
            <button
              style={S.secondaryBtn}
              onClick={() => {
                setSelectedPlan("free");
                setShowWaitlist(true);
              }}
            >
              Join waitlist
            </button>
          </div>
        </div>
      </section>

      {/* ================= POST SCORE ================= */}
      <section style={S.section}>
        <h2 style={S.h2}>Post Score</h2>
        <p style={S.sub}>
          Paste a caption and Wovi will rate it (hook, clarity, CTA, voice) — then
          generate a stronger version.
        </p>

        <div style={S.scoreWrap} className="scoreGridMobileFix postScoreMobileFix">
          <div style={S.card}>
            <h4>Paste your post caption</h4>
            <textarea
              placeholder={`Example:\n“New availability this week.\nMessage us to get started.\nSpots are limited — book today.”`}
              style={S.textarea}
            />
            <div style={S.btnRow}>
              <button style={S.primaryBtn}>Get score</button>
              <button style={S.ghostBtn}>Clear</button>
            </div>
          </div>

          <div className="swipeRow">
            <div className="swipeCard" style={S.card}>
              <h4>Your Wovi Score</h4>
              <p>Paste a caption and press “Get score”.</p>
            </div>
            <div className="swipeCard" style={S.card}>
              <h4>Improved caption</h4>
              <p>Your improved caption will appear here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="pricing" style={S.section}>
        <h2 style={S.h2}>WOVI Pricing Plans</h2>
        <p style={S.sub}>
          Pre-launch rule: All plans lead to the waitlist. Email only. Full billing
          activates at launch.
        </p>

        <div style={S.pricingGrid}>
          {/* FREE */}
          <div style={S.priceCard}>
            <h3>Free Trial</h3>
            <div style={S.price}>$0</div>
            <p>Starter access</p>
            <button
              style={S.primaryBtn}
              onClick={() => {
                setSelectedPlan("free");
                setShowWaitlist(true);
              }}
            >
              Join waitlist
            </button>
          </div>

          {/* GROWTH */}
          <div style={{ ...S.priceCard, outline: "2px solid #02F3DC" }}>
            <h3>Growth</h3>
            <div style={S.price}>$29 / month</div>
            <p>Most popular</p>
            <button
              style={S.primaryBtn}
              onClick={() => {
                setSelectedPlan("growth");
                setShowWaitlist(true);
              }}
            >
              Join waitlist
            </button>
          </div>

          {/* PRO */}
          <div style={S.priceCard}>
            <h3>Pro</h3>
            <div style={S.price}>$49 / month</div>
            <p>Advanced</p>
            <button
              style={S.primaryBtn}
              onClick={() => {
                setSelectedPlan("pro");
                setShowWaitlist(true);
              }}
            >
              Join waitlist
            </button>
          </div>
        </div>
      </section>

      {/* ================= WAITLIST MODAL ================= */}
      {showWaitlist && (
        <div style={S.modalOverlay} onClick={() => setShowWaitlist(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <h3>
              Join waitlist —{" "}
              <span style={{ color: "#02F3DC" }}>
                {selectedPlan === "free"
                  ? "Free Trial"
                  : selectedPlan === "growth"
                  ? "Growth"
                  : "Pro"}
              </span>
            </h3>
            <input placeholder="you@business.com" style={S.input} />
            <button style={S.primaryBtn}>Join waitlist</button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ================= STYLES ================= */

const S: any = {
  page: { background: "#05070b", color: "#fff", minHeight: "100vh" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 24px",
    position: "sticky",
    top: 0,
    backdropFilter: "blur(10px)",
    zIndex: 10,
  },
  logo: { fontWeight: 900 },
  headerBtns: { display: "flex", gap: 12 },
  hero: { padding: "80px 24px" },
  heroCard: { maxWidth: 820, margin: "0 auto" },
  badge: { opacity: 0.7, fontSize: 13 },
  h1: { fontSize: 48, lineHeight: 1.1 },
  gradientText: {
    background: "linear-gradient(135deg,#02F3DC,#21AEF5)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  sub: { opacity: 0.75, marginTop: 12 },
  heroBtns: { display: "flex", gap: 12, marginTop: 24 },
  section: { padding: "80px 24px", maxWidth: 1100, margin: "0 auto" },
  h2: { fontSize: 32 },
  card: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
  },
  scoreWrap: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  textarea: {
    width: "100%",
    minHeight: 160,
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  btnRow: { display: "flex", gap: 10, marginTop: 12 },
  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 16,
    marginTop: 24,
  },
  priceCard: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 20,
  },
  price: { fontSize: 36, fontWeight: 800 },
  primaryBtn: {
    background: "linear-gradient(135deg,#02F3DC,#21AEF5)",
    border: "none",
    padding: "12px 18px",
    borderRadius: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "12px 18px",
    borderRadius: 14,
    color: "#fff",
  },
  ghostBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    opacity: 0.8,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "grid",
    placeItems: "center",
    zIndex: 100,
  },
  modal: {
    background: "#0b0f17",
    padding: 24,
    borderRadius: 16,
    width: "90%",
    maxWidth: 420,
  },
  input: {
    width: "100%",
    padding: 12,
    margin: "12px 0",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#fff",
  },
};
