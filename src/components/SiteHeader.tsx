// Per design spec: "Do not use a Header on the page" for the landing.
// This header is reserved for member-area pages (Dashboard, TrackDetail, Onboarding, Pricing).
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const SiteHeader = () => {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);
  return (
    <header className="sticky top-3 z-40 mx-3">
      <div className="container glass-effect rounded-full px-5 py-2.5 flex items-center justify-between shadow-soft">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-foreground/70">
          <Link to="/" className="hover:text-[#ff0054] transition-colors">Home</Link>
          <Link to="/pricing" className="hover:text-[#ff0054] transition-colors">Pricing</Link>
          {user && <Link to="/dashboard" className="hover:text-[#ff0054] transition-colors">Dashboard</Link>}
          {user && <Link to="/library" className="hover:text-[#ff0054] transition-colors">Library</Link>}
          {isAdmin && <Link to="/admin" className="hover:text-[#ff0054] transition-colors">Admin</Link>}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="outline" size="sm" className="rounded-full border-[#ff0054]/30 text-[#ff0054] hover:bg-[#ff0054] hover:text-white" onClick={() => { signOut(); nav("/"); }}>Sign out</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => nav("/auth")}>Log in</Button>
              <Button size="sm" className="rounded-full bg-[#ff0054] text-white hover:bg-white hover:text-[#ff0054] hover:border-[#ff0054] border-2 border-transparent shadow-pink font-bold" onClick={() => nav("/auth?mode=signup")}>
                Get my first win
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
