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

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-white/40 hover:text-white transition-colors">
          ←
        </button>
        <h1 className="text-xl font-bold text-white">新增收藏</h1>
      </div>

      {/* URL Input */}
      <div className="mb-4">
        <label className="text-xs text-white/40 mb-2 block">貼上網址</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder="https://..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500"
          />
          <button
            onClick={analyze}
            disabled={loading || !url.trim()}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? "分析中..." : "分析"}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-white/40 text-sm">
          <div className="animate-pulse">正在分析內容，請稍候...</div>
        </div>
      )}

      {/* Analysis Result */}
      {analysis && !loading && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {analysis.thumbnail && (
              <img
                src={analysis.thumbnail}
                alt={analysis.title}
                className="w-full h-44 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="p-4">
              <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full mb-2 inline-block">
                {analysis.platform}
              </span>
              <h2 className="font-semibold text-white text-sm mb-2 leading-snug">{analysis.title}</h2>
              <p className="text-white/50 text-xs leading-relaxed">{analysis.summary}</p>

              {analysis.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {analysis.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
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
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    category === cat
                      ? "bg-indigo-500 text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Save */}
          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white py-3.5 rounded-xl font-medium transition-colors"
          >
            {saving ? "儲存中..." : "儲存到收藏庫"}
          </button>
        </div>
      )}
    </div>
  );
}
