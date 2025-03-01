// src/store/slices/balanceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/apiClient';

export const fetchBalance = createAsyncThunk(
  'balance/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/balance');
      return response.data.data.balance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Bakiye bilgisi alınamadı');
    }
  }
);

export const fetchBalanceHistory = createAsyncThunk(
  'balance/fetchBalanceHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/balance/history', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Bakiye geçmişi alınamadı');
    }
  }
);

export const generateQRCode = createAsyncThunk(
  'balance/generateQRCode',
  async (amount, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/balance/generate-qr', { amount });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'QR kod oluşturulamadı');
    }
  }
);

const initialState = {
  balance: 0,
  transactions: [],
  qrCode: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
};

const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    clearBalanceError: (state) => {
      state.error = null;
    },
    clearQRCode: (state) => {
      state.qrCode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch balance
      .addCase(fetchBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload;
      })
      .addCase(fetchBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch balance history
      .addCase(fetchBalanceHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBalanceHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchBalanceHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Generate QR code
      .addCase(generateQRCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateQRCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.qrCode = action.payload;
      })
      .addCase(generateQRCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBalanceError, clearQRCode } = balanceSlice.actions;
export default balanceSlice.reducer;