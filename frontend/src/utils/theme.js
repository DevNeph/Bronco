// src/utils/theme.js
import { DefaultTheme } from 'react-native-paper';

export const colors = {
  primary: '#5D4037',  // Koyu kahverengi
  accent: '#795548',   // Açık kahverengi
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#333333',
  border: '#dddddd',
  notification: '#ff9800',
  success: '#4caf50',
  error: '#f44336',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.card,
    text: colors.text,
    error: colors.error,
  },
  roundness: 8,
};