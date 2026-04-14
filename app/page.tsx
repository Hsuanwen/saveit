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
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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
    <div className="min-h-screen" style={{ background: "#030a0d" }}>
      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setConfirmLogout(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative rounded-2xl p-6 w-full max-w-sm"
            style={{
              background: "rgba(3,15,20,0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold mb-1">確定要登出？</h3>
            <p className="text-white/40 text-sm mb-5">登出後需重新輸入帳號密碼。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 text-white/60 py-2.5 rounded-xl text-sm transition-colors hover:text-white/80"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                取消
              </button>
              <button
                onClick={logout}
                className="flex-1 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                  boxShadow: "0 0 16px rgba(6,182,212,0.3)",
                }}
              >
                登出
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 固定背景（確保 sticky header blur 到漸層而非卡片） */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 70% 10%, #083a42 0%, transparent 50%), radial-gradient(ellipse at 15% 85%, #062d38 0%, transparent 45%), #030a0d",
          zIndex: 0,
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 opacity-15 blur-3xl"
          style={{ background: "radial-gradient(ellipse, #22d3ee 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 pb-36" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="pt-6 pb-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">我的收藏庫</h1>
            {username && <p className="text-white/30 text-xs mt-0.5">@{username}</p>}
          </div>
          <button
            onClick={() => setConfirmLogout(true)}
            className="text-white/50 hover:text-white/80 text-xs px-3 py-2 rounded-full transition-all duration-200 mt-1"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            登出
          </button>
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
                  <button
                    onClick={() => toggleDate(dateKey)}
                    className="w-full flex items-center justify-between py-2 px-1 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white/60 group-hover:text-white/80 transition-colors">
                        {label}
                      </span>
                      <span
                        className="text-xs text-white/25 px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        {groupItems.length}
                      </span>
                    </div>
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-white/60 text-sm transition-all duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
                    >
                      ▾
                    </span>
                  </button>

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

      {/* 底部列 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-3"
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          background: "linear-gradient(to top, rgba(3,10,13,0.92) 60%, transparent)",
        }}
      >
        <div className="max-w-2xl mx-auto space-y-2">
          {/* 搜尋列 */}
          <input
            type="text"
            placeholder="搜尋收藏..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
            onFocus={(e) => { e.target.style.border = "1px solid rgba(6,182,212,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(6,182,212,0.10)"; }}
            onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
          />

          {/* 操作列：篩選（左）+ 登出/新增（右） */}
          <div className="flex items-center justify-between">
            {/* 篩選按鈕 */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
                style={{
                  background: filter !== "全部"
                    ? "linear-gradient(135deg, #0891b2, #06b6d4)"
                    : "rgba(255,255,255,0.08)",
                  border: filter !== "全部" ? "none" : "1px solid rgba(255,255,255,0.12)",
                  boxShadow: filter !== "全部" ? "0 0 14px rgba(6,182,212,0.35)" : "none",
                  color: filter !== "全部" ? "white" : "rgba(255,255,255,0.6)",
                }}
              >
                <span>{filter !== "全部" ? CATEGORY_ICONS[filter] : "☰"}</span>
                <span>{filter}</span>
                <span style={{ fontSize: "10px", opacity: 0.7 }}>{showFilterMenu ? "▾" : "▸"}</span>
              </button>

              {/* 垂直分類選單 */}
              {showFilterMenu && (
                <div
                  className="absolute bottom-full left-0 mb-2 rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(8,25,32,0.97)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
                    minWidth: "140px",
                  }}
                >
                  {["全部", ...CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setFilter(cat); setShowFilterMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 text-left"
                      style={{
                        color: filter === cat ? "#22d3ee" : "rgba(255,255,255,0.65)",
                        background: filter === cat ? "rgba(6,182,212,0.10)" : "transparent",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <span>{cat !== "全部" ? CATEGORY_ICONS[cat] : "🗂️"}</span>
                      <span>{cat}</span>
                      {filter === cat && <span className="ml-auto text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 新增 */}
            <Link
              href="/add"
              className="text-white px-4 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)", boxShadow: "0 0 16px rgba(6,182,212,0.35)" }}
            >
              + 新增
            </Link>
          </div>
        </div>
      </div>
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
            className="relative rounded-2xl p-6 w-full max-w-sm"
            style={{
              background: "rgba(10,30,35,0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold mb-1">確認刪除？</h3>
            <p className="text-white/40 text-sm mb-5 line-clamp-2">
              「{item.title || item.url}」刪除後無法復原。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 text-white/60 py-2.5 rounded-xl text-sm transition-colors hover:text-white/80"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
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

      <div
        className="rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {item.thumbnail && (
          <div className={`w-full h-44 bg-white/[0.04] ${imgLoaded ? "" : "hidden"}`}>
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
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white/50"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
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
            <p className="text-cyan-300 text-xs italic mb-3">💬 {item.note}</p>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.map((tag) => (
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

          <div className="flex flex-wrap gap-3">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
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
