"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const INTRO = `Hey, I'm Ben.

I'm here to take whatever you're dreaming about, struggling with, or trying to build — and make it simple.

No jargon. No tech degree required. Just tell me what's going on and I'll walk you through every step.

I'm going to ask you a few questions so I understand exactly where you're at. Then I'll get to work.

Ready?`;

const QUESTIONS = [
  { id: "dream", label: "What dream, project, or problem are you tackling right now?", placeholder: "E.g. I want to start a trucking business, fix my finances, build an app, get out of debt..." },
  { id: "background", label: "Tell me a little about yourself — your background, experience, and what you've tried before.", placeholder: "E.g. I've worked retail for 10 years, never run a business, tried freelancing once..." },
  { id: "resources_now", label: "What financial resources do you have available right now?", placeholder: "E.g. $500 savings, no income currently, a laptop and phone..." },
  { id: "resources_future", label: "What financial resources will be coming in, and how consistent is that?", placeholder: "E.g. Starting a job next month, inconsistent freelance, disability income, nothing yet..." },
  { id: "tools", label: "What platforms and devices do you have access to right now?", placeholder: "E.g. iPhone, Windows laptop, Gmail, Facebook, no subscriptions..." },
  { id: "effort", label: "How much time and effort are you willing to put in?", placeholder: "E.g. A few hours a week, full time grind, just want it handled for me..." },
  { id: "endgoal", label: "What does success look like to you? What's the end result you're after?", placeholder: "E.g. $3k/month income, a launched website, a business plan I can take to investors, peace of mind..." },
  { id: "vision", label: "How much of this do you already have planned, mapped out, or envisioned?", placeholder: "E.g. Just an idea in my head, I have notes, I've tried before and failed, I have a rough plan..." },
];

const systemPrompt = `You are Ben, the AI at the heart of BenSimple. — a platform built to take any person's dream, problem, or project and turn it into a simple, step-by-step real plan they can actually execute.

Your personality:
- Warm, direct, no-nonsense. You've seen hard times. You respect hustle.
- You NEVER use jargon without explaining it immediately.
- You break everything into the simplest possible next steps.
- You are encouraging without being a cheerleader. You deal in facts and real plans.

Your job: Based on the user's intake answers, create a personalized, actionable plan. Structure your response as:
1. Brief warm acknowledgment (2-3 sentences max)
2. "Here's what I see:" — plain summary
3. "Here's your first move:" — ONE specific action today
4. "Here's your 30-day roadmap:" — 4-6 plain steps
5. "What Ben can do for you right now:" — 3-5 things you can build/research/write/automate immediately
6. End with: "What do you want to tackle first?"

Keep it real. Keep it simple.`;

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

export default function BenApp() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [phase, setPhase] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else {
        setUser(data.user);
        setAuthChecked(true);
      }
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase, currentQ]);

  const handleAnswer = () => {
    if (!inputVal.trim()) return;
    const q = QUESTIONS[currentQ];
    const updated = { ...answers, [q.id]: inputVal.trim() };
    setAnswers(updated);
    setInputVal("");
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setPhase("processing");
      runIntake(updated);
    }
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

  const runIntake = async (ans) => {
    const userContent = "Here are my intake answers:\n\n" +
      "Dream/Project/Problem: " + ans.dream + "\n" +
      "Background: " + ans.background + "\n" +
      "Current Financial Resources: " + ans.resources_now + "\n" +
      "Future Financial Resources: " + ans.resources_future + "\n" +
      "Devices & Platforms Available: " + ans.tools + "\n" +
      "Time & Effort Willing to Spend: " + ans.effort + "\n" +
      "End Goal: " + ans.endgoal + "\n" +
      "How Much I've Already Planned: " + ans.vision + "\n\n" +
      "Based on all of this, give me my personalized plan.";

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        dream: ans.dream,
        background: ans.background,
        resources_now: ans.resources_now,
        resources_future: ans.resources_future,
        tools: ans.tools,
        effort: ans.effort,
        endgoal: ans.endgoal,
        vision: ans.vision,
      })
      .select()
      .single();

    if (projectError) {
      setMessages([{ role: "assistant", content: "Something went wrong saving your project. Please try again." }]);
      setPhase("chat");
      return;
    }

    setProjectId(project.id);

    try {
      const reply = await callBen([{ role: "user", content: userContent }]);

      await supabase.from("messages").insert([
        { project_id: project.id, role: "user", content: userContent },
        { project_id: project.id, role: "assistant", content: reply },
      ]);

      setMessages([
        { role: "user", content: userContent, hidden: true },
        { role: "assistant", content: reply },
      ]);
      setPhase("chat");
    } catch (e) {
      setMessages([{ role: "assistant", content: "Something went wrong connecting to Ben. Please try again." }]);
      setPhase("chat");
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || loading) return;
    if (messages.filter(function (m) { return !m.hidden; }).length >= 5) {
      setMessages([...messages, { role: "assistant", content: "You've used your free messages with Ben. Upgrade is coming very soon to keep going — hang tight!" }]);
      return;
    }
    const userMsg = { role: "user", content: chatInput.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setChatInput("");
    setLoading(true);
    try {
      const apiMessages = updated.filter(function (m) { return !m.hidden; }).map(function (m) {
        return { role: m.role, content: m.content };
      });
      const reply = await callBen(apiMessages);

      if (projectId) {
        await supabase.from("messages").insert([
          { project_id: projectId, role: "user", content: userMsg.content },
          { project_id: projectId, role: "assistant", content: reply },
        ]);
      }

      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...updated, { role: "assistant", content: "Connection issue. Try again." }]);
    }
    setLoading(false);
  };

  const reset = () => {
    setPhase("intro");
    setCurrentQ(0);
    setAnswers({});
    setInputVal("");
    setMessages([]);
    setChatInput("");
    setProjectId(null);
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

  const progress = Math.round((currentQ / QUESTIONS.length) * 100);
  const nextLabel = currentQ < QUESTIONS.length - 1 ? "Next" : "Talk to Ben";

  return (
    <div style={{ minHeight: "100vh", background: "#05060a" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <a href="/dashboard" style={{ fontSize: 21, fontWeight: 800, color: "#fff", textDecoration: "none" }}>BenSimple<span style={{ color: "#a855f7" }}>.</span></a>
          <div style={{ display: "flex", gap: 8 }}>
            {phase === "chat" && (
              <button onClick={reset} style={{ fontSize: 13, padding: "7px 16px", cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 999, fontWeight: 600 }}>
                New project
              </button>
            )}
            <button onClick={handleLogout} style={{ fontSize: 13, padding: "7px 16px", cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", borderRadius: 999, fontWeight: 600 }}>
              Log out
            </button>
          </div>
        </div>

        {phase === "intro" && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "1.75rem", boxShadow: "0 0 60px rgba(168,85,247,0.08)" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700, flexShrink: 0, boxShadow: "0 0 24px rgba(168,85,247,0.4)" }}>B</div>
              <div style={{ fontSize: 15.5, lineHeight: 1.75, whiteSpace: "pre-line", color: "rgba(255,255,255,0.9)" }}>{INTRO}</div>
            </div>
            <button onClick={() => setPhase("intake")} style={{ width: "100%", padding: "14px", fontSize: 15.5, cursor: "pointer", fontWeight: 700, background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: 999, boxShadow: "0 0 30px rgba(168,85,247,0.35)" }}>
              Let's go
            </button>
          </div>
        )}

        {phase === "intake" && (
          <div>
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontWeight: 600 }}>
                <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                <span>{progress}% complete</span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                <div style={{ height: 5, background: "linear-gradient(90deg, #6366f1, #a855f7)", borderRadius: 99, width: progress + "%", transition: "width 0.3s" }} />
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "1.75rem" }}>
              <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, lineHeight: 1.5 }}>{QUESTIONS[currentQ].label}</p>
              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={QUESTIONS[currentQ].placeholder}
                rows={4}
                style={{ width: "100%", resize: "vertical", fontSize: 14.5, padding: "12px 14px", boxSizing: "border-box", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.35)", color: "#fff", lineHeight: 1.6 }}
                autoFocus
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                <button onClick={handleAnswer} disabled={!inputVal.trim()} style={{ padding: "11px 28px", fontSize: 14.5, cursor: inputVal.trim() ? "pointer" : "not-allowed", opacity: inputVal.trim() ? 1 : 0.5, background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: 999, fontWeight: 700 }}>
                  {nextLabel}
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === "processing" && (
          <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700, margin: "0 auto 20px", boxShadow: "0 0 30px rgba(168,85,247,0.5)" }}>B</div>
            <p style={{ fontSize: 17, fontWeight: 700 }}>Ben is working on your plan...</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>This takes about 10 seconds.</p>
          </div>
        )}

        {phase === "chat" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: "1.25rem" }}>
              {messages.filter(function (m) { return !m.hidden; }).map((m, i) => (
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
                placeholder="Ask Ben anything..."
                rows={2}
                style={{ flex: 1, resize: "none", fontSize: 14.5, padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.4)", color: "#fff" }}
              />
              <button onClick={sendChat} disabled={!chatInput.trim() || loading} style={{ padding: "12px 22px", fontSize: 14.5, cursor: "pointer", background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", border: "none", borderRadius: 14, fontWeight: 700 }}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
