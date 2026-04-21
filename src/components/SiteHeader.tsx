import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const SiteHeader = () => {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="/#tracks" className="hover:text-foreground transition-colors">Tracks</a>
          <a href="/#how" className="hover:text-foreground transition-colors">How it works</a>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <a href="/#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => nav("/dashboard")}>Dashboard</Button>
              <Button variant="outline" size="sm" onClick={() => { signOut(); nav("/"); }}>Sign out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => nav("/auth")}>Log in</Button>
              <Button size="sm" className="bg-gradient-sunrise text-primary-foreground border-0 shadow-warm hover:opacity-95" onClick={() => nav("/auth?mode=signup")}>
                Start your first win
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};