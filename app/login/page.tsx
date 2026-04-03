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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/icon.png" alt="SaveIt" className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover" />
          <h1 className="text-2xl font-bold text-white">SaveIt</h1>
          <p className="text-white/40 text-sm mt-1">你的社群內容收藏庫</p>
        </div>

        {/* Tab */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === m ? "bg-indigo-500 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {m === "login" ? "登入" : "建立帳號"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-3">
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500"
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white py-3.5 rounded-xl font-medium transition-colors mt-2"
          >
            {loading ? "處理中..." : mode === "login" ? "登入" : "建立帳號"}
          </button>
        </div>

      </div>
    </div>
  );
}
