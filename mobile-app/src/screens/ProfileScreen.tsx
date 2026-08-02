/**
 * Profile Screen — Settings (desainuiux.md) + Childhood Gallery
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth, useAuthActions, useIsAdmin } from '../store/authStore';
import { useTheme } from '../theme/ThemeContext';
import { ChildhoodGallery, ChildhoodPhoto } from '../types';
import { ScreenHeader } from '../components/common';
import HapticService from '../services/HapticService';
import { ageLabelFromDob, useChildren } from '../hooks/useChildren';
import { showAlert } from '../utils/alert';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 64) / 3;

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function ProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const { logout, requestPasswordReset } = useAuthActions();
  const { isDark, toggleTheme } = useTheme();
  const { data: children = [] } = useChildren(
    isAdmin ? { fetchAll: true } : { parentId: user?.id }
  );
  const roleLabel =
    user?.role === 'ROLE_ADMIN'
      ? 'Petugas / Perawat'
      : user?.role === 'ROLE_USER'
        ? 'Orang Tua'
        : 'Akun belum aktif';
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showGallery, setShowGallery] = useState(true);
  const [childhoodPhotos, setChildhoodPhotos] = useState<(ChildhoodPhoto | null)[]>([
    null, null, null, null, null,
  ]);

  const galleryKey = user?.id
    ? `@babygrow/childhood_gallery_${user.id}`
    : '@babygrow/childhood_gallery';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const savedPhotos = await AsyncStorage.getItem(galleryKey);
        if (cancelled) return;
        if (savedPhotos) {
          const gallery: ChildhoodGallery = JSON.parse(savedPhotos);
          setChildhoodPhotos(gallery.photos);
        } else {
          setChildhoodPhotos([null, null, null, null, null]);
        }
      } catch (error) {
        console.error('Failed to load childhood photos:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [galleryKey]);

  const saveChildhoodPhotos = async (photos: (ChildhoodPhoto | null)[]) => {
    try {
      const gallery: ChildhoodGallery = {
        userId: user?.id || 'anonymous',
        photos: photos,
      };
      await AsyncStorage.setItem(galleryKey, JSON.stringify(gallery));
      setChildhoodPhotos(photos);
    } catch (error) {
      console.error('Failed to save childhood photos:', error);
      showAlert('Error', 'Gagal menyimpan foto');
    }
  };

  const pickImage = async (slot: 1 | 2 | 3 | 4 | 5) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'Izinkan akses ke galeri untuk menambah foto');
        return;
      }

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
          slot: slot,
        };

        const updatedPhotos = [...childhoodPhotos];
        updatedPhotos[slot - 1] = newPhoto;
        await saveChildhoodPhotos(updatedPhotos);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showAlert('Error', 'Gagal memilih foto');
    }
  };

  const removePhoto = (slot: 1 | 2 | 3 | 4 | 5) => {
    showAlert(
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
          },
        },
      ]
    );
  };

  const handlePasswordReset = () => {
    if (!user?.email) {
      showAlert('Error', 'Email akun tidak tersedia');
      return;
    }
    showAlert(
      'Reset Password',
      `Kirim link reset password ke ${user.email}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kirim',
          onPress: async () => {
            try {
              await HapticService.buttonPress();
              await requestPasswordReset(user.email);
              showAlert(
                'Email Terkirim',
                'Cek inbox (dan folder spam) untuk tautan reset kata sandi.'
              );
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : 'Gagal mengirim email reset';
              showAlert('Gagal', message);
            }
          },
        },
      ]
    );
  };

  const navigateStack = (screen: string, params?: object) => {
    void HapticService.buttonPress();
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(screen, params);
    } else {
      navigation.navigate(screen, params);
    }
  };

  const renderMenuIcon = (name: IconName, destructive = false) => (
    <View
      style={[
        styles.menuIconContainer,
        destructive && styles.menuIconContainerDestructive,
      ]}
    >
      <MaterialCommunityIcons
        name={name}
        size={24}
        color={destructive ? colors.status.error : colors.primary.main}
      />
    </View>
  );

  const renderChevron = (expanded?: boolean) => (
    <MaterialCommunityIcons
      name={expanded === undefined ? 'chevron-right' : expanded ? 'chevron-down' : 'chevron-right'}
      size={22}
      color={colors.text.disabled}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Profil" subtitle="Akun & preferensi" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile header card */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={72}
              color={colors.primary.main}
            />
          </View>
          <Text style={styles.userName}>{user?.name || 'Pengguna'}</Text>
          <Text style={styles.userEmail}>{user?.email || '—'}</Text>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons
              name={user?.role === 'ROLE_ADMIN' ? 'shield-account' : 'account'}
              size={14}
              color={colors.primary.main}
            />
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        {/* Pengaturan Akun */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Pengaturan Akun</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowPersonalInfo(!showPersonalInfo)}
            activeOpacity={0.85}
          >
            {renderMenuIcon('account')}
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Informasi Pribadi</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Aktif</Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>Kelola nama, email, no. HP, dan alamat</Text>
            </View>
            {renderChevron(showPersonalInfo)}
          </TouchableOpacity>

          {showPersonalInfo && (
            <View style={styles.expandedContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nama Lengkap:</Text>
                <Text style={styles.infoValue}>{user?.name || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{user?.email || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>No. HP:</Text>
                <Text style={styles.infoValue}>{user?.phone || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lokasi:</Text>
                <Text style={styles.infoValue}>
                  {[user?.location?.puskesmas, user?.location?.city]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowSecurity(!showSecurity)}
            activeOpacity={0.85}
          >
            {renderMenuIcon('lock')}
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Keamanan & Privasi</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.status.success }]}>
                  <Text style={[styles.statusText, { color: colors.text.inverse }]}>Aktif</Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>Reset kata sandi lewat email</Text>
            </View>
            {renderChevron(showSecurity)}
          </TouchableOpacity>

          {showSecurity && (
            <View style={styles.expandedContent}>
              <TouchableOpacity
                style={styles.securityOption}
                onPress={handlePasswordReset}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="key"
                  size={22}
                  color={colors.primary.main}
                  style={styles.securityIcon}
                />
                <View style={styles.securityContent}>
                  <Text style={styles.securityTitle}>Reset Password</Text>
                  <Text style={styles.securityDesc}>
                    Kirim link reset ke {user?.email || 'email akun'}
                  </Text>
                </View>
                {renderChevron()}
              </TouchableOpacity>

              <View style={styles.securityInfo}>
                <MaterialCommunityIcons
                  name="shield-lock"
                  size={20}
                  color={colors.primary.main}
                  style={styles.securityInfoIcon}
                />
                <Text style={styles.securityInfoText}>
                  Keamanan dikelola sistem login. Sesi berakhir saat Anda keluar.
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowChildren(!showChildren)}
            activeOpacity={0.85}
          >
            {renderMenuIcon('baby-face-outline')}
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Kelola Anak</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Aktif</Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>Daftar anak yang terhubung dengan akun</Text>
            </View>
            {renderChevron(showChildren)}
          </TouchableOpacity>

          {showChildren && (
            <View style={styles.expandedContent}>
              {children.length === 0 ? (
                <Text style={styles.emptyChildren}>Belum ada data anak.</Text>
              ) : (
                children.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    style={styles.childCard}
                    onPress={() => navigateStack('ChildDetail', { childId: child.id })}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons
                      name={child.gender === 'female' ? 'face-woman' : 'face-man'}
                      size={32}
                      color={colors.primary.main}
                      style={styles.childIcon}
                    />
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <Text style={styles.childDetails}>
                        {child.gender === 'female' ? 'Perempuan' : 'Laki-laki'} ·{' '}
                        {ageLabelFromDob(child.date_of_birth)}
                      </Text>
                    </View>
                    {renderChevron()}
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity
                style={styles.addChildButton}
                onPress={() => navigateStack('AddChild')}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={18}
                  color={colors.text.inverse}
                />
                <Text style={styles.addChildText}>Tambah Anak</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Childhood Gallery */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowGallery(!showGallery)}
            activeOpacity={0.85}
          >
            {renderMenuIcon('image-multiple')}
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Kenangan Masa Kecil</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.status.warning }]}>
                  <Text style={[styles.statusText, { color: colors.neutral.black }]}>
                    Premium
                  </Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>Galeri 5 foto kenangan istimewa</Text>
            </View>
            {renderChevron(showGallery)}
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
                      onPress={() =>
                        photo
                          ? removePhoto(slot as 1 | 2 | 3 | 4 | 5)
                          : pickImage(slot as 1 | 2 | 3 | 4 | 5)
                      }
                      activeOpacity={0.7}
                    >
                      {photo ? (
                        <>
                          <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                          <View style={styles.photoOverlay}>
                            <MaterialCommunityIcons
                              name="delete"
                              size={28}
                              color={colors.text.inverse}
                            />
                          </View>
                        </>
                      ) : (
                        <View style={styles.photoPlaceholder}>
                          <MaterialCommunityIcons
                            name="camera-plus"
                            size={28}
                            color={colors.text.secondary}
                          />
                          <Text style={styles.photoPlaceholderText}>Tambah{'\n'}Foto</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.galleryInfo}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color={colors.primary.main}
                  style={styles.galleryInfoIcon}
                />
                <Text style={styles.galleryInfoText}>
                  Foto tersimpan lokal di perangkat Anda dan tidak akan hilang saat aplikasi
                  ditutup
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Preferensi */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferensi</Text>

          <View style={styles.menuItem}>
            {renderMenuIcon('weather-night')}
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Mode Gelap</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isDark
                        ? colors.status.success
                        : colors.neutral.gray300,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isDark && { color: colors.text.inverse },
                    ]}
                  >
                    {isDark ? 'On' : 'Off'}
                  </Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>
                {isDark ? 'Tema gelap aktif' : 'Tema terang aktif'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.neutral.gray300, true: colors.primary.light }}
              thumbColor={isDark ? colors.primary.main : colors.neutral.gray100}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              showAlert(
                'Bahasa',
                'Saat ini aplikasi memakai Bahasa Indonesia. Pilih Help & FAQ untuk panduan multi-bahasa.'
              )
            }
            activeOpacity={0.85}
          >
            {renderMenuIcon('web')}
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Bahasa / Language</Text>
              <Text style={styles.menuDesc}>Indonesia (aktif)</Text>
            </View>
            {renderChevron()}
          </TouchableOpacity>
        </View>

        {/* Pintasan */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Pintasan</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateStack('Guide')}
            activeOpacity={0.85}
          >
            {renderMenuIcon('book-open-page-variant')}
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Panduan Penggunaan</Text>
              <Text style={styles.menuDesc}>Alur fitur utama BabyGrow</Text>
            </View>
            {renderChevron()}
          </TouchableOpacity>

          {!isAdmin ? (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateStack('RecipeList')}
                activeOpacity={0.85}
              >
                {renderMenuIcon('food-apple')}
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Resep MBG</Text>
                  <Text style={styles.menuDesc}>Resep bergizi dengan cara memasak</Text>
                </View>
                {renderChevron()}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateStack('AIAssistant')}
                activeOpacity={0.85}
              >
                {renderMenuIcon('robot-outline')}
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>BabyGrow AI</Text>
                  <Text style={styles.menuDesc}>Chat & saran nutrisi</Text>
                </View>
                {renderChevron()}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateStack('ManualMeasurement')}
                activeOpacity={0.85}
              >
                {renderMenuIcon('scale-bathroom')}
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Ukur Manual</Text>
                  <Text style={styles.menuDesc}>Simpan hasil pengukuran anak</Text>
                </View>
                {renderChevron()}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateStack('AIVisionStadiometer')}
                activeOpacity={0.85}
              >
                {renderMenuIcon('camera')}
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>AI Vision</Text>
                  <Text style={styles.menuDesc}>Estimasi tinggi lewat kamera AI</Text>
                </View>
                {renderChevron()}
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        {/* Lainnya */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Lainnya</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateStack('Help')}
            activeOpacity={0.85}
          >
            {renderMenuIcon('help-circle-outline')}
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Bantuan & FAQ</Text>
              <Text style={styles.menuDesc}>Panduan penggunaan aplikasi</Text>
            </View>
            {renderChevron()}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowAbout(!showAbout)}
            activeOpacity={0.85}
          >
            {renderMenuIcon('information-outline')}
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Tentang Aplikasi</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.status.success }]}>
                  <Text style={[styles.statusText, { color: colors.text.inverse }]}>
                    v3.0.0
                  </Text>
                </View>
              </View>
              <Text style={styles.menuDesc}>BabyGrow · UIGM 2026</Text>
            </View>
            {renderChevron(showAbout)}
          </TouchableOpacity>

          {showAbout && (
            <View style={styles.expandedContent}>
              <Text style={styles.aboutTitle}>BabyGrow</Text>
              <Text style={styles.aboutVersion}>Versi 3.0.0 · Expo SDK 54</Text>

              <Text style={styles.aboutSectionTitle}>Visi Kami</Text>
              <Text style={styles.aboutText}>
                BabyGrow memantau pertumbuhan balita berbasis standar WHO dan integrasi IoT
                untuk mendukung pencegahan stunting di Indonesia.
              </Text>

              <Text style={styles.aboutSectionTitle}>Fitur Utama</Text>
              <Text style={styles.aboutText}>
                • Standar pertumbuhan WHO{'\n'}
                • Pengukuran manual, alat pintar, dan kamera AI{'\n'}
                • Dashboard orang tua & petugas{'\n'}
                • Resep MBG & asisten AI{'\n'}
                • Sambungkan alat ukur BabyGrow
              </Text>

              <Text style={styles.aboutSectionTitle}>Data & Keamanan</Text>
              <Text style={styles.aboutText}>
                • Login aman untuk orang tua & petugas{'\n'}
                • Pengukuran bisa antre saat offline{'\n'}
                • Akun: Orang Tua atau Petugas/Perawat
              </Text>

              <Text style={styles.aboutSectionTitle}>Kontak</Text>
              <Text style={styles.aboutText}>
                Proyek akademik · Universitas Indo Global Mandiri{'\n'}
                © 2026 BabyGrow Team
              </Text>

              <View style={styles.uigmFooter}>
                <Text style={styles.uigmTitle}>Developed by</Text>
                <Text style={styles.uigmAuthor}>Jemi Altio</Text>
                <Text style={styles.uigmDepartment}>Sistem Komputer</Text>
                <Text style={styles.uigmUniversity}>Universitas Indo Global Mandiri</Text>
                <Text style={styles.uigmYear}>2026</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => {
              showAlert('Logout', 'Apakah Anda yakin ingin keluar?', [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: async () => {
                    await HapticService.buttonPress();
                    await logout();
                  },
                },
              ]);
            }}
            activeOpacity={0.85}
          >
            {renderMenuIcon('logout', true)}
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, styles.logoutText]}>Keluar</Text>
            </View>
            {renderChevron()}
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.uigmFooter}>
            <MaterialCommunityIcons
              name="school"
              size={28}
              color={colors.primary.main}
              style={{ marginBottom: spacing.xs }}
            />
            <Text style={styles.uigmTitle}>Developed by</Text>
            <Text style={styles.uigmAuthor}>Jemi Altio</Text>
            <Text style={styles.uigmDepartment}>Sistem Komputer</Text>
            <Text style={styles.uigmUniversity}>Universitas Indo Global Mandiri</Text>
            <Text style={styles.uigmYear}>© 2026</Text>
          </View>
        </View>
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
    paddingBottom: 120,
  },
  headerCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.diffusion,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.fixed,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userName: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary.fixed,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    ...typography.styles.labelCaps,
    color: colors.primary.main,
  },
  menuSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    ...typography.styles.labelCaps,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.lowest,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
    ...shadows.diffusion,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.fixed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  menuIconContainerDestructive: {
    backgroundColor: 'rgba(186, 26, 26, 0.1)',
  },
  menuContent: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  menuTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.onSurface,
  },
  menuDesc: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    opacity: 0.8,
  },
  statusBadge: {
    backgroundColor: colors.primary.fixed,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary.onFixedVariant,
  },
  expandedContent: {
    backgroundColor: colors.surface.lowest,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
    ...shadows.soft,
  },
  infoRow: {
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.onSurface,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.low,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  securityIcon: {
    marginRight: spacing.sm,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.onSurface,
    marginBottom: spacing.xs,
  },
  securityDesc: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.fixed,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  securityInfoIcon: {
    marginRight: spacing.xs,
  },
  securityInfoText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.onSurfaceVariant,
    lineHeight: 16,
  },
  emptyChildren: {
    color: colors.text.secondary,
    padding: spacing.sm,
    fontFamily: typography.fontFamily.medium,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.low,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  childIcon: {
    marginRight: spacing.sm,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.onSurface,
    marginBottom: spacing.xs,
  },
  childDetails: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary.main,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  addChildText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  aboutTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  aboutVersion: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  aboutSectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.onSurface,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  aboutText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  logoutItem: {
    marginTop: spacing.md,
  },
  logoutText: {
    color: colors.status.error,
  },
  gallerySectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  galleryDesc: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
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
    backgroundColor: colors.effects.shadowMedium,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface.low,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.neutral.gray400,
  },
  photoPlaceholderText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  galleryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.fixed,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  galleryInfoIcon: {
    marginRight: spacing.xs,
  },
  galleryInfoText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.onSurfaceVariant,
    lineHeight: 16,
  },
  footerContainer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  uigmFooter: {
    backgroundColor: colors.surface.lowest,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.diffusion,
  },
  uigmTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  uigmAuthor: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  uigmDepartment: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.onSurface,
    marginBottom: spacing.xs,
  },
  uigmUniversity: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.onSurface,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  uigmYear: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
