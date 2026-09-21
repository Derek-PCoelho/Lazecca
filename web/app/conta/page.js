import { Suspense } from 'react';
import AccountClient from './AccountClient';

export const metadata = {
  title: 'Minha Conta · La Zecca Numismática',
};

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountClient />
    </Suspense>
  );
}
