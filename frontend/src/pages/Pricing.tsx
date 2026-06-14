import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { PricingCard } from '../components/PricingCard';
import { PACKS, type DisplayPack } from '../lib/packs';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

export default function Pricing() {
  const { notify } = useToast();
  const [busyPack, setBusyPack] = useState<DisplayPack['id'] | null>(null);

  const onSelect = async (packId: DisplayPack['id']) => {
    setBusyPack(packId);
    try {
      const { url } = await api.checkout(packId);
      window.location.href = url;
    } catch (err) {
      setBusyPack(null);
      notify(
        err instanceof Error ? err.message : 'Could not start checkout.',
        'error',
      );
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Top up your credits
        </h1>
        <p className="mt-3 max-w-xl text-text-muted">
          One credit makes one generation, which gives you three scripts. No
          subscription. Credits never expire.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PACKS.map((pack) => (
            <PricingCard
              key={pack.id}
              pack={pack}
              ctaLabel="Buy now"
              onSelect={onSelect}
              busy={busyPack === pack.id}
            />
          ))}
        </div>

        <p className="mt-8 text-sm text-text-faint">
          Payments are handled securely by Stripe. We never see or store your
          card details.
        </p>
      </div>
    </AppLayout>
  );
}
