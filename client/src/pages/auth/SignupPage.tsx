import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmailInput } from "@/components/ui/EmailInput";
import { OTPVerification } from "@/components/ui/OTPVerification";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import AuthShell from "@/components/auth/AuthShell";
import GoogleButton from "@/components/auth/GoogleButton";
import PasswordInput from "@/components/auth/PasswordInput";
import { useAuth } from "@/state/auth";
import { useLocation } from "wouter";
import { useOTPVerification } from "@/hooks/useOTPVerification";

// ---- Musical background image (same as login page) ----
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

const SignupPage: React.FC = () => {
  const { signup, loginWithGoogle } = useAuth();
  const [, setLocation] = useLocation();

  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState<"idle"|"loading"|"ok"|"fail">("idle");
  const [msg, setMsg] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [modalType, setModalType] = React.useState<"terms" | "privacy">("terms");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = React.useState(false);
  const [isEmailValid, setIsEmailValid] = React.useState(true);
  const [showOTPVerification, setShowOTPVerification] = React.useState(false);
  const [verificationToken, setVerificationToken] = React.useState<string | null>(null);
  const [testingKeyword, setTestingKeyword] = React.useState<string | null>(null);

  const { sendOTP } = useOTPVerification();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has agreed to both Terms & Conditions and Privacy Policy
    if (!agreedToTerms || !agreedToPrivacy) {
      setStatus("fail");
      setMsg("Please agree to both Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    // Check if email is valid
    if (!isEmailValid) {
      setStatus("fail");
      setMsg("Please enter a valid email address.");
      return;
    }

    // Check if already verified
    if (verificationToken) {
      // Proceed with signup using verified email
      await proceedWithSignup();
      return;
    }

    // Send OTP for email verification
    setStatus("loading");
    setMsg("Sending verification code...");
    
    try {
      const result = await sendOTP(email);
      
      if (result.success) {
        setShowOTPVerification(true);
        setTestingKeyword(result.testingKeyword || null);
        setMsg("Verification code sent! Check your email.");
        setStatus("idle");
      } else {
        setStatus("fail");
        setMsg(result.message);
      }
    } catch (error) {
      setStatus("fail");
      setMsg("Failed to send verification code. Please try again.");
    }
  };

  const proceedWithSignup = async () => {
    setStatus("loading");
    setMsg("Creating your account...");
    
    try {
      const res = await signup({ email, password, name, mobile });
      if (res.ok) {
        setStatus("ok");
        setMsg(res.message ?? "Account created successfully!");
        setTimeout(() => {
          setLocation("/auth/login?from=signup");
        }, 1500);
      } else {
        setStatus("fail");
        setMsg(res.message);
      }
    } catch (error) {
      setStatus("fail");
      setMsg("Failed to create account. Please try again.");
    }
  };

  const handleOTPVerificationSuccess = (token: string) => {
    setVerificationToken(token);
    setShowOTPVerification(false);
    setMsg("Email verified! Creating your account...");
    // Automatically proceed with signup
    setTimeout(() => {
      proceedWithSignup();
    }, 1000);
  };

  const handleOTPCancel = () => {
    setShowOTPVerification(false);
    setMsg(null);
    setStatus("idle");
  };

  const openModal = (type: "terms" | "privacy") => {
    setModalType(type);
    setShowModal(true);
  };

  const handleAgreement = () => {
    if (modalType === "terms") {
      setAgreedToTerms(true);
    } else {
      setAgreedToPrivacy(true);
    }
    setShowModal(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      {/* Page background */}
      <Background />

      {/* Foreground content */}
      <div className="relative z-10">
        <AuthShell
          title="Sign up"
          illustration={HERO}
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
            {/* Google Sign Up Button at the top */}
            <GoogleButton
              type="button"
              disabled={status === "loading" || !agreedToTerms || !agreedToPrivacy}
              onClick={async () => {
                // Check if user has agreed to both Terms & Conditions and Privacy Policy
                if (!agreedToTerms || !agreedToPrivacy) {
                  setStatus("fail");
                  setMsg("Please agree to both Terms & Conditions and Privacy Policy to continue.");
                  return;
                }
                
                setStatus("loading");
                setMsg(null);
                const res = await loginWithGoogle();
                if (res.ok) {
                  setStatus("ok");
                  setMsg("Sign up successful!");
                  // AuthProvider handles routing
                } else {
                  setStatus("fail");
                  setMsg(res.message);
                }
              }}
            >
              Continue with Google
            </GoogleButton>

            <Divider />

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
              By signing up, you agree to our{" "}
              <button 
                type="button"
                onClick={() => openModal("terms")}
                className={`underline hover:text-primary transition-colors ${
                  agreedToTerms ? "text-green-600 font-semibold" : ""
                }`}
              >
                Terms & Conditions {agreedToTerms && "✓"}
              </button>{" "}
              and{" "}
              <button 
                type="button"
                onClick={() => openModal("privacy")}
                className={`underline hover:text-primary transition-colors ${
                  agreedToPrivacy ? "text-green-600 font-semibold" : ""
                }`}
              >
                Policies {agreedToPrivacy && "✓"}
              </button>.
            </p>

            {(!agreedToTerms || !agreedToPrivacy) && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                ⚠️ Please read and agree to both Terms & Conditions and Privacy Policy to create your account.
              </p>
            )}

            {msg && <p className={status === "ok" ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{msg}</p>}

            <Button disabled={status==="loading" || !agreedToTerms || !agreedToPrivacy || !isEmailValid} type="submit" className="w-full mt-1">
              {status === "loading" ? "Continuing…" : verificationToken ? "Create Account" : "Send Verification Code"}
            </Button>
          </form>
        </AuthShell>
      </div>

      {/* Terms & Conditions Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              {modalType === "terms" ? "Terms & Conditions" : "Privacy Policy"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 pb-4">
            <iframe
              src={modalType === "terms" ? "/terms.html" : "/privacy.html"}
              className="w-full h-[60vh] border rounded-md"
              title={modalType === "terms" ? "Terms & Conditions" : "Privacy Policy"}
            />
          </div>
          
          <DialogFooter className="p-6 pt-0">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="agree-terms" 
                checked={modalType === "terms" ? agreedToTerms : agreedToPrivacy}
                onCheckedChange={(checked) => {
                  if (modalType === "terms") {
                    setAgreedToTerms(checked as boolean);
                  } else {
                    setAgreedToPrivacy(checked as boolean);
                  }
                }}
              />
              <label 
                htmlFor="agree-terms" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the {modalType === "terms" ? "Terms & Conditions" : "Privacy Policy"}
              </label>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
              <Button 
                onClick={handleAgreement}
                disabled={modalType === "terms" ? !agreedToTerms : !agreedToPrivacy}
              >
                I Agree
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Modal */}
      <Dialog open={showOTPVerification} onOpenChange={setShowOTPVerification}>
        <DialogContent className="max-w-md p-0">
          <OTPVerification
            email={email}
            onVerificationSuccess={handleOTPVerificationSuccess}
            onCancel={handleOTPCancel}
            testingKeyword={testingKeyword || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignupPage;