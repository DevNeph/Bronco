// src/screens/profile/EditProfileScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { updateProfile } from '../../store/slices/authSlice';
import { colors } from '../../utils/theme';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('İsim gereklidir'),
  lastName: Yup.string().required('Soyisim gereklidir'),
  phone: Yup.string()
    .matches(/^[0-9+\s]+$/, 'Geçerli bir telefon numarası giriniz')
    .required('Telefon numarası gereklidir'),
});

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  
  const handleUpdateProfile = (values) => {
    dispatch(updateProfile(values))
      .unwrap()
      .then(() => {
        navigation.goBack();
      })
      .catch((error) => {
        console.error('Profil güncellenemedi:', error);
      });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Profil Bilgilerini Düzenle</Text>
        
        {error && (
          <HelperText type="error" style={styles.errorText}>
            {error}
          </HelperText>
        )}
        
        <Formik
          initialValues={{
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleUpdateProfile}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <TextInput
                label="İsim"
                value={values.firstName}
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                error={touched.firstName && errors.firstName}
                style={styles.input}
                mode="outlined"
              />
              {touched.firstName && errors.firstName && (
                <HelperText type="error">{errors.firstName}</HelperText>
              )}
              
              <TextInput
                label="Soyisim"
                value={values.lastName}
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                error={touched.lastName && errors.lastName}
                style={styles.input}
                mode="outlined"
              />
              {touched.lastName && errors.lastName && (
                <HelperText type="error">{errors.lastName}</HelperText>
              )}
              
              <TextInput
                label="Telefon"
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                error={touched.phone && errors.phone}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />
              {touched.phone && errors.phone && (
                <HelperText type="error">{errors.phone}</HelperText>
              )}
              
              <TextInput
                label="E-posta"
                value={user?.email}
                disabled
                style={styles.input}
                mode="outlined"
              />
              <HelperText>E-posta adresi değiştirilemez.</HelperText>
              
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  Güncelle
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

export default EditProfileScreen;