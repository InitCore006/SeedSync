import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {typography } from '@/lib/constants/typography';
import { colors } from '@/lib/constants/colors';
import { borderRadius, spacing } from '@/lib/constants/spacing';


export interface SelectOption {
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onValueChange: (value: string) => void; // Changed from onSelect to onValueChange
  error?: string;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export default function Select({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onValueChange, // Using onValueChange
  error,
  required = false,
  disabled = false,
  containerStyle,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue); // Call onValueChange
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Select Button */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          error && styles.selectButtonError,
          disabled && styles.selectButtonDisabled,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.selectContent}>
          {selectedOption?.icon && (
            <Text style={styles.selectedIcon}>{selectedOption.icon}</Text>
          )}
          <Text
            style={[
              styles.selectText,
              !selectedOption && styles.placeholderText,
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={disabled ? colors.gray[400] : colors.text.secondary}
        />
      </TouchableOpacity>

      {/* Error Text */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity 
                onPress={() => setIsOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  {item.icon && <Text style={styles.optionIcon}>{item.icon}</Text>}
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionText,
                        item.value === value && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.description && (
                      <Text style={styles.optionDescription}>{item.description}</Text>
                    )}
                  </View>
                  {item.value === value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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

  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },

  selectButtonError: {
    borderColor: colors.error,
  },

  selectButtonDisabled: {
    backgroundColor: colors.gray[100],
    opacity: 0.6,
  },

  selectContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  selectedIcon: {
    fontSize: 20,
  },

  selectText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
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
    maxHeight: '70%',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },

  selectedOption: {
    backgroundColor: `${colors.primary}10`,
  },

  optionIcon: {
    fontSize: 24,
  },

  optionContent: {
    flex: 1,
  },

  optionText: {
    ...typography.body,
    color: colors.text.primary,
  },

  selectedOptionText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },

  optionDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
});