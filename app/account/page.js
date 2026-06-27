"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AccountPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [projectCount, setProjectCount] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

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

  const handleUpgrade = async (priceKey) => {
    setCheckoutLoading(priceKey);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: priceKey === "pro" ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO : process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
          userId: user.id,
          userEmail: user.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong starting checkout. Please try again.");
        setCheckoutLoading(null);
      }
    } catch (e) {
      alert("Something went wrong starting checkout. Please try again.");
      setCheckoutLoading(null);
    }
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

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Projects</p>
          <p style={{ fontSize: 15.5, color: "#fff", margin: 0 }}>{projectCount} {projectCount === 1 ? "project" : "projects"} saved</p>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.7)", margin: "0 0 14px" }}>Upgrade your plan</h2>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1.5rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>BenSimple Pro — $9.99/mo</p>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", margin: "0 0 16px" }}>Unlimited messages with Ben. No caps, ever.</p>
          <button
            onClick={() => handleUpgrade("pro")}
            disabled={checkoutLoading !== null}
            style={{ width: "100%", padding: "12px", fontSize: 14.5, cursor: checkoutLoading ? "default" : "pointer", fontWeight: 700, background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: 999, opacity: checkoutLoading === "pro" ? 0.6 : 1 }}
          >
            {checkoutLoading === "pro" ? "Loading..." : "Upgrade to Pro"}
          </button>
        </div>

        <div style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>BenSimple Business Builder — $29.99/mo</p>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", margin: "0 0 16px" }}>Everything in Pro, plus full business plan packets, filing checklists, and document generation.</p>
          <button
            onClick={() => handleUpgrade("business")}
            disabled={checkoutLoading !== null}
            style={{ width: "100%", padding: "12px", fontSize: 14.5, cursor: checkoutLoading ? "default" : "pointer", fontWeight: 700, background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: 999, opacity: checkoutLoading === "business" ? 0.6 : 1 }}
          >
            {checkoutLoading === "business" ? "Loading..." : "Upgrade to Business Builder"}
          </button>
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
