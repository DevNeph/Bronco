// src/screens/orders/OrderDetailsScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchOrderById, cancelOrder } from '../../store/slices/ordersSlice';
import { colors } from '../../utils/theme';

const statusColors = {
  pending: '#FFC107',    // Sarı
  accepted: '#2196F3',   // Mavi
  preparing: '#9C27B0',  // Mor
  ready: '#4CAF50',      // Yeşil
  completed: '#4CAF50',  // Yeşil
  cancelled: '#F44336',  // Kırmızı
};

const statusText = {
  pending: 'Bekleniyor',
  accepted: 'Kabul Edildi',
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

const paymentMethodText = {
  balance: 'Bakiye',
  cash: 'Nakit',
  card: 'Kart',
};

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const dispatch = useDispatch();
  const { currentOrder, isLoading, error } = useSelector((state) => state.orders);
  
  useEffect(() => {
    dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString().slice(0, 5)}`;
  };
  
  const handleCancelOrder = () => {
    dispatch(cancelOrder(orderId))
      .unwrap()
      .then(() => {
        // Başarılı iptalde bildirim gösterilebilir
      })
      .catch((error) => {
        console.error('Sipariş iptal edilemedi:', error);
      });
  };
  
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => dispatch(fetchOrderById(orderId))}>
          Tekrar Dene
        </Button>
      </View>
    );
  }
  
  if (!currentOrder) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Sipariş bulunamadı</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Geri Dön
        </Button>
      </View>
    );
  }
  
  const isActiveOrder = ['pending', 'accepted', 'preparing', 'ready'].includes(currentOrder.status);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.orderCard}>
          <Card.Content>
            <View style={styles.headerContainer}>
              <View>
                <Text style={styles.orderNumber}>
                  Sipariş #{currentOrder.id.slice(0, 8)}
                </Text>
                <Text style={styles.orderDate}>
                  {formatDate(currentOrder.createdAt)}
                </Text>
              </View>
              
              <Chip
                style={[styles.statusChip, { backgroundColor: statusColors[currentOrder.status] }]}
                textStyle={{ color: 'white' }}
              >
                {statusText[currentOrder.status]}
              </Chip>
            </View>
            
            {isActiveOrder && currentOrder.status === 'pending' && (
              <Button
                mode="outlined"
                icon="close"
                onPress={handleCancelOrder}
                style={styles.cancelButton}
                labelStyle={{ color: colors.error }}
              >
                Siparişi İptal Et
              </Button>
            )}
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Sipariş Detayları</Text>
            
            {currentOrder.items && currentOrder.items.map((item, index) => (
              <View key={item.id || index} style={styles.itemContainer}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product?.name || 'Ürün'}</Text>
                  {item.customization && Object.keys(item.customization).length > 0 && (
                    <Text style={styles.itemCustomization}>
                      {Object.entries(item.customization)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </Text>
                  )}
                </View>
                
                <View style={styles.itemPriceContainer}>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {(item.unitPrice * item.quantity).toFixed(2)} ₺
                  </Text>
                </View>
              </View>
            ))}
            
            <Divider style={styles.divider} />
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalValue}>{currentOrder.totalAmount.toFixed(2)} ₺</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.extraInfoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ödeme Yöntemi</Text>
                <Text style={styles.infoValue}>
                  {paymentMethodText[currentOrder.paymentMethod] || currentOrder.paymentMethod}
                </Text>
              </View>
              
              {currentOrder.isFreeCoffee && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bedava Kahve</Text>
                  <Text style={styles.infoValue}>Kullanıldı</Text>
                </View>
              )}
              
              {currentOrder.pickupTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Teslim Zamanı</Text>
                  <Text style={styles.infoValue}>{formatDate(currentOrder.pickupTime)}</Text>
                </View>
              )}
              
              {currentOrder.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.infoLabel}>Sipariş Notları</Text>
                  <Text style={styles.notes}>{currentOrder.notes}</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Durum Takibi</Text>
            
            <View style={styles.statusTimelineContainer}>
              {['pending', 'accepted', 'preparing', 'ready', 'completed'].map((status, index) => {
                const isCompleted = getStatusOrder(currentOrder.status) >= getStatusOrder(status);
                const isCurrent = currentOrder.status === status;
                
                return (
                  <View key={status} style={styles.statusStep}>
                    <View style={styles.statusIcon}>
                      <View
                        style={[
                          styles.statusDot,
                          isCompleted && styles.completedStatusDot,
                          isCurrent && styles.currentStatusDot
                        ]}
                      />
                      {index < 4 && (
                        <View
                          style={[
                            styles.statusLine,
                            isCompleted && styles.completedStatusLine
                          ]}
                        />
                      )}
                    </View>
                    
                    <View style={styles.statusTextContainer}>
                      <Text
                        style={[
                          styles.statusStepText,
                          (isCompleted || isCurrent) && styles.activeStatusText
                        ]}
                      >
                        {statusText[status]}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

// Durum sırasını belirlemek için yardımcı fonksiyon
const getStatusOrder = (status) => {
  const order = {
    cancelled: -1,
    pending: 0,
    accepted: 1,
    preparing: 2,
    ready: 3,
    completed: 4,
  };
  
  return order[status] || 0;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  orderCard: {
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  statusChip: {
    height: 28,
  },
  cancelButton: {
    marginTop: 8,
    borderColor: colors.error,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemCustomization: {
    fontSize: 14,
    color: '#666',
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  extraInfoContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  notesContainer: {
    marginTop: 8,
  },
  notes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  statusTimelineContainer: {
    marginTop: 8,
  },
  statusStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusIcon: {
    width: 24,
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    zIndex: 1,
  },
  statusLine: {
    position: 'absolute',
    top: 12,
    left: 12 / 2 - 1,
    width: 2,
    height: 30,
    backgroundColor: '#ddd',
  },
  completedStatusDot: {
    backgroundColor: colors.primary,
  },
  currentStatusDot: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  completedStatusLine: {
    backgroundColor: colors.primary,
  },
  statusTextContainer: {
    marginLeft: 12,
  },
  statusStepText: {
    fontSize: 14,
    color: '#777',
  },
  activeStatusText: {
    color: colors.text,
    fontWeight: 'bold',
  },
});

export default OrderDetailsScreen;