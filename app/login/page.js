"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("mode") === "signup") {
      setMode("signup");
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage("Please fill in both fields.");
      return;
    }
    setLoading(true);
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Account created. Redirecting...");
        window.location.href = "/dashboard";
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#05060a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <a href="/" style={{ fontSize: 24, fontWeight: 800, color: "#fff", textDecoration: "none" }}>BenSimple<span style={{ color: "#a855f7" }}>.</span></a>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "2rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", margin: "0 0 24px" }}>
            {mode === "signup" ? "Save your projects and pick up right where you left off." : "Log in to continue with Ben."}
          </p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", marginBottom: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.35)", color: "#fff", fontSize: 14.5, boxSizing: "border-box" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            style={{ width: "100%", padding: "12px 14px", marginBottom: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.35)", color: "#fff", fontSize: 14.5, boxSizing: "border-box" }}
          />

          {message && (
            <p style={{ fontSize: 13, color: "#f0997b", margin: "0 0 16px" }}>{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", padding: "13px", fontSize: 15, cursor: loading ? "default" : "pointer", fontWeight: 700, background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: 999, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Working..." : mode === "signup" ? "Create account" : "Log in"}
          </button>

          <p style={{ textAlign: "center", fontSize: 13.5, color: "rgba(255,255,255,0.55)", marginTop: 20 }}>
            {mode === "signup" ? "Already have an account? " : "New here? "}
            <span
              onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage(""); }}
              style={{ color: "#c9a8ff", cursor: "pointer", fontWeight: 600 }}
            >
              {mode === "signup" ? "Log in" : "Create one"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
