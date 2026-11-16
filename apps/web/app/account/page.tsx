import { CustomerAccount } from '../../features/customer/customer-account';

export default function AccountPage() {
  return <CustomerAccount googleEnabled={Boolean(process.env.CUSTOMER_GOOGLE_CLIENT_ID && process.env.CUSTOMER_GOOGLE_REDIRECT_URI)} />;
}
