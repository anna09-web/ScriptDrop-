import { Link } from 'react-router-dom';

/**
 * Shown on auth pages when the Supabase environment variables aren't set, so
 * users get a clear explanation instead of a silent sign-in failure.
 */
export function ConfigNotice() {
  return (
    <div className="mb-5 rounded-lg border border-danger/40 bg-bg-elevated p-4 text-sm">
      <p className="font-medium text-text-primary">Sign-in isn’t connected yet.</p>
      <p className="mt-1 text-text-muted">
        This deployment is missing its Supabase keys, so accounts are
        unavailable. The{' '}
        <Link to="/tools" className="text-accent hover:underline">
          free creator tools
        </Link>{' '}
        work without an account. (Set{' '}
        <code className="text-accent">VITE_SUPABASE_URL</code> and{' '}
        <code className="text-accent">VITE_SUPABASE_ANON_KEY</code> in your host
        to enable accounts.)
      </p>
    </div>
  );
}
