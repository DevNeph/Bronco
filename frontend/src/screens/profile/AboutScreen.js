// src/screens/profile/AboutScreen.js
import React from 'react';
import { View, StyleSheet, ScrollView, Image, Linking } from 'react-native';
import { Text, Card, Divider, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/theme';

const AboutScreen = () => {
  const appVersion = '1.0.0';
  
  const openWebsite = () => {
    Linking.openURL('https://www.broncocoffee.com');
  };
  
  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.broncocoffee.com/privacy-policy');
  };
  
  const openTermsOfService = () => {
    Linking.openURL('https://www.broncocoffee.com/terms-of-service');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>BRONCO</Text>
          <Text style={styles.tagline}>Kahve Dükkanı</Text>
        </View>
        
        <Text style={styles.versionText}>Versiyon {appVersion}</Text>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Hakkımızda</Text>
            <Text style={styles.paragraph}>
              Bronco Kahve Dükkanı, 2018 yılında İstanbul'da kurulmuş, kaliteli kahve deneyimi sunmayı amaçlayan bir kafedir. 
              Taze çekirdeklerimiz, uzman baristalarımız ve samimi ortamımızla müşterilerimize en iyi kahve deneyimini sunmayı hedefliyoruz.
            </Text>
            <Text style={styles.paragraph}>
              Uygulamamız sayesinde siparişlerinizi önceden verebilir, sadakat programımıza katılabilir ve ödeme işlemlerinizi kolayca gerçekleştirebilirsiniz.
            </Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>İletişim</Text>
            
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={24} color={colors.primary} style={styles.contactIcon} />
              <View>
                <Text style={styles.contactLabel}>Adres</Text>
                <Text style={styles.contactText}>
                  Bronco Kahve Dükkanı, Bağdat Caddesi No:123, Kadıköy, İstanbul
                </Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={24} color={colors.primary} style={styles.contactIcon} />
              <View>
                <Text style={styles.contactLabel}>Telefon</Text>
                <Text style={styles.contactText}>+90 (212) 123 45 67</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} style={styles.contactIcon} />
              <View>
                <Text style={styles.contactLabel}>E-posta</Text>
                <Text style={styles.contactText}>info@broncocoffee.com</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={24} color={colors.primary} style={styles.contactIcon} />
              <View>
                <Text style={styles.contactLabel}>Çalışma Saatleri</Text>
                <Text style={styles.contactText}>
                  Hafta içi: 08:00 - 22:00{'\n'}
                  Cumartesi: 09:00 - 23:00{'\n'}
                  Pazar: 09:00 - 21:00
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Yasal</Text>
            
            <Button
              mode="outlined"
              icon="file-document-outline"
              style={styles.legalButton}
              onPress={openPrivacyPolicy}
            >
              Gizlilik Politikası
            </Button>
            
            <Button
              mode="outlined"
              icon="file-document-outline"
              style={styles.legalButton}
              onPress={openTermsOfService}
            >
              Kullanım Koşulları
            </Button>
            
            <Button
              mode="outlined"
              icon="web"
              style={styles.legalButton}
              onPress={openWebsite}
            >
              Web Sitesi
            </Button>
          </Card.Content>
        </Card>
        
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} Bronco Kahve Dükkanı. Tüm hakları saklıdır.
        </Text>
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
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
  tagline: {
    fontSize: 18,
    color: colors.accent,
    marginTop: 8,
  },
  versionText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#777',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.primary,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
    color: colors.text,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  contactIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
  },
  divider: {
    marginVertical: 8,
  },
  legalButton: {
    marginVertical: 8,
    borderColor: colors.primary,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: '#777',
    marginTop: 16,
  },
});

export default AboutScreen;