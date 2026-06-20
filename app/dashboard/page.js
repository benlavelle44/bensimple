"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else {
        setUser(data.user);
        setAuthChecked(true);
        loadProjects(data.user.id);
      }
    });
  }, []);

  const loadProjects = async (userId) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoadingProjects(false);
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
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <a href="/" style={{ fontSize: 21, fontWeight: 800, color: "#fff", textDecoration: "none" }}>BenSimple<span style={{ color: "#a855f7" }}>.</span></a>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href="/account" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{user?.email}</a>
            <button onClick={handleLogout} style={{ fontSize: 13, padding: "7px 16px", cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", borderRadius: 999, fontWeight: 600 }}>
              Log out
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: "#fff" }}>Every day is a new adventure.</h1>
          <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.55)", margin: 0 }}>Where are we going today?</p>
        </div>

        <a href="/app" style={{
          display: "block",
          background: "linear-gradient(90deg, #6366f1, #a855f7)",
          color: "#fff",
          padding: "18px 24px",
          borderRadius: 16,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: 15.5,
          marginBottom: "2rem",
          boxShadow: "0 0 40px rgba(168,85,247,0.3)",
        }}>
          + Start a new dream or project
        </a>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.7)", margin: "0 0 14px" }}>Your projects</h2>

        {loadingProjects && (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Loading your projects...</p>
        )}

        {!loadingProjects && projects.length === 0 && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "2rem", textAlign: "center" }}>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.5)", margin: 0 }}>No projects yet. Start your first one above.</p>
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {projects.map((p) => (
            <a
              key={p.id}
              href={"/project/" + p.id}
              style={{
                display: "block",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "1.25rem 1.5rem",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <p style={{ fontSize: 15.5, fontWeight: 700, margin: "0 0 6px" }}>
                {p.dream ? p.dream.slice(0, 80) + (p.dream.length > 80 ? "..." : "") : "Untitled project"}
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                Started {new Date(p.created_at).toLocaleDateString()}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
