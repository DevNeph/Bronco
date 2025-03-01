// src/screens/home/OrderSuccessScreen.js
import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { colors } from '../../utils/theme';

const OrderSuccessScreen = ({ navigation }) => {
  const { latestOrder } = useSelector((state) => state.orders);

  // Ana ekrana dönmek için
  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LottieView
          source={require('../../assets/animations/success.json')}
          autoPlay
          loop={false}
          style={styles.animation}
        />

        <Text style={styles.title}>Siparişiniz Alındı!</Text>
        <Text style={styles.subtitle}>
          Siparişiniz başarıyla alındı ve hazırlanmaya başlandı.
        </Text>

        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>
            Sipariş No: {latestOrder?.id?.substring(0, 8) || ''}
          </Text>
          <Text style={styles.orderTime}>
            Tahmini Hazırlık Süresi: 5-10 dk
          </Text>
        </View>

        <Text style={styles.thankYou}>
          Bizi tercih ettiğiniz için teşekkür ederiz!
        </Text>

        <Button
          mode="contained"
          style={styles.button}
          onPress={goToHome}
        >
          Ana Sayfaya Dön
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  orderInfo: {
    backgroundColor: '#f5f5f5',
    width: '100%',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderTime: {
    fontSize: 16,
  },
  thankYou: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 8,
  },
});

export default OrderSuccessScreen;