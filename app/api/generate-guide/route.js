import { createClient } from "@supabase/supabase-js";
import { buildGuidePrompt, suggestGuideTitle } from "../../../lib/guidePromptEngine";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(req) {
  const { userId, microTaskId, targetAudience, toneOfVoice, coreOffer } = await req.json();

  if (!userId || !microTaskId || !targetAudience) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: profile, error: profileErr } = await db
    .from("profiles")
    .select("guide_credits")
    .eq("id", userId)
    .single();

  if (profileErr || !profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }
  if (profile.guide_credits < 1) {
    return Response.json({ error: "Out of credits" }, { status: 402 });
  }

  const { data: task, error: taskErr } = await db
    .from("guide_micro_tasks")
    .select("name, description, guide_phases(name, guide_industries(name))")
    .eq("id", microTaskId)
    .single();

  if (taskErr || !task) {
    return Response.json({ error: "Micro-task not found" }, { status: 404 });
  }

  const phaseName = task.guide_phases?.name ?? "";
  const industryName = task.guide_phases?.guide_industries?.name ?? "";

  const prompt = buildGuidePrompt({
    industryName,
    phaseName,
    microTaskName: task.name,
    microTaskDescription: task.description ?? "",
    targetAudience,
    toneOfVoice: toneOfVoice || "clear and direct",
    coreOffer: coreOffer || "",
  });

  const title = suggestGuideTitle(task.name, targetAudience);
  const { data: gen, error: genErr } = await db
    .from("guide_generations")
    .insert({
      user_id: userId,
      micro_task_id: microTaskId,
      target_audience: targetAudience,
      tone_of_voice: toneOfVoice,
      core_offer: coreOffer,
      title,
      status: "pending",
    })
    .select()
    .single();

  if (genErr || !gen) {
    return Response.json({ error: "Could not create generation" }, { status: 500 });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const contentMarkdown =
      data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") ?? "";

    await db
      .from("guide_generations")
      .update({ content_markdown: contentMarkdown, status: "complete" })
      .eq("id", gen.id);

    await db
      .from("profiles")
      .update({ guide_credits: profile.guide_credits - 1 })
      .eq("id", userId);

    return Response.json({ generationId: gen.id, title, contentMarkdown });
  } catch (err) {
    await db.from("guide_generations").update({ status: "failed" }).eq("id", gen.id);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
