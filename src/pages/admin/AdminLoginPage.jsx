import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { explainDbError } from "../../lib/supabaseClient";
import { STORE } from "../../data/catalog";
import Logo from "../../components/store/Logo";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Fields";
import Seo from "../../components/ui/Seo";

const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_KEY = "ahgm-admin-email";
const DASHBOARD = "/admin/dashboard";

const readEmail = () => {
  try {
    return localStorage.getItem(EMAIL_KEY) || "";
  } catch {
    return "";
  }
};
const rememberEmail = (email) => {
  try {
    localStorage.setItem(EMAIL_KEY, email);
  } catch {
    /* private mode: nothing to remember */
  }
};

// Supabase sends a magic-link click back with tokens (or an error) in the URL.
const readUrlParams = () => {
  if (typeof window === "undefined") return { fromLink: false, linkError: "" };
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const has = (k) => hash.has(k) || query.has(k);
  const fromLink = has("code") || has("access_token") || has("token_hash");
  const linkError = hash.get("error_description") || query.get("error_description") || "";
  return { fromLink, linkError };
};

// Auth-specific wording first, then the shared database explanations.
const describeAuthError = (error) => {
  const raw = String(error?.message || "");
  if (/rate limit|only request this after|too many/i.test(raw)) return "Too many emails were sent recently. Wait a minute and try again, or sign in with your password.";
  if (/signups not allowed/i.test(raw)) return "This email has no account yet and new sign-ups are switched off in Supabase. Create the user under Authentication, Users, or allow sign-ups again.";
  if (/invalid login credentials/i.test(raw)) return "Wrong email or password. If you never set a password, use the email code instead.";
  if (/token has expired|invalid token|otp_expired|otp has expired/i.test(raw)) return "That code is wrong or has expired. Request a new one.";
  if (/email not confirmed/i.test(raw)) return "This account's email is not confirmed yet. Sign in with the email code instead.";
  return explainDbError(error, "Could not sign in. Please try again.");
};

const tabClass = (active) => `-mb-px border-b py-3 text-2xs font-medium uppercase tracking-micro transition-colors ${active ? "border-paper text-paper" : "border-transparent text-neutral-500 hover:text-neutral-300"}`;

function Notice({ tone = "error", children }) {
  const Icon = tone === "error" ? AlertCircle : Check;
  return (
    <div role={tone === "error" ? "alert" : "status"} className="flex items-start gap-3 border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm leading-6 text-neutral-200">
      <Icon className="mt-1 h-4 w-4 shrink-0 text-neutral-400" strokeWidth={1.5} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}

function Shell({ children, eyebrow = "Admin", showBack = true }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 py-10 text-paper">
      <Seo title="Admin sign in" description="Sign in to manage the store." noindex />
      <main className="w-full max-w-[420px]">
        <div className="border border-neutral-800 bg-neutral-950 px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col items-center text-center">
            <Logo inverse />
            <p className="eyebrow-dark mt-6">{eyebrow}</p>
          </div>
          {children}
        </div>
        {showBack && (
          <p className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-2xs font-medium uppercase tracking-micro text-neutral-500 transition-colors hover:text-paper">
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Back to store
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, user, isAdmin, checking, error: adminError, signOut, supabase, isSupabaseConfigured } = useAdmin();

  const [mode, setMode] = useState("otp"); // otp | password
  const [step, setStep] = useState("email"); // email | code
  const [email, setEmail] = useState(readEmail);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [urlParams] = useState(readUrlParams);
  const codeRef = useRef(null);

  // A failed magic link (expired, already used) arrives as error_description in the URL.
  useEffect(() => {
    if (!urlParams.linkError) return;
    setError(`${urlParams.linkError.replace(/\s+/g, " ").trim()}. Request a new code below.`);
    window.history.replaceState(null, "", window.location.pathname);
  }, [urlParams.linkError]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Signed in and on the list: continue to where the admin was heading.
  useEffect(() => {
    if (checking || !session || !isAdmin) return;
    const from = location.state?.from;
    navigate(from && !String(from).startsWith("/admin/login") ? from : DASHBOARD, { replace: true });
  }, [checking, session, isAdmin, location.state, navigate]);

  const switchMode = (next) => {
    setMode(next);
    setStep("email");
    setCode("");
    setPassword("");
    setError("");
    setNotice("");
  };

  // Server-side allowlist gate, so a stranger is never emailed a code.
  const assertOnAdminList = async (target) => {
    const { data, error: rpcError } = await supabase.rpc("is_admin_email", { check_email: target });
    // If the function is missing (schema not run yet) the post-login check and RLS still protect everything.
    if (!rpcError && !data) throw new Error("This email is not on the admin list.");
  };

  const sendCode = async (event) => {
    event?.preventDefault();
    const target = email.trim().toLowerCase();
    if (!target) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await assertOnAdminList(target);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: target,
        options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/admin/login` },
      });
      if (otpError) throw otpError;
      rememberEmail(target);
      setEmail(target);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      if (step === "code") setNotice("A fresh code is on its way.");
      setStep("code");
      setTimeout(() => codeRef.current?.focus(), 50);
    } catch (e) {
      setError(describeAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    const token = code.replace(/\D/g, "");
    if (token.length < 6) {
      setError("Enter the six-digit code from the email.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: "email" });
      if (verifyError) throw verifyError;
      if (!data?.session?.user) throw new Error("The session could not be created. Try again.");
      // useAdmin() now verifies the account and the effect above navigates; keep the button busy meanwhile.
    } catch (e) {
      setError(describeAuthError(e));
      setBusy(false);
    }
  };

  const signInWithPassword = async (event) => {
    event.preventDefault();
    const target = email.trim().toLowerCase();
    if (!target || !password) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: target, password });
      if (signInError) throw signInError;
      if (!(data?.session?.user || data?.user)) throw new Error("The session could not be created. Try again.");
      rememberEmail(target);
    } catch (e) {
      setError(describeAuthError(e));
      setBusy(false);
    }
  };

  if (!isSupabaseConfigured || !supabase) {
    return (
      <Shell showBack={false}>
        <div className="mt-6 text-center">
          <h1 className="font-display text-3xl leading-none">Not connected yet</h1>
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            The admin area switches on once the site is connected to Supabase. Follow <span className="whitespace-nowrap text-paper">supabase/ADMIN-SETUP.md</span> in the repository, add the two <span className="whitespace-nowrap text-paper">VITE_SUPABASE_*</span> variables, then redeploy.
          </p>
          <Button to="/" variant="inverse" className="mt-8" full>
            Back to store
          </Button>
        </div>
      </Shell>
    );
  }

  if (checking) {
    return (
      <Shell>
        <div className="mt-6 flex flex-col items-center text-center" role="status">
          <h1 className="font-display text-3xl leading-none">{urlParams.fromLink ? "Finishing sign-in" : "One moment"}</h1>
          <p className="mt-4 text-sm text-neutral-400">{urlParams.fromLink ? "Checking the link from your email." : session ? "Checking your access." : "Checking your session."}</p>
          <Loader2 className="mt-8 h-5 w-5 animate-spin text-neutral-500" aria-hidden="true" />
        </div>
      </Shell>
    );
  }

  if (session && !isAdmin) {
    return (
      <Shell>
        <div className="mt-6 text-center">
          <h1 className="font-display text-3xl leading-none">Not on the admin list</h1>
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            You are signed in as <span className="text-paper">{user?.email}</span>, but this address is not on the admin list for {STORE.name}. Add it to the admin_users table in Supabase, then sign in again.
          </p>
          {adminError && adminError !== "This account is not on the admin list." && <p className="mt-3 text-xs text-neutral-500">{adminError}</p>}
          <Button variant="inverse" className="mt-8" full onClick={signOut}>
            Sign out
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="mt-2 text-center font-display text-3xl leading-none">Sign in</h1>

      <div className="mt-8 grid grid-cols-2 border-b border-neutral-800" role="tablist" aria-label="Sign-in method">
        <button type="button" role="tab" id="tab-otp" aria-selected={mode === "otp"} aria-controls="panel-otp" onClick={() => switchMode("otp")} className={tabClass(mode === "otp")}>
          Email code
        </button>
        <button type="button" role="tab" id="tab-password" aria-selected={mode === "password"} aria-controls="panel-password" onClick={() => switchMode("password")} className={tabClass(mode === "password")}>
          Password
        </button>
      </div>

      {(error || notice) && <div className="mt-6">{error ? <Notice>{error}</Notice> : <Notice tone="success">{notice}</Notice>}</div>}

      {mode === "otp" && step === "email" && (
        <form id="panel-otp" role="tabpanel" aria-labelledby="tab-otp" className="mt-6 space-y-5" onSubmit={sendCode}>
          <Input dark label="Email" type="email" name="email" required autoComplete="username" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" variant="inverse" full loading={busy}>
            {busy ? "Sending" : "Send code"}
          </Button>
          <p className="text-center text-xs leading-5 text-neutral-500">A six-digit code goes to addresses on the admin list. Nothing is sent to anyone else.</p>
        </form>
      )}

      {mode === "otp" && step === "code" && (
        <form id="panel-otp" role="tabpanel" aria-labelledby="tab-otp" className="mt-6 space-y-5" onSubmit={verifyCode}>
          <p className="text-sm leading-6 text-neutral-400">
            We sent a code to <span className="text-paper">{email}</span>. Check the inbox and the spam folder.
          </p>
          <div>
            <label htmlFor="admin-code" className="label label-dark">
              Six-digit code
            </label>
            <input
              id="admin-code"
              ref={codeRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="field field-dark text-center font-display text-2xl tracking-[0.5em] placeholder:tracking-[0.5em]"
              aria-describedby="admin-code-hint"
            />
          </div>
          <Button type="submit" variant="inverse" full loading={busy} disabled={busy || code.length < 6}>
            {busy ? "Checking" : "Verify and sign in"}
          </Button>
          <div className="flex items-center justify-between text-2xs font-medium uppercase tracking-micro">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
                setNotice("");
              }}
              className="py-2 text-neutral-500 transition-colors hover:text-paper"
            >
              Change email
            </button>
            <button type="button" disabled={cooldown > 0 || busy} onClick={sendCode} className="py-2 text-neutral-300 tabular-nums transition-colors hover:text-paper disabled:cursor-not-allowed disabled:text-neutral-600">
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
          <p id="admin-code-hint" className="text-center text-xs leading-5 text-neutral-500">
            The email also carries a sign-in link. Opening it on this device works just as well.
          </p>
        </form>
      )}

      {mode === "password" && (
        <form id="panel-password" role="tabpanel" aria-labelledby="tab-password" className="mt-6 space-y-5" onSubmit={signInWithPassword}>
          <Input dark label="Email" type="email" name="email" required autoComplete="username" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input dark label="Password" type="password" name="password" required autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" variant="inverse" full loading={busy}>
            {busy ? "Signing in" : "Sign in"}
          </Button>
          <p className="text-center text-xs leading-5 text-neutral-500">Passwords are optional. Set one in Supabase under Authentication, Users.</p>
        </form>
      )}
    </Shell>
  );
}
