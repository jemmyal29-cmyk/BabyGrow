/**
 * Profile Screen - UIGM 2026 with Childhood Gallery Premium Feature
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useAuthActions } from '../store/authStore';
import { useTheme } from '../theme/ThemeContext';
import { ChildhoodGallery, ChildhoodPhoto } from '../types';
import { ScreenHeader, Button } from '../components/common';
import HapticService from '../services/HapticService';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 64) / 3; // 3 photos per row with margins

export default function ProfileScreen({ navigation }: any) {
  const { logout } = useAuthActions();
  const { theme, isDark, toggleTheme } = useTheme();
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showGallery, setShowGallery] = useState(true); // Show by default
  const [childhoodPhotos, setChildhoodPhotos] = useState<(ChildhoodPhoto | null)[]>([
    null, null, null, null, null
  ]);

  // Load saved photos on mount
  useEffect(() => {
    loadChildhoodPhotos();
  }, []);

  // Load photos from AsyncStorage
  const loadChildhoodPhotos = async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem('childhood_gallery');
      if (savedPhotos) {
        const gallery: ChildhoodGallery = JSON.parse(savedPhotos);
        setChildhoodPhotos(gallery.photos);
      }
    } catch (error) {
      console.error('Failed to load childhood photos:', error);
    }
  };

  // Save photos to AsyncStorage
  const saveChildhoodPhotos = async (photos: (ChildhoodPhoto | null)[]) => {
    try {
      const gallery: ChildhoodGallery = {
        userId: 'current_user', // Replace with actual user ID
        photos: photos
      };
      await AsyncStorage.setItem('childhood_gallery', JSON.stringify(gallery));
      setChildhoodPhotos(photos);
    } catch (error) {
      console.error('Failed to save childhood photos:', error);
      Alert.alert('Error', 'Gagal menyimpan foto');
    }
  };

  // Pick image from gallery
  const pickImage = async (slot: 1 | 2 | 3 | 4 | 5) => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Izinkan akses ke galeri untuk menambah foto');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: ChildhoodPhoto = {
          id: `photo_${Date.now()}`,
          uri: result.assets[0].uri,
          dateAdded: new Date().toISOString(),
          slot: slot
        };

        const updatedPhotos = [...childhoodPhotos];
        updatedPhotos[slot - 1] = newPhoto;
        await saveChildhoodPhotos(updatedPhotos);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Gagal memilih foto');
    }
  };

  // Remove photo
  const removePhoto = (slot: 1 | 2 | 3 | 4 | 5) => {
    Alert.alert(
      'Hapus Foto',
      'Apakah Anda yakin ingin menghapus foto ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const updatedPhotos = [...childhoodPhotos];
            updatedPhotos[slot - 1] = null;
            await saveChildhoodPhotos(updatedPhotos);
          }
        }
      ]
    );
  };

  const handleFeatureClick = (feature: string, status: string) => {
    Alert.alert(
      `${feature}`,
      `Status: ${status}\n\nFitur ini sedang dalam perbaikan dan akan segera tersedia.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Profil" subtitle="Akun & preferensi" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Profile */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>Ibu Sari</Text>
          <Text style={styles.userEmail}>user@babygrow.app</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>👤 Pengguna (User)</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Pengaturan Akun</Text>

          {/* Informasi Pribadi */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowPersonalInfo(!showPersonalInfo)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>👤</Text>
            </View>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Informasi Pribadi</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>⚠️ Perbaikan Query</Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>Kelola nama, email, no. HP, dan alamat</Text>
            </View>
            <Text style={styles.chevron}>{showPersonalInfo ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showPersonalInfo && (
            <View style={styles.expandedContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nama Lengkap:</Text>
                <Text style={styles.infoValue}>Ibu Sari Rahayu</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>user@babygrow.app</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>No. HP:</Text>
                <Text style={styles.infoValue}>+62 812-3456-7890</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Alamat:</Text>
                <Text style={styles.infoValue}>Jl. Sehat No. 123, Jakarta</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleFeatureClick('Edit Profil', 'Perbaikan Query Database')}
              >
                <Text style={styles.editButtonText}>✏️ Edit Informasi</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Keamanan & Privasi */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowSecurity(!showSecurity)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🔒</Text>
            </View>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Keamanan & Privasi</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>⚠️ Perbaikan Link</Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>Ubah password & verifikasi 2 faktor</Text>
            </View>
            <Text style={styles.chevron}>{showSecurity ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showSecurity && (
            <View style={styles.expandedContent}>
              <TouchableOpacity
                style={styles.securityOption}
                onPress={() => handleFeatureClick('Ubah Password', 'Enkripsi sedang ditingkatkan')}
              >
                <Text style={styles.securityIcon}>🔑</Text>
                <View style={styles.securityContent}>
                  <Text style={styles.securityTitle}>Ubah Password</Text>
                  <Text style={styles.securityDesc}>Terakhir diubah: 15 Des 2025</Text>
                </View>
                <Text style={styles.chevron}>▶</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.securityOption}
                onPress={() => handleFeatureClick('Verifikasi 2 Faktor', 'Integrasi OTP dalam proses')}
              >
                <Text style={styles.securityIcon}>📱</Text>
                <View style={styles.securityContent}>
                  <Text style={styles.securityTitle}>Verifikasi Dua Faktor (2FA)</Text>
                  <Text style={styles.securityDesc}>Status: Belum aktif</Text>
                </View>
                <Text style={styles.chevron}>▶</Text>
              </TouchableOpacity>

              <View style={styles.securityInfo}>
                <Text style={styles.securityInfoIcon}>🔐</Text>
                <Text style={styles.securityInfoText}>
                  Data Anda dilindungi dengan enkripsi AES-256 dan disimpan sesuai standar ISO 27001
                </Text>
              </View>
            </View>
          )}

          {/* Kelola Anak */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowChildren(!showChildren)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>👶</Text>
            </View>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Kelola Anak</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>⚠️ Perbaikan Database</Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>Daftar anak yang terhubung dengan akun</Text>
            </View>
            <Text style={styles.chevron}>{showChildren ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showChildren && (
            <View style={styles.expandedContent}>
              <View style={styles.childCard}>
                <Text style={styles.childIcon}>👶</Text>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>Zaki Pratama</Text>
                  <Text style={styles.childDetails}>Laki-laki • 18 bulan</Text>
                  <Text style={styles.childStatus}>✅ Data lengkap</Text>
                </View>
              </View>

              <View style={styles.childCard}>
                <Text style={styles.childIcon}>👧</Text>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>Aisyah Putri</Text>
                  <Text style={styles.childDetails}>Perempuan • 6 bulan</Text>
                  <Text style={styles.childStatus}>✅ Data lengkap</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addChildButton}
                onPress={() => navigation.navigate('Children')}
                activeOpacity={0.7}
              >
                <Text style={styles.addChildText}>+ Tambah Anak Baru</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 🆕 PREMIUM FEATURE: Childhood Memories Gallery */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowGallery(!showGallery)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>📸</Text>
            </View>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Kenangan Masa Kecil</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#FFD700' }]}>
                  <Text style={[styles.statusText, { color: '#000' }]}>✨ Premium</Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>Galeri 5 foto kenangan istimewa</Text>
            </View>
            <Text style={styles.chevron}>{showGallery ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showGallery && (
            <View style={styles.expandedContent}>
              <Text style={styles.gallerySectionTitle}>Childhood Memories</Text>
              <Text style={styles.galleryDesc}>
                Simpan hingga 5 foto kenangan masa kecil yang berharga
              </Text>

              <View style={styles.photoGrid}>
                {[1, 2, 3, 4, 5].map((slot) => {
                  const photo = childhoodPhotos[slot - 1];
                  return (
                    <TouchableOpacity
                      key={`photo-slot-${slot}`}
                      style={styles.photoSlot}
                      onPress={() => photo ? removePhoto(slot as 1 | 2 | 3 | 4 | 5) : pickImage(slot as 1 | 2 | 3 | 4 | 5)}
                      activeOpacity={0.7}
                    >
                      {photo ? (
                        <>
                          <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                          <View style={styles.photoOverlay}>
                            <Text style={styles.photoRemoveIcon}>🗑️</Text>
                          </View>
                        </>
                      ) : (
                        <View style={styles.photoPlaceholder}>
                          <Text style={styles.photoPlaceholderIcon}>📷</Text>
                          <Text style={styles.photoPlaceholderText}>Tambah{'\n'}Foto</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.galleryInfo}>
                <Text style={styles.galleryInfoIcon}>💡</Text>
                <Text style={styles.galleryInfoText}>
                  Foto tersimpan lokal di perangkat Anda dan tidak akan hilang saat aplikasi ditutup
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Preferensi */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferensi</Text>

          {/* Mode Gelap */}
          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🌙</Text>
            </View>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Mode Gelap</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.statusText}>✨ Aktif</Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>
                {isDark ? 'Mode gelap aktif - Deep Charcoal & Midnight Pink' : 'Mode terang aktif - Tap untuk ubah tema'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.neutral.gray300, true: colors.primary.light }}
              thumbColor={isDark ? colors.primary.main : colors.neutral.gray100}
            />
          </View>

          {/* Bahasa */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Help')}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🌐</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Bahasa / Language</Text>
              <Text style={styles.menuDesc}>Indonesia (5 bahasa tersedia)</Text>
            </View>
            <Text style={styles.chevron}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Lainnya */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Lainnya</Text>

          {/* Bantuan */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Help')}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>💬</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Bantuan & FAQ</Text>
              <Text style={styles.menuDesc}>Panduan penggunaan aplikasi</Text>
            </View>
            <Text style={styles.chevron}>▶</Text>
          </TouchableOpacity>

          {/* Tentang Aplikasi */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowAbout(!showAbout)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>ℹ️</Text>
            </View>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Tentang Aplikasi</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>⚠️ Konten Kosong</Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>Versi 1.0.0 • Build 2026.01.08</Text>
            </View>
            <Text style={styles.chevron}>{showAbout ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showAbout && (
            <View style={styles.expandedContent}>
              <Text style={styles.aboutTitle}>BabyGrow</Text>
              <Text style={styles.aboutVersion}>Versi 1.0.0 (Build 2026.01.08)</Text>
              
              <Text style={styles.aboutSectionTitle}>🎯 Visi Kami</Text>
              <Text style={styles.aboutText}>
                BabyGrow adalah aplikasi pemantauan pertumbuhan anak berbasis AI yang bertujuan mencegah stunting di Indonesia. Kami menggunakan standar WHO dan teknologi IoT untuk memberikan monitoring real-time yang akurat.
              </Text>

              <Text style={styles.aboutSectionTitle}>✨ Fitur Unggulan</Text>
              <Text style={styles.aboutText}>
                • AI Analisis dengan WHO Z-Score{'\n'}
                • Grafik Pertumbuhan Interaktif{'\n'}
                • Jadwal Imunisasi Lengkap{'\n'}
                • Integrasi IoT Device{'\n'}
                • Rekomendasi Nutrisi Personal
              </Text>

              <Text style={styles.aboutSectionTitle}>🔒 Keamanan Data</Text>
              <Text style={styles.aboutText}>
                • Enkripsi End-to-End (AES-256){'\n'}
                • Sertifikasi ISO 27001{'\n'}
                • GDPR & Compliance Indonesia{'\n'}
                • Backup Otomatis Harian
              </Text>

              <Text style={styles.aboutSectionTitle}>📞 Kontak</Text>
              <Text style={styles.aboutText}>
                Email: support@babygrow.app{'\n'}
                Website: www.babygrow.app{'\n'}
                © 2026 BabyGrow Team
              </Text>

              {/* UIGM Footer */}
              <View style={styles.uigmFooter}>
                <Text style={styles.uigmTitle}>🎓 Developed by</Text>
                <Text style={styles.uigmAuthor}>Jemi Altio</Text>
                <Text style={styles.uigmDepartment}>Sistem Komputer</Text>
                <Text style={styles.uigmUniversity}>Universitas Indo Global Mandiri</Text>
                <Text style={styles.uigmYear}>2026</Text>
              </View>
            </View>
          )}

          {/* Logout */}
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Apakah Anda yakin ingin keluar?',
                [
                  { text: 'Batal', style: 'cancel' },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                      await HapticService.buttonPress();
                      await logout();
                    },
                  },
                ]
              );
            }}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🚪</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, styles.logoutText]}>Keluar</Text>
            </View>
            <Text style={styles.chevron}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* UIGM Footer - Always Visible */}
        <View style={styles.footerContainer}>
          <View style={styles.uigmFooter}>
            <Text style={styles.uigmTitle}>🎓 Developed by</Text>
            <Text style={styles.uigmAuthor}>Jemi Altio</Text>
            <Text style={styles.uigmDepartment}>Sistem Komputer</Text>
            <Text style={styles.uigmUniversity}>Universitas Indo Global Mandiri</Text>
            <Text style={styles.uigmYear}>© 2026</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding untuk bottom tabs
  },
  header: {
    backgroundColor: colors.primary.main,
    padding: spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.white,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary.main,
  },
  menuSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray600,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Solid white
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  menuTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
  },
  menuDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
  },
  statusBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  statusText: {
    fontSize: 10,
    color: colors.neutral.gray700,
  },
  chevron: {
    fontSize: 16,
    color: colors.neutral.gray400,
  },
  expandedContent: {
    backgroundColor: '#F5F5F5', // Solid light gray
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
  },
  infoRow: {
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
  },
  editButton: {
    backgroundColor: colors.primary.main,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.white,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Solid white
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
  },
  securityIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  securityDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  securityInfoIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  securityInfoText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray700,
    lineHeight: 16,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Solid white
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
  },
  childIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  childDetails: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  childStatus: {
    fontSize: typography.fontSize.xs,
    color: colors.status.success,
  },
  addChildButton: {
    backgroundColor: colors.primary.main,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addChildText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.white,
  },
  aboutTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  aboutVersion: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  aboutSectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  aboutText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  logoutItem: {
    marginTop: spacing.md,
  },
  logoutText: {
    color: colors.status.error,
  },
  // Childhood Gallery Styles
  gallerySectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  galleryDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  photoSlot: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  photoRemoveIcon: {
    fontSize: 32,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.neutral.gray400,
  },
  photoPlaceholderIcon: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  photoPlaceholderText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
  galleryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  galleryInfoIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  galleryInfoText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray700,
    lineHeight: 16,
  },
  // UIGM Footer Styles
  footerContainer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.neutral.gray200,
  },
  uigmFooter: {
    backgroundColor: colors.primary.light,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  uigmTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  uigmAuthor: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  uigmDepartment: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  uigmUniversity: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  uigmYear: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
  },
});
