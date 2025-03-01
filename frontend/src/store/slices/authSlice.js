// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(email, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, firstName, lastName, phone }, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(email, password, firstName, lastName, phone);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

// Load user data from storage
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await AsyncStorage.getItem('user');
      const tokens = await AsyncStorage.getItem('tokens');
      
      if (!user || !tokens) {
        return null;
      }
      
      return { 
        user: JSON.parse(user), 
        tokens: JSON.parse(tokens) 
      };
    } catch (error) {
      return rejectWithValue('Failed to load user data');
    }
  }
);

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.tokens = {
          accessToken: action.payload.data.accessToken,
          refreshToken: action.payload.data.refreshToken,
        };
        
        // Save to AsyncStorage
        AsyncStorage.setItem('user', JSON.stringify(action.payload.data.user));
        AsyncStorage.setItem('tokens', JSON.stringify({
          accessToken: action.payload.data.accessToken,
          refreshToken: action.payload.data.refreshToken,
        }));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.tokens = {
          accessToken: action.payload.data.accessToken,
          refreshToken: action.payload.data.refreshToken,
        };
        
        // Save to AsyncStorage
        AsyncStorage.setItem('user', JSON.stringify(action.payload.data.user));
        AsyncStorage.setItem('tokens', JSON.stringify({
          accessToken: action.payload.data.accessToken,
          refreshToken: action.payload.data.refreshToken,
        }));
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        
        // Clear AsyncStorage
        AsyncStorage.removeItem('user');
        AsyncStorage.removeItem('tokens');
      })
      
      // Load user
      .addCase(loadUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;