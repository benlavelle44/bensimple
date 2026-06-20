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
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: "#05060a" }}>
      <div
        style={{
          position: "absolute",
          top: "-25%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "150%",
          height: "700px",
          background: "radial-gradient(ellipse at center, hsla(" + glow + ", 85%, 55%, 0.22), transparent 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>BenSimple<span style={{ color: "#a855f7" }}>.</span></div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <a href="/login" style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}>
            Log in
          </a>
          <a href="/login?mode=signup" style={{
            background: "#fff",
            color: "#05060a",
            padding: "10px 24px",
            borderRadius: "999px",
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
          }}>
            Ask Ben
          </a>
        </div>
      </nav>

      <div style={{
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        padding: "90px 20px 60px",
        maxWidth: 920,
        margin: "0 auto",
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(168,85,247,0.4)",
          borderRadius: "999px",
          padding: "7px 18px",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 28,
          color: "#c9a8ff",
        }}>
          Powered by AI that actually finishes things
        </div>

        <h1 style={{
          fontSize: "clamp(38px, 7vw, 76px)",
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: "-2px",
          margin: "0 0 24px",
        }}>
          It's{" "}
          <span style={{
            backgroundImage: "linear-gradient(90deg, hsl(" + glow + ", 90%, 65%), hsl(" + ((glow + 80) % 360) + ", 90%, 65%))",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}>
            BenSimple.
          </span>
          <br />
          all along.
        </h1>

        <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.65)", margin: "0 0 40px", lineHeight: 1.6, fontWeight: 400 }}>
          Any dream. Any problem. Any project.<br />
          You just had to ask Ben.
        </p>

        <a
          href="/app"
          style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #6366f1, #a855f7)",
            color: "#fff",
            padding: "17px 44px",
            borderRadius: "999px",
            fontSize: 17,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 0 50px rgba(168, 85, 247, 0.55)",
          }}
        >
          Ask Ben Right Now
        </a>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 18 }}>
          Free to start. No tech skills needed. Just answer a few questions.
        </p>
      </div>

      <div style={{
        position: "relative",
        zIndex: 2,
        maxWidth: 1100,
        margin: "70px auto 0",
        padding: "0 20px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 1,
        background: "rgba(255,255,255,0.08)",
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        {[
          { n: "01", t: "Tell Ben anything", d: "A business idea, a life problem, a half-finished dream. Type it in plain language." },
          { n: "02", t: "Ben builds the plan", d: "Real steps. No fluff. No cheerleading. Just what to do next." },
          { n: "03", t: "Ben does the work", d: "Websites, research, automations - Ben's agents handle what you can't." },
        ].map((f, i) => (
          <div key={i} style={{
            background: "#0a0b12",
            padding: "32px 28px",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#a855f7", marginBottom: 14 }}>{f.n}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.t}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{f.d}</div>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 700, margin: "90px auto 0", padding: "0 20px", textAlign: "center" }}>
        <p style={{ fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 700, lineHeight: 1.4, color: "rgba(255,255,255,0.9)" }}>
          "I built this because I lived every problem it solves."
        </p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 16 }}>— Ben, founder</p>
      </div>

      <footer style={{ textAlign: "center", padding: "60px 20px 30px", color: "rgba(255,255,255,0.3)", fontSize: 13, position: "relative", zIndex: 2 }}>
        2026 BenSimple. — Just ask Ben.
      </footer>
    </div>
  );
}
