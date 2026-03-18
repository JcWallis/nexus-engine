import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set in .env" }, { status: 500 });
  }

  const cookie = req.cookies.get("nexus_auth")?.value;
  if (cookie !== process.env.SITE_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicA, topicB } = await req.json();

  if (!topicA?.trim() || !topicB?.trim()) {
    return NextResponse.json({ error: "Both topics are required" }, { status: 400 });
  }

  try {
    const model = genai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(
      `Topic A: ${topicA.trim()}\nTopic B: ${topicB.trim()}\n\nFind the deepest real-world connection between these two topics.`
    );

    const text = result.response.text().replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(text));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
