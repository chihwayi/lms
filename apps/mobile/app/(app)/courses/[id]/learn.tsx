import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useOfflineCourse } from '@/hooks/use-offline-course';
import { apiClient } from '@/lib/api-client';
import { offlineStorage } from '@/lib/offline-storage';
import { VideoPlayer } from '@/components/CoursePlayer/VideoPlayer';
import { LessonContent } from '@/components/CoursePlayer/LessonContent';
import { AudioPlayer } from '@/components/CoursePlayer/AudioPlayer';
import { QuizView } from '@/components/CoursePlayer/QuizView';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth-store';
import * as Network from 'expo-network';
import { Text } from '@/components/ui/Text';
import { Colors, Spacing, Shadows, BorderRadius } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useCourseProgress } from '@/hooks/use-course-progress';
import { CompletionModal } from '@/components/CoursePlayer/CompletionModal';
import { LessonNotesModal } from '@/components/CoursePlayer/LessonNotesModal';
import { PdfViewer } from '@/components/CoursePlayer/PdfViewer';

export default function CourseLearnScreen() {
  const { id: paramId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { markLessonComplete, syncOfflineProgress } = useCourseProgress();
  
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [isLastLesson, setIsLastLesson] = useState(false);

  useEffect(() => {
    loadCourse();
    // Try to sync any offline progress when entering the course
    syncOfflineProgress();
    // Sync any offline notes queued
    (async () => {
      try {
        const status = await Network.getNetworkStateAsync();
        const online = !!status.isConnected && !!status.isInternetReachable;
        if (!online) return;
        const pending = await offlineStorage.getPendingNotes();
        for (const item of pending) {
          try {
            const res = await apiClient(`/lessons/${item.lessonId}/note`, {
              method: 'PUT',
              body: JSON.stringify({ content: item.content }),
            });
            if (res.ok) {
              await offlineStorage.markNoteSynced(item.lessonId);
            }
          } catch {}
        }
      } catch {}
    })();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      
      // Check connectivity
      const status = await Network.getNetworkStateAsync();
      const online = !!status.isConnected && !!status.isInternetReachable;
      
      let courseData = null;
      let enrollmentData = null;

      if (online && accessToken) {
        try {
            const res = await apiClient(`/courses/${id}`);
            if (res.ok) {
                courseData = await res.json();
            }
            // Fetch enrollment for resume info
            const enrollRes = await apiClient(`/enrollments/${id}/check`);
            if (enrollRes.ok) {
              const data = await enrollRes.json();
              if (data.isEnrolled) {
                enrollmentData = data.enrollment;
              }
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
      if (enrollmentData) {
        setEnrollment(enrollmentData);
      }
      
      // Set initial lesson: prefer lastLessonId, else first incomplete, else first
      const allLessons = courseData.modules?.flatMap((m: any) => m.lessons) || [];
      let initialLessonId: string | null = null;
      if (enrollmentData?.lastLessonId) {
        initialLessonId = enrollmentData.lastLessonId;
      } else if (enrollmentData?.completedLessons?.length) {
        const completedSet = new Set(enrollmentData.completedLessons);
        const firstIncomplete = allLessons.find((l: any) => !completedSet.has(l.id));
        initialLessonId = firstIncomplete?.id || allLessons?.[0]?.id || null;
      } else {
        initialLessonId = allLessons?.[0]?.id || null;
      }
      if (initialLessonId) {
        await loadLesson(initialLessonId, courseData);
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

          // Unwrap lesson if wrapped (API returns { lesson: {...}, files: [], ... })
          let finalLesson = fullLesson || lessonMeta;
          if (finalLesson && finalLesson.lesson) {
              const { lesson, ...rest } = finalLesson;
              finalLesson = { ...lesson, ...rest };
          }
          
          // Map content for text lessons if missing
          if (finalLesson && !finalLesson.content && finalLesson.content_type === 'text') {
              finalLesson.content = finalLesson.content_data?.html || finalLesson.content_data?.text || finalLesson.description || '';
          }

          setCurrentLesson(finalLesson);
          setMenuOpen(false); // Close menu on selection
      } catch (e) {
          console.error('Failed to load lesson', e);
          Alert.alert('Error', 'Failed to load lesson content');
      }
  };

  const handleLessonComplete = async () => {
      if (!currentLesson || !course) return;

      // 1. Mark complete via hook (API + Offline)
      await markLessonComplete(id, currentLesson.id);

      // 2. Check if it's the last lesson
      const isLast = checkIsLastLesson();
      setIsLastLesson(isLast);

      // 3. Show celebration modal
      setCompletionModalVisible(true);
  };

  const checkIsLastLesson = () => {
      if (!course || !currentLesson) return false;
      
      const allLessons = course.modules.flatMap((m: any) => m.lessons);
      const currentIndex = allLessons.findIndex((l: any) => l.id === currentLesson.id);
      
      return currentIndex === allLessons.length - 1;
  };

  const navigateToNextLesson = () => {
      setCompletionModalVisible(false);

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
          // Course completed - maybe go back to dashboard or course details
          router.replace('/(app)/dashboard');
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
              <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        style={styles.headerBackground}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
              <Feather name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{course?.title}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {!isOfflineMode && (
                <TouchableOpacity onPress={() => setNotesModalVisible(true)} style={styles.headerBtn}>
                    <Feather name="edit-3" size={24} color="white" />
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.headerBtn}>
                <Feather name="menu" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {isOfflineMode && (
            <View style={styles.offlineBanner}>
              <Feather name="wifi-off" size={14} color="white" />
              <Text style={styles.offlineText}>You are viewing downloaded content</Text>
            </View>
          )}
          {/* Main Content Area */}
          <ScrollView style={styles.mainContent} contentContainerStyle={{ paddingBottom: 100 }}>
              {currentLesson && (
                  <View style={styles.lessonCard}>
                      <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
                      
                      {currentLesson.content_data?.blocks && currentLesson.content_data.blocks.length > 0 ? (
                          <View style={styles.blocksContainer}>
                              {currentLesson.content_data.blocks
                                  .sort((a: any, b: any) => a.order - b.order)
                                  .map((block: any) => {
                                      switch (block.type) {
                                          case 'text':
                                              return (
                                                  <View key={block.id} style={styles.blockWrapper}>
                                                      <LessonContent content={block.content || ''} />
                                                  </View>
                                              );
                                          case 'video':
                                              return block.fileId ? (
                                                  <View key={block.id} style={styles.blockWrapper}>
                                                      <VideoPlayer 
                                                          fileId={block.fileId} 
                                                          startAt={enrollment?.lesson_progress?.[currentLesson.id]?.lastPosition ?? 0}
                                                          onProgress={async (pos, dur) => {
                                                            if (!accessToken || isOfflineMode) return;
                                                            const now = Date.now();
                                                            const lastSent = (global as any).__mobileLastProgressSent || 0;
                                                            if (now - lastSent > 10000) {
                                                              try {
                                                                await apiClient('/enrollments/progress', {
                                                                  method: 'PATCH',
                                                                  body: JSON.stringify({
                                                                    courseId: id,
                                                                    lessonId: currentLesson.id,
                                                                    lastPosition: pos,
                                                                    totalDuration: dur,
                                                                  }),
                                                                });
                                                                (global as any).__mobileLastProgressSent = now;
                                                              } catch {}
                                                            }
                                                          }}
                                                          // Only trigger completion if it's the only block or specific logic needed
                                                          // For now, we leave onComplete undefined to avoid premature completion
                                                      />
                                                  </View>
                                              ) : null;
                                          case 'audio':
                                              return block.fileId ? (
                                                  <View key={block.id} style={styles.blockWrapper}>
                                                      <AudioPlayer 
                                                          fileId={block.fileId} 
                                                          title={block.title}
                                                          startAt={enrollment?.lesson_progress?.[currentLesson.id]?.lastPosition ?? 0}
                                                          onProgress={async (pos, dur) => {
                                                            if (!accessToken || isOfflineMode) return;
                                                            const now = Date.now();
                                                            const lastSent = (global as any).__mobileLastProgressSent || 0;
                                                            if (now - lastSent > 10000) {
                                                              try {
                                                                await apiClient('/enrollments/progress', {
                                                                  method: 'PATCH',
                                                                  body: JSON.stringify({
                                                                    courseId: id,
                                                                    lessonId: currentLesson.id,
                                                                    lastPosition: pos,
                                                                    totalDuration: dur,
                                                                  }),
                                                                });
                                                                (global as any).__mobileLastProgressSent = now;
                                                              } catch {}
                                                            }
                                                          }}
                                                      />
                                                  </View>
                                              ) : null;
                                          case 'document':
                                              return block.fileId ? (
                                                  <View key={block.id} style={styles.blockWrapper}>
                                                      <PdfViewer fileId={block.fileId} />
                                                  </View>
                                              ) : null;
                                          default:
                                              return null;
                                      }
                                  })}
                          </View>
                      ) : (
                          <>
                              {currentLesson.content_type === 'video' && currentLesson.content_data?.fileId && (
                                  <View style={styles.videoContainer}>
                                    <VideoPlayer 
                                        fileId={currentLesson.content_data.fileId} 
                                        startAt={enrollment?.lesson_progress?.[currentLesson.id]?.lastPosition ?? 0}
                                        onProgress={async (pos, dur) => {
                                          if (!accessToken || isOfflineMode) return;
                                          const now = Date.now();
                                          const lastSent = (global as any).__mobileLastProgressSent || 0;
                                          if (now - lastSent > 10000) {
                                            try {
                                              await apiClient('/enrollments/progress', {
                                                method: 'PATCH',
                                                body: JSON.stringify({
                                                  courseId: id,
                                                  lessonId: currentLesson.id,
                                                  lastPosition: pos,
                                                  totalDuration: dur,
                                                }),
                                              });
                                              (global as any).__mobileLastProgressSent = now;
                                            } catch {}
                                          }
                                        }}
                                        onComplete={handleLessonComplete}
                                    />
                                  </View>
                              )}

                              {(currentLesson.content_type === 'pdf' || currentLesson.content_type === 'document') && currentLesson.content_data?.fileId && (
                                  <View style={styles.videoContainer}>
                                    <PdfViewer fileId={currentLesson.content_data.fileId} lessonId={currentLesson.id} />
                                  </View>
                              )}

                              {currentLesson.content_type === 'text' && (
                                  <LessonContent content={currentLesson.content} />
                              )}
                          </>
                      )}

                      {currentLesson.content_type === 'quiz' && currentLesson.content_data && (
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
                  <Feather name="chevron-left" size={20} color={Colors.light.text} />
                  <Text style={styles.navBtnText}>Previous</Text>
              </TouchableOpacity>

              {currentLesson?.content_type !== 'quiz' && (
                  <TouchableOpacity 
                      style={[styles.navBtn, styles.primaryBtn]} 
                      onPress={handleLessonComplete}
                  >
                      <Text style={styles.primaryBtnText}>Complete & Next</Text>
                      <Feather name="chevron-right" size={20} color="white" />
                  </TouchableOpacity>
              )}
          </View>

          {/* Course Menu Overlay */}
          {menuOpen && (
              <View style={styles.menuOverlay}>
                  <View style={styles.menuHeader}>
                      <Text style={styles.menuTitle}>Course Content</Text>
                      <TouchableOpacity onPress={() => setMenuOpen(false)} style={styles.closeBtn}>
                          <Feather name="x" size={24} color={Colors.light.textMuted} />
                      </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.menuList}>
                      {course?.modules.map((module: any) => (
                          <View key={module.id} style={styles.moduleItem}>
                              <Text style={styles.moduleTitle}>{module.title}</Text>
                              {module.lessons.map((lesson: any) => {
                                  const isActive = currentLesson?.id === lesson.id;
                                  const lessonProgress = enrollment?.lesson_progress?.[lesson.id];
                                  const isCompleted = enrollment?.completedLessons?.includes(lesson.id);
                                  const resumeTime = !isCompleted && lessonProgress && lessonProgress.lastPosition > 0 
                                      ? new Date(lessonProgress.lastPosition * 1000).toISOString().substr(14, 5) 
                                      : null;

                                  return (
                                      <TouchableOpacity 
                                          key={lesson.id} 
                                          style={[styles.lessonItem, isActive && styles.lessonItemActive]}
                                          onPress={() => loadLesson(lesson.id)}
                                      >
                                          {lesson.type === 'quiz' ? (
                                              <Feather name="help-circle" size={16} color={isActive ? Colors.light.primary : Colors.light.textMuted} />
                                          ) : lesson.content_type === 'video' ? (
                                              <Feather name="play-circle" size={16} color={isActive ? Colors.light.primary : Colors.light.textMuted} />
                                          ) : (
                                              <Feather name="file-text" size={16} color={isActive ? Colors.light.primary : Colors.light.textMuted} />
                                          )}
                                          <View style={{ flex: 1 }}>
                                              <Text 
                                                  style={[styles.lessonItemText, isActive && styles.lessonItemTextActive]} 
                                                  numberOfLines={1}
                                              >
                                                  {lesson.title}
                                              </Text>
                                              {resumeTime && (
                                                  <Text style={{ fontSize: 11, color: Colors.light.primary, marginTop: 2, fontWeight: '500' }}>
                                                      Resume {resumeTime}
                                                  </Text>
                                              )}
                                          </View>
                                      </TouchableOpacity>
                                  );
                              })}
                          </View>
                      ))}
                  </ScrollView>
              </View>
          )}

          {/* Completion Modal */}
          <CompletionModal
            visible={completionModalVisible}
            onNext={navigateToNextLesson}
            onClose={() => setCompletionModalVisible(false)}
            isLastLesson={isLastLesson}
          />

          {/* Notes Modal */}
          {currentLesson && (
            <LessonNotesModal
              visible={notesModalVisible}
              onClose={() => setNotesModalVisible(false)}
              lessonId={currentLesson.id}
            />
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 10,
  },
  headerBtn: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  lessonCard: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
  },
  videoContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: Spacing.lg,
  },
  blocksContainer: {
    gap: Spacing.lg,
  },
  blockWrapper: {
    marginBottom: Spacing.md,
  },
  description: {
    marginTop: Spacing.lg,
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: 'white',
    gap: Spacing.md,
    ...Shadows.sm,
  },
  navBtn: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    backgroundColor: 'white',
  },
  navBtnText: {
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    flex: 1.5,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: 'white',
    ...Shadows.sm,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  menuList: {
    flex: 1,
  },
  moduleItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  moduleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textMuted,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  lessonItemActive: {
    backgroundColor: Colors.light.secondary,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  lessonItemText: {
    fontSize: 15,
    color: Colors.light.text,
    flex: 1,
  },
  lessonItemTextActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  offlineBanner: {
    backgroundColor: Colors.light.warning,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
