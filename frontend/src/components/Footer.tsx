import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} ScriptDrop. All rights reserved.</p>
        <nav className="flex items-center gap-6">
          <Link to="/terms" className="transition-colors hover:text-text-primary">
            Terms
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-text-primary">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
