"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [glow, setGlow] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlow((g) => (g + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "140%",
          height: "600px",
          background: "radial-gradient(ellipse at center, hsla(" + glow + ", 80%, 55%, 0.25), transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>BenSimple.</div>
        <a href="/app" style={{
          background: "#fff",
          color: "#05060a",
          padding: "10px 22px",
          borderRadius: "999px",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}>
          Ask Ben
        </a>
      </nav>

      <div style={{
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        padding: "100px 20px 60px",
        maxWidth: 900,
        margin: "0 auto",
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "999px",
          padding: "6px 16px",
          fontSize: 13,
          marginBottom: 24,
          color: "#a3b8ff",
        }}>
          Powered by AI that actually finishes things
        </div>

        <h1 style={{
          fontSize: "clamp(40px, 7vw, 80px)",
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-2px",
          margin: "0 0 24px",
        }}>
          It was{" "}
          <span style={{
            background: "linear-gradient(90deg, hsl(" + glow + ", 90%, 65%), hsl(" + ((glow + 80) % 360) + ", 90%, 65%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            BenSimple.
          </span>
          <br />
          all along.
        </h1>

        <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.65)", margin: "0 0 40px", lineHeight: 1.6 }}>
          Any dream. Any problem. Any project.<br />
          You just had to ask Ben.
        </p>

        <a
          href="/app"
          style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #6366f1, #a855f7)",
            color: "#fff",
            padding: "16px 40px",
            borderRadius: "999px",
            fontSize: 17,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 0 40px rgba(168, 85, 247, 0.5)",
          }}
        >
          Ask Ben Right Now
        </a>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 16 }}>
          No credit card. No tech skills needed. Just answer a few questions.
        </p>
      </div>

      <div style={{
        position: "relative",
        zIndex: 2,
        maxWidth: 1000,
        margin: "60px auto 100px",
        padding: "0 20px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
      }}>
        {[
          { t: "Tell Ben anything", d: "A business idea, a life problem, a half-finished dream. Type it in plain language." },
          { t: "Ben builds the plan", d: "Real steps. No fluff. No cheerleading. Just what to do next." },
          { t: "Ben does the work", d: "Websites, research, automations - Ben's agents handle what you can't." },
        ].map((f, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "24px 20px",
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.t}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{f.d}</div>
          </div>
        ))}
      </div>

      <footer style={{ textAlign: "center", padding: "30px 20px", color: "rgba(255,255,255,0.3)", fontSize: 13, position: "relative", zIndex: 2 }}>
        2026 BenSimple. - Just ask Ben.
      </footer>
    </div>
  );
}
