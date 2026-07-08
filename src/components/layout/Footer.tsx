import { Link } from "@tanstack/react-router";
import { Github, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-electric to-cyan">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </span>
            <span className="font-display font-semibold text-lg">GridGuide AI</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Smart Learning Platform for Power System Interns.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/learning-path" className="hover:text-foreground">Learning Path</Link></li>
            <li><Link to="/equipment" className="hover:text-foreground">Equipment</Link></li>
            <li><Link to="/ai-assistant" className="hover:text-foreground">AI Assistant</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Privacy</a></li>
            <li><a href="#" className="hover:text-foreground">Contact</a></li>
            <li><a href="#" className="hover:text-foreground inline-flex items-center gap-1"><Github className="w-4 h-4" />GitHub</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} GridGuide AI</span>
          <span>Version 1.0</span>
        </div>
      </div>
    </footer>
  );
}
