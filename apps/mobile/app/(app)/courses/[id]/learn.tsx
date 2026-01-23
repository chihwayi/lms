import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useOfflineCourse } from '@/hooks/use-offline-course';
import { apiClient } from '@/lib/api-client';
import { offlineStorage } from '@/lib/offline-storage';
import { VideoPlayer } from '@/components/CoursePlayer/VideoPlayer';
import { LessonContent } from '@/components/CoursePlayer/LessonContent';
import { QuizView } from '@/components/CoursePlayer/QuizView';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth-store';
import * as Network from 'expo-network';

export default function CourseLearnScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      
      // Check connectivity
      const status = await Network.getNetworkStateAsync();
      const online = !!status.isConnected && !!status.isInternetReachable;
      
      let courseData = null;

      if (online && accessToken) {
        try {
            const res = await apiClient(`/courses/${id}`);
            if (res.ok) {
                courseData = await res.json();
            }
        } catch (e) {
            console.log('Online fetch failed, trying offline');
        }
      }

      if (!courseData) {
          courseData = await offlineStorage.getCourse(id);
          setIsOfflineMode(true);
      }

      if (!courseData) {
          Alert.alert('Error', 'Course not found. Please download it first if you are offline.');
          router.back();
          return;
      }

      setCourse(courseData);
      
      // Set initial lesson (first one)
      if (courseData.modules?.[0]?.lessons?.[0]) {
          await loadLesson(courseData.modules[0].lessons[0].id, courseData);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (lessonId: string, courseData = course) => {
      try {
          // Find basic lesson info from course structure
          let lessonMeta = null;
          for (const m of courseData.modules) {
              const l = m.lessons.find((l: any) => l.id === lessonId);
              if (l) {
                  lessonMeta = l;
                  break;
              }
          }

          if (!lessonMeta) return;

          // Try to get full content
          let fullLesson = null;
          
          // Try offline first for speed/fallback
          fullLesson = await offlineStorage.getLesson(lessonId);

          if (!fullLesson && !isOfflineMode && accessToken) {
              const res = await apiClient(`/courses/${id}/lessons/${lessonId}`);
              if (res.ok) {
                  fullLesson = await res.json();
                  // Cache it
                  await offlineStorage.saveLesson(fullLesson);
              }
          }

          setCurrentLesson(fullLesson || lessonMeta);
          setMenuOpen(false); // Close menu on selection
      } catch (e) {
          console.error('Failed to load lesson', e);
          Alert.alert('Error', 'Failed to load lesson content');
      }
  };

  const handleLessonComplete = async () => {
      // Logic to mark lesson as complete
      // Move to next lesson
      navigateToNextLesson();
  };

  const navigateToNextLesson = () => {
      if (!course || !currentLesson) return;
      
      let found = false;
      let nextLessonId = null;

      for (const m of course.modules) {
          for (const l of m.lessons) {
              if (found) {
                  nextLessonId = l.id;
                  break;
              }
              if (l.id === currentLesson.id) {
                  found = true;
              }
          }
          if (nextLessonId) break;
      }

      if (nextLessonId) {
          loadLesson(nextLessonId);
      } else {
          Alert.alert('Congratulations!', 'You have completed the course.');
      }
  };

  const navigateToPrevLesson = () => {
    if (!course || !currentLesson) return;
    
    let prevLessonId = null;
    let lastSeenLessonId = null;

    for (const m of course.modules) {
        for (const l of m.lessons) {
            if (l.id === currentLesson.id) {
                prevLessonId = lastSeenLessonId;
                break;
            }
            lastSeenLessonId = l.id;
        }
        if (prevLessonId) break;
    }

    if (prevLessonId) {
        loadLesson(prevLessonId);
    }
  };

  if (loading) {
      return (
          <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
          </View>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Feather name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{course?.title}</Text>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.headerBtn}>
            <Feather name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* Main Content Area */}
        <ScrollView style={styles.mainContent}>
            {currentLesson && (
                <View>
                    <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
                    
                    {currentLesson.content_type === 'video' && currentLesson.content_data?.fileId && (
                        <VideoPlayer 
                            fileId={currentLesson.content_data.fileId} 
                            onComplete={handleLessonComplete}
                        />
                    )}

                    {currentLesson.content_type === 'text' && (
                        <LessonContent content={currentLesson.content} />
                    )}

                    {currentLesson.type === 'quiz' && currentLesson.content_data && (
                        <QuizView 
                            data={currentLesson.content_data} 
                            onComplete={(score, passed) => {
                                if (passed) handleLessonComplete();
                            }} 
                        />
                    )}

                    {currentLesson.description && (
                        <Text style={styles.description}>{currentLesson.description}</Text>
                    )}
                </View>
            )}
        </ScrollView>

        {/* Navigation Footer */}
        <View style={styles.footer}>
            <TouchableOpacity 
                style={styles.navBtn} 
                onPress={navigateToPrevLesson}
            >
                <Feather name="chevron-left" size={20} color="#374151" />
                <Text style={styles.navBtnText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.navBtn, styles.primaryBtn]} 
                onPress={handleLessonComplete}
            >
                <Text style={styles.primaryBtnText}>Complete & Next</Text>
                <Feather name="chevron-right" size={20} color="white" />
            </TouchableOpacity>
        </View>

        {/* Course Menu Overlay */}
        {menuOpen && (
            <View style={styles.menuOverlay}>
                <View style={styles.menuHeader}>
                    <Text style={styles.menuTitle}>Course Content</Text>
                    <TouchableOpacity onPress={() => setMenuOpen(false)}>
                        <Text style={{ color: '#6B7280' }}>Close</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.menuList}>
                    {course?.modules.map((module: any) => (
                        <View key={module.id} style={styles.moduleItem}>
                            <Text style={styles.moduleTitle}>{module.title}</Text>
                            {module.lessons.map((lesson: any) => {
                                const isActive = currentLesson?.id === lesson.id;
                                return (
                                    <TouchableOpacity 
                                        key={lesson.id} 
                                        style={[styles.lessonItem, isActive && styles.lessonItemActive]}
                                        onPress={() => loadLesson(lesson.id)}
                                    >
                                        {lesson.type === 'quiz' ? (
                                            <Feather name="help-circle" size={16} color={isActive ? '#2563EB' : '#6B7280'} />
                                        ) : lesson.content_type === 'video' ? (
                                            <Feather name="play-circle" size={16} color={isActive ? '#2563EB' : '#6B7280'} />
                                        ) : (
                                            <Feather name="file-text" size={16} color={isActive ? '#2563EB' : '#6B7280'} />
                                        )}
                                        <Text 
                                            style={[styles.lessonItemText, isActive && styles.lessonItemTextActive]} 
                                            numberOfLines={1}
                                        >
                                            {lesson.title}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </ScrollView>
            </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  description: {
    marginTop: 16,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
    gap: 12,
  },
  navBtn: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    gap: 8,
  },
  navBtnText: {
    color: '#374151',
    fontWeight: '500',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    flex: 1.5,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  menuList: {
    flex: 1,
  },
  moduleItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  lessonItemActive: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  lessonItemText: {
    fontSize: 15,
    color: '#374151',
  },
  lessonItemTextActive: {
    color: '#2563EB',
    fontWeight: '500',
  },
});
