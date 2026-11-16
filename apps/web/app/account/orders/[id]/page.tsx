import { CustomerOrderDetail } from '../../../../features/customer/customer-order-detail';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <CustomerOrderDetail orderId={params.id} />;
}
