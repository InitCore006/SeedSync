import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { Button, Input } from '@/components';
import { COLORS } from '@/constants/colors';
import { authAPI } from '@/services/authService';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    phone_number: '',
    name: '',
    user_type: 'farmer',
    organization_name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.phone_number || formData.phone_number.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(formData);
      await authAPI.sendOTP(formData.phone_number);
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone: formData.phone_number, type: 'register' },
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Input
            label="Phone Number"
            placeholder="Enter 10-digit phone number"
            value={formData.phone_number}
            onChangeText={(text) =>
              setFormData({ ...formData, phone_number: text })
            }
            keyboardType="phone-pad"
            maxLength={10}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>User Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.user_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, user_type: value })
                }
                style={styles.picker}
              >
                <Picker.Item label="Farmer" value="farmer" />
                <Picker.Item label="FPO" value="fpo" />
                <Picker.Item label="Processor" value="processor" />
                <Picker.Item label="Retailer" value="retailer" />
              </Picker>
            </View>
          </View>

          {(formData.user_type === 'fpo' ||
            formData.user_type === 'processor' ||
            formData.user_type === 'retailer') && (
            <Input
              label="Organization Name"
              placeholder="Enter organization name"
              value={formData.organization_name}
              onChangeText={(text) =>
                setFormData({ ...formData, organization_name: text })
              }
            />
          )}

          <Button
            title="Register"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Button
              title="Login"
              onPress={() => router.back()}
              variant="outline"
              size="small"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  form: {
    width: '100%',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 50,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
});
