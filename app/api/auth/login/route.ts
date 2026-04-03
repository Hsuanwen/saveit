import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { sessionCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password)
      return Response.json({ error: "請輸入帳號和密碼" }, { status: 400 });

    const supabase = getSupabase();

    const { data: user } = await supabase
      .from("users")
      .select("id, username, password_hash")
      .eq("username", username)
      .single();

    if (!user)
      return Response.json({ error: "帳號或密碼錯誤" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return Response.json({ error: "帳號或密碼錯誤" }, { status: 401 });

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
