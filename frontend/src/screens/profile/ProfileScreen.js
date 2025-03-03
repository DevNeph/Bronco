// src/screens/profile/ProfileScreen.js
import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Avatar, Card, Button, List, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchBalance } from '../../store/slices/balanceSlice';
import { logout } from '../../store/slices/authSlice';
import { colors } from '../../utils/theme';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.balance);
  
  useEffect(() => {
    dispatch(fetchBalance());
  }, [dispatch]);
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Avatar.Text 
            size={80} 
            label={getInitials(user?.firstName, user?.lastName)} 
            backgroundColor={colors.primary} 
          />
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        
        <Card style={styles.balanceCard}>
          <Card.Content style={styles.balanceContent}>
            <View>
              <Text style={styles.balanceLabel}>Bakiyeniz</Text>
              <Text style={styles.balanceValue}>{balance.toFixed(2)} ₺</Text>
            </View>
            <Button 
              mode="contained"
              onPress={() => navigation.navigate('Balance')}
              style={styles.balanceButton}
            >
              Bakiye İşlemleri
            </Button>
          </Card.Content>
        </Card>
        
        <View style={styles.menuContainer}>
          <List.Section>
            <List.Subheader style={styles.menuHeader}>Hesap</List.Subheader>
            
            <List.Item
              title="Profil Bilgileri"
              left={props => <List.Icon {...props} icon="account" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.menuItem}
            />
            
            <Divider />
            
            <List.Item
              title="Şifre Değiştir"
              left={props => <List.Icon {...props} icon="lock" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('ChangePassword')}
              style={styles.menuItem}
            />
            
            <Divider />
            
            <List.Subheader style={styles.menuHeader}>Bakiye</List.Subheader>
            
            <List.Item
              title="Bakiye Yükle"
              left={props => <List.Icon {...props} icon="cash-plus" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Balance')}
              style={styles.menuItem}
            />
            
            <Divider />
            
            <List.Item
              title="Bakiye Geçmişi"
              left={props => <List.Icon {...props} icon="history" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('BalanceHistory')}
              style={styles.menuItem}
            />
            
            <Divider />
            
            <List.Subheader style={styles.menuHeader}>Uygulama</List.Subheader>
            
            
            <Divider />
            
            <List.Item
              title="Sıkça Sorulan Sorular"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('FAQ')}
              style={styles.menuItem}
            />

            <List.Item
              title="Hakkında"
              left={props => <List.Icon {...props} icon="information" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('About')}
              style={styles.menuItem}
            />
            
            <Divider />
          </List.Section>
        </View>
        
        <Button 
          mode="outlined" 
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          labelStyle={styles.logoutButtonLabel}
        >
          Çıkış Yap
        </Button>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
    marginTop: 4,
  },
  balanceCard: {
    marginBottom: 24,
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#777',
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  balanceButton: {
    borderRadius: 8,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  menuItem: {
    paddingVertical: 8,
  },
  logoutButton: {
    borderColor: colors.error,
    marginBottom: 24,
    borderRadius: 8,
  },
  logoutButtonContent: {
    height: 50,
  },
  logoutButtonLabel: {
    color: colors.error,
    fontSize: 16,
  },
});

export default ProfileScreen;