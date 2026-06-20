"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AccountPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else {
        setUser(data.user);
        setAuthChecked(true);
        loadProjectCount(data.user.id);
      }
    });
  }, []);

  const loadProjectCount = async (userId) => {
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    setProjectCount(count || 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", background: "#05060a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#05060a" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <a href="/dashboard" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>← Back to dashboard</a>
          <a href="/" style={{ fontSize: 21, fontWeight: 800, color: "#fff", textDecoration: "none" }}>BenSimple<span style={{ color: "#a855f7" }}>.</span></a>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 28px", color: "#fff" }}>My account</h1>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1.5rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</p>
          <p style={{ fontSize: 15.5, color: "#fff", margin: 0 }}>{user?.email}</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1.5rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Projects</p>
          <p style={{ fontSize: 15.5, color: "#fff", margin: 0 }}>{projectCount} {projectCount === 1 ? "project" : "projects"} saved</p>
        </div>

        <div style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 12.5, color: "#c9a8ff", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Plan</p>
          <p style={{ fontSize: 15.5, color: "#fff", margin: "0 0 4px" }}>Free</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>Upgrade options coming soon.</p>
        </div>

        <button
          onClick={handleLogout}
          style={{ width: "100%", padding: "13px", fontSize: 14.5, cursor: "pointer", fontWeight: 700, background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999 }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
