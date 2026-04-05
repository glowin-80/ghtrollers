import { createClient } from "@supabase/supabase-js";
import { HOME_APPROVED_CATCHES_SELECT } from "@/lib/home";
import type { Catch } from "@/types/home";

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function fetchPublicApprovedCatchById(catchId: string): Promise<Catch | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("catches")
    .select(HOME_APPROVED_CATCHES_SELECT)
    .eq("id", catchId)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function fetchAllApprovedCatches(): Promise<Catch[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("catches")
    .select(HOME_APPROVED_CATCHES_SELECT)
    .eq("status", "approved");

  if (error) {
    throw error;
  }

  return data ?? [];
}