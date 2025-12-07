import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker as RNPicker } from '@react-native-picker/picker';
import { COLORS } from '@/constants/colors';

interface PickerOption {
  label: string;
  value: string;
}

interface PickerProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: PickerOption[];
  placeholder?: string;
  error?: string;
}

export const Picker: React.FC<PickerProps> = ({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  error,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.pickerWrapper, error && styles.pickerError]}>
        <RNPicker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          {options.map((option, index) => (
            <RNPicker.Item
              key={index}
              label={option.label}
              value={option.value}
            />
          ))}
        </RNPicker>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  pickerError: {
    borderColor: COLORS.error,
  },
  picker: {
    height: 50,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
});
