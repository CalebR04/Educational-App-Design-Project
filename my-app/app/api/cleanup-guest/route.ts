import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Called via navigator.sendBeacon when a guest's tab closes.
 *  Deletes all rows belonging to the anonymous guest user. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, accessToken } = body as { userId?: string; accessToken?: string };

    if (!userId || !accessToken) {
      return NextResponse.json({ ok: false, error: "missing params" }, { status: 400 });
    }

    // Use the guest's own JWT so standard RLS (user_id = auth.uid()) permits the deletes.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );

    await Promise.all([
      supabase.from("lesson_progress").delete().eq("user_id", userId),
      supabase.from("word_progress").delete().eq("user_id", userId),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
