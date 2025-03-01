// src/screens/auth/WelcomeScreen.js
import React from 'react';
import { View, StyleSheet, Image, ImageBackground } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { colors } from '../../utils/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = ({ navigation }) => {
  return (
    <ImageBackground
      //source={require('../../assets/coffee-bg.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>BRONCO</Text>
          <Text style={styles.tagline}>Kahve Dükkanı</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.welcomeText}>
            Hoş Geldiniz
          </Text>
          <Text style={styles.descriptionText}>
            Bronco Kahve Dükkanı uygulamasıyla siparişlerinizi kolayca verin,
            sadakat puanları kazanın ve özel fırsatlardan yararlanın.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate('Login')}
          >
            Giriş Yap
          </Button>
          
          <Button
            mode="outlined"
            style={[styles.button, styles.registerButton]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.registerButtonLabel}
            onPress={() => navigation.navigate('Register')}
          >
            Kayıt Ol
          </Button>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  button: {
    marginVertical: 10,
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  registerButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;