import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { GOVERNMENT_SCHEMES } from '@/constants/governmentSchemes';

export default function SchemeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = GOVERNMENT_SCHEMES.find(s => s.id === id);

  if (!scheme) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Scheme not found</Text>
        </View>
      </View>
    );
  }

  const handleApply = () => {
    Alert.alert(
      'Apply Online',
      `You will be redirected to the official government portal to apply for ${scheme.name}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            Linking.openURL(scheme.applyUrl).catch(() => {
              Alert.alert('Error', 'Could not open the application portal');
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{scheme.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{scheme.category}</Text>
          </View>
          <Text style={styles.shortDesc}>{scheme.shortDesc}</Text>
        </View>

        {/* Full Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>About This Scheme</Text>
          </View>
          <Text style={styles.sectionText}>{scheme.fullDesc}</Text>
        </View>

        {/* Eligibility */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-done-circle" size={24} color={COLORS.success} />
            <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
          </View>
          {scheme.eligibility.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="gift" size={24} color={COLORS.warning} />
            <Text style={styles.sectionTitle}>Key Benefits</Text>
          </View>
          {scheme.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* How to Apply */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="clipboard" size={24} color={COLORS.info} />
            <Text style={styles.sectionTitle}>How to Apply</Text>
          </View>
          {scheme.howToApply.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Apply Button */}
        <View style={styles.applySection}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <Ionicons name="open-outline" size={20} color={COLORS.white} />
            <Text style={styles.applyButtonText}>Apply Online</Text>
          </TouchableOpacity>
          <Text style={styles.applyNote}>
            You will be redirected to the official government portal
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    lineHeight: 32,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  shortDesc: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  sectionText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 22,
    paddingTop: 4,
  },
  applySection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: 12,
    alignItems: 'center',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  applyNote: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    marginTop: 12,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text.secondary,
    marginTop: 16,
  },
});
