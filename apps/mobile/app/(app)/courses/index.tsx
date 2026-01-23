import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
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
        onPress={() => router.push(`/(app)/courses/${item.id}/learn`)}
      >
        <View style={styles.courseHeader}>
          <View style={styles.courseIcon}>
            <Feather name="book" size={24} color={Colors.light.primary} />
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.courseCategory}>
              {typeof item.category === 'object' ? (item.category?.name || 'General') : (item.category || 'General')}
            </Text>
          </View>
          {isOnline && (
            <Button
              title={isDownloaded ? "Saved" : isCurrentDownloading ? `${Math.round(downloadProgress)}%` : ""}
              icon={<Feather name={isDownloaded ? "check" : "download"} size={16} color={isDownloaded ? Colors.light.success : Colors.light.primary} />}
              onPress={() => !isDownloaded && !isDownloading && handleDownload(item.id)}
              variant="ghost"
              size="sm"
              disabled={isDownloaded || isDownloading}
            />
          )}
        </View>
        <Text style={styles.courseDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
        </View>
        <Text style={styles.progressText}>{item.progress || 0}% Complete</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Courses</Text>
        <Button 
            title={isOnline ? "Online" : "Offline"} 
            variant={isOnline ? "ghost" : "destructive"} 
            size="sm"
            icon={<Feather name={isOnline ? "wifi" : "wifi-off"} size={14} color={isOnline ? Colors.light.success : "white"} />}
            onPress={() => {}} 
        />
      </View>
      <FlatList
        data={courses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCourses(); }} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Feather name="book-open" size={48} color={Colors.light.textMuted} />
              <Text style={styles.emptyText}>No courses found</Text>
              <Button title="Browse Catalog" onPress={() => router.push('/(app)/dashboard')} variant="outline" style={{marginTop: 16}} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  courseCard: {
    marginBottom: 4,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  courseCategory: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  courseDesc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.secondary,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    color: Colors.light.textSecondary,
    fontSize: 16,
  },
});
