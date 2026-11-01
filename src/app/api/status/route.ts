import { connection } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Health check: which settings are present and whether headlines and deals are readable.
// Shows no secret values. Open /api/status in a browser.
export async function GET() {
  await connection(); // always run fresh
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  const status: Record<string, unknown> = {
    supabaseUrlSet: !!url,
    anonKeySet: !!key,
    anthropicKeySet: !!process.env.ANTHROPIC_API_KEY,
  };
  if (url && key) {
    const db = createClient(url, key, { auth: { persistSession: false } });
    const items = await db.from("items").select("id", { count: "exact", head: true });
    const deals = await db.from("deals").select("id", { count: "exact", head: true });
    status.headlinesReadable = items.count ?? 0;
    status.dealsReadable = deals.count ?? 0;
    status.errors = [items.error?.message, deals.error?.message].filter(Boolean);
    if (!items.count) status.hint = "0 headlines readable: run supabase/migrations/0002_live_data.sql in the Supabase SQL Editor.";
  } else {
    status.hint = "Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then redeploy.";
  }
  return Response.json(status);
}
