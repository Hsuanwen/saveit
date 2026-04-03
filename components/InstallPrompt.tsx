"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 已經是 standalone 模式（安裝過了）
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setShow(false);
      setInstalled(true);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setShow(false);
  }

  if (!show || installed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-2xl mx-auto bg-[#0a1628] border border-sky-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
        <img src="/icon-192.png" alt="SaveIt" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium">安裝 SaveIt 到主畫面</p>
          <p className="text-white/40 text-xs">讓分享功能出現在 IG 的分享選單</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShow(false)}
            className="text-white/30 text-xs px-2 py-1"
          >
            稍後
          </button>
          <button
            onClick={install}
            className="bg-sky-500 hover:bg-sky-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            安裝
          </button>
        </div>
      </div>
    </div>
  );
}
