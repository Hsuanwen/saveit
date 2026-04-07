"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!username || !password) { setError("請輸入帳號和密碼"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "操作失敗"); return; }
      router.push("/");
      router.refresh();
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "radial-gradient(ellipse at 60% 20%, #0e4f5a 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, #0a3d4a 0%, transparent 50%), #050e12",
      }}
    >
      {/* 背景光暈裝飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(ellipse, #22d3ee 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        {/* 毛玻璃卡片 */}
        <div
          className="rounded-3xl border border-white/10 p-8 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/icon-192.png" alt="SaveIt" className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover shadow-lg" />
            <h1 className="text-2xl font-bold text-white tracking-wide">SaveIt</h1>
            <p className="text-white/40 text-sm mt-1">你的社群內容收藏庫</p>
          </div>

          {/* Tab */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === m
                    ? "text-white shadow-md"
                    : "text-white/40 hover:text-white/60"
                }`}
                style={mode === m ? {
                  background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                  boxShadow: "0 0 16px rgba(6,182,212,0.35)",
                } : {}}
              >
                {m === "login" ? "登入" : "建立帳號"}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">帳號</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="只限英文和數字"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(6,182,212,0.6)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(6,182,212,0.12), inset 0 1px 0 rgba(255,255,255,0.05)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.10)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">密碼</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="只限英文和數字"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(6,182,212,0.6)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(6,182,212,0.12), inset 0 1px 0 rgba(255,255,255,0.05)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.10)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-2.5"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-medium transition-all duration-200 mt-2 disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)",
                boxShadow: loading ? "none" : "0 0 24px rgba(6,182,212,0.4), 0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              {loading ? "處理中..." : mode === "login" ? "登入" : "建立帳號"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
