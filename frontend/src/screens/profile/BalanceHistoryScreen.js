// src/screens/profile/BalanceHistoryScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, Button, Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchBalanceHistory } from '../../store/slices/balanceSlice';
import { colors } from '../../utils/theme';

const BalanceHistoryScreen = () => {
  const dispatch = useDispatch();
  const { transactions, isLoading, error, totalCount, currentPage, totalPages } = useSelector((state) => state.balance);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadTransactions();
  }, []);
  
  const loadTransactions = (page = 1) => {
    dispatch(fetchBalanceHistory({ page, limit: 10 }));
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions().finally(() => setRefreshing(false));
  };
  
  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoading) {
      loadTransactions(currentPage + 1);
    }
  };
  
  const getTransactionTypeText = (type) => {
    switch (type) {
      case 'deposit':
        return 'Bakiye Yükleme';
      case 'withdrawal':
        return 'Bakiye Kullanımı';
      case 'refund':
        return 'İade';
      default:
        return type;
    }
  };
  
  const getTransactionTypeChip = (type) => {
    switch (type) {
      case 'deposit':
        return 'Yükleme';
      case 'withdrawal':
        return 'Kullanım';
      case 'refund':
        return 'İade';
      default:
        return type;
    }
  };
  
  const renderTransactionItem = ({ item }) => {
    const isPositive = item.amount > 0;
    
    return (
      <Card style={styles.transactionCard}>
        <Card.Content>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDate}>
                {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
              </Text>
              <Text style={styles.transactionType}>
                {getTransactionTypeText(item.type)}
              </Text>
            </View>
            
            <Text style={[
              styles.transactionAmount,
              isPositive ? styles.positiveAmount : styles.negativeAmount
            ]}>
              {isPositive ? '+' : ''}{item.amount.toFixed(2)} ₺
            </Text>
          </View>
          
          {item.description && (
            <Text style={styles.transactionDescription}>
              {item.description}
            </Text>
          )}
          
          <View style={styles.transactionFooter}>
            <Chip style={styles.typeChip}>
              {getTransactionTypeChip(item.type)}
            </Chip>
            <Text style={styles.balanceAfter}>
              Bakiye: {item.balanceAfter.toFixed(2)} ₺
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  const renderFooter = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };
  
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={handleRefresh}>
          Tekrar Dene
        </Button>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bakiye Geçmişi</Text>
        {totalCount > 0 && (
          <Text style={styles.totalCount}>{totalCount} işlem</Text>
        )}
      </View>
      
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz bakiye işlemi yok</Text>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalCount: {
    fontSize: 14,
    color: '#777',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    color: '#777',
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#F44336',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  typeChip: {
    height: 28,
  },
  balanceAfter: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loaderFooter: {
    padding: 16,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 200,
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
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
});

export default BalanceHistoryScreen;