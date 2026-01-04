"use client";

import { useState } from "react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setSubmitted(true);
    setEmail("");
  }

  return (
    <main style={{ minHeight: "100vh", padding: "60px 20px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ fontSize: 42, marginBottom: 16 }}>
          Let AI run your social media.
        </h1>

        <p style={{ fontSize: 18, marginBottom: 32 }}>
          Wovi plans and creates social media content for any business — so you
          never have to wonder what to post again.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: 14,
                fontSize: 16,
                marginBottom: 12,
              }}
            />

            <button
              type="submit"
              style={{
                width: "100%",
                padding: 14,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Join the waitlist
            </button>
          </form>
        ) : (
          <p style={{ fontSize: 18 }}>
            You’re on the list. We’ll email you when Wovi launches.
          </p>
        )}
      </div>
    </main>
  );
}
