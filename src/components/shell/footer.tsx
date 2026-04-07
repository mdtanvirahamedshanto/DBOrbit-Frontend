import { Github, Heart, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="panel-surface mt-4 border border-border/80 px-6 py-4 shadow-panel">
      <div className="mx-auto flex max-w-[1800px] flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-1.5">
          <span>Built with</span>
          <Heart className="h-3.5 w-3.5 fill-destructive text-destructive" />
          <span>by</span>
          <a
            href="https://github.com/mdtanvirahamedshanto"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Md Tanvir Ahamed Shanto
          </a>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/mdtanvirahamedshanto"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
            aria-label="GitHub Profile"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
          <a
            href="mailto:mdtanvirahamdsanto987@gmail.com"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
            aria-label="Contact via Email"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Contact</span>
          </a>
          <span className="glass-chip">DBOrbit v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
