import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

const SYSTEM_PROMPT = `You are a Social Trends Connection Engine. Given two topics, find the hidden, non-obvious real-world connections between them through the lens of human behavior, culture, and society.

IMPORTANT RESTRICTIONS:
- Focus ONLY on social, cultural, psychological, behavioral, and sociological connections
- Do NOT reference economic systems, financial markets, capitalism, corporate profits, or monetary incentives
- Do NOT reference political parties, elections, government policy, legislation, or political ideologies
- Draw from: social movements, cultural shifts, generational behavior, psychology, identity, community, media influence, lifestyle trends, and human relationships

Respond ONLY with valid JSON, no markdown fences:
{
  "score": <number 0-100 representing connection strength>,
  "headline": "<one punchy sentence summarizing the social link>",
  "chain": ["<step 1>", "<step 2>", "<step 3>", "..."],
  "category": "<one of: Sociological, Cultural, Psychological, Behavioral, Environmental, Technological, Historical>",
  "surprising_fact": "<one specific real fact about human behavior or social trends that anchors the connection>"
}

Score guide:
- 0-20: Tenuous, speculative
- 21-40: Indirect but traceable
- 41-60: Clear multi-step social chain
- 61-80: Well-documented social relationship
- 81-100: Direct, undeniable cultural impact

Be specific. Reference real social movements, documented behavioral studies, or cultural phenomena. No vague hand-waving.`;

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("nexus_auth")?.value;
  if (cookie !== process.env.SITE_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicA, topicB } = await req.json();

  if (!topicA?.trim() || !topicB?.trim()) {
    return NextResponse.json({ error: "Both topics are required" }, { status: 400 });
  }

  try {
    const response = await ollama.chat({
      model: "llama3.2",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Topic A: ${topicA.trim()}\nTopic B: ${topicB.trim()}\n\nFind the deepest social and cultural connection between these two topics.`,
        },
      ],
      format: "json",
    });

    const text = response.message.content.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(text));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const isOffline = message.includes("ECONNREFUSED") || message.includes("fetch failed");
    return NextResponse.json(
      { error: isOffline ? "Ollama is not running — start it with: ollama serve" : message },
      { status: 500 }
    );
  }
}
