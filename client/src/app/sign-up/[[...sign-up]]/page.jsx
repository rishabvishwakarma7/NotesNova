export const dynamic = 'force-dynamic';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gradient-bg)',
    }}>
      <SignUp afterSignUpUrl="/dashboard" />
    </div>
  );
}
