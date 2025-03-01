// src/screens/home/ProductDetailsScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Divider, Chip, RadioButton } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { addToCart } from '../../store/slices/cartSlice';
import { colors } from '../../utils/theme';

const ProductDetailsScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const dispatch = useDispatch();
  
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState({});
  
  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleCustomizationChange = (option, value) => {
    setCustomization({
      ...customization,
      [option]: value,
    });
  };
  
  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product,
        quantity,
        customization,
      })
    );
    
    navigation.navigate('Cart');
  };
  
  const renderCustomizationOptions = () => {
    if (!product.customizationOptions || Object.keys(product.customizationOptions).length === 0) {
      return null;
    }
    
    return (
      <View style={styles.customizationContainer}>
        <Text style={styles.sectionTitle}>Özelleştirme</Text>
        
        {Object.entries(product.customizationOptions).map(([option, values]) => {
          // Size, milk, sugar gibi özelleştirme seçenekleri
          const optionKey = option.toLowerCase();
          
          // Boolean değerler için chip kullanıyoruz (örn: whippedCream)
          if (Array.isArray(values) && values.length === 2 && typeof values[0] === 'boolean') {
            return (
              <View key={optionKey} style={styles.customizationOption}>
                <Text style={styles.optionTitle}>
                  {getOptionDisplayName(option)}
                </Text>
                <View style={styles.booleanOption}>
                  <Chip
                    selected={customization[optionKey] === true}
                    onPress={() => handleCustomizationChange(optionKey, true)}
                    style={[
                      styles.booleanChip,
                      customization[optionKey] === true && styles.selectedChip,
                    ]}
                  >
                    Evet
                  </Chip>
                  <Chip
                    selected={customization[optionKey] === false}
                    onPress={() => handleCustomizationChange(optionKey, false)}
                    style={[
                      styles.booleanChip,
                      customization[optionKey] === false && styles.selectedChip,
                    ]}
                  >
                    Hayır
                  </Chip>
                </View>
              </View>
            );
          }
          
          // Dizi seçenekleri için radio button kullanıyoruz
          return (
            <View key={optionKey} style={styles.customizationOption}>
              <Text style={styles.optionTitle}>
                {getOptionDisplayName(option)}
              </Text>
              <RadioButton.Group
                onValueChange={(value) => handleCustomizationChange(optionKey, value)}
                value={customization[optionKey]}
              >
                <View style={styles.radioGroup}>
                  {values.map((value) => (
                    <View key={value} style={styles.radioButton}>
                      <RadioButton value={value} color={colors.primary} />
                      <Text>{getValueDisplayName(value)}</Text>
                    </View>
                  ))}
                </View>
              </RadioButton.Group>
            </View>
          );
        })}
      </View>
    );
  };
  
  // Özelleştirme seçeneklerinin görünen isimlerini düzenleme
  const getOptionDisplayName = (option) => {
    const displayNames = {
      size: 'Boyut',
      milk: 'Süt',
      sugar: 'Şeker',
      whippedCream: 'Krema',
      type: 'Tür',
    };
    
    return displayNames[option] || option;
  };
  
  // Özelleştirme değerlerinin görünen isimlerini düzenleme
  const getValueDisplayName = (value) => {
    const displayNames = {
      // Boyutlar
      small: 'Küçük',
      medium: 'Orta',
      large: 'Büyük',
      double: 'Double',
      
      // Sütler
      whole: 'Tam Yağlı',
      skim: 'Yağsız',
      soy: 'Soya',
      almond: 'Badem',
      oat: 'Yulaf',
      
      // Şeker
      none: 'Şekersiz',
      low: 'Az',
      medium: 'Orta',
      high: 'Çok',
      
      // İçecek türleri
      cola: 'Kola',
      lemon: 'Limon',
      orange: 'Portakal',
      'soda water': 'Soda',
    };
    
    return displayNames[value] || value;
  };
  
  const totalPrice = product.price * quantity;
  
  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.imageUrl || 'https://via.placeholder.com/400x300?text=Bronco+Coffee' }}
        style={styles.productImage}
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price.toFixed(2)} ₺</Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.description}>{product.description}</Text>
        
        <Divider style={styles.divider} />
        
        <View style={styles.quantitySelector}>
          <Text style={styles.sectionTitle}>Adet</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={quantity <= 1 ? '#ccc' : colors.text}
              />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {renderCustomizationOptions()}
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Toplam:</Text>
          <Text style={styles.totalPrice}>{totalPrice.toFixed(2)} ₺</Text>
        </View>
        
        <Button
          mode="contained"
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
          onPress={handleAddToCart}
        >
          Sepete Ekle
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  productImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  divider: {
    marginVertical: 16,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  quantitySelector: {
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  customizationContainer: {
    marginBottom: 16,
  },
  customizationOption: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  booleanOption: {
    flexDirection: 'row',
  },
  booleanChip: {
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 4,
  },
});

export default ProductDetailsScreen;