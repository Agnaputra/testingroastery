import { Suspense } from 'react';
import { CustomerAuthForm } from '../../components/customer-auth-form';
export default function VerifyEmailPage() {
  return <Suspense><CustomerAuthForm mode="verify" /></Suspense>;
}
