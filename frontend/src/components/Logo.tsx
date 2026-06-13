import { Link } from 'react-router-dom';

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link
      to={to}
      className="font-display text-xl font-bold tracking-tight text-text-primary"
    >
      Script<span className="text-accent">Drop</span>
    </Link>
  );
}
