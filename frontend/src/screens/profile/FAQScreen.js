// src/screens/profile/FAQScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/theme';

// Sıkça sorulan sorular listesi
const faqData = [
  {
    id: '1',
    category: 'Uygulama',
    question: 'Uygulamayı nasıl kullanabilirim?',
    answer: 'Bronco Coffee uygulamasını kullanmak için öncelikle bir hesap oluşturmalısınız. Kayıt olduktan sonra, sepetinize ürün ekleyebilir, siparişinizi tamamlayabilir ve bakiyenizi yönetebilirsiniz.'
  },
  {
    id: '2',
    category: 'Uygulama',
    question: 'Şifremi unuttum, ne yapmalıyım?',
    answer: 'Giriş ekranında "Şifremi Unuttum" seçeneğine tıklayarak e-posta adresinizi girebilirsiniz. Size şifre sıfırlama bağlantısı içeren bir e-posta göndereceğiz.'
  },
  {
    id: '3',
    category: 'Siparişler',
    question: '"Birazdan Oradayım" özelliği nasıl çalışır?',
    answer: 'Siparişinizi oluşturduktan sonra, teslim almak istediğiniz zamanı seçebilirsiniz. Böylece siparişiniz belirttiğiniz zamanda hazır olacak ve siz sadece almaya geleceksiniz.'
  },
  {
    id: '4',
    category: 'Siparişler',
    question: 'Siparişimi iptal edebilir miyim?',
    answer: 'Evet, "Bekleyen" durumundaki siparişlerinizi iptal edebilirsiniz. Siparişler ekranından ilgili siparişin detaylarına gidip "Siparişi İptal Et" butonuna tıklayabilirsiniz.'
  },
  {
    id: '5',
    category: 'Ödeme',
    question: 'Bakiye yükleme işlemi nasıl yapılır?',
    answer: 'Profil ekranından "Bakiye Yükle" seçeneğine tıklayarak, yüklemek istediğiniz tutarı belirleyebilir ve QR kod oluşturabilirsiniz. Bu QR kodu cafe\'de baristaya gösterin ve nakit ödeme yapın.'
  },
  {
    id: '6',
    category: 'Ödeme',
    question: 'Hangi ödeme yöntemlerini kullanabilirim?',
    answer: 'Şu anda nakit, kart ve uygulama bakiyesi ile ödeme yapabilirsiniz. Yakın zamanda daha fazla ödeme seçeneği eklenecektir.'
  },
  {
    id: '7',
    category: 'Sadakat',
    question: 'Sadakat programı nasıl çalışır?',
    answer: 'Her 10 kahve siparişinizde 1 kahve bedava kazanırsınız. Kahve sayacınız uygulama üzerinden takip edilir ve bedava kahve hakkı kazandığınızda otomatik olarak hesabınıza tanımlanır.'
  },
  {
    id: '8',
    category: 'Sadakat',
    question: 'Bedava kahvemi nasıl kullanabilirim?',
    answer: 'Sipariş verirken ödeme ekranında "Bedava Kahve Kullan" seçeneğini işaretleyerek bedava kahve hakkınızı kullanabilirsiniz.'
  }
];

const FAQScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  
  // Filter FAQs based on search and category
  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const toggleQuestion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const categories = [
    { id: 'Tümü', label: 'Tümü' },
    { id: 'Uygulama', label: 'Uygulama' },
    { id: 'Siparişler', label: 'Siparişler' },
    { id: 'Ödeme', label: 'Ödeme' },
    { id: 'Sadakat', label: 'Sadakat' }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Sıkça Sorulan Sorular</Text>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Soru ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={colors.primary}
        />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScrollView}>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text 
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.selectedCategoryButtonText
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <ScrollView style={styles.faqContainer}>
        <View style={styles.faqWrapper}>
          {filteredFAQs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity 
                style={styles.questionContainer}
                onPress={() => toggleQuestion(faq.id)}
              >
                <Text style={styles.questionText}>{faq.question}</Text>
                <Ionicons 
                  name={expandedId === faq.id ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#666"
                />
              </TouchableOpacity>
              
              {expandedId === faq.id && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              )}
              
              <Divider style={styles.divider} />
            </View>
          ))}
          
          {filteredFAQs.length === 0 && (
            <View style={styles.emptyResultContainer}>
              <Text style={styles.emptyResultText}>Arama sonucuna uygun soru bulunamadı.</Text>
            </View>
          )}
        </View>
        
        <View style={styles.contactContainer}>
          <Text style={styles.contactText}>
            Başka sorularınız mı var? Bizimle iletişime geçin:
          </Text>
          <Text style={styles.contactEmail}>info@broncocoffee.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4037',
    padding: 16,
    paddingBottom: 0,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    borderRadius: 20,
    height: 45,
    backgroundColor: 'white',
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  categoriesScrollView: {
    maxHeight: 55,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    alignItems: 'center',
    height: 50,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  selectedCategoryButton: {
    backgroundColor: '#5D4037',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  faqContainer: {
    flex: 1,
    marginTop: 10,
  },
  faqWrapper: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 16,
    marginTop: 8,
    padding: 8,
    overflow: 'hidden',
  },
  faqItem: {
    paddingVertical: 4,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5D4037',
    flex: 1,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  emptyResultContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyResultText: {
    color: '#666',
    fontSize: 14,
  },
  contactContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 0,
    marginBottom: 30,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D4037',
  },
});

export default FAQScreen;