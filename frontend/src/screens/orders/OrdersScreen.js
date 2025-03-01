// src/screens/orders/OrdersScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserOrders } from '../../store/slices/ordersSlice';
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

const OrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector((state) => state.orders);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('active');
  
  useEffect(() => {
    loadOrders();
  }, [activeFilter]);
  
  const loadOrders = () => {
    let params = { limit: 20, page: 1 };
    
    // Aktif siparişler için filtre
    if (activeFilter === 'active') {
      params.status = ['pending', 'accepted', 'preparing', 'ready'].join(',');
    }
    // Geçmiş siparişler için filtre
    else if (activeFilter === 'past') {
      params.status = ['completed', 'cancelled'].join(',');
    }
    
    dispatch(fetchUserOrders(params));
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders().finally(() => setRefreshing(false));
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString().slice(0, 5)}`;
  };
  
  const renderOrderItem = ({ item }) => {
    const isActiveOrder = ['pending', 'accepted', 'preparing', 'ready'].includes(item.status);
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
      >
        <Card style={styles.orderCard}>
          <Card.Content>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderNumber}>Sipariş #{item.id.slice(0, 8)}</Text>
                <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
              </View>
              
              <Chip
                style={[styles.statusChip, { backgroundColor: statusColors[item.status] }]}
                textStyle={{ color: 'white' }}
              >
                {statusText[item.status]}
              </Chip>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.orderInfo}>
              <Text style={styles.itemCount}>
                {item.items?.length || 0} ürün
              </Text>
              
              <Text style={styles.totalAmount}>
                {item.totalAmount.toFixed(2)} ₺
              </Text>
            </View>
            
            {item.pickupTime && (
              <Text style={styles.pickupTime}>
                Teslim Zamanı: {formatDate(item.pickupTime)}
              </Text>
            )}
            
            {isActiveOrder && (
              <View style={styles.ctaContainer}>
                <Button
                  mode="contained"
                  compact
                  onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
                  style={styles.detailsButton}
                >
                  Detaylar
                </Button>
                
                {item.status === 'pending' && (
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleCancelOrder(item.id)}
                    style={styles.cancelButton}
                    labelStyle={{ color: colors.error }}
                  >
                    İptal Et
                  </Button>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'active' && styles.activeFilterButton
          ]}
          onPress={() => setActiveFilter('active')}
        >
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === 'active' && styles.activeFilterButtonText
            ]}
          >
            Aktif Siparişler
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'past' && styles.activeFilterButton
          ]}
          onPress={() => setActiveFilter('past')}
        >
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === 'past' && styles.activeFilterButtonText
            ]}
          >
            Geçmiş Siparişler
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button mode="contained" onPress={handleRefresh}>
                Tekrar Dene
              </Button>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>Sipariş Bulunamadı</Text>
              <Text style={styles.emptyText}>
                {activeFilter === 'active'
                  ? 'Aktif siparişiniz bulunmamaktadır.'
                  : 'Geçmiş siparişiniz bulunmamaktadır.'}
              </Text>
              
              {activeFilter === 'active' && (
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Home')}
                  style={styles.orderButton}
                >
                  Sipariş Ver
                </Button>
              )}
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeFilterButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 16,
    color: '#777',
  },
  activeFilterButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  orderCard: {
    marginBottom: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
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
  divider: {
    marginVertical: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickupTime: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 12,
  },
  ctaContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  detailsButton: {
    marginRight: 8,
  },
  cancelButton: {
    borderColor: colors.error,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 300,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 24,
  },
  orderButton: {
    borderRadius: 8,
  },
});

export default OrdersScreen;