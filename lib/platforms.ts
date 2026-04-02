export function detectPlatform(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("instagram.com")) return "Instagram";
    if (host.includes("threads.net")) return "Threads";
    if (host.includes("tiktok.com")) return "TikTok";
    if (host.includes("twitter.com") || host.includes("x.com")) return "X";
    if (host.includes("reddit.com")) return "Reddit";
    if (host.includes("facebook.com")) return "Facebook";
    return "網頁";
  } catch {
    return "網頁";
  }
}

export const PLATFORM_COLORS: Record<string, string> = {
  YouTube: "bg-red-500/20 text-red-400",
  Instagram: "bg-pink-500/20 text-pink-400",
  Threads: "bg-gray-500/20 text-gray-300",
  TikTok: "bg-cyan-500/20 text-cyan-400",
  X: "bg-gray-500/20 text-gray-300",
  Reddit: "bg-orange-500/20 text-orange-400",
  Facebook: "bg-blue-500/20 text-blue-400",
  網頁: "bg-indigo-500/20 text-indigo-400",
};

export const CATEGORIES = ["美食", "旅遊", "購物", "知識", "娛樂", "健康", "其他"];

export const CATEGORY_ICONS: Record<string, string> = {
  美食: "🍜",
  旅遊: "✈️",
  購物: "🛍️",
  知識: "📚",
  娛樂: "🎬",
  健康: "💪",
  其他: "📌",
};
