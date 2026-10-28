import { CustomerOrderDetail } from '../../../../components/customer-order-detail';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <CustomerOrderDetail orderId={params.id} />;
}
