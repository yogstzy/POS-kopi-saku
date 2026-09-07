// src/store/useCartStore.ts
import { create } from "zustand";

// 1. Mendefinisikan bentuk data Item Keranjang
export interface CartItem {
  id: number;
  nama: string;
  harga: number;
  qty: number;
}

// 2. Mendefinisikan aksi-aksi yang bisa dilakukan di keranjang
interface CartState {
  items: CartItem[]; // Daftar pesanan
  tambahItem: (produk: { id: number; nama: string; harga: number }) => void;
  kurangiItem: (id: number) => void;
  hapusItem: (id: number) => void;
  bersihkanKeranjang: () => void;
  hitungTotal: () => number;
}

// 3. Membuat Store Zustand
export const useCartStore = create<CartState>((set, get) => ({
  items: [], // Awalnya keranjang kosong

  // Logika Menambah Item
  tambahItem: (produk) => {
    set((state) => {
      // Cek apakah kopi ini sudah ada di keranjang?
      const itemAda = state.items.find((item) => item.id === produk.id);
      
      if (itemAda) {
        // Jika sudah ada, tambahkan quantity (qty) + 1
        return {
          items: state.items.map((item) =>
            item.id === produk.id ? { ...item, qty: item.qty + 1 } : item
          ),
        };
      } else {
        // Jika belum ada, masukkan sebagai item baru dengan qty = 1
        return { items: [...state.items, { ...produk, qty: 1 }] };
      }
    });
  },

  // Logika Mengurangi Item
  kurangiItem: (id) => {
    set((state) => {
      const itemAda = state.items.find((item) => item.id === id);
      
      // Jika kuantitas saat ini adalah 1, dan diklik minus, maka hapus dari keranjang
      if (itemAda?.qty === 1) {
        return { items: state.items.filter((item) => item.id !== id) };
      }
      
      // Jika lebih dari 1, cukup kurangi kuantitasnya
      return {
        items: state.items.map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        ),
      };
    });
  },
  // Logika Menghapus 1 Macam Kopi dari keranjang
  hapusItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  // Logika Mengosongkan Keranjang (setelah bayar)
  bersihkanKeranjang: () => {
    set({ items: [] });
  },

  // Logika Menghitung Total Harga (qty * harga)
  hitungTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.harga * item.qty, 0);
  },
}));