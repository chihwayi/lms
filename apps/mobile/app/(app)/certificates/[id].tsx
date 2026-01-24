import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Colors, Spacing } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function CertificateViewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateCertificate = async () => {
      try {
        // Fetch course/enrollment details to get enrollment ID
        const response = await apiClient('/enrollments/my-courses');
        if (response.ok) {
          const data = await response.json();
          const enrollment = data.find((item: any) => item.course.id === id);
          
          if (enrollment) {
            // Fetch rendered HTML from backend
            const htmlResponse = await apiClient(`/certificates/render/${enrollment.id}`);
            if (htmlResponse.ok) {
              const htmlContent = await htmlResponse.text();
              setHtml(htmlContent);
            } else {
               // Fallback if render fails
               setHtml('<html><body><h1>Failed to load certificate</h1></body></html>');
            }
          }
        }
      } catch (error) {
        console.error('Error generating certificate:', error);
      } finally {
        setLoading(false);
      }
    };

    generateCertificate();
  }, [id, user]);

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
          <Text style={styles.headerTitle}>Certificate View</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.primary} />
          ) : html ? (
            Platform.OS === 'web' ? (
              React.createElement('iframe', {
                srcDoc: html,
                style: { width: '100%', height: '100%', border: 'none' }
              })
            ) : (
              <WebView 
                source={{ html }} 
                originWhitelist={['*']}
                style={styles.webview}
              />
            )
          ) : (
            <View style={styles.errorState}>
              <Text>Certificate not found</Text>
            </View>
          )}
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
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
