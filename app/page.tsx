"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Item } from "@/lib/supabase";
import { PLATFORM_COLORS, CATEGORY_ICONS, CATEGORIES } from "@/lib/platforms";

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "今天";
  if (isSameDay(date, yesterday)) return "昨天";

  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function getDateKey(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 10);
}

export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((u) => { if (u?.username) setUsername(u.username); });
    fetch("/api/items")
      .then((r) => r.json())
      .then((data) => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function deleteItem(id: string) {
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function toggleDate(dateKey: string) {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      next.has(dateKey) ? next.delete(dateKey) : next.add(dateKey);
      return next;
    });
  }

  const filtered = items.filter((item) => {
    const matchCat = filter === "全部" || item.category === filter;
    const matchSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.summary?.toLowerCase().includes(search.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  // 依日期分組（已按 created_at DESC 排序）
  const grouped = filtered.reduce<{ dateKey: string; label: string; items: Item[] }[]>((acc, item) => {
    const dateKey = getDateKey(item.created_at);
    const existing = acc.find((g) => g.dateKey === dateKey);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({ dateKey, label: formatDateLabel(item.created_at), items: [item] });
    }
    return acc;
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      <div className="sticky top-0 bg-[#0f0f0f]/95 backdrop-blur pt-6 pb-3 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">SaveIt</h1>
            {username && <p className="text-white/30 text-xs mt-0.5">@{username}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="text-white/30 hover:text-white/60 text-xs px-3 py-2 rounded-full transition-colors"
            >
              登出
            </button>
            <Link
              href="/add"
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              + 新增
            </Link>
          </div>
        </div>

        <input
          type="text"
          placeholder="搜尋收藏..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-sky-500 mb-3"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {["全部", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === cat
                  ? "bg-sky-500 text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {cat !== "全部" && CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-white/30">載入中...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-white/30 gap-3">
          <span className="text-4xl">📭</span>
          <p className="text-sm">
            {items.length === 0 ? "還沒有收藏，點右上角新增吧！" : "沒有符合的結果"}
          </p>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          {grouped.map(({ dateKey, label, items: groupItems }) => {
            const isCollapsed = collapsedDates.has(dateKey);
            return (
              <div key={dateKey}>
                {/* 日期標題列 */}
                <button
                  onClick={() => toggleDate(dateKey)}
                  className="w-full flex items-center justify-between py-2 px-1 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/60 group-hover:text-white/80 transition-colors">
                      {label}
                    </span>
                    <span className="text-xs text-white/25 bg-white/5 px-1.5 py-0.5 rounded-full">
                      {groupItems.length}
                    </span>
                  </div>
                  <span className={`text-white/30 text-xs transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}>
                    ▾
                  </span>
                </button>

                {/* 摺疊內容 */}
                {!isCollapsed && (
                  <div className="grid gap-3">
                    {groupItems.map((item) => (
                      <ItemCard key={item.id} item={item} onDelete={deleteItem} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onDelete }: { item: Item; onDelete: (id: string) => void }) {
  const platformColor = PLATFORM_COLORS[item.platform] || PLATFORM_COLORS["網頁"];
  const [confirm, setConfirm] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const timeStr = new Date(item.created_at).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {/* 確認刪除 Modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setConfirm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#1c1c2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold mb-1">確認刪除？</h3>
            <p className="text-white/40 text-sm mb-5 line-clamp-2">
              「{item.title || item.url}」刪除後無法復原。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 py-2.5 rounded-xl text-sm transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => { onDelete(item.id); setConfirm(false); }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
      {item.thumbnail && (
        <div className={`w-full h-44 bg-white/[0.06] ${imgLoaded ? "" : "hidden"}`}>
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover"
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) parent.style.display = "none";
            }}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${platformColor}`}>
              {item.platform}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50">
              {CATEGORY_ICONS[item.category]} {item.category}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-white/20 text-xs">{timeStr}</span>
            <button
              onClick={() => setConfirm(true)}
              className="text-white/20 hover:text-red-400 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <h2 className="font-semibold text-white text-sm leading-snug mb-1 line-clamp-2">
          {item.title || item.url}
        </h2>

        {item.summary && (
          <p className="text-white/50 text-xs leading-relaxed mb-3 line-clamp-3">{item.summary}</p>
        )}

        {item.note && (
          <p className="text-sky-300 text-xs italic mb-3">💬 {item.note}</p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag) => (
              <span key={tag} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 text-xs hover:text-sky-300 transition-colors"
          >
            開啟原始連結 →
          </a>
          {item.location && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 text-xs hover:text-green-300 transition-colors"
            >
              📍 {item.location}
            </a>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
