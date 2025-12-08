import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { AppHeader, Sidebar } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { geminiService } from '@/services/geminiService';
import { speechService, SpeechRecognitionResult } from '@/services/speechService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  {
    icon: 'water',
    text: 'How much water for my crops?',
    color: '#3b82f6',
  },
  {
    icon: 'nutrition',
    text: 'When to apply fertilizer?',
    color: '#22c55e',
  },
  {
    icon: 'bug',
    text: 'How to control pests?',
    color: '#ef4444',
  },
  {
    icon: 'leaf',
    text: 'Best season to plant?',
    color: '#f59e0b',
  },
];

export default function FarmingAssistantScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'नमस्ते! 🙏 मैं आपका फार्मिंग सहायक हूं। आप मुझसे खेती से जुड़े कोई भी सवाल पूछ सकते हैं।\n\nHello! I\'m your farming assistant. Ask me anything about farming!',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [processingVoice, setProcessingVoice] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      // Start duration timer
      setRecordingDuration(0);
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Clear interval when not recording
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isRecording, pulseAnim]);

  const startRecording = async () => {
    try {
      // Request permissions and start recording
      const hasPermission = await speechService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to use voice input. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      await speechService.startRecording();
      setIsRecording(true);
      setShowRecordingUI(true);
    } catch (err: any) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setProcessingVoice(true);

      // Stop recording and get audio URI
      const audioUri = await speechService.stopRecording();

      // Show processing message
      const processingMessage: Message = {
        id: Date.now().toString(),
        text: '🎤 Processing your voice message...',
        isUser: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, processingMessage]);

      // Convert speech to text using Whisper API (supports Hindi and English)
      const result: SpeechRecognitionResult = await speechService.convertSpeechToText(audioUri, true);
      
      console.log('Speech recognition result:', result);

      // Remove processing message
      setMessages((prev) => prev.filter(msg => msg.id !== processingMessage.id));

      // Detect language
      const detectedLang = speechService.detectLanguage(result.transcript);
      const languageEmoji = detectedLang === 'hindi' ? '🇮🇳' : detectedLang === 'english' ? '🇬🇧' : '🌐';

      // Add user message with detected language indicator
      const userMessage: Message = {
        id: Date.now().toString(),
        text: `${languageEmoji} ${result.transcript}`,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Process the question with detected language
      await processQuestion(result.transcript, detectedLang);

      // Cleanup audio file
      await speechService.cleanup();
      setShowRecordingUI(false);
      setProcessingVoice(false);
    } catch (err: any) {
      console.error('Failed to process voice', err);
      setShowRecordingUI(false);
      setProcessingVoice(false);
      Alert.alert(
        'Error / त्रुटि',
        'Failed to convert speech to text. Please try again.\n\nआवाज़ को टेक्स्ट में बदलने में विफल। कृपया पुनः प्रयास करें।'
      );
    }
  };

  const cancelRecording = async () => {
    try {
      await speechService.cancelRecording();
      setIsRecording(false);
      setShowRecordingUI(false);
      setRecordingDuration(0);
    } catch (err) {
      console.error('Failed to cancel recording', err);
    }
  };

  const processQuestion = async (questionText: string, language: 'hindi' | 'english' | 'mixed') => {
    setLoading(true);

    try {
      // Get farmer context
      const farmerContext = user?.profile
        ? `Farmer from ${user.profile.state}, India`
        : 'Farmer in India';

      // Add language instruction based on detected language
      let languageInstruction = '';
      if (language === 'hindi') {
        languageInstruction = '\n\nकृपया हिंदी में उत्तर दें।';
      } else if (language === 'mixed') {
        languageInstruction = '\n\nPlease respond in both Hindi and English.';
      }

      const response = await geminiService.getFarmingAdvice(
        questionText + languageInstruction,
        farmerContext
      );

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'क्षमा करें, मैं आपके प्रश्न को प्रोसेस नहीं कर सका। कृपया पुनः प्रयास करें।\n\nSorry, I couldn\'t process your question. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (questionText?: string) => {
    const messageText = questionText || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Detect language
    const detectedLang = speechService.detectLanguage(messageText);

    // Process the question
    await processQuestion(messageText, detectedLang);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Farming Assistant" 
        onMenuPress={() => setSidebarVisible(true)}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userMessage : styles.aiMessage,
              ]}
            >
              {!message.isUser && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="leaf" size={20} color={COLORS.primary} />
                </View>
              )}
              <View style={styles.messageContent}>
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.aiMessageText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    message.isUser ? styles.userTimestamp : styles.aiTimestamp,
                  ]}
                >
                  {message.timestamp.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={[styles.messageBubble, styles.aiMessage]}>
              <View style={styles.aiAvatar}>
                <Ionicons name="leaf" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.loadingDots}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            </View>
          )}

          {/* Quick Questions */}
          {messages.length === 1 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickQuestionsTitle}>Quick Questions</Text>
              <View style={styles.quickQuestionsGrid}>
                {QUICK_QUESTIONS.map((q, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.quickQuestionCard, { borderColor: q.color }]}
                    onPress={() => handleQuickQuestion(q.text)}
                  >
                    <Ionicons name={q.icon as any} size={24} color={q.color} />
                    <Text style={styles.quickQuestionText}>{q.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.micButton}
            onPress={startRecording}
            disabled={loading}
          >
            <Ionicons name="mic" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Ask me anything about farming..."
            placeholderTextColor={COLORS.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="send" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Voice Recording Modal */}
      <Modal
        visible={showRecordingUI}
        transparent
        animationType="fade"
        onRequestClose={cancelRecording}
      >
        <View style={styles.recordingOverlay}>
          <View style={styles.recordingCard}>
            <Text style={styles.recordingTitle}>
              {isRecording ? 'सुन रहा हूँ... / Listening...' : 'प्रोसेसिंग... / Processing...'}
            </Text>
            
            <Animated.View
              style={[
                styles.recordingCircle,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Ionicons name="mic" size={48} color={COLORS.white} />
            </Animated.View>

            {/* Recording Duration */}
            {isRecording && (
              <Text style={styles.recordingDuration}>
                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
              </Text>
            )}

            <Text style={styles.recordingHint}>
              {isRecording 
                ? 'हिंदी या अंग्रेजी में बोलें\nSpeak in Hindi or English' 
                : processingVoice 
                ? 'आपकी आवाज़ को टेक्स्ट में बदला जा रहा है...\nConverting speech to text...'
                : 'Processing...'}
            </Text>

            {isRecording && (
              <View style={styles.recordingActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelRecording}
                >
                  <Ionicons name="close-circle" size={32} color={COLORS.error} />
                  <Text style={styles.actionLabel}>रद्द करें / Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopRecording}
                >
                  <Ionicons name="stop-circle" size={56} color={COLORS.primary} />
                  <Text style={styles.actionLabel}>रोकें / Stop</Text>
                </TouchableOpacity>
              </View>
            )}

            {processingVoice && (
              <ActivityIndicator size="large" color={COLORS.primary} style={styles.processingIndicator} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  aiMessageText: {
    backgroundColor: COLORS.white,
    color: COLORS.text.primary,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: COLORS.text.tertiary,
    textAlign: 'right',
  },
  aiTimestamp: {
    color: COLORS.text.tertiary,
    textAlign: 'left',
    marginLeft: 12,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  quickQuestionsContainer: {
    marginTop: 24,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  quickQuestionsGrid: {
    gap: 12,
  },
  quickQuestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1.5,
  },
  quickQuestionText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text.primary,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
    alignItems: 'center',
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  // Recording UI Styles
  recordingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  recordingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 32,
  },
  recordingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  recordingHint: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  recordingDuration: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
  },
  processingIndicator: {
    marginTop: 24,
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
    marginTop: 16,
  },
  cancelButton: {
    alignItems: 'center',
    gap: 8,
  },
  stopButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
});
