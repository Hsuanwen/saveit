"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/platforms";
import { Suspense } from "react";

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

function ShareContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = params.get("url") || params.get("text") || "";
    if (!url) { router.push("/add"); return; }

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((r) => r.json())
      .then((data) => { setAnalysis(data); setCategory(data.category); })
      .catch(() => setError("分析失敗，請稍後再試"));
  }, [params, router]);

  async function save() {
    if (!analysis) return;
    setSaving(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...analysis, category, note }),
      });
      if (!res.ok) throw new Error();
      router.push("/");
    } catch {
      setError("儲存失敗");
      setSaving(false);
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-4">
        <span className="text-4xl">😕</span>
        <p className="text-white/50 text-sm text-center">{error}</p>
        <button onClick={() => router.push("/")} className="text-sky-400 text-sm">
          回到首頁
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-sm">正在分析內容...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/")} className="text-white/40 hover:text-white">
          ×
        </button>
        <h1 className="text-xl font-bold text-white">分享收藏</h1>
      </div>

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
            <h2 className="font-semibold text-white text-sm mb-2">{analysis.title}</h2>
            <p className="text-white/50 text-xs leading-relaxed">{analysis.summary}</p>
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 mb-2 block">分類</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  category === cat ? "bg-sky-500 text-white" : "bg-white/5 text-white/50"
                }`}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 mb-2 block">備註（選填）</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="為什麼想存這個？"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-sky-500 resize-none"
          />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white py-3.5 rounded-xl font-medium"
        >
          {saving ? "儲存中..." : "儲存到收藏庫"}
        </button>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}
