// Netlify Function: AI script generation with free-provider fallback.
// API keys belong in Netlify environment variables, never in public browser code.
const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS"
  },
  body: JSON.stringify(body)
});

const trimText = (value, max = 6000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function makePrompt({ thought, contentType, tone, creator }) {
  const mode = contentType === "course"
    ? "a practical complete course outline"
    : contentType === "mini"
      ? "a practical mini-course outline"
      : "a spoken short-form video script";
  const style = {
    natural: "natural, warm, honest, conversational",
    bold: "confident, direct, energetic but not exaggerated",
    helpful: "practical, clear, useful, encouraging",
    story: "story-led and emotionally engaging, without inventing personal experiences"
  }[tone] || "natural and conversational";
  const videoRules = contentType === "video"
    ? "The script must be about 125–145 spoken words for roughly 60 seconds. Include a strong opening hook, explain the core idea clearly, add a specific realistic example, and finish with a memorable conclusion or useful call to action. Write for speech, not an essay."
    : "Build a genuinely useful outline with a clear learning promise, intended learner, sequenced modules/lessons, practical examples, learner exercises, and a final outcome. Avoid filler and generic repeated instructions.";
  return `You are an excellent human-sounding scriptwriter and instructional designer. Turn the user's rough idea into useful, well-developed content; do not merely repeat or lightly rephrase it.

CREATOR TYPE: ${creator || "Creator"}
CONTENT TYPE: ${mode}
VOICE: ${style}
REQUIREMENTS: ${videoRules}
Preserve the user's intended meaning. Add sound reasoning and relevant, ordinary examples, but never fabricate the user's personal history, credentials, statistics, testimonials, or claims. If a detail is uncertain, phrase it carefully. Avoid clichés, fake urgency, empty motivational filler, and phrases like "Can we talk honestly about this?" unless genuinely fitting. Make it easy to read aloud. Return only valid JSON with exactly two string fields: "script" and "caption". The caption should be specific to the actual content, not a generic caption.

USER'S ROUGH IDEA:
${thought}`;
}

async function gemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Gemini is not configured");

  // Keep the Gemini work inside a short time budget so Netlify can return a
  // useful JSON error instead of timing out with a gateway HTTP 504.
  const deadline = Date.now() + 6500;
  const preferred = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const models = [...new Set([preferred, "gemini-3.6-flash", "gemini-3.5-flash-lite"])];
  const failures = [];

  for (const model of models) {
    const remaining = deadline - Date.now();
    if (remaining < 1200) {
      failures.push("remaining time budget exhausted before trying every model");
      break;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
    const body = JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
    });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), Math.max(1000, remaining - 150));
      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        failures.push(`${model}: HTTP ${response.status}`);
        continue;
      }
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("");
      if (text) return text;
      failures.push(`${model}: empty response`);
    } catch (error) {
      failures.push(error?.name === "AbortError"
        ? `${model}: timed out`
        : `${model}: request failed`);
    }
  }
  throw new Error(`Gemini could not respond within the time limit (${failures.join("; ")})`);
}

async function openAICompatible(provider, prompt) {
  const isGroq = provider === "groq";
  const key = process.env[isGroq ? "GROQ_API_KEY" : "OPENROUTER_API_KEY"];
  if (!key) throw new Error(`${provider} is not configured`);
  const url = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
  const model = process.env[isGroq ? "GROQ_MODEL" : "OPENROUTER_MODEL"] ||
    (isGroq ? "llama-3.3-70b-versatile" : "meta-llama/llama-3.3-70b-instruct:free");
  const headers = { "content-type": "application/json", authorization: `Bearer ${key}` };
  if (!isGroq) {
    headers["HTTP-Referer"] = process.env.URL || "https://thought-to-video.netlify.app";
    headers["X-Title"] = "Thought to Video";
  }
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "Return only valid JSON with exactly two string fields: script and caption." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })
  });
  if (!response.ok) throw new Error(`${provider} HTTP ${response.status}`);
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${provider} returned an empty response`);
  return text;
}

function parseOutput(raw) {
  const cleaned = raw.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  const parsed = JSON.parse(cleaned);
  const script = trimText(parsed.script, 12000);
  const caption = trimText(parsed.caption, 2000);
  if (script.length < 40 || caption.length < 5) throw new Error("AI response did not contain a complete script and caption");
  return { script, caption };
}

export const handler = async (request) => {
  if (request.httpMethod === "OPTIONS") return json(204, {});
  if (request.httpMethod !== "POST") return json(405, { error: "Use POST to generate content." });

  let input;
  try { input = JSON.parse(request.body || "{}"); }
  catch { return json(400, { error: "The request was not valid JSON." }); }

  const thought = trimText(input.thought, 6000);
  const contentType = ["video", "mini", "course"].includes(input.contentType) ? input.contentType : "video";
  const tone = ["natural", "bold", "helpful", "story"].includes(input.tone) ? input.tone : "natural";
  const creator = trimText(input.creator, 100);
  if (thought.length < 3) return json(400, { error: "Please enter a thought with a little more detail." });

  const prompt = makePrompt({ thought, contentType, tone, creator });
  const providers = [
    ["Gemini", () => gemini(prompt)],
    ["Groq", () => openAICompatible("groq", prompt)],
    ["OpenRouter", () => openAICompatible("openrouter", prompt)]
  ];
  const configured = providers.filter(([name]) =>
    name === "Gemini" ? !!process.env.GEMINI_API_KEY :
    name === "Groq" ? !!process.env.GROQ_API_KEY : !!process.env.OPENROUTER_API_KEY
  );
  if (!configured.length) {
    return json(503, { error: "AI is not connected yet. Add a free provider API key in Netlify: GEMINI_API_KEY is the recommended first step. The key must be saved as an environment variable, not in the website code." });
  }

  const failures = [];
  for (const [name, call] of configured) {
    try {
      const raw = await call();
      const output = parseOutput(raw);
      return json(200, { ...output, provider: name });
    } catch (error) {
      failures.push(`${name}: ${String(error?.message || "request failed").slice(0, 120)}`);
    }
  }
  return json(502, {
    error: "The free AI providers did not return a script this time. Please try again shortly.",
    details: failures
  });
};
