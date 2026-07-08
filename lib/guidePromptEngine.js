// Atomic Prompting engine — builds the hidden master prompt that turns a
// taxonomy selection into a sellable micro-guide. Kept separate from Ben's
// R.O.L.E. (Reality/Outcome/Limitations/Execution) intentionally: same brand,
// different tool, no reason to make customers reconcile two acronyms.

export function buildGuidePrompt({
  industryName,
  phaseName,
  microTaskName,
  microTaskDescription,
  targetAudience,
  toneOfVoice,
  coreOffer,
}) {
  return `You are an expert ${industryName} consultant and direct-response copywriter, specializing in ${phaseName}.

Your task is to generate a premium, sellable micro-guide solving exactly ONE problem:
"${microTaskName}" — ${microTaskDescription}

Target buyer / end reader: ${targetAudience}
Tone constraints: ${toneOfVoice}
Core offer / context to weave in where relevant: ${coreOffer}

RULES:
- Do NOT write introductory fluff, theory, or generic advice.
- Do NOT produce a broad overview of ${industryName} or ${phaseName}. Stay locked on the single micro-task above.
- Every section must be something the reader can literally copy, paste, and use in the next 5 minutes.

Output exactly these four sections, using markdown headers:

## THE ANATOMY
Break down exactly why standard/generic attempts at "${microTaskName}" fail. 3-5 sharp bullet points.

## THE FRAMEWORK
A step-by-step 3-step formula that solves this micro-task. One tight paragraph per step.

## THE VAULT
5 distinct, ready-to-use templates or scripts matching the tone: ${toneOfVoice}.
Use placeholders like [Insert Detail] so the buyer can drop in their own specifics.

## THE PROMPT
One master AI prompt the buyer can run themselves to generate infinite fresh variations of this exact asset, in a code block.

Write the whole thing now. No preamble before "## THE ANATOMY".`;
}

export function suggestGuideTitle(microTaskName, targetAudience) {
  return `The ${targetAudience} Playbook: ${microTaskName}`;
}
