// src/screens/admin/OrderManagementScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
const mockOrders = [
  {
    id: '1234abcd',
    userId: 'user123',
    status: 'pending',
    createdAt: new Date().toISOString(),
    pickupTime: new Date(Date.now() + 15 * 60000).toISOString(),
    totalAmount: 45.5,
    items: [
      { id: 1, productName: 'Latte', quantity: 2 },
      { id: 2, productName: 'Croissant', quantity: 1 }
    ],
    userName: 'Ahmet Yılmaz'
  },
  {
    id: '5678efgh',
    userId: 'user456',
    status: 'accepted',
    createdAt: new Date().toISOString(),
    pickupTime: new Date(Date.now() + 10 * 60000).toISOString(),
    totalAmount: 32.0,
    items: [
      { id: 3, productName: 'Americano', quantity: 1 },
      { id: 4, productName: 'Cheesecake', quantity: 1 }
    ],
    userName: 'Ayşe Demir'
  }
];

const OrderManagementScreen = ({ navigation }) => {
  const [orders, setOrders] = useState(mockOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('active');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString().slice(0, 5)}`;
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    // Gerçek bir uygulamada, burada API çağrısı yapılır
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const renderStatusButtons = (order) => {
    switch (order.status) {
      case 'pending':
        return (
          <View style={styles.buttonGroup}>
            <Button 
              mode="contained" 
              style={styles.acceptButton}
              onPress={() => handleStatusUpdate(order.id, 'accepted')}
            >
              Kabul Et
            </Button>
            <Button 
              mode="outlined" 
              style={styles.cancelButton}
              onPress={() => handleStatusUpdate(order.id, 'cancelled')}
            >
              İptal Et
            </Button>
          </View>
        );
      case 'accepted':
        return (
          <Button 
            mode="contained" 
            onPress={() => handleStatusUpdate(order.id, 'preparing')}
          >
            Hazırlanıyor
          </Button>
        );
      case 'preparing':
        return (
          <Button 
            mode="contained" 
            onPress={() => handleStatusUpdate(order.id, 'ready')}
          >
            Hazır
          </Button>
        );
      case 'ready':
        return (
          <Button 
            mode="contained" 
            onPress={() => handleStatusUpdate(order.id, 'completed')}
          >
            Teslim Edildi
          </Button>
        );
      default:
        return null;
    }
  };

  const renderOrderItem = ({ item }) => {
    const isActiveOrder = ['pending', 'accepted', 'preparing', 'ready'].includes(item.status);
    
    if (activeFilter === 'active' && !isActiveOrder) return null;
    if (activeFilter === 'completed' && item.status !== 'completed') return null;
    if (activeFilter === 'cancelled' && item.status !== 'cancelled') return null;

    return (
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
          
          <Text style={styles.customerName}>{item.userName}</Text>
          
          <View style={styles.orderItems}>
            {item.items.map((item, index) => (
              <Text key={index} style={styles.item}>
                {item.productName} x{item.quantity}
              </Text>
            ))}
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.infoLabel}>Toplam:</Text>
            <Text style={styles.infoValue}>{item.totalAmount.toFixed(2)} ₺</Text>
          </View>
          
          {item.pickupTime && (
            <View style={styles.orderInfo}>
              <Text style={styles.infoLabel}>Teslim Zamanı:</Text>
              <Text style={styles.infoValue}>{formatDate(item.pickupTime)}</Text>
            </View>
          )}
          
          <View style={styles.actionContainer}>
            <Button 
              mode="outlined" 
              style={styles.detailButton}
              onPress={() => navigation.navigate('AdminOrderDetails', { orderId: item.id })}
            >
              Detaylar
            </Button>
            
            {isActiveOrder && renderStatusButtons(item)}
          </View>
        </Card.Content>
      </Card>
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
              styles.filterText,
              activeFilter === 'active' && styles.activeFilterText
            ]}
          >
            Aktif
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'completed' && styles.activeFilterButton
          ]}
          onPress={() => setActiveFilter('completed')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'completed' && styles.activeFilterText
            ]}
          >
            Tamamlanan
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'cancelled' && styles.activeFilterButton
          ]}
          onPress={() => setActiveFilter('cancelled')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'cancelled' && styles.activeFilterText
            ]}
          >
            İptal Edilen
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Sipariş bulunamadı</Text>
          </View>
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
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: '#777',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  orderCard: {
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderItems: {
    marginBottom: 12,
  },
  item: {
    fontSize: 14,
    marginBottom: 4,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailButton: {
    marginRight: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  acceptButton: {
    marginRight: 8,
  },
  cancelButton: {
    borderColor: colors.error,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
});

export default OrderManagementScreen;