import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "未登入" }, { status: 401 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "未登入" }, { status: 401 });

  const supabase = getSupabase();
  const body = await request.json();
  const { data, error } = await supabase
    .from("items")
    .insert([{ ...body, user_id: user.id }])
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
