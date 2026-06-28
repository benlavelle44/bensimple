"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else {
        setUser(data.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", data.user.id)
          .single();
        if (profile?.subscription_status) {
          setSubscriptionStatus(profile.subscription_status);
        }
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

  const planLabel = subscriptionStatus === "business" ? "Business Builder" : subscriptionStatus === "pro" ? "Pro" : "Free";
  const planColor = subscriptionStatus === "free" ? "rgba(255,255,255,0.5)" : "#c9a8ff";

  const navItems = [
    { icon: "⌂", label: "Dashboard", href: "/dashboard", active: true },
    { icon: "+", label: "New project", href: "/app", active: false },
    { icon: "◈", label: "Account", href: "/account", active: false },
  ];

  const shimmerTextStyle = {
    backgroundImage: "linear-gradient(110deg, #6b6f76 25%, #d4d6da 45%, #f5f6f8 50%, #d4d6da 55%, #6b6f76 75%)",
    backgroundSize: "200% 100%",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#05060a", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(rgba(168,85,247,0.35) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        opacity: 0.25,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        top: "-10%",
        left: "20%",
        width: "60%",
        height: "500px",
        background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12), transparent 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", position: "relative", zIndex: 2, minHeight: "100vh" }}>
        {/* Side nav */}
        <div style={{
          width: 240,
          minHeight: "100vh",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          padding: "1.75rem 1rem",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 36, paddingLeft: 8 }}>
            BenSimple<span style={{ color: "#a855f7" }}>.</span>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
            {navItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  textDecoration: "none",
                  color: item.active ? "#fff" : "rgba(255,255,255,0.55)",
                  background: item.active ? "rgba(168,85,247,0.12)" : "transparent",
                  border: item.active ? "1px solid rgba(168,85,247,0.25)" : "1px solid transparent",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span style={{ fontSize: 16, width: 18, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>

          <div style={{ padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Current plan</p>
            <p style={{ fontSize: 14, color: planColor, margin: "0 0 10px", fontWeight: 700 }}>{planLabel}</p>
            {subscriptionStatus === "free" && (
              <a href="/account" style={{
                display: "block",
                textAlign: "center",
                fontSize: 12.5,
                fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(90deg, #6366f1, #a855f7)",
                padding: "8px",
                borderRadius: 8,
                textDecoration: "none",
              }}>
                Upgrade
              </a>
            )}
          </div>

          <div style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "0 0 2px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>{projects.length} {projects.length === 1 ? "project" : "projects"}</p>
          </div>

          <div style={{ flex: 1 }} />

          <button onClick={handleLogout} style={{
            width: "100%",
            padding: "10px",
            fontSize: 13,
            cursor: "pointer",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.5)",
            borderRadius: 8,
            fontWeight: 600,
            boxSizing: "border-box",
          }}>
            Log out
          </button>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "2.5rem 3rem", maxWidth: 1100, boxSizing: "border-box" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px", ...shimmerTextStyle, display: "inline-block" }}>
              Every day is a new adventure.
            </h1>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.5)", margin: 0 }}>Where are we going today, {user?.email?.split("@")[0]}?</p>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: "2rem" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.25rem" }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Active projects</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: 0 }}>{projects.length}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.25rem" }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Plan</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: planColor, margin: 0 }}>{planLabel}</p>
            </div>
            <div style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 16, padding: "1.25rem" }}>
              <p style={{ fontSize: 12, color: "#c9a8ff", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Ben status</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#5dcaa5", display: "inline-block" }} />
                Online
              </p>
            </div>
          </div>

          {/* New project CTA */}
          <a href="/app" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(90deg, #4f46e5, #9333ea)",
            color: "#fff",
            padding: "18px 22px",
            borderRadius: 14,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 15,
            marginBottom: "2.5rem",
            boxShadow: "0 0 24px rgba(147,51,234,0.25)",
          }}>
            <span>Start a new dream or project</span>
            <span style={{ fontSize: 18 }}>→</span>
          </a>

          <h2 style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.6)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Your projects</h2>

          {loadingProjects && (
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Loading your projects...</p>
          )}

          {!loadingProjects && projects.length === 0 && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "2.5rem", textAlign: "center" }}>
              <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.5)", margin: 0 }}>No projects yet. Start your first one above.</p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {projects.map((p) => (
              <a
                key={p.id}
                href={"/project/" + p.id}
                style={{
                  display: "block",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: "1.25rem 1.4rem",
                  textDecoration: "none",
                  color: "#fff",
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>B</div>
                <p style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.4 }}>
                  {p.dream ? p.dream.slice(0, 70) + (p.dream.length > 70 ? "..." : "") : "Untitled project"}
                </p>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
