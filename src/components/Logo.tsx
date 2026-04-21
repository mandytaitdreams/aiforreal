import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`inline-flex items-center gap-2 font-display font-black text-xl tracking-tight ${className}`}>
    <span className="relative inline-block w-8 h-8">
      <span className="absolute inset-0 bg-gradient-sunrise rounded-full animate-blob" />
      <span className="absolute inset-1.5 bg-background rounded-full" />
      <span className="absolute inset-3 bg-gradient-coral-saffron rounded-full" />
    </span>
    <span>
      AI <span className="text-gradient-sunrise">For Real Life</span>
    </span>
  </Link>
);