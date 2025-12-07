import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { GOVERNMENT_SCHEMES, SCHEME_CATEGORIES } from '@/constants/governmentSchemes';

export default function GovernmentSchemesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredSchemes = selectedCategory === 'all'
    ? GOVERNMENT_SCHEMES
    : GOVERNMENT_SCHEMES.filter(scheme => scheme.category === selectedCategory);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Government Schemes</Text>
          <Text style={styles.subtitle}>
            Explore {GOVERNMENT_SCHEMES.length} schemes to support your farming business
          </Text>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {SCHEME_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryPill,
                selectedCategory === category.id && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.id ? COLORS.white : COLORS.text.secondary}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Schemes List */}
        <View style={styles.schemesContainer}>
          {filteredSchemes.map((scheme) => (
            <TouchableOpacity
              key={scheme.id}
              style={styles.schemeCard}
              onPress={() => router.push(`/(tabs)/schemes/${scheme.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.schemeHeader}>
                <View style={styles.schemeTitleRow}>
                  <Text style={styles.schemeName}>{scheme.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{scheme.category}</Text>
                </View>
              </View>

              <Text style={styles.schemeDesc} numberOfLines={2}>
                {scheme.shortDesc}
              </Text>

              <View style={styles.schemeFooter}>
                <View style={styles.benefitPreview}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.benefitText} numberOfLines={1}>
                    {scheme.benefits[0]}
                  </Text>
                </View>
                <TouchableOpacity style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {filteredSchemes.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.text.tertiary} />
              <Text style={styles.emptyText}>No schemes found in this category</Text>
            </View>
          )}
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
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  categoriesContainer: {
    marginVertical: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  schemesContainer: {
    paddingHorizontal: 20,
  },
  schemeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  schemeHeader: {
    marginBottom: 12,
  },
  schemeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  schemeName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  schemeDesc: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  schemeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  benefitPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  benefitText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    flex: 1,
  },
  viewDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.tertiary,
    marginTop: 12,
  },
});
