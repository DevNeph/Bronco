// src/screens/home/CartScreen.js
import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Divider, IconButton } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateCartItem, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import { colors } from '../../utils/theme';

const CartScreen = ({ navigation }) => {
  const { items, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  
  const incrementQuantity = (id, currentQuantity) => {
    dispatch(updateCartItem({ id, quantity: currentQuantity + 1 }));
  };
  
  const decrementQuantity = (id, currentQuantity) => {
    if (currentQuantity > 1) {
      dispatch(updateCartItem({ id, quantity: currentQuantity - 1 }));
    } else {
      dispatch(removeFromCart({ id }));
    }
  };
  
  // Özelleştirmeleri görüntülemek için yardımcı fonksiyon
  const formatCustomization = (customization) => {
    if (!customization || Object.keys(customization).length === 0) {
      return null;
    }
    
    const displayNames = {
      size: 'Boyut',
      milk: 'Süt',
      sugar: 'Şeker',
      whippedCream: 'Krema',
      type: 'Tür',
    };
    
    const valueDisplayNames = {
      small: 'Küçük',
      medium: 'Orta',
      large: 'Büyük',
      double: 'Double',
      whole: 'Tam Yağlı',
      skim: 'Yağsız',
      soy: 'Soya',
      almond: 'Badem',
      oat: 'Yulaf',
      none: 'Şekersiz',
      low: 'Az',
      medium: 'Orta',
      high: 'Çok',
      true: 'Evet',
      false: 'Hayır',
      cola: 'Kola',
      lemon: 'Limon',
      orange: 'Portakal',
      'soda water': 'Soda',
    };
    
    return Object.entries(customization).map(([key, value]) => {
      const optionName = displayNames[key] || key;
      const displayValue = typeof value === 'boolean' 
        ? (value ? 'Evet' : 'Hayır')
        : (valueDisplayNames[value] || value);
      
      return `${optionName}: ${displayValue}`;
    }).join(', ');
  };
  
  const renderCartItem = ({ item }) => {
    const itemTotal = item.product.price * item.quantity;
    
    return (
      <Card style={styles.itemCard}>
        <Card.Content>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.product.name}</Text>
            <Text style={styles.itemPrice}>{itemTotal.toFixed(2)} ₺</Text>
          </View>
          
          {formatCustomization(item.customization) && (
            <Text style={styles.customization}>
              {formatCustomization(item.customization)}
            </Text>
          )}
          
          <View style={styles.itemActions}>
            <View style={styles.quantityControls}>
              <IconButton
                icon="minus"
                size={16}
                onPress={() => decrementQuantity(item.id, item.quantity)}
              />
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <IconButton
                icon="plus"
                size={16}
                onPress={() => incrementQuantity(item.id, item.quantity)}
              />
            </View>
            
            <IconButton
              icon="delete"
              iconColor={colors.error}
              size={20}
              onPress={() => dispatch(removeFromCart({ id: item.id }))}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sepetiniz boş</Text>
        <Button
          mode="contained"
          style={styles.shopButton}
          onPress={() => navigation.navigate('Home')}
        >
          Alışverişe Başla
        </Button>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      
      <View style={styles.summaryContainer}>
        <Divider style={styles.divider} />
        
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ara Toplam:</Text>
            <Text style={styles.summaryValue}>{total.toFixed(2)} ₺</Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <Button
            mode="outlined"
            style={[styles.actionButton, styles.clearButton]}
            onPress={() => dispatch(clearCart())}
          >
            Sepeti Temizle
          </Button>
          
          <Button
            mode="contained"
            style={[styles.actionButton, styles.checkoutButton]}
            onPress={() => navigation.navigate('Checkout')}
          >
            Siparişi Tamamla
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  customization: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  summaryContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
  },
  divider: {
    marginBottom: 12,
  },
  summary: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
  },
  clearButton: {
    marginRight: 8,
  },
  checkoutButton: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 16,
  },
  shopButton: {
    marginTop: 16,
  },
});

export default CartScreen;