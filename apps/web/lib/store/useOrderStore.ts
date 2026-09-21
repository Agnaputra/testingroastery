import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'pending' | 'roasting' | 'shipped' | 'completed' | 'cancelled';
export type CourierType =
  | 'JNE Reguler'
  | 'J&T Express'
  | 'SiCepat BEST'
  | 'Paxel Sameday'
  | 'Pickup Di Kedai';

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  weightLabel: string;
  grindLabel: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customerCity: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: 'qris' | 'bca-va' | 'mandiri-va' | 'cod';
  paymentStatus: 'paid' | 'pending';
  status: OrderStatus;
  courier: CourierType;
  trackingNumber?: string;
  roastDate?: string;
  notes?: string;
}

interface OrderStoreState {
  orders: OrderRecord[];
  addOrder: (order: Omit<OrderRecord, 'id' | 'createdAt'> & { id?: string }) => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateShipping: (id: string, courier: CourierType, trackingNumber: string) => void;
  getOrderById: (id: string) => OrderRecord | undefined;
}

// Initial realistic roastery transactions to showcase dashboard analytics
const INITIAL_ROASTERY_ORDERS: OrderRecord[] = [
  {
    id: '52CR-892011',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    customerName: 'Bima Wicaksono',
    customerPhone: '081234567890',
    customerEmail: 'bima.wicaksono@gmail.com',
    customerAddress: 'Jl. Ijen No. 42, Klojen',
    customerCity: 'Malang',
    items: [
      {
        productId: 'ijen-cm-asmara',
        name: 'Ijen Carbonic Maceration (Asmara)',
        slug: 'ijen-carbonic-maceration-asmara',
        weightLabel: '200g',
        grindLabel: 'Biji utuh',
        unitPrice: 120000,
        quantity: 1,
      },
      {
        productId: 'sumbing-supernova-celestia',
        name: 'Sumbing Supernova Wash (Celestia)',
        slug: 'sumbing-supernova-celestia',
        weightLabel: '100g',
        grindLabel: 'Medium (V60)',
        unitPrice: 139000,
        quantity: 1,
      },
    ],
    subtotal: 259000,
    shippingCost: 15000,
    total: 274000,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    status: 'roasting',
    courier: 'JNE Reguler',
    roastDate: 'Batch Sangrai 18 Sep 2026',
    notes: 'Mohon cantumkan tanggal sangrai di pouch.',
  },
  {
    id: '52CR-881920',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), // Yesterday
    customerName: 'Siti Rahmawati',
    customerPhone: '085712349911',
    customerEmail: 'siti.rahma@yahoo.com',
    customerAddress: 'Jl. Dago Asri Blok B7 No. 12',
    customerCity: 'Bandung',
    items: [
      {
        productId: 'puntang-natural-aromanis',
        name: 'Puntang Natural Aromanis',
        slug: 'puntang-natural-aromanis',
        weightLabel: '500g',
        grindLabel: 'Biji utuh',
        unitPrice: 399000,
        quantity: 1,
      },
    ],
    subtotal: 399000,
    shippingCost: 22000,
    total: 421000,
    paymentMethod: 'bca-va',
    paymentStatus: 'paid',
    status: 'shipped',
    courier: 'J&T Express',
    trackingNumber: 'JT-98201829012',
    roastDate: 'Batch Sangrai 17 Sep 2026',
  },
  {
    id: '52CR-776102',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
    customerName: 'Reza Pratama (Kedai Sejiwa)',
    customerPhone: '081399881122',
    customerEmail: 'reza@sejiwacoffee.id',
    customerAddress: 'Jl. Rinjani No. 18',
    customerCity: 'Malang',
    items: [
      {
        productId: 'espresso-arabica-ijen-full-wash',
        name: 'Arabica Ijen Full Wash (Espresso)',
        slug: 'espresso-arabica-ijen-full-wash',
        weightLabel: '1kg',
        grindLabel: 'Biji utuh',
        unitPrice: 250000,
        quantity: 3,
      },
    ],
    subtotal: 750000,
    shippingCost: 0,
    total: 750000,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    status: 'completed',
    courier: 'Pickup Di Kedai',
    roastDate: 'Batch Sangrai 16 Sep 2026',
  },
  {
    id: '52CR-990142',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    customerName: 'Dimas Anggara',
    customerPhone: '082199887766',
    customerEmail: 'dimas.a@outlook.com',
    customerAddress: 'Apartemen Sudirman Park Tower A/12',
    customerCity: 'Jakarta Selatan',
    items: [
      {
        productId: 'grand-reserve-el-triunfo-geisha',
        name: 'El Triunfo Geisha Colombia (Aurora)',
        slug: 'grand-reserve-el-triunfo-geisha',
        weightLabel: '50g',
        grindLabel: 'Biji utuh',
        unitPrice: 200000,
        quantity: 1,
      },
    ],
    subtotal: 200000,
    shippingCost: 18000,
    total: 218000,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    status: 'pending',
    courier: 'SiCepat BEST',
    notes: 'Kemasan tube kaca koleksi.',
  },
];

export const useOrderStore = create<OrderStoreState>()(
  persist(
    (set, get) => ({
      orders: INITIAL_ROASTERY_ORDERS,

      addOrder: (newOrderData) => {
        const uniqueId = newOrderData.id || `52CR-${Date.now().toString().slice(-6)}`;
        const newRecord: OrderRecord = {
          ...newOrderData,
          id: uniqueId,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          orders: [newRecord, ...state.orders],
        }));

        return uniqueId;
      },

      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status } : order
          ),
        }));
      },

      updateShipping: (id, courier, trackingNumber) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  courier,
                  trackingNumber,
                  status: 'shipped',
                }
              : order
          ),
        }));
      },

      getOrderById: (id) => {
        const cleanId = id.trim().toUpperCase();
        return get().orders.find(
          (o) => o.id.toUpperCase() === cleanId || o.id.replace('52CR-', '') === cleanId
        );
      },
    }),
    {
      name: '52coffee:orders-storage',
    }
  )
);
