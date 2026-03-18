import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a Connection Research Engine. Given two topics, find the hidden, non-obvious real-world connections between them. Focus on causal chains, economic ripple effects, sociological links, and butterfly-effect style relationships.

Respond ONLY with valid JSON, no markdown fences:
{
  "score": <number 0-100 representing connection strength>,
  "headline": "<one punchy sentence summarizing the link>",
  "chain": ["<step 1>", "<step 2>", "<step 3>", "..."],
  "category": "<one of: Economic, Sociological, Political, Technological, Environmental, Cultural, Psychological>",
  "surprising_fact": "<one specific real fact that anchors the connection>"
}

Score guide:
- 0-20: Tenuous, speculative
- 21-40: Indirect but traceable
- 41-60: Clear multi-step causal chain
- 61-80: Well-documented relationship
- 81-100: Direct, undeniable impact

Be specific. Cite real events, data, or mechanisms. No vague hand-waving.`;

export async function POST(req: NextRequest) {
  const { topicA, topicB } = await req.json();

  if (!topicA?.trim() || !topicB?.trim()) {
    return NextResponse.json({ error: "Both topics are required" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Topic A: ${topicA.trim()}\nTopic B: ${topicB.trim()}\n\nFind the deepest real-world connection between these two topics.`,
      },
    ],
  });

  const text = message.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return NextResponse.json(JSON.parse(cleaned));
  } catch {
    return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
  }
}
