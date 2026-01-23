import { View, Text, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth-store';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { Feather } from '@expo/vector-icons';
import * as Network from 'expo-network';

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

  const renderCourseCard = (course: any, type: 'continue' | 'recommended') => (
    <Card 
      key={course.id} 
      style={[styles.courseCard, type === 'recommended' ? styles.recommendedCard : undefined]}
      onPress={() => router.push(`/(app)/courses/${course.id}/learn`)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, type === 'recommended' && styles.iconBoxAlt]}>
          <Feather name="book-open" size={20} color={type === 'recommended' ? 'white' : Colors.light.primary} />
        </View>
        {type === 'continue' && (
           <Text style={styles.progressLabel}>{course.progress || 0}%</Text>
        )}
      </View>
      
      <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
      
      {type === 'continue' && (
        <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${course.progress || 0}%` }]} />
        </View>
      )}
      
      {type === 'recommended' && (
        <View style={styles.metaRow}>
          <Feather name="star" size={12} color={Colors.light.warning} />
          <Text style={styles.metaText}>4.8</Text>
          <Text style={[styles.metaText, { marginLeft: 8 }]}>
            {typeof course.category === 'object' ? (course.category?.name || 'General') : (course.category || 'General')}
          </Text>
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.firstName || 'Learner'}!</Text>
          </View>
          <View style={styles.avatar}>
             <Text style={styles.avatarText}>{user?.firstName?.[0]}</Text>
          </View>
        </View>

        {/* Gamification Widget */}
        <Card style={styles.statsCard} variant="default">
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {continueLearning.length > 0 ? (
                continueLearning.map(c => renderCourseCard(c, 'continue'))
            ) : (
                <Text style={styles.emptyText}>No courses in progress</Text>
            )}
          </ScrollView>
        </View>

        {/* Recommended */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {recommended.length > 0 ? (
                recommended.map(c => renderCourseCard(c, 'recommended'))
            ) : (
                <Text style={styles.emptyText}>No recommendations yet</Text>
            )}
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsCard: {
    marginBottom: 32,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
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
    height: 30,
    backgroundColor: Colors.light.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  horizontalList: {
    gap: 16,
    paddingRight: 20,
  },
  courseCard: {
    width: 160,
    height: 140,
    justifyContent: 'space-between',
  },
  recommendedCard: {
    backgroundColor: Colors.light.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxAlt: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.secondary,
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyText: {
    color: Colors.light.textMuted,
    fontStyle: 'italic',
  },
});
