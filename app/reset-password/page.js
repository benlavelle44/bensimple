"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!password.trim() || !confirm.trim()) {
      setMessage("Please fill in both fields.");
      setMessageType("error");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords don't match.");
      setMessageType("error");
      return;
    }
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      setMessageType("error");
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#05060a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <a href="/" style={{ fontSize: 24, fontWeight: 800, color: "#fff", textDecoration: "none" }}>
            BenSimple<span style={{ color: "#a855f7" }}>.</span>
          </a>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "2rem" }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: "#5dcaa5", margin: "0 0 12px" }}>Password updated.</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: "0 0 20px" }}>You can now log in with your new password.</p>
              <a href="/login" style={{ display: "block", padding: "12px", fontSize: 15, fontWeight: 700, background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", borderRadius: 999, textDecoration: "none", textAlign: "center" }}>
                Go to log in
              </a>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>Set a new password</h1>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", margin: "0 0 24px" }}>Choose something you'll remember. At least 8 characters.</p>

              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", marginBottom: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.35)", color: "#fff", fontSize: 14.5, boxSizing: "border-box" }}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleReset(); }}
                style={{ width: "100%", padding: "12px 14px", marginBottom: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.35)", color: "#fff", fontSize: 14.5, boxSizing: "border-box" }}
              />

              {message && (
                <p style={{ fontSize: 13, color: messageType === "success" ? "#5dcaa5" : "#f0997b", margin: "0 0 16px" }}>{message}</p>
              )}

              <button
                onClick={handleReset}
                disabled={loading}
                style={{ width: "100%", padding: "13px", fontSize: 15, cursor: loading ? "default" : "pointer", fontWeight: 700, background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: 999, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
