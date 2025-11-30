import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export interface PickerItem {
  label: string;
  value: string;
}

interface PickerProps {
  label?: string;
  placeholder?: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function Picker({
  label,
  placeholder = 'Select an option',
  selectedValue,
  onValueChange,
  items,
  error,
  disabled = false,
  required = false,
}: PickerProps) {
  const [isVisible, setIsVisible] = useState(false);

  const selectedItem = items.find((item) => item.value === selectedValue);
  const displayText = selectedItem ? selectedItem.label : placeholder;

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsVisible(false);
  };

  const renderItem = ({ item }: { item: PickerItem }) => {
    const isSelected = item.value === selectedValue;

    return (
      <TouchableOpacity
        style={[styles.option, isSelected && styles.optionSelected]}
        onPress={() => handleSelect(item.value)}
        activeOpacity={0.7}
      >
        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
          {item.label}
        </Text>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}

      <Pressable
        style={[
          styles.picker,
          error && styles.pickerError,
          disabled && styles.pickerDisabled,
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.pickerText,
            !selectedValue && styles.pickerPlaceholder,
            disabled && styles.pickerTextDisabled,
          ]}
        >
          {displayText}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select'}</Text>
              <Pressable onPress={() => setIsVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  required: {
    ...typography.body,
    color: colors.error,
    marginLeft: 4,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  pickerError: {
    borderColor: colors.error,
  },
  pickerDisabled: {
    backgroundColor: colors.background,
    opacity: 0.6,
  },
  pickerText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  pickerPlaceholder: {
    color: colors.text.secondary,
  },
  pickerTextDisabled: {
    color: colors.text.secondary,
  },
  arrow: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    ...typography.h4,
    color: colors.text.secondary,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  optionText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
});