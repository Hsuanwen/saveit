import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase 環境變數未設定，請建立 .env.local");
    _client = createClient(url, key);
  }
  return _client;
}

export type Item = {
  id: string;
  url: string;
  title: string;
  description: string;
  thumbnail: string | null;
  platform: string;
  category: string;
  tags: string[];
  summary: string;
  note: string;
  location: string | null;
  created_at: string;
};
