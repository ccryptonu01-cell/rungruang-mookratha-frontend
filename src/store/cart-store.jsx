import { create } from 'zustand';

const useCartStore = create((set) => ({
  cartItems: [],
  tableNumber: "",

  addToCart: (item) =>
    set((state) => {
      const exists = state.cartItems.find((i) => i.id === item.id);
      if (exists) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return {
        cartItems: [...state.cartItems, { ...item, qty: 1 }],
      };
    }),

  increaseQty: (id) =>
    set((state) => ({
      cartItems: state.cartItems.map((i) =>
        i.id === id ? { ...i, qty: i.qty + 1 } : i
      ),
    })),

  decreaseQty: (id) =>
    set((state) => ({
      cartItems: state.cartItems
        .map((i) =>
          i.id === id ? { ...i, qty: i.qty - 1 } : i
        )
        .filter((i) => i.qty > 0),
    })),

  removeFromCart: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.id !== id),
    })),

  clearCart: () => set({ cartItems: [] }),

  setTableNumber: (number) => set({ tableNumber: number }),
}));

export default useCartStore;
