
import { View, StyleSheet, ScrollView, RefreshControl, Image, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth-store';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { Feather } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { LinearGradient } from 'expo-linear-gradient';

export default function Dashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [stats, setStats] = useState({ xp: 0, level: 1, nextLevelXp: 100 });
  const [continueLearning, setContinueLearning] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const status = await Network.getNetworkStateAsync();
      if (!status.isConnected) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Parallel fetch for dashboard data
      const [coursesRes, statsRes] = await Promise.all([
        apiClient('/courses'), // In real app, separate endpoints for "enrolled" vs "recommended"
        apiClient('/gamification/stats').catch(() => null) // Graceful fail
      ]);

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        const allCourses = Array.isArray(data) ? data : (data.courses || []);
        
        // Mocking "Continue Learning" vs "Recommended" logic for now
        // In a real app, backend filters this
        setContinueLearning(allCourses.slice(0, 3)); 
        setRecommended(allCourses.slice(3, 6));
      }

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

    } catch (error) {
      console.error('Dashboard load error:', error);
      // Don't show toast on initial load to avoid annoyance, only on pull-to-refresh if fails
      if (refreshing) showToast({ type: 'error', title: 'Failed to refresh dashboard' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderCourseCard = (course: any, type: 'continue' | 'recommended') => {
    const isRecommended = type === 'recommended';
    
    return (
      <Card 
        key={course.id} 
        style={[styles.courseCard, isRecommended ? styles.recommendedCard : undefined]}
        variant={isRecommended ? 'elevated' : 'default'}
        onPress={() => {
            if (isRecommended) {
                router.push(`/(app)/courses/${course.id}`);
            } else {
                router.push(`/(app)/courses/${course.id}/learn`);
            }
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, isRecommended && styles.iconBoxAlt]}>
            <Feather 
              name={isRecommended ? "star" : "book-open"} 
              size={20} 
              color={isRecommended ? "white" : Colors.light.primary} 
            />
          </View>
          {!isRecommended && (
             <View style={styles.progressBadge}>
               <Text style={styles.progressLabel}>{course.progress || 0}%</Text>
             </View>
          )}
        </View>
        
        <View style={styles.cardContent}>
          <Text 
            style={[styles.courseTitle, isRecommended && { color: 'white' }]} 
            numberOfLines={2}
          >
            {course.title}
          </Text>
          
          {isRecommended ? (
             <Text style={styles.categoryText} numberOfLines={1}>
                {typeof course.category === 'object' ? (course.category?.name || 'General') : (course.category || 'General')}
             </Text>
          ) : (
            <View style={styles.progressBarBg}>
                <View style={[styles.progressFill, { width: `${course.progress || 0}%` }]} />
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Decorative Header Background */}
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        style={styles.headerBackground}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); loadData(); }} 
              tintColor="white"
            />
          }
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.firstName || 'Learner'}!</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatar}>
               {user?.avatar ? (
                 <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
               ) : (
                 <Text style={styles.avatarText}>{user?.firstName?.[0]}</Text>
               )}
            </TouchableOpacity>
          </View>

          {/* Gamification Widget */}
          <Card style={styles.statsCard} variant="elevated">
            <View style={styles.statsRow}>
               <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.level}</Text>
                  <Text style={styles.statLabel}>Level</Text>
               </View>
               <View style={styles.divider} />
               <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.xp}</Text>
                  <Text style={styles.statLabel}>XP Earned</Text>
               </View>
               <View style={styles.divider} />
               <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.nextLevelXp - stats.xp}</Text>
                  <Text style={styles.statLabel}>To Next Lvl</Text>
               </View>
            </View>
          </Card>

          {/* Continue Learning */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Learning</Text>
              <Button 
                  title="See All" 
                  variant="ghost" 
                  size="sm" 
                  onPress={() => router.push('/(app)/courses')} 
              />
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalList}
              decelerationRate="fast"
              snapToInterval={200 + Spacing.md} // card width + gap
            >
              {continueLearning.length > 0 ? (
                  continueLearning.map(c => renderCourseCard(c, 'continue'))
              ) : (
                  <View style={styles.emptyStateCard}>
                    <Text style={styles.emptyText}>No courses in progress</Text>
                    <Button 
                      title="Browse Courses" 
                      variant="outline" 
                      size="sm" 
                      onPress={() => router.push('/(app)/courses')}
                      style={{ marginTop: 8 }}
                    />
                  </View>
              )}
            </ScrollView>
          </View>

          {/* Recommended */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalList}
              decelerationRate="fast"
              snapToInterval={200 + Spacing.md}
            >
              {recommended.length > 0 ? (
                  recommended.map(c => renderCourseCard(c, 'recommended'))
              ) : (
                  <Text style={styles.emptyText}>No recommendations yet</Text>
              )}
            </ScrollView>
          </View>

        </ScrollView>
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
    height: 280, // Covers header and part of stats card
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  horizontalList: {
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  courseCard: {
    width: 200,
    height: 160,
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  recommendedCard: {
    backgroundColor: Colors.light.primary, // Will be overridden if gradient used, but keeping simple for now
    borderWidth: 0,
    ...Shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxAlt: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBadge: {
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  cardContent: {
    justifyContent: 'flex-end',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  categoryText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.light.secondary,
    borderRadius: 3,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  emptyStateCard: {
    width: 200,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  emptyText: {
    color: Colors.light.textMuted,
    fontStyle: 'italic',
    marginBottom: 8,
  },
});
