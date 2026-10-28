import { Suspense } from 'react';
import { CustomerAuthForm } from '../../components/customer-auth-form';
export default function ForgotPasswordPage() {
  return <Suspense><CustomerAuthForm mode="forgot" /></Suspense>;
}
