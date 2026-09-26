import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { isAdminUser } from "../lib/adminApi";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  const verify = useCallback(async (nextSession) => {
    if (!isSupabaseConfigured || !supabase) {
      setChecking(false);
      return;
    }
    setChecking(true);
    try {
      if (!nextSession?.user) {
        setIsAdmin(false);
        return;
      }
      const ok = await isAdminUser(supabase);
      setIsAdmin(ok);
      setError(ok ? "" : "This account is not on the admin list.");
    } catch (e) {
      setIsAdmin(false);
      setError(e?.message || "Could not verify admin access.");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session || null);
      verify(data.session || null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession || null);
      verify(nextSession || null);
    });
    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, [verify]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user || null, isAdmin, checking, error, signOut, refresh: () => verify(session), supabase, isSupabaseConfigured }),
    [session, isAdmin, checking, error, signOut, verify]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
