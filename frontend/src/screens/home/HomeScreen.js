// src/screens/home/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchProducts } from '../../store/slices/productsSlice';
import { colors } from '../../utils/theme';

const categories = [
  { id: 'all', name: 'Tümü' },
  { id: 'coffee', name: 'Kahveler' },
  { id: 'tea', name: 'Çaylar' },
  { id: 'food', name: 'Yiyecekler' },
  { id: 'dessert', name: 'Tatlılar' },
  { id: 'other', name: 'Diğer' },
];

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { products, isLoading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const onChangeSearch = (query) => setSearchQuery(query);

  const filteredProducts = products.filter((product) => {
    // Kategori filtresi
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    // Arama filtresi
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
    
    return categoryMatch && (nameMatch || descriptionMatch);
  });

  const renderCategoryItem = ({ item }) => (
    <Chip
      mode="outlined"
      selected={selectedCategory === item.id}
      onPress={() => setSelectedCategory(item.id)}
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.selectedCategoryChip,
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedCategory === item.id && styles.selectedCategoryChipText,
      ]}
    >
      {item.name}
    </Chip>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <Card>
        <Card.Cover
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/300x200?text=Bronco+Coffee' }}
          style={styles.productImage}
        />
        <Card.Content style={styles.productContent}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{item.price.toFixed(2)} ₺</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Merhaba, {user?.firstName || 'Misafir'}!
        </Text>
        
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <Searchbar
        placeholder="Ara..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Ürünler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Ürün bulunamadı.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  cartButton: {
    padding: 8,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#fff',
    borderColor: colors.primary,
  },
  selectedCategoryChip: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    color: colors.text,
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  productsList: {
    padding: 8,
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    padding: 8,
    maxWidth: '50%',
  },
  productImage: {
    height: 140,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productContent: {
    padding: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  loaderContainer: {
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
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    height: 200,
  },
  emptyText: {
    color: colors.text,
    textAlign: 'center',
  },
});

export default HomeScreen;