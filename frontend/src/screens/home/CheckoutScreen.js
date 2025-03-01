// src/screens/home/CheckoutScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Card, RadioButton, TextInput, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { clearCart } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/ordersSlice';
import { colors } from '../../utils/theme';

const CheckoutScreen = ({ navigation }) => {
  const { items, total } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.balance);
  const { availableFreeCoffees } = useSelector((state) => state.loyalty);
  const { isLoading } = useSelector((state) => state.orders);
  const dispatch = useDispatch();
  
  const [paymentMethod, setPaymentMethod] = useState('balance');
  const [useFreeCoffee, setUseFreeCoffee] = useState(false);
  const [pickupTime, setPickupTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [notes, setNotes] = useState('');
  
  const isSingleCoffeeOrder = items.length === 1 && items[0].product.category === 'coffee';
  const canUseFreeCoffee = isSingleCoffeeOrder && availableFreeCoffees > 0;
  const finalTotal = useFreeCoffee ? 0 : total;
  
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setPickupTime(date);
    hideDatePicker();
  };
  
  const formatPickupTime = (date) => {
    if (!date) return 'Hemen Şimdi';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };
  
  const handleOrderSubmit = () => {
    // Sipariş verilerini hazırla
    const orderData = {
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        customization: item.customization || {}
      })),
      paymentMethod,
      useFreeCoffee,
      pickupTime: pickupTime ? pickupTime.toISOString() : null,
      notes: notes || ''
    };
    
    // Sipariş oluştur
    dispatch(createOrder(orderData))
      .unwrap()
      .then(() => {
        dispatch(clearCart());
        navigation.navigate('OrderSuccess');
      })
      .catch((error) => {
        console.error('Sipariş işlemi başarısız:', error);
      });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Sipariş Özeti</Text>
            
            {items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>
                    {item.product.name} x {item.quantity}
                  </Text>
                  
                  {item.customization && Object.keys(item.customization).length > 0 && (
                    <Text style={styles.customization}>
                      {Object.entries(item.customization)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </Text>
                  )}
                </View>
                
                <Text style={styles.itemPrice}>
                  {(item.product.price * item.quantity).toFixed(2)} ₺
                </Text>
              </View>
            ))}
            
            <Divider style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalValue}>{total.toFixed(2)} ₺</Text>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Teslimat Zamanı</Text>
            
            <TouchableOpacity 
              style={styles.timeSelector}
              onPress={showDatePicker}
            >
              <Text style={styles.timeSelectorText}>
                {pickupTime ? formatPickupTime(pickupTime) : 'Hemen Şimdi'}
              </Text>
            </TouchableOpacity>
            
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="time"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              date={new Date()}
              minimumDate={new Date()}
            />
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Ödeme Yöntemi</Text>
            
            <RadioButton.Group
              onValueChange={(value) => setPaymentMethod(value)}
              value={paymentMethod}
            >
              <View style={styles.radioItem}>
                <RadioButton.Android value="balance" color={colors.primary} />
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>Bakiye</Text>
                  <Text style={styles.radioSubtitle}>
                    Mevcut bakiye: {balance.toFixed(2)} ₺
                  </Text>
                </View>
              </View>
              
              <View style={styles.radioItem}>
                <RadioButton.Android value="cash" color={colors.primary} />
                <Text style={styles.radioLabel}>Nakit</Text>
              </View>
              
              <View style={styles.radioItem}>
                <RadioButton.Android value="card" color={colors.primary} />
                <Text style={styles.radioLabel}>Kart ile Ödeme</Text>
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>
        
        {canUseFreeCoffee && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.freeCoffeeRow}>
                <View>
                  <Text style={styles.sectionTitle}>Bedava Kahve Kullan</Text>
                  <Text style={styles.freeCoffeeSubtitle}>
                    {availableFreeCoffees} bedava kahve hakkınız var
                  </Text>
                </View>
                
                <RadioButton.Android
                  status={useFreeCoffee ? 'checked' : 'unchecked'}
                  onPress={() => setUseFreeCoffee(!useFreeCoffee)}
                  color={colors.primary}
                />
              </View>
            </Card.Content>
          </Card>
        )}
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Sipariş Notları</Text>
            
            <TextInput
              mode="outlined"
              value={notes}
              onChangeText={setNotes}
              placeholder="Siparişiniz ile ilgili notlarınız"
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>Ödenecek Tutar</Text>
              <Text style={styles.finalTotalValue}>{finalTotal.toFixed(2)} ₺</Text>
            </View>
            
            {paymentMethod === 'balance' && finalTotal > balance && (
              <Text style={styles.errorText}>
                Yetersiz bakiye. Lütfen başka bir ödeme yöntemi seçin.
              </Text>
            )}
            
            <Button
              mode="contained"
              style={styles.submitButton}
              onPress={handleOrderSubmit}
              loading={isLoading}
              disabled={
                isLoading || 
                (paymentMethod === 'balance' && finalTotal > balance)
              }
            >
              Siparişi Tamamla
            </Button>
          </Card.Content>
        </Card>
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
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemDetails: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    fontSize: 16,
  },
  customization: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timeSelector: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  timeSelectorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
  },
  radioSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  freeCoffeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freeCoffeeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  notesInput: {
    backgroundColor: 'white',
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  finalTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 8,
  },
});

export default CheckoutScreen;