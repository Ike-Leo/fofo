import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
    isOpen: boolean;
    sessionId: string | null;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    setSessionId: (id: string) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            isOpen: false,
            sessionId: null,
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            setSessionId: (id) => set({ sessionId: id }),
        }),
        {
            name: 'uccp-cart-storage',
            partialize: (state) => ({ sessionId: state.sessionId }), // Only persist session ID
        }
    )
);
