// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('Login attempt started in Redux:', email);
      
      const response = await AuthService.login(email, password);
      console.log('Login API call succeeded in Redux');
      
      // Save tokens immediately after successful response
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
      await AsyncStorage.setItem('tokens', JSON.stringify({
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      }));
      console.log('User data and tokens saved to AsyncStorage from Redux');
      
      return response.data;
    } catch (error) {
      console.error('Login failed in Redux:', error.message);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, firstName, lastName, phone }, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(email, password, firstName, lastName, phone);
      
      // Save tokens immediately
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
      await AsyncStorage.setItem('tokens', JSON.stringify({
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      }));
      
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
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('tokens');
      
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
      console.log('Loading user from AsyncStorage in Redux...');
      const user = await AsyncStorage.getItem('user');
      const tokens = await AsyncStorage.getItem('tokens');
      
      if (!user || !tokens) {
        console.log('No user or tokens found in AsyncStorage');
        return null;
      }
      
      console.log('User and tokens found in AsyncStorage, updating Redux state');
      return { 
        user: JSON.parse(user), 
        tokens: JSON.parse(tokens) 
      };
    } catch (error) {
      console.error('Failed to load user data:', error);
      return rejectWithValue('Failed to load user data');
    }
  }
);

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,  // Başlangıçta yükleniyor durumunda başla
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
      })
      
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;