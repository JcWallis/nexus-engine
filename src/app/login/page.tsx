"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Wrong password.");
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.box}>
        <div style={styles.logo}>⬡</div>
        <div style={styles.title}>NEXUS ENGINE</div>
        <form onSubmit={submit} style={styles.form}>
          <input
            style={styles.input}
            type="password"
            placeholder="Password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button style={styles.btn} disabled={loading || !password}>
            {loading ? "◌ Checking..." : "⬡ Enter"}
          </button>
          {error && <div style={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    fontFamily: "'Menlo', 'Consolas', monospace",
    background: "#080c0a",
    color: "#c8d6d0",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    width: 280,
  },
  logo: { fontSize: 32, color: "#00ff88" },
  title: { fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#00ff88" },
  form: { width: "100%", display: "flex", flexDirection: "column", gap: 10 },
  input: {
    width: "100%",
    background: "#0d1512",
    border: "1px solid #1a2f28",
    borderRadius: 6,
    padding: "12px 14px",
    color: "#c8d6d0",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
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
  },
  error: { color: "#ff4466", fontSize: 12, textAlign: "center" },
};
