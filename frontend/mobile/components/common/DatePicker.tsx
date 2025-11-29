import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ViewStyle,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';


interface DatePickerProps {
  label?: string;
  value?: string; // Changed to string (ISO format: YYYY-MM-DD)
  onChange: (date: string) => void; // Changed to return string
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  placeholder?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  error,
  required = false,
  disabled = false,
  containerStyle,
  placeholder = 'Select date',
}: DatePickerProps) {
  const [show, setShow] = useState(false);
  
  // Convert string to Date or use current date
  const dateValue = value ? new Date(value) : new Date();
  const [tempDate, setTempDate] = useState(dateValue);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'set' && selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        // Convert Date to ISO string (YYYY-MM-DD)
        const isoDate = selectedDate.toISOString().split('T')[0];
        onChange(isoDate);
      }
    }
  };

  const handleConfirm = () => {
    // Convert Date to ISO string (YYYY-MM-DD)
    const isoDate = tempDate.toISOString().split('T')[0];
    onChange(isoDate);
    setShow(false);
  };

  const handleCancel = () => {
    setTempDate(dateValue);
    setShow(false);
  };

  // Format display value
  const displayValue = value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : placeholder;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Date Button */}
      <TouchableOpacity
        style={[
          styles.dateButton,
          error && styles.dateButtonError,
          disabled && styles.dateButtonDisabled,
        ]}
        onPress={() => !disabled && setShow(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={value ? colors.primary : colors.gray[400]}
        />
        <Text
          style={[
            styles.dateText,
            !value && styles.placeholderText,
          ]}
        >
          {displayValue}
        </Text>
      </TouchableOpacity>

      {/* Error Text */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* iOS Date Picker Modal */}
      {show && Platform.OS === 'ios' && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.confirmButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor={colors.text.primary}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android Date Picker */}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode={mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },

  label: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  required: {
    color: colors.error,
  },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    gap: spacing.sm,
  },

  dateButtonError: {
    borderColor: colors.error,
  },

  dateButtonDisabled: {
    backgroundColor: colors.gray[100],
    opacity: 0.6,
  },

  dateText: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
  },

  placeholderText: {
    color: colors.text.secondary,
  },

  errorText: {
    ...typography.captionSmall,
    color: colors.error,
    marginTop: spacing.xs,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  cancelButton: {
    ...typography.body,
    color: colors.gray[600],
  },

  confirmButton: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
});