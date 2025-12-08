import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { Button, Input } from '@/components';
import { COLORS } from '@/constants/colors';
import { authAPI } from '@/services/authService';
import { RegisterData } from '@/types/api';
import { getErrorMessage, getErrorTitle, logDetailedError } from '@/utils/errorHandler';

type UserRole = 'farmer' | 'logistics';

export default function RegisterScreen() {
  const [role, setRole] = useState<UserRole>('farmer');
  const [formData, setFormData] = useState({
    phone_number: '',
    full_name: '',
    // Farmer specific
    father_name: '',
    total_land_acres: '',
    village: '',
    district: '',
    state: 'madhya_pradesh',
    pincode: '',
    // Logistics specific
    company_name: '',
    contact_person: '',
    city: '',
    vehicle_type: '',
    vehicle_number: '',
    capacity_quintals: '',
  });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.phone_number || formData.phone_number.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    if (!formData.full_name.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }

    if (role === 'farmer') {
      if (!formData.father_name.trim()) {
        Alert.alert('Validation Error', 'Please enter father\'s name');
        return false;
      }
      if (!formData.total_land_acres || parseFloat(formData.total_land_acres) <= 0) {
        Alert.alert('Validation Error', 'Please enter valid land area');
        return false;
      }
      if (!formData.district.trim()) {
        Alert.alert('Validation Error', 'Please enter district');
        return false;
      }
      if (!formData.pincode || formData.pincode.length !== 6) {
        Alert.alert('Validation Error', 'Please enter valid 6-digit pincode');
        return false;
      }
    } else {
      if (!formData.company_name.trim()) {
        Alert.alert('Validation Error', 'Please enter company name');
        return false;
      }
      if (!formData.contact_person.trim()) {
        Alert.alert('Validation Error', 'Please enter contact person');
        return false;
      }
      if (!formData.city.trim()) {
        Alert.alert('Validation Error', 'Please enter city');
        return false;
      }
      if (!formData.vehicle_type) {
        Alert.alert('Validation Error', 'Please select vehicle type');
        return false;
      }
      if (!formData.vehicle_number.trim()) {
        Alert.alert('Validation Error', 'Please enter vehicle number');
        return false;
      }
      if (!formData.capacity_quintals || parseFloat(formData.capacity_quintals) <= 0) {
        Alert.alert('Validation Error', 'Please enter valid capacity');
        return false;
      }
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    console.log('\n=== REGISTRATION ATTEMPT ===');
    console.log('Phone:', formData.phone_number);
    console.log('Name:', formData.full_name);
    console.log('Role:', role);

    setLoading(true);
    try {
      // Step 1: Register user (backend sends OTP automatically)
      // Only phone_number and role - User model fields only
      console.log('Registering user...');
      const registerData: RegisterData = {
        phone_number: formData.phone_number,
        role: role,
      };
      
      const registerResponse = await authAPI.register(registerData);
      console.log('User registered successfully');
      console.log('User ID:', registerResponse.data.user_id);
      console.log('Phone:', registerResponse.data.phone_number);

      // Prepare profile data to send after OTP verification
      // This will create UserProfile and RoleProfile (Farmer/Logistics)
      const profileData = {
        full_name: formData.full_name.trim(),
        district: formData.district.trim(),
        state: formData.state,
        pincode: formData.pincode,
        ...(role === 'farmer' 
          ? {
              father_name: formData.father_name.trim(),
              total_land_acres: parseFloat(formData.total_land_acres),
              village: formData.village.trim(),
            }
          : {
              company_name: formData.company_name.trim(),
              contact_person: formData.contact_person.trim(),
              city: formData.city.trim(),
              vehicle_type: formData.vehicle_type,
              vehicle_number: formData.vehicle_number.trim(),
              capacity_quintals: parseFloat(formData.capacity_quintals),
            }),
      };

      console.log('Navigating to OTP verification...');
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { 
          phone: formData.phone_number,
          type: 'register',
          role: role,
          user_id: registerResponse.data.user_id,
          profile_data: JSON.stringify(profileData),
        },
      });
    } catch (error: any) {
      logDetailedError(error, 'Register Screen - Registration');
      const errorTitle = getErrorTitle(error);
      const errorMessage = getErrorMessage(error);
      
      console.log('Error:', errorTitle, '-', errorMessage);
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>SeedSync</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register to get started</Text>
        </View>

        <View style={styles.form}>
          {/* Role Selection */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Account Type</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'farmer' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('farmer')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'farmer' && styles.roleButtonTextActive,
                  ]}
                >
                  Farmer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'logistics' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('logistics')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'logistics' && styles.roleButtonTextActive,
                  ]}
                >
                  Logistics Partner
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Common Fields */}
          <Input
            label="Full Name *"
            placeholder="Enter your full name"
            value={formData.full_name}
            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
          />

          <Input
            label="Phone Number *"
            placeholder="10-digit mobile number"
            value={formData.phone_number}
            onChangeText={(text) =>
              setFormData({ ...formData, phone_number: text.replace(/[^0-9]/g, '') })
            }
            keyboardType="phone-pad"
            maxLength={10}
          />

          {/* Farmer Specific Fields */}
          {role === 'farmer' && (
            <>
              <Input
                label="Father's Name *"
                placeholder="Enter father's name"
                value={formData.father_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, father_name: text })
                }
              />

              <Input
                label="Total Land (Acres) *"
                placeholder="Land area in acres"
                value={formData.total_land_acres}
                onChangeText={(text) =>
                  setFormData({ ...formData, total_land_acres: text.replace(/[^0-9.]/g, '') })
                }
                keyboardType="decimal-pad"
              />

              <Input
                label="Village"
                placeholder="Enter village name"
                value={formData.village}
                onChangeText={(text) =>
                  setFormData({ ...formData, village: text })
                }
              />

              <Input
                label="District *"
                placeholder="Enter district"
                value={formData.district}
                onChangeText={(text) =>
                  setFormData({ ...formData, district: text })
                }
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>State *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.state}
                    onValueChange={(value) =>
                      setFormData({ ...formData, state: value })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Madhya Pradesh" value="madhya_pradesh" />
                    <Picker.Item label="Maharashtra" value="maharashtra" />
                    <Picker.Item label="Rajasthan" value="rajasthan" />
                    <Picker.Item label="Gujarat" value="gujarat" />
                    <Picker.Item label="Karnataka" value="karnataka" />
                    <Picker.Item label="Telangana" value="telangana" />
                  </Picker>
                </View>
              </View>

              <Input
                label="Pincode *"
                placeholder="6-digit pincode"
                value={formData.pincode}
                onChangeText={(text) =>
                  setFormData({ ...formData, pincode: text.replace(/[^0-9]/g, '') })
                }
                keyboardType="number-pad"
                maxLength={6}
              />
            </>
          )}

          {/* Logistics Specific Fields */}
          {role === 'logistics' && (
            <>
              <Input
                label="Company Name *"
                placeholder="Enter company/business name"
                value={formData.company_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, company_name: text })
                }
              />

              <Input
                label="Contact Person *"
                placeholder="Enter contact person name"
                value={formData.contact_person}
                onChangeText={(text) =>
                  setFormData({ ...formData, contact_person: text })
                }
              />

              <Input
                label="City *"
                placeholder="Enter city"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>State *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.state}
                    onValueChange={(value) =>
                      setFormData({ ...formData, state: value })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Madhya Pradesh" value="madhya_pradesh" />
                    <Picker.Item label="Maharashtra" value="maharashtra" />
                    <Picker.Item label="Rajasthan" value="rajasthan" />
                    <Picker.Item label="Gujarat" value="gujarat" />
                    <Picker.Item label="Karnataka" value="karnataka" />
                    <Picker.Item label="Telangana" value="telangana" />
                  </Picker>
                </View>
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Vehicle Type *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.vehicle_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, vehicle_type: value })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Select vehicle type" value="" />
                    <Picker.Item label="Truck" value="truck" />
                    <Picker.Item label="Tempo" value="tempo" />
                    <Picker.Item label="Mini Truck" value="mini_truck" />
                    <Picker.Item label="Tractor-Trolley" value="tractor" />
                  </Picker>
                </View>
              </View>

              <Input
                label="Vehicle Number *"
                placeholder="e.g., MH12AB1234"
                value={formData.vehicle_number}
                onChangeText={(text) =>
                  setFormData({ ...formData, vehicle_number: text.toUpperCase() })
                }
                autoCapitalize="characters"
              />

              <Input
                label="Vehicle Capacity (Quintals) *"
                placeholder="Capacity in quintals"
                value={formData.capacity_quintals}
                onChangeText={(text) =>
                  setFormData({ ...formData, capacity_quintals: text.replace(/[^0-9.]/g, '') })
                }
                keyboardType="decimal-pad"
              />
            </>
          )}

          <Button
            title="Register"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  form: {
    width: '100%',
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.light,
  },
  roleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  roleButtonTextActive: {
    color: COLORS.primary,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
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
  registerButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
