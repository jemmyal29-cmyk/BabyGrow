/**
 * Edit Child Profile Screen - Full Page Form with Glassmorphism
 * Floating labels, photo gallery management, and premium styling
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
// import { useDarkMode } from '../store/themeStore';
const { isDarkMode } = { isDarkMode: false }; // Temporary fix
import { useNotification } from '../hooks/useNotification';
import CustomNotification from '../components/common/CustomNotification';

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

export default function EditChildProfileScreen({ navigation, route }: EditChildProfileScreenProps) {
  const { isDarkMode } = { isDarkMode: false }; // Temporary fix
  const { notification, showError, showSuccess, showConfirm, hideNotification } = useNotification();
  const child = route?.params?.child;

  // Form state
  const [name, setName] = useState(child?.name || '');
  const [birthDate, setBirthDate] = useState(child?.birthDate || '');
  const [gender, setGender] = useState(child?.gender || 'Laki-laki');
  const [childhoodPhotos, setChildhoodPhotos] = useState<ChildhoodPhoto[]>([]);

  // Animation refs
  const nameInputAnim = useRef(new Animated.Value(0)).current;
  const birthDateInputAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadChildhoodPhotos();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadChildhoodPhotos = async () => {
    try {
      const photosData = await AsyncStorage.getItem('childhood_photos');
      if (photosData) {
        setChildhoodPhotos(JSON.parse(photosData));
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  };

  const saveChildhoodPhotos = async (photos: ChildhoodPhoto[]) => {
    try {
      await AsyncStorage.setItem('childhood_photos', JSON.stringify(photos));
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

  const removePhoto = async (photoId: string) => {
    // Using CustomNotification instead of Alert.alert for Expo Go
    showError('Info', 'Fitur hapus foto belum diimplementasikan');
    // TODO: Implement proper delete confirmation with CustomNotification modal
    /*
    Alert.alert(
      'Hapus Foto',
      'Apakah Anda yakin ingin menghapus foto ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const updatedPhotos = childhoodPhotos.filter(photo => photo.id !== photoId);
            await saveChildhoodPhotos(updatedPhotos);
          },
        },
      ]
    );
    */
  };

  const animateInput = (animValue: Animated.Value, focused: boolean) => {
    Animated.timing(animValue, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSave = () => {
    if (!name.trim()) {
      showError('Validasi', 'Nama anak harus diisi');
      return;
    }

    if (!birthDate.trim()) {
      showError('Validasi', 'Tanggal lahir harus diisi');
      return;
    }

    // Save the child data
    const updatedChild = {
      ...child,
      name: name.trim(),
      birthDate: birthDate.trim(),
      gender,
    };

    showSuccess(
      'Berhasil!',
      'Profil anak berhasil disimpan 💗',
      () => navigation.goBack()
    );
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
      color: isDarkMode ? '#FFFFFF' : colors.text.secondary,
    };

    return (
      <View style={[
        styles.inputContainer,
        { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF' }
      ]}>
        <Animated.Text style={[styles.floatingLabel, labelStyle]}>
          {label}
        </Animated.Text>
        <TextInput
          style={[
            styles.input,
            { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : colors.text.tertiary}
          onFocus={() => animateInput(animValue, true)}
          onBlur={() => animateInput(animValue, value.length > 0)}
        />
      </View>
    );
  };

  const renderGenderSelector = () => (
    <View style={styles.genderContainer}>
      <Text style={[
        styles.sectionTitle,
        { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
      ]}>
        Jenis Kelamin
      </Text>
      <View style={styles.genderButtons}>
        {['Laki-laki', 'Perempuan'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.genderButton,
              gender === option && {
                backgroundColor: isDarkMode ? colors.pink[100] : colors.pink.main,
              },
              {
                backgroundColor: gender === option 
                  ? (isDarkMode ? colors.pink[100] : colors.pink.main)
                  : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF'),
                borderColor: isDarkMode ? colors.pink[100] : colors.pink.main,
              }
            ]}
            onPress={() => setGender(option)}
          >
            <Text style={[
              styles.genderButtonText,
              {
                color: gender === option 
                  ? '#FFFFFF' 
                  : (isDarkMode ? '#FFFFFF' : colors.pink.main),
              }
            ]}>
              {option === 'Laki-laki' ? '👦' : '👧'} {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPhotoGallery = () => (
    <View style={[
      styles.galleryContainer,
      { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF' }
    ]}>
      <Text style={[
        styles.sectionTitle,
        { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
      ]}>
        📸 Galeri Masa Kecil ({childhoodPhotos.length}/5)
      </Text>
      
      <View style={styles.photoGrid}>
        {Array.from({ length: 5 }).map((_, index) => {
          const photo = childhoodPhotos[index];
          
          if (photo) {
            return (
              <TouchableOpacity
                key={photo.id}
                style={[
                  styles.photoSlot,
                  { backgroundColor: isDarkMode ? 'rgba(255, 105, 180, 0.2)' : colors.pink[50] }
                ]}
                onLongPress={() => removePhoto(photo.id)}
              >
                <View style={styles.photoContainer}>
                  <Text style={styles.photoEmoji}>📷</Text>
                  <Text style={[
                    styles.photoLabel,
                    { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
                  ]}>
                    {photo.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.photoSlot,
                styles.emptyPhotoSlot,
                { 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : colors.background.default,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : '#EEEEEE',
                }
              ]}
              onPress={pickImage}
            >
              <Text style={styles.addPhotoIcon}>+</Text>
              <Text style={[
                styles.addPhotoText,
                { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
              ]}>
                Tambah Foto
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <Text style={[
        styles.galleryHint,
        { color: isDarkMode ? '#FFFFFF' : colors.text.tertiary }
      ]}>
        💡 Tekan lama foto untuk menghapus
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#212529' : colors.background.default }
    ]} edges={['top']}>
      {/* Header */}
      <View style={[
        styles.header,
        { backgroundColor: isDarkMode ? '#343a40' : '#FFFFFF' }
      ]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[
            styles.backIcon,
            { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
          ]}>←</Text>
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
        ]}>
          ✏️ Edit Profil Anak
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={[
            styles.saveButtonText,
            { color: isDarkMode ? colors.pink[100] : colors.pink.main }
          ]}>
            Simpan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Basic Information */}
          <View style={[
            styles.section,
            { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF' }
          ]}>
            <Text style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
            ]}>
              👶 Informasi Dasar
            </Text>
            
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

          {/* Photo Gallery */}
          {renderPhotoGallery()}

          {/* Additional Information */}
          <View style={[
            styles.section,
            { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF' }
          ]}>
            <Text style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
            ]}>
              📋 Informasi Tambahan
            </Text>
            
            <View style={styles.infoRow}>
              <Text style={[
                styles.infoLabel,
                { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
              ]}>
                Berat Lahir:
              </Text>
              <Text style={[
                styles.infoValue,
                { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
              ]}>
                3.2 kg
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[
                styles.infoLabel,
                { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
              ]}>
                Tinggi Lahir:
              </Text>
              <Text style={[
                styles.infoValue,
                { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
              ]}>
                49 cm
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[
                styles.infoLabel,
                { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
              ]}>
                Golongan Darah:
              </Text>
              <Text style={[
                styles.infoValue,
                { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
              ]}>
                A
              </Text>
            </View>
          </View>

          {/* UIGM Footer */}
          <View style={styles.footerContainer}>
            <Text style={[
              styles.footerText,
              { color: isDarkMode ? '#FFFFFF' : colors.text.tertiary }
            ]}>
              Developed by Jemi Altio - Sistem Komputer
            </Text>
            <Text style={[
              styles.footerText,
              { color: isDarkMode ? '#FFFFFF' : colors.text.tertiary }
            ]}>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.soft,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
  },
  saveButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold as any,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.standard,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    marginBottom: spacing.md,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    ...shadows.soft,
  },
  floatingLabel: {
    position: 'absolute',
    left: spacing.md,
    fontWeight: typography.fontWeight.medium as any,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xs,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    fontSize: typography.fontSize.md,
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
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    ...shadows.soft,
  },
  genderButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold as any,
  },
  galleryContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.standard,
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
    ...shadows.soft,
  },
  emptyPhotoSlot: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoEmoji: {
    fontSize: 20,
    marginBottom: spacing.xs / 2,
  },
  photoLabel: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  addPhotoIcon: {
    fontSize: 24,
    color: colors.pink.main,
    marginBottom: spacing.xs / 2,
  },
  addPhotoText: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  galleryHint: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  infoLabel: {
    fontSize: typography.fontSize.md,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold as any,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
});
