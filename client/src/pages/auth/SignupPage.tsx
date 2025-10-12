import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";
import { useAuth } from "@/state/auth";
import { useLocation } from "wouter";

const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const [, setLocation] = useLocation();

  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState<"idle"|"loading"|"ok"|"fail">("idle");
  const [msg, setMsg] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading"); setMsg(null);
    const res = await signup({ email, password, name, mobile });
    if (res.ok) {
      setStatus("ok"); setMsg(res.message ?? "Sign up successful!");
      // provider will navigate; also do it here as a fallback:
      setTimeout(() => setLocation("/auth/login?signup=1"), 150);
    } else {
      setStatus("fail"); setMsg(res.message);
    }
  };

  return (
    <AuthShell
      title="Sign up"
      alignTop   // <- push content to the top of the card
      footer={
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <button className="text-primary underline-offset-2 hover:underline" onClick={() => setLocation("/auth/login")}>
            Log in
          </button>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm">Email Address</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm">Full Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm">Mobile Number</label>
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm">Password</label>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <p className="text-xs text-muted-foreground">
          By signing up, you agree to our <a href="#" className="underline">Terms & Conditions</a> and <a href="#" className="underline">Policies</a>.
        </p>

        {msg && <p className={status === "ok" ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{msg}</p>}

        <Button disabled={status==="loading"} type="submit" className="w-full mt-1">
          {status === "loading" ? "Continuing…" : "Continue"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default SignupPage;