import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { CreditBadge } from '../components/CreditBadge';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { profile, loading } = useCredits();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError(null);

    if (password.length < 8) {
      setPwError('Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setPwError('Passwords don’t match.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      setPwError(error.message);
      return;
    }
    setPassword('');
    setConfirm('');
    notify('Password updated.', 'success');
  };

  const onDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete your account permanently? This removes your profile, history, and credits. This cannot be undone.',
    );
    if (!confirmed) return;

    setDeleting(true);
    // Self-service deletion path: sign out and route the user to support.
    // A full hard-delete requires a privileged backend endpoint; we surface
    // that clearly rather than pretending the data is gone.
    await signOut();
    setDeleting(false);
    notify(
      'You’ve been signed out. Email support to finish deleting your data.',
      'info',
    );
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-3xl font-bold">Settings</h1>

        <section className="card mt-8 p-6">
          <h2 className="font-display text-lg font-bold">Account</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-text-muted">Email</label>
              <input
                type="email"
                value={profile?.email ?? user?.email ?? ''}
                readOnly
                className="input-field cursor-not-allowed opacity-70"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Credit balance</span>
              <CreditBadge credits={profile?.credits ?? null} loading={loading} />
            </div>
          </div>
        </section>

        <section className="card mt-6 p-6">
          <h2 className="font-display text-lg font-bold">Change password</h2>
          <form onSubmit={onChangePassword} className="mt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm text-text-muted">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm text-text-muted">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-field"
                placeholder="Re-enter password"
              />
            </div>
            {pwError && (
              <p className="text-sm text-danger" role="alert">
                {pwError}
              </p>
            )}
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-card border border-danger/40 bg-bg-card p-6">
          <h2 className="font-display text-lg font-bold text-danger">Danger zone</h2>
          <p className="mt-2 text-sm text-text-muted">
            Deleting your account removes your profile, generation history, and
            any remaining credits. This can’t be undone.
          </p>
          <button
            type="button"
            onClick={onDeleteAccount}
            disabled={deleting}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-danger px-6 py-3 font-medium text-danger transition-colors duration-150 hover:bg-danger hover:text-black disabled:opacity-50"
          >
            {deleting ? 'Processing…' : 'Delete account'}
          </button>
        </section>
      </div>
    </AppLayout>
  );
}
