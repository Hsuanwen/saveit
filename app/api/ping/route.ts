import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { count } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true });

    return Response.json({
      ok: true,
      message: "Supabase is alive",
      itemCount: count ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
