import { cookies } from "next/headers";
import { getSupabase } from "./supabase";

export const SESSION_COOKIE = "saveit_session";
const MAX_INACTIVE_MS = 10 * 24 * 60 * 60 * 1000; // 10 天
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;           // cookie 存 30 天

export type SessionUser = { id: string; username: string };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return validateSession(sessionId);
}

export async function validateSession(sessionId: string): Promise<SessionUser | null> {
  try {
    const supabase = getSupabase();

    const { data: session } = await supabase
      .from("sessions")
      .select("id, user_id, last_active")
      .eq("id", sessionId)
      .single();

    if (!session) return null;

    const inactiveMs = Date.now() - new Date(session.last_active).getTime();
    if (inactiveMs > MAX_INACTIVE_MS) {
      await supabase.from("sessions").delete().eq("id", sessionId);
      return null;
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, username")
      .eq("id", session.user_id)
      .single();

    if (!user) return null;

    // 更新最後活躍時間
    await supabase
      .from("sessions")
      .update({ last_active: new Date().toISOString() })
      .eq("id", sessionId);

    return { id: user.id, username: user.username };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(sessionId: string) {
  return {
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}
