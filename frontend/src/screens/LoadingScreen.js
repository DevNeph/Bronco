// src/screens/LoadingScreen.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { colors } from '../utils/theme';

const LoadingScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        // Check if we have stored tokens
        const userStr = await AsyncStorage.getItem('user');
        const tokensStr = await AsyncStorage.getItem('tokens');
        
        if (userStr && tokensStr) {
          console.log('Tokens found, updating Redux state...');
          
          // Parse the data
          const user = JSON.parse(userStr);
          const tokens = JSON.parse(tokensStr);
          
          // Dispatch action to update Redux state
          // Bu kısmı authSlice.js'deki loadUser action'ın yapmasına izin verelim
          // Burada doğrudan navigasyon yapmak yerine,
          // AppNavigator component'ının isAuthenticated state'e göre yönlendirme yapmasını bekleyelim
          
          // Bu fonksiyon LoadingScreen'in kendisi tarafından gösteriliyor, bu yüzden
          // burada bir navigasyon yapmak gerekmiyor
          // AppNavigator zaten isAuthenticated state'e göre doğru ekrana yönlendirecek
          
          console.log('Authentication state updated, waiting for AppNavigator to handle navigation');
        } else {
          console.log('No tokens found, staying on Auth navigator');
          // Tokens not found, will stay in Auth navigator (handled by AppNavigator)
        }
      } catch (error) {
        console.error('Authentication check error:', error);
      }
    };

    checkAuth();
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Yükleniyor...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
});

export default LoadingScreen;