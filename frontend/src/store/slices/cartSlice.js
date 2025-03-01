// src/store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, customization } = action.payload;
      
      // Aynı ürün ve özelleştirme ile zaten varsa güncelle
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.customization) === JSON.stringify(customization)
      );
      
      if (existingItemIndex >= 0) {
        // Mevcut öğeyi güncelle
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Yeni öğe ekle
        state.items.push({
          id: Date.now().toString(),
          product,
          quantity,
          customization,
        });
      }
      
      // Toplam tutarı güncelle
      state.total = state.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
    },
    
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      
      // Öğeyi bul ve güncelle
      const itemIndex = state.items.findIndex((item) => item.id === id);
      
      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = quantity;
      }
      
      // Toplam tutarı güncelle
      state.total = state.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
    },
    
    removeFromCart: (state, action) => {
      const { id } = action.payload;
      
      // Öğeyi sepetten kaldır
      state.items = state.items.filter((item) => item.id !== id);
      
      // Toplam tutarı güncelle
      state.total = state.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { addToCart, updateCartItem, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;