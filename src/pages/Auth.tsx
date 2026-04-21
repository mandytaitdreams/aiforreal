import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      nav(profile?.onboarding_complete ? "/dashboard" : "/onboarding", { replace: true });
    }
  }, [user, profile, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("You're in. Let's get your first win.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm grain flex flex-col">
      <div className="container py-6"><Logo /></div>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl shadow-card border border-border p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-sunrise opacity-30 blur-3xl" />
            <div className="relative">
              <h1 className="font-display font-black text-3xl text-foreground">
                {mode === "signup" ? "Get your first AI win." : "Welcome back."}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signup" ? "30 seconds. No credit card." : "Pick up where you left off."}
              </p>

              <form onSubmit={submit} className="mt-8 space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">First name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Maya" className="rounded-xl h-11" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="rounded-xl h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="rounded-xl h-11" />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-full bg-gradient-sunrise text-primary-foreground border-0 shadow-warm hover:opacity-95 font-semibold">
                  {loading ? "..." : mode === "signup" ? "Start my first win →" : "Log in"}
                </Button>
              </form>

              <button
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="mt-6 text-sm text-muted-foreground hover:text-foreground w-full text-center"
              >
                {mode === "signup" ? "Already a member? Log in" : "New here? Create account"}
              </button>
            </div>
          </div>
          <Link to="/" className="block text-center mt-6 text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}