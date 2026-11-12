import { LoadingState } from '@/components/ui/loading-state';
import { Suspense } from 'react';
import { CustomerAuthForm } from '../../components/customer-auth-form';
export default function ResetPasswordPage() {
  return <Suspense fallback={<LoadingState fullPage />}><CustomerAuthForm mode="reset" /></Suspense>;
}
