// src/screens/LoadingScreen.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../utils/theme';

const LoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // AsyncStorage'dan token'ı oku
        const token = await AsyncStorage.getItem('userToken');

        // Eğer token varsa, doğrulama için API çağrısı yapılabilir
        if (token) {
          // Örneğin: API'ye token doğrulama isteği gönderin
          // const response = await fetch('https://yourapi.com/verifyToken', {
          //   method: 'GET',
          //   headers: {
          //     'Authorization': `Bearer ${token}`,
          //   },
          // });
          // const result = await response.json();
          // if (response.ok && result.valid) {
          //   navigation.replace('AdminDashboard');
          // } else {
          //   navigation.replace('Auth');
          // }

          // Şimdilik token varsa doğrudan AdminDashboard'e yönlendiriyoruz
          navigation.replace('AdminDashboard');
        } else {
          // Token yoksa, giriş ekranına yönlendir
          navigation.replace('Auth');
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        // Hata durumunda da giriş ekranına yönlendir
        navigation.replace('Auth');
      }
    };

    checkAuth();
  }, [navigation]);

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
