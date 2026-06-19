export async function POST(req) {
  try {
    const { messages, system } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: system,
        messages: messages,
      }),
    });

    const data = await response.json();
    const reply = data.content?.find((b) => b.type === "text")?.text || "Ben hit a snag. Try again.";

    return Response.json({ reply });
  } catch (err) {
    return Response.json({ reply: "Connection issue. Try again." }, { status: 500 });
  }
}
