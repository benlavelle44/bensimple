"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

function LoginForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("mode") === "signup") {
      setMode("signup");
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    if (mode === "forgot") {
      if (!email.trim()) { setMessage("Enter your email address."); setMessageType("error"); return; }
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://bensimple.co/reset-password",
      });
      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage("Check your email — we sent you a reset link.");
        setMessageType("success");
      }
      setLoading(false);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setMessage("Please fill in both fields.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage("Account created! Check your email to confirm, then log in.");
        setMessageType("success");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        window.location.href = "/dashboard";
      }
    }
    setLoading(false);
  };

  const titles = {
    login: "Welcome back",
    signup: "Create your account",
    forgot: "Reset your password",
  };

  const subtitles = {
    login: "Log in to continue with Ben.",
    signup: "Save your projects and pick up right where you left off.",
    forgot: "Enter your email and we'll send you a reset link.",
  };

  const buttonLabels = {
    login: "Log in",
    signup: "Create account",
    forgot: "Send reset link",
  };

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <a href="/" style={{ fontSize: 24, fontWeight: 800, color: "#fff", textDecoration: "none" }}>
          BenSimple<span style={{ color: "#a855f7" }}>.</span>
        </a>
      </div>

      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "2rem" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>{titles[mode]}</h1>
        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", margin: "0 0 24px" }}>{subtitles[mode]}</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", marginBottom: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.35)", color: "#fff", fontSize: 14.5, boxSizing: "border-box" }}
        />

        {mode !== "forgot" && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            style={{ width: "100%", padding: "12px 14px", marginBottom: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.35)", color: "#fff", fontSize: 14.5, boxSizing: "border-box" }}
          />
        )}

        {mode === "login" && (
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", margin: "-8px 0 16px", textAlign: "right" }}>
            <span onClick={() => { setMode("forgot"); setMessage(""); }} style={{ cursor: "pointer", color: "#c9a8ff" }}>
              Forgot your password?
            </span>
          </p>
        )}

        {message && (
          <p style={{ fontSize: 13, color: messageType === "success" ? "#5dcaa5" : "#f0997b", margin: "0 0 16px" }}>{message}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "13px", fontSize: 15, cursor: loading ? "default" : "pointer", fontWeight: 700, background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: 999, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Working..." : buttonLabels[mode]}
        </button>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          {mode === "login" && (
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", margin: 0 }}>
              New here?{" "}
              <span onClick={() => { setMode("signup"); setMessage(""); }} style={{ color: "#c9a8ff", cursor: "pointer", fontWeight: 600 }}>
                Create an account
              </span>
            </p>
          )}
          {mode === "signup" && (
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", margin: 0 }}>
              Already have an account?{" "}
              <span onClick={() => { setMode("login"); setMessage(""); }} style={{ color: "#c9a8ff", cursor: "pointer", fontWeight: 600 }}>
                Log in
              </span>
            </p>
          )}
          {mode === "forgot" && (
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", margin: 0 }}>
              Remember it?{" "}
              <span onClick={() => { setMode("login"); setMessage(""); }} style={{ color: "#c9a8ff", cursor: "pointer", fontWeight: 600 }}>
                Back to log in
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#05060a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <Suspense fallback={<p style={{ color: "rgba(255,255,255,0.5)" }}>Loading...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
