// src/screens/admin/AdminOrderDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Örnek sipariş verisi
const mockOrder = {
  id: '1234abcd',
  userId: 'user123',
  status: 'pending',
  createdAt: new Date().toISOString(),
  pickupTime: new Date(Date.now() + 15 * 60000).toISOString(),
  totalAmount: 45.5,
  paymentMethod: 'balance',
  isFreeCoffee: false,
  notes: 'Lütfen şekersiz hazırlayın.',
  items: [
    { 
      id: 1, 
      product: { 
        id: 'prod1', 
        name: 'Latte', 
        price: 18.0 
      }, 
      quantity: 2,
      unitPrice: 18.0,
      customization: { 
        milk: 'oat', 
        sugar: 'none' 
      }
    },
    { 
      id: 2, 
      product: { 
        id: 'prod2', 
        name: 'Croissant', 
        price: 9.5 
      }, 
      quantity: 1,
      unitPrice: 9.5,
      customization: {}
    }
  ],
  user: {
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    email: 'ahmet@example.com',
    phone: '+901234567890'
  }
};

const AdminOrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Gerçek uygulamada burada API çağrısı yapılır
    // Şimdilik mock veri kullanıyoruz
    setTimeout(() => {
      setOrder(mockOrder);
      setIsLoading(false);
    }, 500);
  }, [orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString().slice(0, 5)}`;
  };

  const handleStatusUpdate = (newStatus) => {
    // Gerçek uygulamada API çağrısı yapılır
    setOrder(prev => ({ ...prev, status: newStatus }));
  };

  const renderStatusButtons = () => {
    if (!order) return null;

    switch (order.status) {
      case 'pending':
        return (
          <View style={styles.buttonGroup}>
            <Button 
              mode="contained" 
              style={styles.actionButton}
              onPress={() => handleStatusUpdate('accepted')}
            >
              Kabul Et
            </Button>
            <Button 
              mode="outlined" 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleStatusUpdate('cancelled')}
            >
              İptal Et
            </Button>
          </View>
        );
      case 'accepted':
        return (
          <Button 
            mode="contained" 
            style={styles.actionButton}
            onPress={() => handleStatusUpdate('preparing')}
          >
            Hazırlanıyor
          </Button>
        );
      case 'preparing':
        return (
          <Button 
            mode="contained" 
            style={styles.actionButton}
            onPress={() => handleStatusUpdate('ready')}
          >
            Hazır
          </Button>
        );
      case 'ready':
        return (
          <Button 
            mode="contained" 
            style={styles.actionButton}
            onPress={() => handleStatusUpdate('completed')}
          >
            Teslim Edildi
          </Button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Sipariş bulunamadı</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Geri Dön
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderNumber}>
                  Sipariş #{order.id.slice(0, 8)}
                </Text>
                <Text style={styles.orderDate}>
                  {formatDate(order.createdAt)}
                </Text>
              </View>
              
              <Chip
                style={[styles.statusChip, { backgroundColor: statusColors[order.status] }]}
                textStyle={{ color: 'white' }}
              >
                {statusText[order.status]}
              </Chip>
            </View>

            {renderStatusButtons()}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
            
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>
                {order.user.firstName} {order.user.lastName}
              </Text>
              <Text style={styles.customerContact}>
                {order.user.phone}
              </Text>
              <Text style={styles.customerContact}>
                {order.user.email}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Sipariş Detayları</Text>
            
            {order.items.map((item, index) => (
              <View key={item.id || index} style={styles.itemContainer}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.product.name} x{item.quantity}
                  </Text>
                  
                  {item.customization && Object.keys(item.customization).length > 0 && (
                    <Text style={styles.itemCustomization}>
                      {Object.entries(item.customization)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </Text>
                  )}
                </View>
                
                <Text style={styles.itemPrice}>
                  {(item.unitPrice * item.quantity).toFixed(2)} ₺
                </Text>
              </View>
            ))}
            
            <Divider style={styles.divider} />
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalValue}>{order.totalAmount.toFixed(2)} ₺</Text>
            </View>
            
            <View style={styles.paymentDetails}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Ödeme Yöntemi</Text>
                <Text style={styles.paymentValue}>
                  {order.paymentMethod === 'balance' ? 'Bakiye' : 
                   order.paymentMethod === 'cash' ? 'Nakit' : 'Kart'}
                </Text>
              </View>
              
              {order.isFreeCoffee && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Bedava Kahve</Text>
                  <Text style={styles.paymentValue}>Kullanıldı</Text>
                </View>
              )}
              
              {order.pickupTime && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Teslim Zamanı</Text>
                  <Text style={styles.paymentValue}>{formatDate(order.pickupTime)}</Text>
                </View>
              )}
            </View>
            
            {order.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Sipariş Notları</Text>
                <Text style={styles.notes}>{order.notes}</Text>
              </View>
            )}
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
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  orderHeader: {
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
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  customerDetails: {
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerContact: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
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
    marginBottom: 16,
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
  paymentDetails: {
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#555',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  notesContainer: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: colors.error,
  },
});

export default AdminOrderDetailsScreen;