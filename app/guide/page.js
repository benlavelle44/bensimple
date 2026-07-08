"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const CARD = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "1.75rem" };
const LABEL = { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 6, display: "block", marginTop: 18 };
const INPUT = { width: "100%", padding: "12px 14px", fontSize: 14.5, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.35)", color: "#fff", boxSizing: "border-box" };
const BTN = { padding: "12px 24px", fontSize: 14.5, cursor: "pointer", background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: 999, fontWeight: 700 };

export default function GuidePage() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [industries, setIndustries] = useState([]);
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [industryId, setIndustryId] = useState("");
  const [phaseId, setPhaseId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("");
  const [coreOffer, setCoreOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return (window.location.href = "/login");
      setUser(data.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("guide_credits")
        .eq("id", data.user.id)
        .single();
      setCredits(profile?.guide_credits ?? 0);
    });
    supabase.from("guide_industries").select("id, name").then(({ data }) => setIndustries(data ?? []));
  }, []);

  useEffect(() => {
    if (!industryId) return setPhases([]);
    supabase.from("guide_phases").select("id, name").eq("industry_id", industryId).then(({ data }) => setPhases(data ?? []));
    setPhaseId(""); setTaskId("");
  }, [industryId]);

  useEffect(() => {
    if (!phaseId) return setTasks([]);
    supabase.from("guide_micro_tasks").select("id, name, description").eq("phase_id", phaseId).then(({ data }) => setTasks(data ?? []));
    setTaskId("");
  }, [phaseId]);

  async function handleGenerate() {
    setLoading(true); setResult(null);
    const res = await fetch("/api/generate-guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, microTaskId: taskId, targetAudience, toneOfVoice, coreOffer }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) return alert(data.error);
    setResult(data);
    setCredits((c) => c - 1);
  }

  async function handleBuy(pack) {
    setBuying(true);
    const res = await fetch("/api/guide-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, userEmail: user.email, pack }),
    });
    const data = await res.json();
    setBuying(false);
    if (data.url) window.location.href = data.url;
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#05060a" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <a href="/dashboard" style={{ fontSize: 21, fontWeight: 800, color: "#fff", textDecoration: "none" }}>BenSimple<span style={{ color: "#a855f7" }}>.</span></a>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{credits} credit{credits === 1 ? "" : "s"}</span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Build a micro-guide</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 20 }}>
          Pick a niche, pick the exact pain point, get a sellable PDF-ready guide in under a minute.
        </p>

        <div style={CARD}>
          <label style={{ ...LABEL, marginTop: 0 }}>Industry</label>
          <select style={INPUT} value={industryId} onChange={(e) => setIndustryId(e.target.value)}>
            <option value="">Select an industry</option>
            {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>

          <label style={LABEL}>Workflow phase</label>
          <select style={INPUT} value={phaseId} onChange={(e) => setPhaseId(e.target.value)} disabled={!industryId}>
            <option value="">Select a phase</option>
            {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <label style={LABEL}>Micro-task (the pain point)</label>
          <select style={INPUT} value={taskId} onChange={(e) => setTaskId(e.target.value)} disabled={!phaseId}>
            <option value="">Select a micro-task</option>
            {tasks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <label style={LABEL}>Target audience</label>
          <input style={INPUT} value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. busy tech executives" />

          <label style={LABEL}>Tone of voice</label>
          <input style={INPUT} value={toneOfVoice} onChange={(e) => setToneOfVoice(e.target.value)} placeholder="e.g. direct and bold" />

          <label style={LABEL}>Core offer / context</label>
          <input style={INPUT} value={coreOffer} onChange={(e) => setCoreOffer(e.target.value)} placeholder="optional" />

          <div style={{ marginTop: 22 }}>
            {credits > 0 ? (
              <button style={BTN} onClick={handleGenerate} disabled={!taskId || loading}>
                {loading ? "Generating..." : "Generate guide"}
              </button>
            ) : (
              <div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>Out of credits.</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={BTN} onClick={() => handleBuy("single")} disabled={buying}>$7 — 1 credit</button>
                  <button style={{ ...BTN, background: "rgba(255,255,255,0.1)" }} onClick={() => handleBuy("five")} disabled={buying}>$30 — 5 credits</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div style={{ ...CARD, marginTop: 20, whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.7, color: "rgba(255,255,255,0.9)" }}>
            <h2 style={{ fontSize: 16, marginBottom: 10, color: "#fff" }}>{result.title}</h2>
            {result.contentMarkdown}
          </div>
        )}
      </div>
    </div>
  );
}
