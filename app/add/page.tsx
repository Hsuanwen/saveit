"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/platforms";

type Analysis = {
  url: string;
  platform: string;
  title: string;
  description: string;
  thumbnail: string;
  summary: string;
  category: string;
  tags: string[];
};

export default function AddPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [clipboardMsg, setClipboardMsg] = useState("");

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith("http://") || text.startsWith("https://")) {
        setUrl(text);
        setClipboardMsg("");
      } else {
        setClipboardMsg("剪貼簿內容不是網址，請先複製連結");
        setTimeout(() => setClipboardMsg(""), 3000);
      }
    } catch {
      setClipboardMsg("請手動長按輸入框貼上");
      setTimeout(() => setClipboardMsg(""), 3000);
    }
  }

  async function analyze() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "分析失敗");
      setAnalysis(data);
      setCategory(data.category);
    } catch (e) {
      setError(e instanceof Error ? e.message : "分析失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!analysis) return;
    setSaving(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...analysis, category, note }),
      });
      if (!res.ok) throw new Error("儲存失敗");
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "儲存失敗");
      setSaving(false);
    }
  }

  const glassInput = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
  };

  const glassInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.border = "1px solid rgba(6,182,212,0.5)";
    e.target.style.boxShadow = "0 0 0 3px rgba(6,182,212,0.10)";
  };

  const glassInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.border = "1px solid rgba(255,255,255,0.10)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(ellipse at 70% 10%, #083a42 0%, transparent 50%), radial-gradient(ellipse at 15% 85%, #062d38 0%, transparent 45%), #030a0d",
      }}
    >
      {/* 背景光暈 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 opacity-15 blur-3xl"
          style={{ background: "radial-gradient(ellipse, #22d3ee 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full text-white/70 hover:text-white transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-white">新增收藏</h1>
        </div>

        {/* 使用說明 */}
        <div
          className="rounded-xl px-4 py-3 mb-4 text-xs text-white/40 leading-relaxed"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          在 IG / Threads / YouTube 點「<span className="text-white/60">複製連結</span>」，回到這裡貼上 👇
        </div>

        {/* URL Input */}
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="https://..."
              className="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
              style={glassInput}
              onFocus={glassInputFocus}
              onBlur={glassInputBlur}
            />
            <button
              onClick={analyze}
              disabled={loading || !url.trim()}
              className="text-white px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                boxShadow: "0 0 16px rgba(6,182,212,0.3)",
              }}
            >
              {loading ? "分析中..." : "分析"}
            </button>
          </div>

          <button
            onClick={pasteFromClipboard}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm text-white/50 hover:text-white/70 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            📋 從剪貼簿貼上連結
          </button>
          {clipboardMsg && (
            <p className="text-yellow-400 text-xs mt-1.5 text-center">{clipboardMsg}</p>
          )}
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {/* Loading state */}
        {loading && (
          <div
            className="rounded-2xl p-6 text-center text-white/40 text-sm"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="animate-pulse">正在分析內容，請稍候...</div>
          </div>
        )}

        {/* Analysis Result */}
        {analysis && !loading && (
          <div className="space-y-4">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}
            >
              {analysis.thumbnail && (
                <img
                  src={analysis.thumbnail}
                  alt={analysis.title}
                  className="w-full h-44 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="p-4">
                <span
                  className="text-xs text-white/60 px-2 py-0.5 rounded-full mb-2 inline-block"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  {analysis.platform}
                </span>
                <h2 className="font-semibold text-white text-sm mb-2 leading-snug">{analysis.title}</h2>
                <p className="text-white/50 text-xs leading-relaxed">{analysis.summary}</p>

                {analysis.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {analysis.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-white/40 px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-white/40 mb-2 block">分類</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                    style={category === cat ? {
                      background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                      boxShadow: "0 0 12px rgba(6,182,212,0.3)",
                      color: "white",
                    } : {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {CATEGORY_ICONS[cat]} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs text-white/40 mb-2 block">備註（選填）</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="為什麼想存這個？有什麼想法？"
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 resize-none"
                style={glassInput}
                onFocus={glassInputFocus}
                onBlur={glassInputBlur}
              />
            </div>

            {/* Save */}
            <button
              onClick={save}
              disabled={saving}
              className="w-full text-white py-3.5 rounded-xl font-medium transition-all disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)",
                boxShadow: saving ? "none" : "0 0 24px rgba(6,182,212,0.4), 0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              {saving ? "儲存中..." : "儲存到收藏庫"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
