// src/screens/admin/ScanQRScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, Card, Title, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { colors } from '../../utils/theme';

const ScanQRScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    try {
      // QR formatı: userId:uniqueId:amount
      const parts = data.split(':');
      if (parts.length === 3) {
        const [userId, uniqueId, qrAmount] = parts;
        setQrData({
          userId,
          uniqueId,
          amount: parseFloat(qrAmount)
        });
        setAmount(qrAmount);
      } else {
        Alert.alert('Hata', 'Geçersiz QR kod formatı');
        setQrData(null);
      }
    } catch (error) {
      Alert.alert('Hata', 'QR kod işlenirken bir hata oluştu');
      setQrData(null);
    }
  };

  const handleProcessPayment = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar giriniz');
      return;
    }

    setIsProcessing(true);

    // Gerçek uygulamada, burada API çağrısı yapılırdı
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Başarılı',
        `${parseFloat(amount).toFixed(2)} ₺ tutarında bakiye başarıyla yüklendi.`,
        [
          {
            text: 'Tamam',
            onPress: () => {
              setScanned(false);
              setQrData(null);
              setAmount('');
              navigation.navigate('AdminDashboard');
            }
          }
        ]
      );
    }, 1500);
  };

  const resetScan = () => {
    setScanned(false);
    setQrData(null);
    setAmount('');
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Kamera erişimi reddedildi</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Geri Dön
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!scanned ? (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.scanner}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerTarget} />
          </View>
          <Text style={styles.scannerText}>
            Müşterinin QR kodunu tarayın
          </Text>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Bakiye Yükleme</Title>
              
              {qrData && (
                <View style={styles.qrInfo}>
                  <Text style={styles.userIdText}>Kullanıcı ID: {qrData.userId}</Text>
                </View>
              )}
              
              <TextInput
                label="Yüklenecek Tutar (₺)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />
              
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleProcessPayment}
                  loading={isProcessing}
                  disabled={isProcessing || !amount}
                  style={styles.processButton}
                >
                  Bakiye Yükle
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={resetScan}
                  disabled={isProcessing}
                  style={styles.resetButton}
                >
                  Yeniden Tara
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  scanner: {
    ...StyleSheet.absoluteFillObject,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerTarget: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  scannerText: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: 16,
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  qrInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  userIdText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginTop: 8,
  },
  processButton: {
    marginBottom: 12,
  },
  resetButton: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
    padding: 16,
  },
  button: {
    margin: 16,
  },
});

export default ScanQRScreen;