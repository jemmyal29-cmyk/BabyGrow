/**
 * BabyGrow AI Screen - Real AI Chat Interface
 * Solusi Pintar Cegah Stunting
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
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { ScreenHeader, Button } from '../components/common';
import AIAssistantService, { AIMessage, Language } from '../services/AIAssistantService';

const QUICK_ACTIONS: {
  label: string;
  prompt: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}[] = [
  {
    label: 'Analisis Pertumbuhan',
    prompt: 'Analisis pertumbuhan anak saya',
    icon: 'chart-line',
  },
  {
    label: 'Saran Nutrisi',
    prompt: 'Berikan saran menu bergizi',
    icon: 'food-apple',
  },
  {
    label: 'Panduan IoT',
    prompt: 'Cara menggunakan IoT device',
    icon: 'bluetooth',
  },
  {
    label: 'Info Stunting',
    prompt: 'Apa itu stunting?',
    icon: 'help-circle-outline',
  },
];

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage] = useState<Language['code']>('id');
  const [userRole] = useState<'user' | 'admin' | 'super_user'>('user');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? ''
  );
  const [realAIEnabled, setRealAIEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    sendWelcomeMessage();
  }, []);

  const sendWelcomeMessage = async () => {
    const welcomeMessage = await AIAssistantService.generateResponse('Halo', {
      userRole,
      language: currentLanguage,
    });
    setMessages([welcomeMessage]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessageText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await AIAssistantService.generateResponse(userMessageText, {
        userRole,
        language: currentLanguage,
      });
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error('AI Response Error:', error);
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickAction = async (action: string) => {
    setIsLoading(true);
    const response = await AIAssistantService.generateResponse(action, {
      userRole,
      language: currentLanguage,
    });
    setMessages((prev) => [...prev, response]);
    setIsLoading(false);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim().length < 20) {
      Alert.alert(
        'Error',
        'API key tidak valid. Pastikan Anda memasukkan API key yang benar dari Google AI Studio.'
      );
      return;
    }

    AIAssistantService.setGeminiApiKey(apiKey.trim());
    Alert.alert(
      'Berhasil!',
      'API key telah disimpan. REAL AI (Google Gemini) sekarang aktif!\n\nAnda dapat bertanya apapun dan AI akan menjawab secara dinamis seperti ChatGPT.',
      [{ text: 'OK', onPress: () => setShowSettings(false) }]
    );
  };

  const toggleRealAI = (enabled: boolean) => {
    setRealAIEnabled(enabled);
    AIAssistantService.setUseRealAI(enabled);

    if (enabled && !AIAssistantService.isRealAIEnabled()) {
      Alert.alert(
        'API Key Diperlukan',
        'Untuk menggunakan REAL AI, Anda perlu memasukkan Google Gemini API key terlebih dahulu.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Set API Key', onPress: () => setShowSettings(true) },
        ]
      );
    }
  };

  const renderMessage = (message: AIMessage) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser ? (
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons
              name="robot-outline"
              size={20}
              color={colors.primary.main}
            />
          </View>
        ) : null}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}
          >
            {message.content}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.assistantTimestamp,
            ]}
          >
            {message.timestamp.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScreenHeader
          title="BabyGrow AI"
          subtitle="Solusi Pintar Cegah Stunting"
          brand
          rightAction={
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettings(true)}
              hitSlop={12}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={22}
                color={colors.primary.main}
              />
            </TouchableOpacity>
          }
        />

        <Modal
          visible={showSettings}
          animationType="slide"
          transparent
          onRequestClose={() => setShowSettings(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalTitleRow}>
                  <MaterialCommunityIcons
                    name="cog"
                    size={22}
                    color={colors.primary.main}
                  />
                  <Text style={styles.modalTitle}>Pengaturan REAL AI</Text>
                </View>

                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleTitle}>REAL AI Mode</Text>
                    <Text style={styles.toggleSub}>
                      Jawaban dinamis seperti ChatGPT/Gemini
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleRealAI(!realAIEnabled)}
                    style={[
                      styles.switchTrack,
                      {
                        backgroundColor: realAIEnabled
                          ? colors.status.success
                          : colors.neutral.gray400,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.switchThumb,
                        {
                          alignSelf: realAIEnabled ? 'flex-end' : 'flex-start',
                        },
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>Google Gemini API Key</Text>
                <TextInput
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="Masukkan API key Anda di sini..."
                  placeholderTextColor={colors.neutral.gray400}
                  style={styles.apiInput}
                  multiline
                  numberOfLines={3}
                />
                <Text style={styles.hint}>
                  Dapatkan API key gratis di aistudio.google.com/app/apikey
                </Text>

                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxText}>
                    REAL AI: jawaban dinamis, konteks alami, 5 bahasa, rekomendasi
                    personal dari data anak.
                  </Text>
                </View>

                <View style={styles.warnBox}>
                  <Text style={styles.warnBoxText}>
                    API key disimpan lokal. Internet diperlukan untuk REAL AI.
                    Jika dimatikan, sistem kembali ke template.
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title="Batal"
                    onPress={() => setShowSettings(false)}
                    variant="secondary"
                    size="medium"
                    style={{ flex: 1 }}
                    fullWidth={false}
                  />
                  <Button
                    title="Simpan"
                    onPress={handleSaveApiKey}
                    size="medium"
                    style={{ flex: 1 }}
                    fullWidth={false}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => renderMessage(message))}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary.main} />
              <Text style={styles.loadingText}>Sedang menganalisis...</Text>
            </View>
          ) : null}

          {messages.length <= 2 ? (
            <View style={styles.quickActionsContainer}>
              <Text style={styles.quickActionsTitle}>Pertanyaan Cepat</Text>
              {QUICK_ACTIONS.map((qa) => (
                <TouchableOpacity
                  key={qa.label}
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction(qa.prompt)}
                >
                  <MaterialCommunityIcons
                    name={qa.icon}
                    size={20}
                    color={colors.primary.main}
                  />
                  <Text style={styles.quickActionText}>{qa.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ketik pertanyaan Anda..."
            placeholderTextColor={colors.neutral.gray400}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={colors.primary.onPrimary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={14}
            color={colors.text.secondary}
          />
          <Text style={styles.disclaimerText}>
            Asisten AI bukan pengganti konsultasi medis profesional
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 28, 28, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    ...shadows.diffusion,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.styles.headlineLgMobile,
    fontSize: 20,
    color: colors.primary.main,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.element,
    backgroundColor: colors.surface.low,
    borderRadius: borderRadius.lg,
  },
  toggleTitle: {
    ...typography.styles.buttonText,
    fontSize: typography.fontSize.md,
    color: colors.text.onSurface,
  },
  toggleSub: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    padding: 2,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.lowest,
  },
  fieldLabel: {
    ...typography.styles.labelCaps,
    color: colors.text.onSurface,
    marginBottom: spacing.sm,
  },
  apiInput: {
    borderWidth: 1,
    borderColor: colors.border.input,
    borderRadius: borderRadius.lg,
    padding: spacing.element,
    fontSize: typography.fontSize.sm,
    backgroundColor: colors.background.default,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.text.onSurface,
  },
  hint: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  infoBox: {
    backgroundColor: colors.background.overlay,
    padding: spacing.element,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
    marginBottom: spacing.md,
  },
  infoBoxText: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.xs,
    color: colors.text.onSurfaceVariant,
    lineHeight: 18,
  },
  warnBox: {
    backgroundColor: colors.primary.fixed,
    padding: spacing.element,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  warnBoxText: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.xs,
    color: colors.primary.onFixed,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.element,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 90,
    gap: spacing.sm,
  },
  messageContainer: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.fixed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  messageBubble: {
    maxWidth: '78%',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.soft,
  },
  userBubble: {
    backgroundColor: colors.chat.userBubble,
    borderBottomRightRadius: borderRadius.sm,
  },
  assistantBubble: {
    backgroundColor: colors.chat.aiBubble,
    borderBottomLeftRadius: borderRadius.sm,
    ...shadows.diffusion,
  },
  messageText: {
    ...typography.styles.bodyMd,
  },
  userText: {
    color: colors.chat.userText,
  },
  assistantText: {
    color: colors.chat.aiText,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.medium,
  },
  userTimestamp: {
    color: colors.chat.userText,
    opacity: 0.8,
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: colors.chat.timestamp,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  loadingText: {
    marginLeft: spacing.sm,
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  quickActionsContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  quickActionsTitle: {
    ...typography.styles.labelCaps,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface.lowest,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.diffusion,
  },
  quickActionText: {
    ...typography.styles.bodyMd,
    color: colors.text.onSurface,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.lowest,
    borderTopWidth: 1,
    borderTopColor: colors.border.divider,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface.low,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...typography.styles.bodyMd,
    maxHeight: 100,
    marginRight: spacing.sm,
    color: colors.text.onSurface,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primaryGlow,
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface.lowest,
  },
  disclaimerText: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});
