import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { CreditBadge } from './CreditBadge';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { profile, loading } = useCredits();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initial = (profile?.email ?? user?.email ?? '?').charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo to="/app" />

        <div className="flex items-center gap-3">
          <CreditBadge credits={profile?.credits ?? null} loading={loading} />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-semibold text-black"
            >
              {initial}
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 animate-fade-in overflow-hidden rounded-lg border border-border bg-bg-elevated py-1 shadow-xl"
              >
                <MenuLink to="/pricing" onClick={() => setOpen(false)}>
                  Buy credits
                </MenuLink>
                <MenuLink to="/history" onClick={() => setOpen(false)}>
                  My history
                </MenuLink>
                <MenuLink to="/settings" onClick={() => setOpen(false)}>
                  Settings
                </MenuLink>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="block w-full px-4 py-2 text-left text-sm text-text-primary transition-colors hover:bg-bg-card"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="block px-4 py-2 text-sm text-text-primary transition-colors hover:bg-bg-card"
    >
      {children}
    </Link>
  );
}
