/**
 * BabyGrow AI Screen - KAI-INSPIRED PREMIUM
 * Features:
 * - Vibrant Pink Gradient Header
 * - Modern Bubble Chat Design (Extra Rounded)
 * - Real AI Integration (Gemini)
 * - Multi-language Support (5 languages)
 * - Personality: Ramah, Empatik, Ceria, Profesional
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import AIAssistantService, { AIMessage, Language } from '../services/AIAssistantService';

export default function AIAssistantScreenKAI() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language['code']>('id');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    sendWelcomeMessage();
  }, []);

  const sendWelcomeMessage = async () => {
    const welcomeMessage = await AIAssistantService.generateResponse('Halo', {
      userRole: 'user',
      language: currentLanguage,
    });
    setMessages([welcomeMessage]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await AIAssistantService.generateResponse(inputText, {
        userRole: 'user',
        language: currentLanguage,
      });
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setIsLoading(false);
    }

    // Auto scroll
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const LANGUAGES: Language[] = [
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
    { code: 'es', name: 'Español' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF85A1" />
      
      {/* Vibrant Pink Gradient Header - KAI INSPIRED */}
      <LinearGradient
        colors={['#FF1976', '#FF85A1', '#FFB3D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.aiIcon}>
                <Text style={styles.aiIconText}>🤖</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>BabyGrow AI</Text>
                <Text style={styles.headerSubtitle}>Solusi Pintar Cegah Stunting</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Compact Language Selector - HORIZONTAL MINI PILLS */}
      <View style={styles.languageWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.languageScroll}
          contentContainerStyle={styles.languageContainer}
        >
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageChip,
                currentLanguage === lang.code && styles.languageChipActive
              ]}
              onPress={() => setCurrentLanguage(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.languageText,
                currentLanguage === lang.code && styles.languageTextActive
              ]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages - SOLID WHITE BACKGROUND */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            {message.role === 'assistant' && (
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>🤖</Text>
              </View>
            )}
            <View style={[
              styles.bubbleContent,
              message.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent,
            ]}>
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userMessageText : styles.aiMessageText,
              ]}>
                {message.content}
              </Text>
              <Text style={[
                styles.timestamp,
                message.role === 'user' ? styles.userTimestamp : styles.aiTimestamp,
              ]}>
                {new Date(message.timestamp).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>🤖</Text>
            </View>
            <View style={styles.aiBubbleContent}>
              <ActivityIndicator size="small" color={colors.primary.main} />
              <Text style={styles.typingText}>BabyGrow AI sedang mengetik...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area (KAI-Style) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 150 : 85}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tanya BabyGrow AI..."
            placeholderTextColor={colors.text.disabled}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <LinearGradient
              colors={inputText.trim() ? ['#FF85A1', '#FF6B95'] : ['#E0E0E0', '#E0E0E0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    paddingBottom: spacing.lg,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  aiIconText: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary.contrast,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.contrast,
    opacity: 0.9,
  },
  // === COMPACT LANGUAGE SELECTOR (MINI PILLS) ===
  languageWrapper: {
    backgroundColor: '#FFFFFF', // Solid white
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    zIndex: 50, // Below input (900) but above content
  },
  languageScroll: {
    maxHeight: 40, // DRASTICALLY REDUCED from ~60px
  },
  languageContainer: {
    paddingHorizontal: spacing.sm, // Reduced padding
    paddingVertical: 6, // Minimal vertical space
    alignItems: 'center',
  },
  languageChip: {
    paddingHorizontal: 12, // COMPACT: Reduced from 16px
    paddingVertical: 4, // COMPACT: Reduced from 8px
    borderRadius: 12, // Small rounded
    backgroundColor: '#F5F5F5', // Light gray
    marginRight: 6, // Tight spacing
    borderWidth: 1,
    borderColor: 'transparent',
  },
  languageChipActive: {
    backgroundColor: '#FFE5F0', // Light pink background
    borderColor: '#FF85A1', // Vibrant pink border
  },
  languageText: {
    color: '#616161', // Gray text
    fontFamily: typography.fontFamily.regular,
    fontSize: 12, // SMALL: Reduced from 14px
    lineHeight: 16,
  },
  languageTextActive: {
    color: '#FF1976', // Vibrant pink text
    fontFamily: typography.fontFamily.semiBold,
  },
  // === CHAT AREA - SOLID WHITE WITH SAFE SPACING ===
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // SOLID WHITE - NO TRANSPARENCY
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: 215, // CRITICAL: Space for input (155px) + bottom nav (60px) = 215px total
  },
  messageBubble: {
    borderRadius: 20, // Extra rounded untuk KAI style
    marginBottom: spacing.md,
    padding: spacing.md,
    maxWidth: '85%', // Slightly wider
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    ...shadows.standard,
    flexDirection: 'row',
    alignItems: 'flex-start', // Better alignment
  },
  userBubble: {
    backgroundColor: '#FF85A1', // Vibrant Pink for user
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse', // Avatar on right for user
  },
  aiBubble: {
    backgroundColor: '#F5F5F5', // Light gray for AI
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5F0', // Light pink background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  aiAvatarText: {
    fontSize: 20,
  },
  bubbleContent: {
    flex: 1,
  },
  userBubbleContent: {
    alignItems: 'flex-end',
  },
  aiBubbleContent: {
    alignItems: 'flex-start',
  },
  messageText: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray900,
    fontFamily: typography.fontFamily.regular,
  },
  userMessageText: {
    color: colors.primary.contrast,
    fontFamily: typography.fontFamily.medium,
  },
  aiMessageText: {
    color: colors.neutral.gray900,
    fontFamily: typography.fontFamily.regular,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray500,
    marginTop: 2,
  },
  userTimestamp: {
    color: colors.primary.light,
    alignSelf: 'flex-end',
  },
  aiTimestamp: {
    color: colors.pink[400],
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: typography.fontSize.sm,
    color: colors.pink[400],
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.md,
  },
  // === INPUT BOX - ALWAYS VISIBLE ABOVE BOTTOM NAV ===
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12, // Compact vertical padding
    backgroundColor: '#FFFFFF', // SOLID WHITE - NO TRANSPARENCY
    borderTopWidth: 3, // Thicker border for prominence
    borderTopColor: '#FF85A1', // Vibrant pink border
    // EXTRA STRONG SHADOW
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12, // Android shadow
    position: 'absolute',
    bottom: 90, // RAISED: 90px above screen bottom (clear from bottom nav)
    left: 0,
    right: 0,
    zIndex: 900, // HIGH: Below nav (1000) but above all content
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Very light gray
    borderRadius: 20, // Rounded for KAI style
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: typography.fontFamily.regular,
    color: '#212121',
    marginRight: spacing.sm,
    maxHeight: 100, // Prevent excessive growth
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sendButton: {
    width: 44, // Fixed size for consistency
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...shadows.standard,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
