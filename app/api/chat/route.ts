import { NextRequest } from "next/server";

/**
 * This MOCK API simulates:
 * - token streaming
 * - random LLM errors
 * - realistic latency
 * - fallback responses
 * 
 * Output protocol:
 * {
 *    tokens: string[] | null,
 *    error?: string
 * }
 */

const MOCK_SENTENCES = [
  "This is a fully simulated streaming response generated entirely by the mock API.",
  "You can test your UI logic, animations, and performance without calling any real LLM.",
  "The system supports fake rate limits, server errors, and fallback recovery.",
  "Everything is designed to behave like ChatGPT or Grok, including token-by-token streaming."
];

const MOCK_ERRORS = [
  { type: "RATE_LIMIT", message: "Mock rate limit exceeded." },
  { type: "SERVER_ERROR", message: "Mock internal server error." },
  { type: "TIMEOUT", message: "Mock request timeout." }
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body?.messages?.at(-1)?.content || "";

  // Simula errori (8% di probabilità)
  const rnd = Math.random();
  if (rnd < 0.08) {
    const e = MOCK_ERRORS[Math.floor(Math.random() * MOCK_ERRORS.length)];
    return new Response(
      JSON.stringify({ error: e.type, message: e.message }), 
      { status: 500 }
    );
  }

  // Simula latenza realistica
  await new Promise(r => setTimeout(r, 300 + Math.random() * 700));

  // Scegli risposta mock
  const full =
    MOCK_SENTENCES[Math.floor(Math.random() * MOCK_SENTENCES.length)];

  // Simula tokenizzazione
  const tokens = full.split(" ");

  return new Response(
    JSON.stringify({ tokens }), 
    { status: 200 }
  );
}
