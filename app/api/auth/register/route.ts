import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { sessionCookieOptions } from "@/lib/auth";

const USERNAME_RE = /^[a-zA-Z0-9]+$/;
const PASSWORD_RE = /^[a-zA-Z0-9]+$/;

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !USERNAME_RE.test(username))
      return Response.json({ error: "帳號只能使用英文和數字" }, { status: 400 });

    if (!password || !PASSWORD_RE.test(password))
      return Response.json({ error: "密碼只能使用英文和數字" }, { status: 400 });

    const supabase = getSupabase();

    // 檢查帳號是否已存在
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existing)
      return Response.json({ error: "此帳號名稱已被使用，請換一個" }, { status: 409 });

    // 雜湊密碼
    const password_hash = await bcrypt.hash(password, 10);

    // 建立帳號
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({ username, password_hash })
      .select("id, username")
      .single();

    if (userError || !user)
      return Response.json({ error: "建立帳號失敗" }, { status: 500 });

    // 建立 session
    const { data: session } = await supabase
      .from("sessions")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    if (!session)
      return Response.json({ error: "登入失敗，請重試" }, { status: 500 });

    const response = NextResponse.json({ username: user.username });
    response.cookies.set(sessionCookieOptions(session.id));
    return response;
  } catch (e) {
    console.error(e);
    return Response.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
