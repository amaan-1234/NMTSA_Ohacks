import React from "react";
import { useSearch } from "wouter";
import { useAuth } from "@/state/auth";

export default function WelcomeBar() {
  const { user, isAuthenticated } = useAuth();
  const search = useSearch();
  const [show, setShow] = React.useState(false);

  const name =
    user?.name?.toString() ||
    user?.username?.toString() ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "";

  React.useEffect(() => {
    const params = new URLSearchParams(search || "");
    if (params.get("greet") === "1") {
      setShow(true);

      // Speak it out once
      try {
        const text = `Welcome ${name || "back"}`;
        const utter = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch {}

      // Clear the query param so it doesn't repeat on refresh
      const url = window.location.pathname;
      window.history.replaceState({}, "", url);
    }
  }, [search, name]);

  if (!show || !name || !isAuthenticated) return null;

  return (
    <div className="w-full bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl border border-emerald-200 mb-4">
      <span className="font-medium">Welcome {name}</span>
    </div>
  );
}
