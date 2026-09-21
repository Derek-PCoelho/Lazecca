import { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';

export const metadata = {
  title: 'Redefinir senha · La Zecca Numismática',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient />
    </Suspense>
  );
}
