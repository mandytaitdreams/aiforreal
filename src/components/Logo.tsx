import { Link } from "react-router-dom";

export const Logo = ({ className = "", invert = false }: { className?: string; invert?: boolean }) => (
  <Link to="/" className={`inline-flex items-center gap-2.5 font-display font-black text-xl tracking-tight ${invert ? "text-white" : "text-foreground"} ${className}`}>
    <span className="relative inline-flex w-9 h-9 items-center justify-center rounded-full bg-gradient-brand shadow-pink">
      <span className="font-handwritten text-white text-xl leading-none">a</span>
    </span>
    <span>AI <span className="text-gradient-brand">For Real Life</span></span>
  </Link>
);
