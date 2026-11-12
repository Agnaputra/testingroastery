import { LoadingState } from '@/components/ui/loading-state';
import { Suspense } from 'react';
import { CustomerAuthForm } from '../../components/customer-auth-form';
export default function VerifyEmailPage() {
  return <Suspense fallback={<LoadingState fullPage />}><CustomerAuthForm mode="verify" /></Suspense>;
}
