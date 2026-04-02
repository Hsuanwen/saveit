import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { detectPlatform } from "@/lib/platforms";

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY 未設定，請檢查 .env.local");
  return new Anthropic({ apiKey });
}

async function fetchOgData(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    const getMeta = (prop: string) => {
      const match =
        html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, "i")) ||
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, "i")) ||
        html.match(new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"));
      return match ? match[1] : "";
    };

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    return {
      title: decodeHtmlEntities(getMeta("title") || (titleMatch ? titleMatch[1].trim() : "")),
      description: decodeHtmlEntities(getMeta("description")),
      image: getMeta("image"),
    };
  } catch {
    return { title: "", description: "", image: "" };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return Response.json({ error: "URL is required" }, { status: 400 });

    const platform = detectPlatform(url);
    const og = await fetchOgData(url);

    const hasContent = og.title || og.description;
    const prompt = hasContent
      ? `你是一個內容分析助手。根據以下資訊分析這個網頁的內容：

URL: ${url}
平台: ${platform}
標題: ${og.title || "（無法取得）"}
描述: ${og.description || "（無法取得）"}

請用繁體中文回覆，格式如下（嚴格照這個JSON格式）：
{
  "summary": "2-3句話的重點摘要",
  "category": "從以下選一個：美食、旅遊、購物、知識、娛樂、健康、其他",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "location": "如果內容提到具體地點（餐廳名、景點、地址等）就填入，否則填 null"
}

只回覆JSON，不要其他文字。`
      : `這是一個來自 ${platform} 的連結，但因為平台限制無法讀取內容。

URL: ${url}

請根據平台名稱和URL結構推測可能的內容類型，用繁體中文回覆：
{
  "summary": "這是一則來自 ${platform} 的內容，因平台隱私限制無法自動擷取詳細資訊，請在備註欄補充說明。",
  "category": "從以下選一個：美食、旅遊、購物、知識、娛樂、健康、其他",
  "tags": ["${platform}"],
  "location": null
}

只回覆JSON，不要其他文字。`;

    const message = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "{}";
    let analysis = { summary: "", category: "其他", tags: [] as string[], location: null as string | null };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
    } catch {
      analysis.summary = og.description || "無法分析內容";
    }

    return Response.json({
      url,
      platform,
      title: og.title,
      description: og.description,
      thumbnail: og.image,
      summary: analysis.summary,
      category: analysis.category,
      tags: analysis.tags,
      location: analysis.location || null,
    });
  } catch (error) {
    console.error("analyze error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return Response.json({ error: `分析失敗：${msg}` }, { status: 500 });
  }
}
