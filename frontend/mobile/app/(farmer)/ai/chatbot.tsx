import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAI } from '@/hooks/useAI';
import { ChatMessage } from '@/types/ai.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function AIChatbotScreen() {
  const { currentSession, sendChatMessage, isSendingMessage, startNewChat } = useAI();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!currentSession) {
      startNewChat('New Chat');
    }
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isSendingMessage || !currentSession) return;

    const message = inputText.trim();
    setInputText('');

    await sendChatMessage(currentSession.id, message);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
            {new Date(item.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        {!isUser && item.suggestions && item.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {item.suggestions.map((suggestion, index) => (
              <Pressable
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeIcon}>🤖</Text>
      <Text style={styles.welcomeTitle}>AI Farming Assistant</Text>
      <Text style={styles.welcomeText}>
        Ask me anything about farming, crops, pests, weather, market prices, or best practices.
        Im here to help!
      </Text>
      <View style={styles.quickQuestionsContainer}>
        <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
        {[
          'How to control pests in soybean?',
          'Best time to sow wheat?',
          'Current market price of cotton?',
          'How to improve soil fertility?',
        ].map((question, index) => (
          <Pressable
            key={index}
            style={styles.quickQuestionChip}
            onPress={() => handleSuggestionPress(question)}
          >
            <Text style={styles.quickQuestionText}>{question}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>AI Chat</Text>
        <Pressable onPress={() => startNewChat('New Chat')}>
          <Text style={styles.newChatButton}>New</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={currentSession?.messages || []}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListHeaderComponent={
            !currentSession?.messages || currentSession.messages.length === 0
              ? renderHeader
              : null
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isSendingMessage && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.typingText}>AI is thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your question..."
            placeholderTextColor={colors.text.secondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isSendingMessage}
          />
          <Pressable
            style={[styles.sendButton, (!inputText.trim() || isSendingMessage) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSendingMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  newChatButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  welcomeIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  welcomeTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  quickQuestionsContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  quickQuestionsTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  quickQuestionChip: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickQuestionText: {
    ...typography.body,
    color: colors.primary,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: colors.surface,
  },
  messageTime: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.secondary,
  },
  userMessageTime: {
    color: colors.surface,
    opacity: 0.8,
  },
  suggestionsContainer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  suggestionChip: {
    backgroundColor: `${colors.primary}20`,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  suggestionText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 11,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typingText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  sendButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});