import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "SaveIt",
  description: "儲存並分析你在社群看到的精彩內容",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SaveIt",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={geist.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');`,
          }}
        />
      </head>
      <body className="bg-[#0f0f0f] text-white min-h-screen font-sans antialiased">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
