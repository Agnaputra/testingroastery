import { LoadingState } from '@/components/ui/loading-state';
import { Suspense } from 'react';
import { CustomerAuthForm } from '../../components/customer-auth-form';
export default function LoginPage() {
  return <Suspense fallback={<LoadingState fullPage />}><CustomerAuthForm mode="login" googleEnabled={Boolean(process.env.CUSTOMER_GOOGLE_CLIENT_ID && process.env.CUSTOMER_GOOGLE_REDIRECT_URI)} /></Suspense>;
}
