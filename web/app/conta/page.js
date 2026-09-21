import { Suspense } from 'react';
import AccountClient from './AccountClient';

export const metadata = {
  title: 'Minha Conta',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountClient />
    </Suspense>
  );
}
