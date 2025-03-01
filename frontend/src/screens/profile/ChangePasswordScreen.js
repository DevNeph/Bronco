// src/screens/profile/ChangePasswordScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Snackbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { changePassword } from '../../store/slices/authSlice';
import { colors } from '../../utils/theme';

const validationSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Mevcut şifrenizi giriniz'),
  newPassword: Yup.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Yeni şifre gereklidir'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Şifreler eşleşmiyor')
    .required('Şifre onayı gereklidir'),
});

const ChangePasswordScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [secureCurrentPassword, setSecureCurrentPassword] = useState(true);
  const [secureNewPassword, setSecureNewPassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  
  const handleChangePassword = (values, { resetForm }) => {
    dispatch(changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    }))
      .unwrap()
      .then(() => {
        resetForm();
        setShowSnackbar(true);
      })
      .catch((error) => {
        console.error('Şifre değiştirme başarısız:', error);
      });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Şifre Değiştir</Text>
        
        {error && (
          <HelperText type="error" style={styles.errorText}>
            {error}
          </HelperText>
        )}
        
        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleChangePassword}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <TextInput
                label="Mevcut Şifre"
                value={values.currentPassword}
                onChangeText={handleChange('currentPassword')}
                onBlur={handleBlur('currentPassword')}
                error={touched.currentPassword && errors.currentPassword}
                secureTextEntry={secureCurrentPassword}
                style={styles.input}
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon={secureCurrentPassword ? 'eye' : 'eye-off'}
                    onPress={() => setSecureCurrentPassword(!secureCurrentPassword)}
                  />
                }
              />
              {touched.currentPassword && errors.currentPassword && (
                <HelperText type="error">{errors.currentPassword}</HelperText>
              )}
              
              <TextInput
                label="Yeni Şifre"
                value={values.newPassword}
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                error={touched.newPassword && errors.newPassword}
                secureTextEntry={secureNewPassword}
                style={styles.input}
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon={secureNewPassword ? 'eye' : 'eye-off'}
                    onPress={() => setSecureNewPassword(!secureNewPassword)}
                  />
                }
              />
              {touched.newPassword && errors.newPassword && (
                <HelperText type="error">{errors.newPassword}</HelperText>
              )}
              
              <TextInput
                label="Yeni Şifre Tekrar"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword && errors.confirmPassword}
                secureTextEntry={secureConfirmPassword}
                style={styles.input}
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon={secureConfirmPassword ? 'eye' : 'eye-off'}
                    onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                  />
                }
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <HelperText type="error">{errors.confirmPassword}</HelperText>
              )}
              
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  Şifreyi Değiştir
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={[styles.button, styles.cancelButton]}
                  contentStyle={styles.buttonContent}
                >
                  İptal
                </Button>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
      
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        action={{
          label: 'Tamam',
          onPress: () => setShowSnackbar(false),
        }}
      >
        Şifreniz başarıyla değiştirildi.
      </Snackbar>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: colors.primary,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginBottom: 12,
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  cancelButton: {
    borderColor: '#ccc',
  },
  errorText: {
    marginBottom: 16,
    fontSize: 14,
  },
});

export default ChangePasswordScreen;