import { Suspense } from 'react';
import { CustomerAuthForm } from '../../components/customer-auth-form';
export default function ResetPasswordPage() {
  return <Suspense><CustomerAuthForm mode="reset" /></Suspense>;
}
