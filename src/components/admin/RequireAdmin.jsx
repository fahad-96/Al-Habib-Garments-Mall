import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import Spinner from "../ui/Spinner";
import Button from "../ui/Button";

export default function RequireAdmin({ children }) {
  const { isSupabaseConfigured, checking, session, isAdmin, error, signOut } = useAdmin();
  const location = useLocation();

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-paper">
        <div className="max-w-md text-center">
          <p className="eyebrow-dark">Admin</p>
          <h1 className="mt-3 font-display text-3xl">Admin is not set up yet</h1>
          <p className="mt-4 text-sm text-neutral-400">
            Connect the store to Supabase to enable the dashboard. Follow <span className="text-paper">supabase/ADMIN-SETUP.md</span> in the repository, then add the two <span className="text-paper">VITE_SUPABASE_*</span> variables and redeploy.
          </p>
          <Button to="/" variant="inverse" className="mt-8">Back to store</Button>
        </div>
      </div>
    );
  }
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Spinner />
      </div>
    );
  }
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-paper">
        <div className="max-w-md text-center">
          <p className="eyebrow-dark">Admin</p>
          <h1 className="mt-3 font-display text-3xl">Not on the admin list</h1>
          <p className="mt-4 text-sm text-neutral-400">{error || "This account is signed in but is not allowed into the dashboard."} Add the email to the admin_users table in Supabase, then sign in again.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="inverse" onClick={signOut}>Sign out</Button>
            <Button to="/" variant="inverse-outline">Back to store</Button>
          </div>
        </div>
      </div>
    );
  }
  return children;
}
