import { create } from 'zustand';
import type { CartItem, CatalogItem } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: CatalogItem, quantity?: number, selectedVariant?: string, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  getTotalCents: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  addItem: (item, quantity = 1, selectedVariant, notes) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (ci) => ci.item.id === item.id && ci.selectedVariant === selectedVariant
      );
      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex].quantity += quantity;
        return { items: updated, isOpen: true };
      }
      return {
        items: [...state.items, { item, quantity, selectedVariant, notes }],
        isOpen: true,
      };
    });
  },
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((ci) => ci.item.id !== itemId),
    }));
  },
  updateQuantity: (itemId, delta) => {
    set((state) => {
      const updated = state.items
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
      return { items: updated };
    });
  },
  clearCart: () => set({ items: [] }),
  getTotalCents: () => {
    return get().items.reduce((acc, ci) => acc + ci.item.priceCents * ci.quantity, 0);
  },
  getItemCount: () => {
    return get().items.reduce((acc, ci) => acc + ci.quantity, 0);
  },
}));
