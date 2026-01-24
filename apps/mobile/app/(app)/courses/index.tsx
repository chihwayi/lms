
import { View, StyleSheet, FlatList, RefreshControl, StatusBar } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Shadows, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { Feather } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { offlineStorage } from '@/lib/offline-storage';
import { useOfflineCourse } from '@/hooks/use-offline-course';
import { Button } from '@/components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';

export default function CoursesScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  const { downloadCourse, isDownloading, downloadProgress, isCourseDownloaded } = useOfflineCourse();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  const loadCourses = useCallback(async () => {
    try {
      const status = await Network.getNetworkStateAsync();
      const online = !!status.isConnected && !!status.isInternetReachable;
      setIsOnline(online);

      if (online) {
        const res = await apiClient('/courses');
        if (res.ok) {
          const data = await res.json();
          const courseList = Array.isArray(data) ? data : (data.courses || []);
          setCourses(courseList);
          checkDownloads(courseList);
        } else {
          throw new Error('Failed to fetch courses');
        }
      } else {
        const offlineCourses = await offlineStorage.getAllCourses();
        setCourses(offlineCourses || []);
        const ids = new Set(offlineCourses?.map((c: any) => c.id));
        setDownloadedIds(ids);
      }
    } catch (error) {
      console.error('Load courses error:', error);
      showToast({ type: 'error', title: 'Failed to load courses' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const checkDownloads = async (courseList: any[]) => {
    const ids = new Set<string>();
    for (const c of courseList) {
        if (await isCourseDownloaded(c.id)) {
            ids.add(c.id);
        }
    }
    setDownloadedIds(ids);
  };

  const handleDownload = async (courseId: string) => {
    try {
      setDownloadingId(courseId);
      showToast({ type: 'info', title: 'Download started', message: 'Course content is downloading...' });
      await downloadCourse(courseId);
      setDownloadedIds(prev => new Set(prev).add(courseId));
      showToast({ type: 'success', title: 'Download complete' });
    } catch (error) {
      showToast({ type: 'error', title: 'Download failed' });
    } finally {
      setDownloadingId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isDownloaded = downloadedIds.has(item.id);
    const isCurrentDownloading = downloadingId === item.id;

    return (
      <Card 
        style={styles.courseCard} 
        variant="elevated"
        onPress={() => router.push(`/(app)/courses/${item.id}/learn`)}
      >
        <View style={styles.cardInner}>
          <View style={styles.courseHeader}>
            <View style={styles.iconContainer}>
              <Feather name="book" size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.courseCategory}>
                {typeof item.category === 'object' ? (item.category?.name || 'General') : (item.category || 'General')}
              </Text>
            </View>
          </View>
          
          <Text style={styles.courseDesc} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
            </View>
            <Text style={styles.progressText}>{item.progress || 0}%</Text>
          </View>

          <View style={styles.cardFooter}>
            <Button
              title={isOnline ? (isDownloaded ? "Available Offline" : "Download") : (isDownloaded ? "Available" : "Not Available")}
              variant={isDownloaded ? "ghost" : "outline"}
              size="sm"
              icon={<Feather name={isDownloaded ? "check-circle" : "download-cloud"} size={14} color={isDownloaded ? Colors.light.success : Colors.light.primary} />}
              onPress={() => !isDownloaded && isOnline && !isDownloading && handleDownload(item.id)}
              disabled={isDownloaded || isDownloading || !isOnline}
              style={styles.downloadBtn}
            />
             {isCurrentDownloading && (
                <Text style={styles.downloadingText}>Downloading... {Math.round(downloadProgress)}%</Text>
             )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        style={styles.headerBackground}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>My Courses</Text>
          <View style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}>
            <Feather name={isOnline ? "wifi" : "wifi-off"} size={12} color="white" />
            <Text style={styles.statusText}>{isOnline ? "Online" : "Offline"}</Text>
          </View>
        </View>

        <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); loadCourses(); }} 
              tintColor="white"
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                  <Feather name="book-open" size={48} color={Colors.light.primary} />
                </View>
                <Text style={styles.emptyTitle}>No courses found</Text>
                <Text style={styles.emptyText}>You haven't enrolled in any courses yet.</Text>
                <Button 
                  title="Browse Catalog" 
                  onPress={() => router.push('/(app)/dashboard')} 
                  variant="primary" 
                  style={{marginTop: Spacing.lg}} 
                />
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
    height: 150,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusOnline: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  statusOffline: {
    backgroundColor: Colors.light.destructive,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.lg,
  },
  courseCard: {
    padding: 0, // Reset default padding to handle inner layout
    overflow: 'hidden',
  },
  cardInner: {
    padding: Spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  courseCategory: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
  courseDesc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.secondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted,
    width: 40,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.md,
  },
  downloadBtn: {
    height: 36,
  },
  downloadingText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});
