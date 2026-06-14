import { LegalLayout, LegalSection } from '../components/LegalLayout';

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 13, 2026">
      <p className="leading-relaxed text-text-muted">
        This Privacy Policy explains what information ScriptDrop collects, how we
        use it, and the choices you have. We keep this short and collect only
        what we need to run the Service.
      </p>

      <LegalSection heading="1. Information we collect">
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong className="text-text-primary">Account data:</strong> your
            email address and an authentication identifier.
          </li>
          <li>
            <strong className="text-text-primary">Usage data:</strong> the
            product descriptions you submit, the scripts you generate, and basic
            metadata (platform, hook style, timestamps) so your history works.
          </li>
          <li>
            <strong className="text-text-primary">Payment data:</strong> handled
            entirely by Stripe. We receive a confirmation and the credits to
            grant — we never see or store your full card details.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. How we use information">
        <p>
          We use your information to authenticate you, provide and improve the
          Service, maintain your credit balance and history, process payments,
          and prevent abuse. We do not sell your personal information.
        </p>
      </LegalSection>

      <LegalSection heading="3. Cookies">
        <p>
          We use session cookies strictly to keep you signed in. We do not use
          advertising or third-party tracking cookies.
        </p>
      </LegalSection>

      <LegalSection heading="4. Third-party services">
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong className="text-text-primary">Supabase</strong> — database
            and authentication.
          </li>
          <li>
            <strong className="text-text-primary">Stripe</strong> — payment
            processing.
          </li>
          <li>
            <strong className="text-text-primary">Anthropic</strong> — generates
            your scripts. Your inputs are processed to produce a response and are
            not retained by Anthropic for training beyond what is needed to serve
            the request.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Data retention">
        <p>
          We retain your account and generation history for as long as your
          account is active. When you delete your account, we delete your
          associated profile, history, and credit records.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your rights">
        <p>
          You can access and update your account information at any time in
          Settings. Deleting your account deletes your data. Depending on where
          you live, you may have additional rights to access, correct, or export
          your data — contact us and we’ll help.
        </p>
      </LegalSection>

      <LegalSection heading="7. Marketing">
        <p>
          We will not send you marketing email without your explicit opt-in. You
          can withdraw consent at any time.
        </p>
      </LegalSection>

      <LegalSection heading="8. Contact">
        <p>
          Questions about your privacy? Contact us at{' '}
          <span className="text-text-primary">privacy@scriptdrop.example</span>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
