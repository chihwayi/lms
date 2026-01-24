import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Shadows, BorderRadius } from '@/constants/theme';
import { apiClient } from '@/lib/api-client';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function CertificatesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const response = await apiClient('/enrollments/my-courses');
      if (response.ok) {
        const data = await response.json();
        // Filter for completed courses (progress === 100)
        const completed = data.filter((item: any) => item.progress === 100);
        setCertificates(completed);
      }
    } catch (error) {
      console.error('Failed to load certificates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/certificates/${item.course.id}`)}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Feather name="award" size={32} color={Colors.light.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.courseTitle}>{item.course.title}</Text>
          <Text style={styles.date}>Completed on {new Date(item.completedAt || item.updatedAt || Date.now()).toLocaleDateString()}</Text>
        </View>
        <Feather name="chevron-right" size={24} color={Colors.light.textMuted} />
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Certificates</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={certificates}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Feather name="award" size={64} color={Colors.light.textMuted} />
                <Text style={styles.emptyTitle}>No Certificates Yet</Text>
                <Text style={styles.emptyText}>Complete a course to earn your first certificate!</Text>
              </View>
            ) : null
          }
        />
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
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.light.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
});
