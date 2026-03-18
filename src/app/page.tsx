"use client";

import { useState } from "react";

function getScoreColor(s: number) {
  if (s >= 70) return "#00ff88";
  if (s >= 40) return "#ffc844";
  return "#ff4466";
}

function getScoreLabel(s: number) {
  if (s >= 80) return "DIRECT IMPACT";
  if (s >= 60) return "STRONG LINK";
  if (s >= 40) return "TRACEABLE";
  if (s >= 20) return "INDIRECT";
  return "TENUOUS";
}

type Result = {
  score: number;
  headline: string;
  chain: string[];
  category: string;
  surprising_fact: string;
};

export default function NexusEngine() {
  const [topicA, setTopicA] = useState("");
  const [topicB, setTopicB] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!topicA.trim() || !topicB.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicA, topicB }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result ? getScoreColor(result.score) : "#666";

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <span style={styles.logo}>⬡</span>
        <span style={styles.title}>NEXUS ENGINE</span>
        <span style={styles.sub}>Connection Research Machine</span>
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="Topic A..."
          value={topicA}
          onChange={(e) => setTopicA(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && analyze()}
        />
        <div style={styles.linkIcon}>⟷</div>
        <input
          style={styles.input}
          placeholder="Topic B..."
          value={topicB}
          onChange={(e) => setTopicB(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && analyze()}
        />
      </div>

      <button
        style={{
          ...styles.btn,
          opacity: loading || !topicA.trim() || !topicB.trim() ? 0.4 : 1,
        }}
        onClick={analyze}
        disabled={loading || !topicA.trim() || !topicB.trim()}
      >
        {loading ? "◌ Tracing connections..." : "⬡ Analyze Connection"}
      </button>

      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div style={styles.resultCard}>
          <div style={styles.scoreRow}>
            <div style={{ ...styles.scoreBadge, borderColor: scoreColor }}>
              <span style={{ ...styles.scoreNum, color: scoreColor }}>
                {result.score}
              </span>
              <span style={styles.scoreMax}>/100</span>
            </div>
            <div style={styles.scoreMeta}>
              <div style={{ ...styles.scoreLabel, color: scoreColor }}>
                {getScoreLabel(result.score)}
              </div>
              <div style={styles.category}>{result.category}</div>
            </div>
          </div>

          <div style={styles.headline}>{result.headline}</div>

          <div style={styles.chainTitle}>CAUSAL CHAIN</div>
          <div style={styles.chain}>
            {result.chain?.map((step, i) => (
              <div key={i} style={styles.chainStep}>
                <div style={{ ...styles.chainDot, background: scoreColor }} />
                {i < result.chain.length - 1 && <div style={styles.chainLine} />}
                <span style={styles.chainText}>{step}</span>
              </div>
            ))}
          </div>

          {result.surprising_fact && (
            <div style={styles.factBox}>
              <span style={styles.factLabel}>⚡ KEY FACT</span>
              <span style={styles.factText}>{result.surprising_fact}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    fontFamily: "'Menlo', 'Consolas', monospace",
    background: "#080c0a",
    color: "#c8d6d0",
    padding: 24,
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  logo: { fontSize: 22, color: "#00ff88" },
  title: { fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#00ff88" },
  sub: { fontSize: 11, color: "#4a6a5a", letterSpacing: 1 },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: 140,
    background: "#0d1512",
    border: "1px solid #1a2f28",
    borderRadius: 6,
    padding: "12px 14px",
    color: "#c8d6d0",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
  },
  linkIcon: { color: "#2a4a3a", fontSize: 18, flexShrink: 0 },
  btn: {
    width: "100%",
    padding: "12px 0",
    background: "#00ff8815",
    border: "1px solid #00ff8833",
    borderRadius: 6,
    color: "#00ff88",
    fontSize: 12,
    fontFamily: "inherit",
    letterSpacing: 2,
    cursor: "pointer",
    marginBottom: 20,
  },
  error: { color: "#ff4466", fontSize: 12, marginBottom: 16 },
  resultCard: {
    background: "#0a1210",
    border: "1px solid #1a2f28",
    borderRadius: 10,
    padding: 20,
  },
  scoreRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 },
  scoreBadge: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  scoreNum: { fontSize: 26, fontWeight: 700, lineHeight: 1 },
  scoreMax: { fontSize: 10, color: "#4a6a5a" },
  scoreMeta: { display: "flex", flexDirection: "column", gap: 4 },
  scoreLabel: { fontSize: 12, fontWeight: 700, letterSpacing: 2 },
  category: { fontSize: 11, color: "#4a6a5a", letterSpacing: 1, textTransform: "uppercase" },
  headline: {
    fontSize: 15,
    color: "#e0ece6",
    lineHeight: 1.5,
    marginBottom: 20,
    borderLeft: "2px solid #1a2f28",
    paddingLeft: 12,
  },
  chainTitle: { fontSize: 10, color: "#3a5a4a", letterSpacing: 2, marginBottom: 10 },
  chain: { display: "flex", flexDirection: "column", gap: 0, marginBottom: 20 },
  chainStep: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    position: "relative",
    paddingBottom: 14,
  },
  chainDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: 4,
    position: "relative",
    zIndex: 1,
  },
  chainLine: {
    position: "absolute",
    left: 3.5,
    top: 12,
    bottom: 0,
    width: 1,
    background: "#1a2f28",
  },
  chainText: { fontSize: 12, lineHeight: 1.5, color: "#9ab3a8" },
  factBox: {
    background: "#0d1a15",
    border: "1px solid #1a2f28",
    borderRadius: 6,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  factLabel: { fontSize: 10, color: "#ffc844", letterSpacing: 2 },
  factText: { fontSize: 12, color: "#9ab3a8", lineHeight: 1.5 },
};
