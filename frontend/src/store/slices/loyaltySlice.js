// src/store/slices/loyaltySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/apiClient';

export const fetchLoyaltyStatus = createAsyncThunk(
  'loyalty/fetchLoyaltyStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/loyalty');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Sadakat bilgisi alınamadı');
    }
  }
);

export const useFreeCoffee = createAsyncThunk(
  'loyalty/useFreeCoffee',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/loyalty/use-free-coffee');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Bedava kahve kullanılamadı');
    }
  }
);

const initialState = {
  coffeeCount: 0,
  freeCoffees: 0,
  usedCoffees: 0,
  availableFreeCoffees: 0,
  progress: 0,
  progressPercentage: 0,
  coffeeThreshold: 10,
  enabled: true,
  isLoading: false,
  error: null,
};

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {
    clearLoyaltyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch loyalty status
      .addCase(fetchLoyaltyStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLoyaltyStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coffeeCount = action.payload.coffeeCount;
        state.freeCoffees = action.payload.freeCoffees;
        state.usedCoffees = action.payload.usedCoffees;
        state.availableFreeCoffees = action.payload.availableFreeCoffees;
        state.progress = action.payload.progress;
        state.progressPercentage = action.payload.progressPercentage;
        state.coffeeThreshold = action.payload.coffeeThreshold;
        state.enabled = action.payload.enabled;
      })
      .addCase(fetchLoyaltyStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Use free coffee
      .addCase(useFreeCoffee.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(useFreeCoffee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coffeeCount = action.payload.coffeeCount;
        state.freeCoffees = action.payload.freeCoffees;
        state.usedCoffees = action.payload.usedCoffees;
        state.availableFreeCoffees = action.payload.availableFreeCoffees;
      })
      .addCase(useFreeCoffee.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLoyaltyError } = loyaltySlice.actions;
export default loyaltySlice.reducer;