import { Logo } from "./Logo";
import { Link } from "react-router-dom";

export const SiteFooter = () => (
  <footer className="border-t border-border/60 bg-gradient-warm">
    <div className="container py-16 grid md:grid-cols-4 gap-10">
      <div className="md:col-span-2 space-y-4">
        <Logo />
        <p className="text-sm text-muted-foreground max-w-sm">
          AI for tired, ambitious women. Built for your actual week — not for tech bros.
        </p>
      </div>
      <div>
        <h4 className="font-display font-bold mb-3 text-sm uppercase tracking-wider">Product</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="/#tracks" className="hover:text-foreground">Tracks</a></li>
          <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
          <li><a href="/#how" className="hover:text-foreground">How it works</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-display font-bold mb-3 text-sm uppercase tracking-wider">Company</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="/#faq" className="hover:text-foreground">FAQ</a></li>
          <li><a href="#" className="hover:text-foreground">Privacy</a></li>
          <li><a href="#" className="hover:text-foreground">Terms</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} AI For Real Life · Made with care for multi-hyphenate women.
    </div>
  </footer>
);