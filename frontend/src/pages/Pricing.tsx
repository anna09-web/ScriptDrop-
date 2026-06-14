import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { PricingCard } from '../components/PricingCard';
import { IntervalToggle } from '../components/IntervalToggle';
import { PLANS, type BillingInterval, type Plan } from '../lib/packs';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

export default function Pricing() {
  const { notify } = useToast();
  const [interval, setInterval] = useState<BillingInterval>('month');
  const [busyPlan, setBusyPlan] = useState<Plan['id'] | null>(null);

  const onSelect = async (planId: Plan['id']) => {
    setBusyPlan(planId);
    try {
      const { url } = await api.checkout(planId, interval);
      window.location.href = url;
    } catch (err) {
      setBusyPlan(null);
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
          Pick your plan
        </h1>
        <p className="mt-3 max-w-xl text-text-muted">
          Every plan includes the full creator toolkit and a monthly batch of
          script generations. Cancel anytime. Switch to annual for 20% off.
        </p>

        <div className="mt-8">
          <IntervalToggle interval={interval} onChange={setInterval} />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              interval={interval}
              ctaLabel="Choose plan"
              onSelect={onSelect}
              busy={busyPlan === plan.id}
            />
          ))}
        </div>

        <p className="mt-8 text-sm text-text-faint">
          Payments are handled securely by Stripe. We never see or store your
          card details. Annual plans are billed once up front at the discounted
          rate.
        </p>
      </div>
    </AppLayout>
  );
}
