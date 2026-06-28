"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const systemPrompt = `You are Ben, the AI at the heart of BenSimple. — a platform built to take any person's dream, problem, or project and turn it into a simple, step-by-step real plan they can actually execute.

Your personality:
- Warm, direct, no-nonsense. You've seen hard times. You respect hustle.
- You NEVER use jargon without explaining it immediately.
- You break everything into the simplest possible next steps.
- You are encouraging without being a cheerleader. You deal in facts and real plans.

Keep it real. Keep it simple. You already have full context on this person's project from the conversation history provided.`;

function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={"list-" + key} style={{ margin: "8px 0 16px", paddingLeft: 20 }}>
          {listBuffer.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 6, lineHeight: 1.6 }}>{formatInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  function formatInline(str) {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ fontWeight: 700, color: "#fff" }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      flushList(i);
      elements.push(<h3 key={i} style={{ fontSize: 17, fontWeight: 700, margin: "20px 0 10px", color: "#c9a8ff" }}>{formatInline(trimmed.slice(3))}</h3>);
    } else if (trimmed.startsWith("# ")) {
      flushList(i);
      elements.push(<h2 key={i} style={{ fontSize: 19, fontWeight: 800, margin: "4px 0 14px" }}>{formatInline(trimmed.slice(2))}</h2>);
    } else if (trimmed === "---") {
      flushList(i);
      elements.push(<hr key={i} style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "18px 0" }} />);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listBuffer.push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushList(i);
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      flushList(i);
      elements.push(<p key={i} style={{ margin: "0 0 10px", lineHeight: 1.7 }}>{formatInline(trimmed)}</p>);
    }
  });
  flushList("end");
  return elements;
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id;

  const [authChecked, setAuthChecked] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", data.user.id)
          .single();
        if (profile?.subscription_status) {
          setSubscriptionStatus(profile.subscription_status);
        }
        setAuthChecked(true);
        loadProject();
      }
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadProject = async () => {
    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    setProject(projectData);

    const { data: messageData } = await supabase
      .from("messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (messageData) {
      setMessages(messageData);
    }
    setLoadingHistory(false);
  };

  const callBen = async (apiMessages) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages, system: systemPrompt }),
    });
    const data = await res.json();
    return data.reply || "Ben ran into an issue. Try again.";
  };

  const sendChat = async () => {
    if (!chatInput.trim() || loading) return;
    const isPaid = subscriptionStatus === "pro" || subscriptionStatus === "business";
    if (!isPaid && messages.length >= 5) {
      setMessages([...messages, { role: "assistant", content: "You've used your free messages with Ben. Upgrade on your account page to keep going — unlimited messages, no caps." }]);
      return;
    }
    const userContent = chatInput.trim();
    const userMsg = { role: "user", content: userContent };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setChatInput("");
    setLoading(true);

    try {
      const apiMessages = updated.map(function (m) {
        return { role: m.role, content: m.content };
      });
      const reply = await callBen(apiMessages);

      await supabase.from("messages").insert([
        { project_id: projectId, role: "user", content: userContent },
        { project_id: projectId, role: "assistant", content: reply },
      ]);

      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...updated, { role: "assistant", content: "Connection issue. Try again." }]);
    }
    setLoading(false);
  };

  if (!authChecked || loadingHistory) {
    return (
      <div style={{ minHeight: "100vh", background: "#05060a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Loading your project...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#05060a" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <a href="/dashboard" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>← Back to dashboard</a>
          <a href="/" style={{ fontSize: 21, fontWeight: 800, color: "#fff", textDecoration: "none" }}>BenSimple<span style={{ color: "#a855f7" }}>.</span></a>
        </div>

        {project && (
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: 19, fontWeight: 700, margin: 0, color: "#fff" }}>
              {project.dream ? project.dream.slice(0, 100) : "Your project"}
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: "1.25rem" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              {m.role === "assistant" && (
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>B</div>
              )}
              <div style={{
                maxWidth: "82%",
                background: m.role === "user" ? "linear-gradient(90deg, #6366f1, #a855f7)" : "rgba(255,255,255,0.05)",
                border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 18,
                padding: "14px 18px",
                fontSize: 14.5,
                color: "rgba(255,255,255,0.92)",
              }}>
                {m.role === "assistant" ? renderMarkdown(m.content) : <span style={{ lineHeight: 1.6 }}>{m.content}</span>}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>B</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Ben is thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ display: "flex", gap: 10, position: "sticky", bottom: 16 }}>
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
            placeholder="Ask Ben anything about this project..."
            rows={2}
            style={{ flex: 1, resize: "none", fontSize: 14.5, padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.4)", color: "#fff" }}
          />
          <button onClick={sendChat} disabled={!chatInput.trim() || loading} style={{ padding: "12px 22px", fontSize: 14.5, cursor: "pointer", background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: 14, fontWeight: 700 }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
