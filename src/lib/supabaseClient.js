import { createClient } from "@supabase/supabase-js";

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && /^https:\/\//.test(supabaseUrl) && !supabaseUrl.includes("your-project-ref")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Lets a magic-link click (/admin/login#access_token=... or ?code=...) finish sign-in automatically.
        detectSessionInUrl: true,
        flowType: "pkce",
        storageKey: "ahgm-admin-auth",
      },
    })
  : null;

// Friendlier messages for the two errors admins actually hit.
export const explainDbError = (error, fallback = "Something went wrong.") => {
  const message = String(error?.message || "");
  const lower = message.toLowerCase();
  if (lower.includes("row-level security") || lower.includes("permission denied")) {
    return "Blocked by database security. Confirm your email is in the admin_users table (see supabase/schema.sql).";
  }
  if (lower.includes("jwt") && lower.includes("expired")) return "Your session expired. Please sign in again.";
  if (lower.includes("failed to fetch") || lower.includes("network")) return "Network error. Check your connection and try again.";
  return message || fallback;
};
