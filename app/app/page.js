"use client";
import { useState, useRef, useEffect } from "react";

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

export default function BenApp() {
  const [phase, setPhase] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

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
    const userContent = `Here are my intake answers:

Dream/Project/Problem: ${ans.dream}
Background: ${ans.background}
Current Financial Resources: ${ans.resources_now}
Future Financial Resources: ${ans.resources_future}
Devices & Platforms Available: ${ans.tools}
Time & Effort Willing to Spend: ${ans.effort}
End Goal: ${ans.endgoal}
How Much I've Already Planned: ${ans.vision}

Based on all of this, give me my personalized plan.`;

    try {
      const reply = await callBen([{ role: "user", content: userContent }]);
      setMessages([
        { role: "user", content: userContent, hidden: true },
        { role: "assistant", content: reply },
      ]);
      setPhase("chat");
    } catch {
      setMessages([{ role: "assistant", content: "Something went wrong connecting to Ben. Please try again." }]);
      setPhase("chat");
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || loading) return;
    const userMsg = { role: "user", content: chatInput.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setChatInput("");
    setLoading(true);
    try {
      const apiMessages = updated.filter((m) => !m.hidden).map((m) => ({ role: m.role, content: m.content }));
      const reply = await callBen(apiMessages);
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch {
