import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Shadows, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth-store';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native';

export default function EditProfileScreen() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || null,
  });

  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        avatar: user.avatar || null,
      });
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      showToast({ type: 'error', title: 'Permission required', message: 'We need permission to access your photos' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast({ type: 'error', title: 'Error', message: 'First name and last name are required' });
      return;
    }

    setSaving(true);
    try {
      // 1. Upload avatar if selected
      let avatarUrl = formData.avatar;
      
      if (selectedImage) {
        const formDataImage = new FormData();
        
        // Prepare file object for FormData
        const file = {
          uri: selectedImage.uri,
          name: selectedImage.fileName || 'avatar.jpg',
          type: selectedImage.mimeType || 'image/jpeg',
        };

        // TypeScript workaround for React Native FormData
        formDataImage.append('file', file as any);

        try {
          const uploadResponse = await apiClient('/users/avatar', {
            method: 'POST',
            body: formDataImage,
          });
          const uploadData = await uploadResponse.json();
          avatarUrl = uploadData.avatar;
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          showToast({ type: 'error', title: 'Avatar upload failed', message: 'Continuing with profile update...' });
        }
      }

      // 2. Update profile data
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
      };

      const response = await apiClient('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      const userData = await response.json();
      
      // Update local store
      setUser(userData);
      
      showToast({ type: 'success', title: 'Profile updated successfully' });
      router.back();
    } catch (error) {
      console.error('Update profile error:', error);
      showToast({ type: 'error', title: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        style={styles.headerBackground}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage.uri }} style={styles.avatar} />
              ) : formData.avatar ? (
                <Image source={{ uri: formData.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitials}>
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Feather name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                placeholder="Enter your first name"
                placeholderTextColor={Colors.light.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                placeholder="Enter your last name"
                placeholderTextColor={Colors.light.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Tell us about yourself"
                placeholderTextColor={Colors.light.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button 
            title={saving ? "Saving..." : "Save Changes"} 
            onPress={handleSave}
            disabled={saving}
            variant="primary"
            fullWidth
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 120,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
  },
  content: {
    padding: Spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.border,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarInitials: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: 'white',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.light.text,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.light.text,
    ...Shadows.sm,
  },
  textArea: {
    minHeight: 100,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
