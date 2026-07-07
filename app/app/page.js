"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const INTRO = `Hey, I'm Ben.

Whatever brought you here today — a dream you can't shake, a problem you're ready to solve, or something you've been sitting on way too long — you're in the right place.

I'm going to ask you a few questions so I actually understand what you're working with and where you want to go. Then I'll get to work building you a real plan.

No judgment on where you're starting from. No impossible promises about where you'll end up. Just an honest look at what's possible, what it takes, and exactly what to do next.

Let's figure this out together.`;

const QUESTIONS = [
  {
    id: "reality",
    label: "What's the dream, project, or idea you want to tackle? Tell me everything.",
    placeholder: "Big or small, fully formed or just a feeling — whatever is on your mind, lay it out. Nothing is too early or too rough.",
    followUp: "Tell me more — what does this actually look like to you?"
  },
  {
    id: "dream",
    label: "What's driving this? What made today the day you decided to do something about it?",
    placeholder: "It could be a feeling, a situation, a number you need to hit, or just that you're ready. Whatever it is, I want to understand it.",
    followUp: "What's the real thing underneath this? What changes if you pull this off?"
  },
  {
    id: "outcome",
    label: "Paint me a picture — what does success actually look like for you?",
    placeholder: "Not the Instagram version. The real version. What's different about your day-to-day life when this works?",
    followUp: "Get specific — what number, what situation, what feeling tells you this worked?"
  },
  {
    id: "limitations",
    label: "What's in your way right now? Time, money, skills, something else?",
    placeholder: "Every plan has real constraints. The more honest you are here, the more useful your roadmap will be. Nothing is disqualifying.",
    followUp: "What's the biggest one? The thing you're most unsure how to get past?"
  },
  {
    id: "resources",
    label: "What do you have to work with — time, budget, tools, skills, connections?",
    placeholder: "Tell me what's actually available to you today. Real numbers are more useful than round ones.",
    followUp: "Roughly how much time per week can you put into this? And what's a realistic budget to start?"
  },
  {
    id: "execution",
    label: "How do you work best — step by step guidance or big picture and run?",
    placeholder: "There's no wrong answer. Knowing how you actually operate helps me build a plan you'll follow through on, not just one that looks good.",
    followUp: "Think about something you actually finished and felt good about. What made that work?"
  },
  {
    id: "vision",
    label: "How far along is this? Brand new idea, something you've been thinking about, or already started?",
    placeholder: "Whether this is day one or you've been circling this for years — it all matters. Tell me where you actually are.",
    followUp: "If you've tried before, what got in the way? That's usually the most useful thing to know."
  },
];

const systemPrompt = `You are Ben — the core intelligence behind BenSimple. Your entire purpose is to cut through vagueness, extract truth, and build real plans for real people.

## Your philosophy
Most AI cheerleads. You don't. Most AI accepts vague answers. You don't. Most AI builds plans for the dream version of someone. You build plans for the actual person in front of you.

You operate on the ROLE framework:
- R (Reality): Their actual current situation — not the idealized version
- O (Outcome): What success truly looks like, specifically — not "I want to be successful"
- L (Limitations): What is genuinely in the way — time, money, skills, fear, history
- E (Execution): How they actually work and what they'll actually follow through on

## Your rules
1. NEVER accept vague answers. If someone says "make more money," ask: how much, by when, doing what, starting from where?
2. NEVER ask compound questions. ONE question at a time, always.
3. NEVER cheerleade. "That's a great idea!" is banned. Deal in facts.
4. NEVER use jargon without defining it immediately after.
5. ALWAYS name the real obstacle, even if the user hasn't named it themselves.
6. ALWAYS adapt the plan to how the person actually works, not how they wish they worked.
7. If an answer is vague, reflect it back and ask for specifics before moving on.

## Your voice
Warm, capable, and genuinely excited to help. Like the most resourceful friend someone has — one who's seen hard times, respects hustle, doesn't sugarcoat reality, but always leads with "here's what we can do" not "here's what's wrong with you." You deal in hope AND honesty. The sky IS the limit — but you help people figure out what the actual path looks like from where they actually are.

## How you build the plan
Once you have R, O, L, and E clearly established from the intake, structure your response as:

**Here's what I see:** (2-3 sentences — the honest baseline, what's real)

**Here's your first move:** (ONE specific action they can take TODAY — not a list, one thing)

**Here's your 30-day roadmap:** (4-6 plain-language steps, realistic for their actual situation)

**What Ben can do for you right now:** (3-5 specific things you can build, research, write, or automate immediately)

**What do you want to tackle first?**

## What makes you different
You don't just answer questions — you understand people. The intake isn't a form. It's a guided conversation that extracts what someone actually needs, even when they can't articulate it themselves. You ask follow-up questions if an answer is vague. You reflect back what you hear. You name what's underneath what they're saying.

The goal: by the time you give a plan, you know this person better than most people who've met them in real life.`;

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
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
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
    const userContent = "Here is everything I've told you about myself and what I'm working on:\n\n" +
      "What's actually going on in my life right now:\n" + ans.reality + "\n\n" +
      "What I'm trying to build, fix, or change:\n" + ans.dream + "\n\n" +
      "What success actually looks like to me:\n" + ans.outcome + "\n\n" +
      "What's actually in the way:\n" + ans.limitations + "\n\n" +
      "What I have to work with right now:\n" + ans.resources + "\n\n" +
      "How I actually work best:\n" + ans.execution + "\n\n" +
      "How much I've already thought this through:\n" + ans.vision + "\n\n" +
      "Now give me my real plan. Don't sugarcoat it. I want the truth and I want to know exactly what to do.";

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        dream: ans.dream,
        background: ans.reality,
        resources_now: ans.resources,
        resources_future: ans.resources,
        tools: ans.execution,
        effort: ans.execution,
        endgoal: ans.outcome,
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
    const isPaid = subscriptionStatus === "pro" || subscriptionStatus === "business";
    if (!isPaid && messages.filter(function (m) { return !m.hidden; }).length >= 5) {
      setMessages([...messages, { role: "assistant", content: "You've used your free messages with Ben. Upgrade on your account page to keep going — unlimited messages, no caps." }]);
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
              Let's figure this out
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
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>B</div>
                <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 0, lineHeight: 1.5, margin: 0 }}>{QUESTIONS[currentQ].label}</p>
              </div>
              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={QUESTIONS[currentQ].placeholder}
                rows={5}
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
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Reading everything. Putting together what's possible and what it takes.</p>
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
                placeholder="Ask Ben anything — he won't sugarcoat it."
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
