// Checkout store - manages checkout form state

import { create } from 'zustand';

interface CheckoutStore {
  customerName: string;
  notes: string;
  paymentMethod: 'card' | 'counter';
  setCustomerName: (name: string) => void;
  setNotes: (notes: string) => void;
  setPaymentMethod: (method: 'card' | 'counter') => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()((set) => ({
  customerName: '',
  notes: '',
  paymentMethod: 'counter',
  
  setCustomerName: (name) => set({ customerName: name }),
  
  setNotes: (notes) => set({ notes }),
  
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  
  reset: () => set({
    customerName: '',
    notes: '',
    paymentMethod: 'counter',
  }),
}));
