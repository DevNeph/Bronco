// src/screens/loyalty/LoyaltyScreen.js
import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, ProgressBar, Button, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchLoyaltyStatus } from '../../store/slices/loyaltySlice';
import { colors } from '../../utils/theme';

const LoyaltyScreen = () => {
  const dispatch = useDispatch();
  const { 
    coffeeCount, 
    freeCoffees, 
    usedCoffees, 
    availableFreeCoffees,
    progress,
    progressPercentage,
    coffeeThreshold,
    enabled,
    isLoading,
    error
  } = useSelector((state) => state.loyalty);

  useEffect(() => {
    dispatch(fetchLoyaltyStatus());
  }, [dispatch]);

  const renderCoffeeIcons = () => {
    const icons = [];
    for (let i = 0; i < coffeeThreshold; i++) {
      const isFilled = i < progress;
      icons.push(
        <Ionicons
          key={i}
          name={isFilled ? 'cafe' : 'cafe-outline'}
          size={24}
          color={isFilled ? colors.primary : '#ccc'}
          style={styles.coffeeIcon}
        />
      );
    }
    return icons;
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => dispatch(fetchLoyaltyStatus())}>
          Tekrar Dene
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Sadakat Programı</Text>
            <Text style={styles.cardSubtitle}>
              {coffeeThreshold} kahvede 1 kahve bedava!
            </Text>

            <View style={styles.progressContainer}>
              <ProgressBar
                progress={progressPercentage / 100}
                color={colors.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {progress} / {coffeeThreshold}
              </Text>
            </View>

            <View style={styles.coffeeIconsContainer}>
              {renderCoffeeIcons()}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Bedava Kahve Kuponlarım</Text>
            
            {availableFreeCoffees > 0 ? (
              <View style={styles.couponContainer}>
                <View style={styles.couponInfo}>
                  <Ionicons name="gift" size={32} color={colors.primary} />
                  <View style={styles.couponTextContainer}>
                    <Text style={styles.couponTitle}>
                      {availableFreeCoffees} Bedava Kahve Hakkınız Var
                    </Text>
                    <Text style={styles.couponDescription}>
                      Dilediğiniz zaman kullanabilirsiniz.
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.couponInstructions}>
                  Siparişinizi verirken kullanmak için ödeme adımında "Bedava Kahve Kullan" seçeneğini işaretleyin.
                </Text>
              </View>
            ) : (
              <View style={styles.noCouponContainer}>
                <Ionicons name="cafe-outline" size={48} color="#ccc" />
                <Text style={styles.noCouponText}>
                  Henüz bedava kahve kuponunuz yok.
                </Text>
                <Text style={styles.noCouponDescription}>
                  {coffeeThreshold - progress} kahve daha alarak bir bedava kahve kazanabilirsiniz.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Sadakat Puanlarım</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{coffeeCount}</Text>
                <Text style={styles.statLabel}>Toplam Kahve</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{freeCoffees}</Text>
                <Text style={styles.statLabel}>Kazanılan Kupon</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usedCoffees}</Text>
                <Text style={styles.statLabel}>Kullanılan Kupon</Text>
              </View>
            </View>
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
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'right',
    fontSize: 14,
    color: '#666',
  },
  coffeeIconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  coffeeIcon: {
    margin: 4,
  },
  couponContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  couponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  couponTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  couponDescription: {
    fontSize: 14,
    color: '#666',
  },
  couponInstructions: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  noCouponContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noCouponText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noCouponDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
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
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default LoyaltyScreen;