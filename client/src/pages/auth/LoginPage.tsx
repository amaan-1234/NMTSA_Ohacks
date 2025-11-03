import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmailInput } from "@/components/ui/EmailInput";
import AuthShell from "@/components/auth/AuthShell";
import GoogleButton from "@/components/auth/GoogleButton";
import PasswordInput from "@/components/auth/PasswordInput";
import { useAuth } from "@/state/auth";
import { useLocation, useSearch } from "wouter";

// ---- Musical background image (working online source) ----
let BG = "";
let HERO = "";
try {
  BG = new URL("@assets/stock_images/music_notes_instrume_07962769.jpg", import.meta.url).toString();
} catch {}
try {
  HERO = new URL("@assets/stock_images/music_notes_instrume_07962769.jpg", import.meta.url).toString();
} catch {}

// Working musical background - abstract musical staves and notes
if (!BG) BG = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1920&auto=format&fit=crop";
if (!HERO) HERO = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop";

const Background: React.FC = () => (
  <>
    {/* full-viewport background image */}
    <img
      src={BG}
      alt=""
      className="fixed inset-0 -z-10 h-full w-full object-cover"
    />
    {/* a subtle wash to keep the form readable on any background */}
    <div className="fixed inset-0 -z-10 bg-white/70 dark:bg-black/50 backdrop-blur-[1px]" />
  </>
);

const Divider = () => (
  <div className="flex items-center gap-3 my-2">
    <div className="h-px bg-border flex-1" />
    <span className="text-xs text-muted-foreground">or</span>
    <div className="h-px bg-border flex-1" />
  </div>
);

const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState<"idle"|"loading"|"ok"|"fail">("idle");
  const [isEmailValid, setIsEmailValid] = React.useState(true);
  const [msg, setMsg] = React.useState<string | null>(null);

  // Check if coming from signup
  const isFromSignup = React.useMemo(() => {
    const params = new URLSearchParams(search || "");
    return params.get("signup") === "1";
  }, [search]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMsg(null);

    const res = await login({ email, password });
    if (res.ok) {
      setStatus("ok");
      setMsg(res.message ?? "Login successful!");
      // DO NOT navigate here. AuthProvider handles routing (admin → /admin, others → /courses).
    } else {
      setStatus("fail");
      setMsg(res.message);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      {/* Page background */}
      <Background />

      {/* Foreground content */}
      <div className="relative z-10">
        <AuthShell
          title="Log in"
          // This image appears ABOVE the "Log in" text, like your mock
          illustration={HERO}
          footer={
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <button
                className="text-primary underline-offset-2 hover:underline"
                onClick={() => setLocation("/auth/signup")}
              >
                Sign up
              </button>
            </p>
          }
        >
          <form onSubmit={onSubmit} className="space-y-3">
            {isFromSignup && (
              <div className="bg-green-50 text-green-800 px-3 py-2 rounded-md text-sm border border-green-200">
                Account created successfully! Please log in to continue.
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm">Email Address</label>
              <EmailInput
                value={email}
                onChange={setEmail}
                showValidation={true}
                onValidationChange={setIsEmailValid}
                disabled={status === "loading"}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm">Password</label>
                <a className="text-xs text-muted-foreground hover:underline" href="#">
                  Forgot Password?
                </a>
              </div>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {msg && (
              <p className={status === "ok" ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{msg}</p>
            )}

            <Button disabled={status==="loading" || !isEmailValid} type="submit" className="w-full mt-1">
              {status === "loading" ? "Continuing…" : "Continue"}
            </Button>

            <Divider />
            <GoogleButton
              type="button"
              disabled={status === "loading"}
              onClick={async () => {
                setStatus("loading");
                setMsg(null);
                const res = await loginWithGoogle();
                if (res.ok) {
                  setStatus("ok");
                  setMsg("Login successful!");
                  // AuthProvider handles routing
                } else {
                  setStatus("fail");
                  setMsg(res.message);
                }
              }}
            >
              Continue with Google
            </GoogleButton>
          </form>
        </AuthShell>
      </div>
    </div>
  );
};

export default LoginPage;
