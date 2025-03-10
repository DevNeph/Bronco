// src/screens/auth/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice'; // Import login action
import { colors } from '../../utils/theme';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi gereklidir'),
  password: Yup.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Şifre gereklidir'),
});

const LoginScreen = ({ navigation }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  // Debug info for platform
  useEffect(() => {
    console.log(`Running on platform: ${Platform.OS}`);
  }, []);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Login form submitted:', values.email);
        setIsLoading(true);
        setError(null);
        
        // Redux login action'ını dispatch et
        await dispatch(login({ 
          email: values.email, 
          password: values.password
        })).unwrap();
        
        console.log('Redux login action dispatched');
        
      } catch (err) {
        console.error('Login error:', err);
        setError(err?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
        Alert.alert(
          'Giriş Hatası',
          err?.message || 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.'
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const { handleChange, handleSubmit, handleBlur, values, errors, touched } = formik;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Giriş Yap</Text>
          <Text style={styles.subHeaderText}>
            Hesabınıza giriş yaparak siparişlerinizi yönetin ve puanlarınızı takip edin.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {error && (
            <HelperText type="error" style={styles.errorText}>
              {error}
            </HelperText>
          )}

          <TextInput
            label="E-posta"
            value={values.email}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            error={touched.email && errors.email}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
          />
          {touched.email && errors.email && (
            <HelperText type="error">{errors.email}</HelperText>
          )}

          <TextInput
            label="Şifre"
            value={values.password}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            error={touched.password && errors.password}
            secureTextEntry={secureTextEntry}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
            left={<TextInput.Icon icon="lock" />}
          />
          {touched.password && errors.password && (
            <HelperText type="error">{errors.password}</HelperText>
          )}

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Giriş Yap
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabınız yok mu?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.8,
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.text,
  },
  registerText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 10,
  },
});

export default LoginScreen;