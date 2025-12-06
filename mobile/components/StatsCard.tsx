import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  subtitle?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  subtitle,
  onPress,
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.value} numberOfLines={1}>{value}</Text>
        <Text style={styles.label} numberOfLines={2}>{label}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
    </CardWrapper>
  );
};

interface StatsGridProps {
  stats: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number;
    color: string;
    subtitle?: string;
    onPress?: () => void;
  }>;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <View style={styles.grid}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.gridItem}>
          <StatCard {...stat} />
        </View>
      ))}
    </View>
  );
};

interface StatsSectionProps {
  title: string;
  stats: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number;
    color: string;
    subtitle?: string;
    onPress?: () => void;
  }>;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ title, stats }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <StatsGrid stats={stats} />
    </View>
  );
};

const BRAND_COLORS = {
  primary: '#4a7c0f',
  secondary: '#65a30d',
  dark: '#365314',
  darker: '#1a2e05',
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: 130,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    lineHeight: 17,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BRAND_COLORS.darker,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
});
