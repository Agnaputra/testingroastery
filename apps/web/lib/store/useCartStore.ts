import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GrindOption } from '../data';

export interface CartItem {
  id: string; // composite key: `${productId}-${weightGrams}-${grind}`
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  weightGrams: number;
  weightLabel: string;
  grind: GrindOption;
  grindLabel: string;
  unitPrice: number;
  quantity: number;
  series: string;
  tastingNotes: string[];
}

export type CartItemInput = Omit<CartItem, 'id'>;

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  
  // Actions
  addItem: (item: CartItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  
  // Computed values
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (itemInput) => {
        const id = `${itemInput.productId}-${itemInput.weightGrams}-${itemInput.grind}`;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === id);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += itemInput.quantity;
          set({ items: updated, isDrawerOpen: true });
        } else {
          set({
            items: [...currentItems, { ...itemInput, id }],
            isDrawerOpen: true,
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set({ isDrawerOpen: !get().isDrawerOpen }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
      },
    }),
    {
      name: '52coffee-cart-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);
