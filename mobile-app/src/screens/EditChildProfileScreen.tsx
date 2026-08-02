/**
 * Edit Child Profile Screen - Full Page Form with Glassmorphism
 * Floating labels, photo gallery management, and premium styling
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { ScreenHeader } from '../components/common';
import { useNotification } from '../hooks/useNotification';
import CustomNotification from '../components/common/CustomNotification';
import {
  createChildSchema,
  formatIsoToBirthDate,
  parseBirthDateToIso,
  useUpdateChild,
} from '../hooks/useChildren';
import type { ChildRow, Gender } from '../types/database';

const { width } = Dimensions.get('window');

interface EditChildProfileScreenProps {
  navigation: any;
  route: any;
}

interface ChildhoodPhoto {
  id: string;
  uri: string;
  label: string;
}

function genderToUi(value?: string | null): 'Laki-laki' | 'Perempuan' {
  if (value === 'female' || value === 'Perempuan') return 'Perempuan';
  return 'Laki-laki';
}

function genderToDb(value: string): Gender {
  return value === 'Perempuan' || value === 'female' ? 'female' : 'male';
}

export default function EditChildProfileScreen({ navigation, route }: EditChildProfileScreenProps) {
  const { notification, showError, showSuccess, showConfirm, hideNotification } =
    useNotification();
  const child = route?.params?.child as ChildRow | undefined;
  const childId: string | undefined = route?.params?.childId ?? child?.id;
  const updateChild = useUpdateChild();

  const initialBirthDate = useMemo(() => {
    const raw =
      child?.date_of_birth ||
      (child as { birthDate?: string } | undefined)?.birthDate ||
      '';
    return formatIsoToBirthDate(raw);
  }, [child]);

  // Form state
  const [name, setName] = useState(child?.name || '');
  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>(
    genderToUi(child?.gender)
  );
  const [childhoodPhotos, setChildhoodPhotos] = useState<ChildhoodPhoto[]>([]);
  const [saving, setSaving] = useState(false);

  // Animation refs
  const nameInputAnim = useRef(new Animated.Value(name ? 1 : 0)).current;
  const birthDateInputAnim = useRef(new Animated.Value(initialBirthDate ? 1 : 0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const photosKey = childId
    ? `@babygrow/childhood_photos_${childId}`
    : '@babygrow/childhood_photos';

  useEffect(() => {
    loadChildhoodPhotos();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [photosKey]);

  const loadChildhoodPhotos = async () => {
    try {
      const photosData = await AsyncStorage.getItem(photosKey);
      if (photosData) {
        setChildhoodPhotos(JSON.parse(photosData));
      } else {
        setChildhoodPhotos([]);
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  };

  const saveChildhoodPhotos = async (photos: ChildhoodPhoto[]) => {
    try {
      await AsyncStorage.setItem(photosKey, JSON.stringify(photos));
      setChildhoodPhotos(photos);
    } catch (error) {
      console.error('Failed to save photos:', error);
      showError('Error', 'Gagal menyimpan foto');
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        showError('Izin Ditolak', 'Izinkan akses ke galeri untuk menambah foto');
        return;
      }

      if (childhoodPhotos.length >= 5) {
        showError('Batas Maksimal', 'Maksimal 5 foto masa kecil');
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
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          label: `Foto ${childhoodPhotos.length + 1}`,
        };

        const updatedPhotos = [...childhoodPhotos, newPhoto];
        await saveChildhoodPhotos(updatedPhotos);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showError('Error', 'Gagal memilih foto');
    }
  };

  const removePhoto = (photoId: string) => {
    showConfirm(
      'Hapus Foto',
      'Apakah Anda yakin ingin menghapus foto ini?',
      async () => {
        const updatedPhotos = childhoodPhotos.filter((photo) => photo.id !== photoId);
        await saveChildhoodPhotos(updatedPhotos);
      },
      'Hapus',
      'Batal'
    );
  };

  const animateInput = (animValue: Animated.Value, focused: boolean) => {
    Animated.timing(animValue, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSave = async () => {
    if (!childId) {
      showError('Error', 'Data anak tidak ditemukan. Buka ulang dari daftar anak.');
      return;
    }

    const parsed = createChildSchema.safeParse({
      name: name.trim(),
      gender: genderToDb(gender),
      birthDate: birthDate.trim(),
    });

    if (!parsed.success) {
      showError(
        'Validasi',
        parsed.error.errors[0]?.message || 'Data profil tidak valid'
      );
      return;
    }

    const date_of_birth = parseBirthDateToIso(parsed.data.birthDate);
    if (!date_of_birth) {
      showError('Validasi', 'Tanggal lahir tidak valid');
      return;
    }

    setSaving(true);
    try {
      await updateChild.mutateAsync({
        id: childId,
        name: parsed.data.name,
        gender: parsed.data.gender,
        date_of_birth,
        birth_weight: child?.birth_weight ?? null,
        birth_height: child?.birth_height ?? null,
        child_blood: child?.child_blood ?? null,
      });

      showSuccess('Berhasil!', 'Profil anak berhasil disimpan', () =>
        navigation.goBack()
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Gagal menyimpan profil anak';
      showError('Gagal Menyimpan', message);
    } finally {
      setSaving(false);
    }
  };

  const renderFloatingLabelInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    animValue: Animated.Value,
    placeholder?: string
  ) => {
    const labelStyle = {
      top: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [16, -8],
      }),
      fontSize: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
      }),
      color: colors.text.secondary,
    };

    return (
      <View style={styles.inputContainer}>
        <Animated.Text style={[styles.floatingLabel, labelStyle]}>
          {label}
        </Animated.Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          onFocus={() => animateInput(animValue, true)}
          onBlur={() => animateInput(animValue, value.length > 0)}
        />
      </View>
    );
  };

  const renderGenderSelector = () => (
    <View style={styles.genderContainer}>
      <Text style={styles.sectionTitle}>Jenis Kelamin</Text>
      <View style={styles.genderButtons}>
        {['Laki-laki', 'Perempuan'].map((option) => {
          const active = gender === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.genderButton, active && styles.genderButtonActive]}
              onPress={() => setGender(option)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name={option === 'Laki-laki' ? 'face-man' : 'face-woman'}
                size={20}
                color={active ? colors.text.inverse : colors.primary.main}
              />
              <Text
                style={[
                  styles.genderButtonText,
                  active && styles.genderButtonTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderPhotoGallery = () => (
    <View style={styles.galleryContainer}>
      <Text style={styles.sectionTitle}>
        Galeri Masa Kecil ({childhoodPhotos.length}/5)
      </Text>

      <View style={styles.photoGrid}>
        {Array.from({ length: 5 }).map((_, index) => {
          const photo = childhoodPhotos[index];

          if (photo) {
            return (
              <TouchableOpacity
                key={photo.id}
                style={styles.photoSlot}
                onLongPress={() => removePhoto(photo.id)}
              >
                <View style={styles.photoContainer}>
                  <MaterialCommunityIcons
                    name="image"
                    size={22}
                    color={colors.primary.main}
                  />
                  <Text style={styles.photoLabel}>{photo.label}</Text>
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={index}
              style={[styles.photoSlot, styles.emptyPhotoSlot]}
              onPress={pickImage}
            >
              <MaterialCommunityIcons
                name="plus"
                size={22}
                color={colors.primary.main}
              />
              <Text style={styles.addPhotoText}>Tambah</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.galleryHint}>Tekan lama foto untuk menghapus</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader
        title="Edit Profil Anak"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={handleSave}
            hitSlop={8}
            disabled={saving || updateChild.isPending}
          >
            {saving || updateChild.isPending ? (
              <ActivityIndicator size="small" color={colors.primary.main} />
            ) : (
              <Text style={styles.saveButtonText}>Simpan</Text>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Dasar</Text>

            {renderFloatingLabelInput(
              'Nama Lengkap',
              name,
              setName,
              nameInputAnim,
              'Masukkan nama anak'
            )}

            {renderFloatingLabelInput(
              'Tanggal Lahir',
              birthDate,
              setBirthDate,
              birthDateInputAnim,
              'DD/MM/YYYY'
            )}

            {renderGenderSelector()}
          </View>

          {renderPhotoGallery()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Tambahan</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Berat Lahir:</Text>
              <Text style={styles.infoValue}>
                {child?.birth_weight != null
                  ? `${child.birth_weight} kg`
                  : '—'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tinggi Lahir:</Text>
              <Text style={styles.infoValue}>
                {child?.birth_height != null
                  ? `${child.birth_height} cm`
                  : '—'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Golongan Darah:</Text>
              <Text style={styles.infoValue}>
                {child?.child_blood?.trim() || '—'}
              </Text>
            </View>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Developed by Jemi Altio - Sistem Komputer
            </Text>
            <Text style={styles.footerText}>
              Universitas Indo Global Mandiri
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Custom notification */}
      <CustomNotification
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
        onConfirm={notification.onConfirm}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary.main,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  section: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.diffusion,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.onSurface,
    marginBottom: spacing.md,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    backgroundColor: colors.surface.lowest,
  },
  floatingLabel: {
    position: 'absolute',
    left: spacing.md,
    fontFamily: typography.fontFamily.medium,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xs,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.onSurface,
    fontFamily: typography.fontFamily.medium,
  },
  genderContainer: {
    marginBottom: spacing.md,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary.main,
    backgroundColor: colors.surface.lowest,
  },
  genderButtonActive: {
    backgroundColor: colors.primary.main,
  },
  genderButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary.main,
  },
  genderButtonTextActive: {
    color: colors.text.inverse,
  },
  galleryContainer: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.diffusion,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoSlot: {
    width: (width - spacing.md * 2 - spacing.lg * 2 - spacing.sm * 4) / 5,
    height: (width - spacing.md * 2 - spacing.lg * 2 - spacing.sm * 4) / 5,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.fixed,
  },
  emptyPhotoSlot: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.neutral.gray400,
    backgroundColor: colors.surface.low,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  addPhotoText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  galleryHint: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  infoLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.onSurface,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
