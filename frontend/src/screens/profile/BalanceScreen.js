// src/screens/profile/BalanceScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { fetchBalance, generateQRCode, clearQRCode } from '../../store/slices/balanceSlice';
import { colors } from '../../utils/theme';

const amounts = [20, 50, 100, 200, 500];

const BalanceScreen = () => {
  const dispatch = useDispatch();
  const { balance, qrCode, isLoading, error } = useSelector((state) => state.balance);
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  
  useEffect(() => {
    dispatch(fetchBalance());
    return () => {
      // QR kodu temizle
      dispatch(clearQRCode());
    };
  }, [dispatch]);
  
  const handleSelectAmount = (value) => {
    setAmount(value.toString());
    setCustomAmount('');
  };
  
  const handleCustomAmount = (value) => {
    setCustomAmount(value);
    setAmount('');
  };
  
  const handleGenerateQRCode = () => {
    const finalAmount = amount || customAmount;
    if (finalAmount && !isNaN(finalAmount) && parseFloat(finalAmount) > 0) {
      dispatch(generateQRCode(parseFloat(finalAmount)));
    }
  };
  
  const renderQRCodeSection = () => {
    if (!qrCode) return null;
    
    return (
      <Card style={styles.qrCard}>
        <Card.Content style={styles.qrContent}>
          <Text style={styles.qrTitle}>Bakiye Yükleme QR Kodu</Text>
          <Text style={styles.qrSubtitle}>
            Bu QR kodu baristaya gösterin ve nakit ödeme yapın.
          </Text>
          
          <View style={styles.qrContainer}>
            <QRCode
              value={qrCode.qrCode}
              size={200}
              color={colors.primary}
              backgroundColor="white"
            />
          </View>
          
          <View style={styles.qrInfo}>
            <Text style={styles.qrAmount}>
              Yüklenecek Tutar: {qrCode.amount.toFixed(2)} ₺
            </Text>
            <Text style={styles.qrExpiry}>
              Geçerlilik Süresi: {new Date(qrCode.expires).toLocaleTimeString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.balanceCard}>
          <Card.Content>
            <Text style={styles.balanceLabel}>Mevcut Bakiye</Text>
            <Text style={styles.balanceValue}>{balance.toFixed(2)} ₺</Text>
          </Card.Content>
        </Card>
        
        {!qrCode ? (
          <View>
            <Text style={styles.sectionTitle}>Bakiye Yükle</Text>
            
            <View style={styles.amountButtons}>
              {amounts.map((value) => (
                <Button
                  key={value}
                  mode={amount === value.toString() ? 'contained' : 'outlined'}
                  onPress={() => handleSelectAmount(value)}
                  style={styles.amountButton}
                  labelStyle={styles.amountButtonLabel}
                >
                  {value} ₺
                </Button>
              ))}
            </View>
            
            <Text style={styles.orText}>veya</Text>
            
            <TextInput
              label="Özel Tutar (₺)"
              value={customAmount}
              onChangeText={handleCustomAmount}
              keyboardType="numeric"
              style={styles.customAmountInput}
              mode="outlined"
            />
            
            <Button
              mode="contained"
              onPress={handleGenerateQRCode}
              loading={isLoading}
              disabled={isLoading || (!amount && !customAmount)}
              style={styles.generateButton}
              contentStyle={styles.generateButtonContent}
            >
              QR Kod Oluştur
            </Button>
            
            <Text style={styles.instruction}>
              QR kod oluşturup baristaya göstererek bakiye yükleyebilirsiniz.
            </Text>
          </View>
        ) : (
          renderQRCodeSection()
        )}
        
        <View style={styles.historyContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('BalanceHistory')}
            style={styles.historyButton}
          >
            Bakiye Geçmişini Görüntüle
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  balanceCard: {
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#777',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  amountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  amountButton: {
    margin: 4,
    minWidth: '30%',
  },
  amountButtonLabel: {
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 16,
    color: '#777',
  },
  customAmountInput: {
    marginBottom: 24,
    backgroundColor: 'white',
  },
  generateButton: {
    marginBottom: 16,
    borderRadius: 8,
  },
  generateButtonContent: {
    height: 50,
  },
  instruction: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#777',
    marginBottom: 24,
  },
  qrCard: {
    marginVertical: 24,
  },
  qrContent: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 24,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrInfo: {
    width: '100%',
  },
  qrAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  qrExpiry: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  historyContainer: {
    marginTop: 16,
  },
  historyButton: {
    borderRadius: 8,
  },
});

export default BalanceScreen;