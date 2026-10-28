export interface CustomerUser {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
  googleLinked: boolean;
  displayName: string;
  whatsapp: string;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  recipientName: string;
  whatsapp: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
  notes: string;
  isDefault: boolean;
}

export interface CustomerOrder {
  id: string;
  checkoutMode: 'testing' | 'operational';
  createdAt: string;
  customerName: string;
  customerEmail: string;
  shipping: Omit<CustomerAddress, 'id' | 'isDefault'> & { shippingPolicy: string;
    courierName?: string; courierService?: string; courierDuration?: string; shippingOptionId?: string };
  items: Array<{ skuId: string; productName: string; variantLabel: string; grindLabel: string; quantity: number; unitPrice: number; lineTotal: number }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  paymentMethod: 'qris_static' | 'bca_transfer';
  paymentStatus: 'pending' | 'awaiting_verification' | 'paid' | 'rejected' | 'cancelled';
  fulfillmentStatus: 'pending' | 'processing' | 'roasting' | 'shipped' | 'completed' | 'cancelled';
  trackingNumber?: string;
  rejectionReason?: string;
  expiresAt?: string;
}

export interface CustomerPayment {
  orderId: string;
  total: number;
  method: CustomerOrder['paymentMethod'];
  status: CustomerOrder['paymentStatus'];
  rejectionReason?: string;
  createdAt: string;
  proofSubmittedAt?: string;
  verifiedAt?: string;
}
