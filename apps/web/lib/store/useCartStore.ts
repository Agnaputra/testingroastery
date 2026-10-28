import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GrindOption } from '../data';

export interface CartItem {
  id: string; // product, weight, variant, and grind selection identify a cart line
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
  componentSlugs?: string[];
  blendComponents?: Array<{ slug: string; ratio: number }>;
}

export type CartItemInput = Omit<CartItem, 'id'>;

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  lastAddedName: string | null;
  
  // Actions
  addItem: (item: CartItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  dismissToast: () => void;
  
  // Computed values
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      lastAddedName: null,

      addItem: (itemInput) => {
        const id = `${itemInput.productId}-${itemInput.weightGrams}-${itemInput.weightLabel}-${itemInput.grind}-${itemInput.grindLabel}`;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) =>
          i.productId === itemInput.productId && i.weightGrams === itemInput.weightGrams
          && i.weightLabel === itemInput.weightLabel && i.grind === itemInput.grind
          && i.grindLabel === itemInput.grindLabel
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += itemInput.quantity;
          set({ items: updated, lastAddedName: itemInput.name });
        } else {
          set({
            items: [...currentItems, { ...itemInput, id }],
            lastAddedName: itemInput.name,
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
      dismissToast: () => set({ lastAddedName: null }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
      },
    }),
    {
      name: '52coffee-cart-storage',
      partialize: (state) => ({ items: state.items }),
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);
