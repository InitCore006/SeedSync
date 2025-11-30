import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { HelpCategory } from '@/types/profile.types';

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: '1',
    name: 'Getting Started',
    icon: '🚀',
    questions: [
      {
        id: '1-1',
        question: 'How do I create an account?',
        answer: 'You can create an account by entering your mobile number and verifying it with the OTP sent to your phone.',
      },
      {
        id: '1-2',
        question: 'How do I complete my profile?',
        answer: 'Go to Profile > Edit Profile and fill in all the required information including your personal details, address, and farm details.',
      },
      {
        id: '1-3',
        question: 'What is KYC and why is it required?',
        answer: 'KYC (Know Your Customer) is a verification process required for secure transactions. Upload your Aadhaar, PAN, and bank passbook documents to complete KYC.',
      },
    ],
  },
  {
    id: '2',
    name: 'Crop Management',
    icon: '🌾',
    questions: [
      {
        id: '2-1',
        question: 'How do I add a new crop?',
        answer: 'Go to Crops tab, tap the + button, fill in crop details including name, area, planting date, and save.',
      },
      {
        id: '2-2',
        question: 'How do I track crop stages?',
        answer: 'Each crop shows its current growth stage. You can update stages manually or they will progress automatically based on the planting date.',
      },
      {
        id: '2-3',
        question: 'Can I add multiple lots for the same crop?',
        answer: 'Yes, you can create multiple lots with different planting dates and locations for the same crop type.',
      },
    ],
  },
  {
    id: '3',
    name: 'Market & Trading',
    icon: '💰',
    questions: [
      {
        id: '3-1',
        question: 'How do I check market prices?',
        answer: 'Go to Market tab to see current prices for different crops in nearby mandis. You can also set price alerts for specific crops.',
      },
      {
        id: '3-2',
        question: 'How do I create a trade listing?',
        answer: 'Go to Market > Trade, tap Create Listing, choose Buy/Sell, enter crop details, price, and quantity.',
      },
      {
        id: '3-3',
        question: 'Is trading safe on this platform?',
        answer: 'We verify all users through KYC. However, always verify crop quality and payment before completing transactions.',
      },
    ],
  },
  {
    id: '4',
    name: 'Weather & Advisory',
    icon: '🌤️',
    questions: [
      {
        id: '4-1',
        question: 'How accurate is the weather forecast?',
        answer: 'We use data from India Meteorological Department (IMD) which provides accurate 7-day forecasts.',
      },
      {
        id: '4-2',
        question: 'What are weather alerts?',
        answer: 'We send notifications for severe weather conditions like heavy rain, storms, or extreme temperatures that may affect your crops.',
      },
      {
        id: '4-3',
        question: 'How do I get crop advisory?',
        answer: 'Go to Advisory tab to get expert recommendations based on your location, crops, and weather conditions.',
      },
    ],
  },
  {
    id: '5',
    name: 'Payments & Banking',
    icon: '🏦',
    questions: [
      {
        id: '5-1',
        question: 'How do I add bank account details?',
        answer: 'Go to Profile > Bank Details and add your account information. You can add multiple accounts and set one as primary.',
      },
      {
        id: '5-2',
        question: 'When will I receive payments?',
        answer: 'Payment timelines depend on the buyer. We recommend using secure payment methods and getting confirmation before delivery.',
      },
      {
        id: '5-3',
        question: 'Are my bank details safe?',
        answer: 'Yes, all banking information is encrypted and stored securely. We never share your details with third parties.',
      },
    ],
  },
];

export default function HelpScreen() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const filteredCategories = HELP_CATEGORIES.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0 || searchQuery === '');

  const handleCallSupport = () => {
    Linking.openURL('tel:1800-XXX-XXXX');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@seedsync.com');
  };

  const handleWhatsAppSupport = () => {
    Linking.openURL('https://wa.me/91XXXXXXXXXX');
  };

  const handleSubmitTicket = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit support ticket
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Ticket Submitted',
        'Your support ticket has been submitted successfully. We will respond within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setContactForm({ subject: '', message: '' });
              setShowContactForm(false);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Search */}
          <View style={styles.searchSection}>
            <Input
              placeholder="Search help topics..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon="🔍"
            />
          </View>

          {/* Quick Contact */}
          <View style={styles.quickContactSection}>
            <Text style={styles.sectionTitle}>Quick Contact</Text>
            <View style={styles.quickContactButtons}>
              <Pressable style={styles.quickContactButton} onPress={handleCallSupport}>
                <Text style={styles.quickContactIcon}>📞</Text>
                <Text style={styles.quickContactText}>Call</Text>
              </Pressable>
              <Pressable style={styles.quickContactButton} onPress={handleWhatsAppSupport}>
                <Text style={styles.quickContactIcon}>💬</Text>
                <Text style={styles.quickContactText}>WhatsApp</Text>
              </Pressable>
              <Pressable style={styles.quickContactButton} onPress={handleEmailSupport}>
                <Text style={styles.quickContactIcon}>✉️</Text>
                <Text style={styles.quickContactText}>Email</Text>
              </Pressable>
            </View>
          </View>

          {/* FAQ */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

            {filteredCategories.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <Pressable
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(category.id)}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <Text style={styles.categoryChevron}>
                    {expandedCategory === category.id ? '▼' : '▶'}
                  </Text>
                </Pressable>

                {expandedCategory === category.id && (
                  <View style={styles.questionsContainer}>
                    {category.questions.map((question) => (
                      <View key={question.id} style={styles.questionCard}>
                        <Pressable
                          style={styles.questionHeader}
                          onPress={() => toggleQuestion(question.id)}
                        >
                          <Text style={styles.questionText}>{question.question}</Text>
                          <Text style={styles.questionChevron}>
                            {expandedQuestion === question.id ? '−' : '+'}
                          </Text>
                        </Pressable>

                        {expandedQuestion === question.id && (
                          <View style={styles.answerContainer}>
                            <Text style={styles.answerText}>{question.answer}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Contact Form */}
          {showContactForm ? (
            <View style={styles.contactFormSection}>
              <View style={styles.contactFormHeader}>
                <Text style={styles.sectionTitle}>Submit a Ticket</Text>
                <Pressable onPress={() => setShowContactForm(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.contactFormCard}>
                <Input
                  label="Subject"
                  value={contactForm.subject}
                  onChangeText={(text) => setContactForm({ ...contactForm, subject: text })}
                  placeholder="Brief description of your issue"
                />

                <Input
                  label="Message"
                  value={contactForm.message}
                  onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
                  placeholder="Describe your issue in detail..."
                  multiline
                  numberOfLines={6}
                />

                <Button
                  label="Submit Ticket"
                  onPress={handleSubmitTicket}
                  loading={isSubmitting}
                />
              </View>
            </View>
          ) : (
            <Button
              label="📝 Submit a Support Ticket"
              onPress={() => setShowContactForm(true)}
              variant="outline"
              style={styles.submitTicketButton}
            />
          )}

          {/* Support Hours */}
          <View style={styles.supportHoursCard}>
            <Text style={styles.supportHoursIcon}>🕐</Text>
            <View style={styles.supportHoursContent}>
              <Text style={styles.supportHoursTitle}>Support Hours</Text>
              <Text style={styles.supportHoursText}>Monday - Saturday: 9:00 AM - 6:00 PM</Text>
              <Text style={styles.supportHoursText}>Sunday: Closed</Text>
              <Text style={styles.supportHoursSubtext}>
                We typically respond within 24 hours
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  searchSection: {
    marginBottom: spacing.lg,
  },
  quickContactSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickContactButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickContactButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickContactIcon: {
    fontSize: 28,
  },
  quickContactText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  faqSection: {
    marginBottom: spacing.lg,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  categoryName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  categoryChevron: {
    ...typography.body,
    color: colors.text.secondary,
  },
  questionsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  questionCard: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  questionText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  questionChevron: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  answerContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  answerText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  contactFormSection: {
    marginBottom: spacing.lg,
  },
  contactFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  contactFormCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  submitTicketButton: {
    marginBottom: spacing.lg,
  },
  supportHoursCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  supportHoursIcon: {
    fontSize: 24,
  },
  supportHoursContent: {
    flex: 1,
  },
  supportHoursTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  supportHoursText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  supportHoursSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});