import { Link, useLocation } from "react-router-dom";
import { Home, Layers, MessageCircle, Users, Bookmark } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const TABS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/dashboard#tracks", label: "Tracks", icon: Layers },
  { to: "/chat", label: "AI Chat", icon: MessageCircle },
  { to: "/community", label: "Community", icon: Users },
  { to: "/library", label: "Saved", icon: Bookmark },
];

export const MobileBottomNav = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const loc = useLocation();
  if (!user || !isMobile) return null;
  return (
    <nav className="fixed bottom-3 inset-x-3 z-50 glass-effect rounded-full px-2 py-2 flex items-center justify-between shadow-pink">
      {TABS.map(t => {
        const Icon = t.icon;
        const active = loc.pathname === t.to.split("#")[0];
        return (
          <Link key={t.to} to={t.to} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-[10px] font-medium ${active ? "bg-pink text-white" : "text-foreground/70"}`}>
            <Icon className="w-4 h-4" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
};