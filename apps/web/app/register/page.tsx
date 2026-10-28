import { Suspense } from 'react';
import { CustomerAuthForm } from '../../components/customer-auth-form';
export default function RegisterPage() {
  return <Suspense><CustomerAuthForm mode="register" googleEnabled={Boolean(process.env.CUSTOMER_GOOGLE_CLIENT_ID && process.env.CUSTOMER_GOOGLE_REDIRECT_URI)} /></Suspense>;
}
