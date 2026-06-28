/**
 * BabyGrow AI Screen - Real AI Chat Interface
 * Solusi Pintar Cegah Stunting
 * 
 * IDENTITAS:
 * - Nama: BabyGrow AI (bukan "AI Analisis")
 * - Slogan: "Solusi Pintar Cegah Stunting"
 * - Kepribadian: Ramah, Empatik, Ceria, Profesional, Medis
 * - Role: Teman Diskusi yang Pintar
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
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import AIAssistantService, { AIMessage, Language } from '../services/AIAssistantService';

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language['code']>('id');
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'super_user'>('user');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('AIzaSyCZiJHNJcO2jTAhnrAAZJR842SzOoYVWhI');
  const [realAIEnabled, setRealAIEnabled] = useState(true); // Real AI ON - Dynamic responses
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Send welcome message
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

    // Create user message
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Get AI response with role-based context
      const response = await AIAssistantService.generateResponse(userMessageText, {
        userRole,
        language: currentLanguage,
        // In production, pass actual child data and measurements
      });

      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error('AI Response Error:', error);
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Maaf, terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    // Scroll to bottom
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
      Alert.alert('Error', 'API key tidak valid. Pastikan Anda memasukkan API key yang benar dari Google AI Studio.');
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
          { text: 'Set API Key', onPress: () => setShowSettings(true) }
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
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>🤖</Text>
          </View>
        )}

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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarEmoji}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>BabyGrow AI</Text>
              <Text style={styles.headerSubtitle}>Solusi Pintar Cegah Stunting</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 24,
              width: '90%',
              maxWidth: 400,
              maxHeight: '80%',
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.primary.main,
                  marginBottom: 16,
                }}
              >
                ⚙️ Pengaturan REAL AI
              </Text>

              {/* Real AI Toggle */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  padding: 12,
                  backgroundColor: '#F5F5F5',
                  borderRadius: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                    🤖 REAL AI Mode
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Jawaban dinamis seperti ChatGPT/Gemini
                  </Text>
                </View>
                {/* Switch component */}
                <TouchableOpacity
                  onPress={() => toggleRealAI(!realAIEnabled)}
                  style={{
                    width: 50,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: realAIEnabled ? '#4CAF50' : '#CCC',
                    justifyContent: 'center',
                    padding: 2,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: 'white',
                      alignSelf: realAIEnabled ? 'flex-end' : 'flex-start',
                    }}
                  />
                </TouchableOpacity>
              </View>

              {/* API Key Section */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                  🔑 Google Gemini API Key
                </Text>
                <TextInput
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="Masukkan API key Anda di sini..."
                  placeholderTextColor="#999"
                  secureTextEntry={false}
                  style={{
                    borderWidth: 1,
                    borderColor: '#DDD',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                    backgroundColor: '#FAFAFA',
                    fontFamily: 'monospace',
                  }}
                  multiline
                  numberOfLines={3}
                />
                <Text style={{ fontSize: 11, color: '#666', marginTop: 6, lineHeight: 16 }}>
                  💡 Dapatkan API key gratis di:{'\n'}
                  <Text style={{ color: colors.primary.main, fontWeight: '600' }}>
                    https://aistudio.google.com/app/apikey
                  </Text>
                </Text>
              </View>

              {/* Info Box */}
              <View
                style={{
                  backgroundColor: '#E3F2FD',
                  padding: 12,
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: '#2196F3',
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 12, color: '#1565C0', lineHeight: 18 }}>
                  <Text style={{ fontWeight: 'bold' }}>✨ REAL AI Features:</Text>
                  {'\n'}• Jawaban berbeda setiap kali (tidak template)
                  {'\n'}• Konteks percakapan lebih alami
                  {'\n'}• Dapat menjawab pertanyaan kompleks
                  {'\n'}• Mendukung 5 bahasa (ID/EN/CN/AR/JP)
                  {'\n'}• Data anak Anda digunakan untuk rekomendasi personal
                </Text>
              </View>

              {/* Warning Box */}
              <View
                style={{
                  backgroundColor: '#FFF3E0',
                  padding: 12,
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: '#FFA000',
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 11, color: '#E65100', lineHeight: 16 }}>
                  ⚠️ <Text style={{ fontWeight: 'bold' }}>Penting:</Text>
                  {'\n'}• API key Anda disimpan lokal di perangkat
                  {'\n'}• Jika REAL AI dimatikan, sistem akan kembali ke template responses
                  {'\n'}• Internet diperlukan untuk REAL AI
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowSettings(false)}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.primary.main,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.primary.main, fontWeight: '600' }}>
                    Batal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveApiKey}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 8,
                    backgroundColor: colors.primary.main,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>
                    💾 Simpan
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => renderMessage(message))}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary.main} />
              <Text style={styles.loadingText}>Sedang menganalisis...</Text>
            </View>
          )}

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <View style={styles.quickActionsContainer}>
              <Text style={styles.quickActionsTitle}>Pertanyaan Cepat:</Text>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => handleQuickAction('Analisis pertumbuhan anak saya')}
              >
                <Text style={styles.quickActionEmoji}>📊</Text>
                <Text style={styles.quickActionText}>Analisis Pertumbuhan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => handleQuickAction('Berikan saran menu bergizi')}
              >
                <Text style={styles.quickActionEmoji}>🥗</Text>
                <Text style={styles.quickActionText}>Saran Nutrisi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => handleQuickAction('Cara menggunakan IoT device')}
              >
                <Text style={styles.quickActionEmoji}>📱</Text>
                <Text style={styles.quickActionText}>Panduan IoT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => handleQuickAction('Apa itu stunting?')}
              >
                <Text style={styles.quickActionEmoji}>❓</Text>
                <Text style={styles.quickActionText}>Info Stunting</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Input */}
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
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Asisten AI bukan pengganti konsultasi medis profesional
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Solid white background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.main,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.standard,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF', // Solid white
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  headerAvatarEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.white,
    opacity: 0.9,
  },
  settingsButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
  },
  settingsIcon: {
    fontSize: 24,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Solid light gray background
  },
  messagesContent: {
    padding: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFE4F3', // Solid pink background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary.main,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  userBubble: {
    backgroundColor: '#FF69B4', // Solid pink
    borderBottomRightRadius: borderRadius.sm,
    borderWidth: 0,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF', // Solid white
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: '#FFE4F3',
  },
  messageText: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * 1.5,
  },
  userText: {
    color: colors.neutral.white,
  },
  assistantText: {
    color: colors.neutral.gray800,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  userTimestamp: {
    color: colors.neutral.white,
    opacity: 0.8,
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: colors.neutral.gray500,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  loadingText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    fontStyle: 'italic',
  },
  quickActionsContainer: {
    marginTop: spacing.lg,
  },
  quickActionsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray600,
    marginBottom: spacing.sm,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Solid white
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  quickActionEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray700,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF', // Solid white
    borderTopWidth: 2,
    borderTopColor: colors.neutral.gray300,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Solid light gray
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    maxHeight: 100,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral.gray300,
  },
  sendButtonText: {
    fontSize: 20,
    color: colors.neutral.white,
  },
  disclaimer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#FFF9E6', // Solid light yellow
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray300,
  },
  disclaimerText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
});
