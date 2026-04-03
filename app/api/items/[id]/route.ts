import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "未登入" }, { status: 401 });

  const supabase = getSupabase();
  const { id } = await params;

  // 確認這筆資料屬於該用戶
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
