
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Shadows, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth-store';
import { useOfflineCourse } from '@/hooks/use-offline-course';

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuthStore();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const { downloadCourse, isDownloading, downloadProgress, isCourseDownloaded } = useOfflineCourse();

  useEffect(() => {
    loadCourseDetails();
    checkDownloadStatus();
  }, [id]);

  const checkDownloadStatus = async () => {
    const downloaded = await isCourseDownloaded(id);
    setIsDownloaded(downloaded);
  };

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      // Fetch course details
      const res = await apiClient(`/courses/${id}`);
      if (!res.ok) throw new Error('Failed to load course');
      const data = await res.json();
      setCourse(data);

      // Check enrollment status
      // We can check if the user is already enrolled by fetching their enrollments
      // OR if the course object has an 'isEnrolled' flag (depends on backend)
      // For now, let's fetch my-courses to check
      const enrollmentsRes = await apiClient('/enrollments/my-courses');
      if (enrollmentsRes.ok) {
        const enrollments = await enrollmentsRes.json();
        const enrolled = enrollments.some((e: any) => e.courseId === id || e.course?.id === id);
        setIsEnrolled(enrolled);
      }

    } catch (error) {
      console.error('Error loading details:', error);
      showToast({ type: 'error', title: 'Failed to load details' });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const res = await apiClient('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId: id }),
      });

      if (res.ok) {
        showToast({ type: 'success', title: 'Enrolled successfully!' });
        setIsEnrolled(true);
        // Navigate to learn page after short delay
        setTimeout(() => {
            router.push(`/(app)/courses/${id}/learn`);
        }, 500);
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Enrollment failed');
      }
    } catch (error: any) {
        // If already enrolled (400), just proceed
        if (error.message?.includes('already enrolled')) {
            setIsEnrolled(true);
            router.push(`/(app)/courses/${id}/learn`);
        } else {
            showToast({ type: 'error', title: 'Enrollment failed', message: error.message });
        }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!course) return null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {course.thumbnail_url ? (
            <Image source={{ uri: course.thumbnail_url }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Feather name="book" size={64} color="white" />
            </View>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.categoryRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{course.category?.name || 'Course'}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Feather name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
            </View>
          </View>

          <Text style={styles.title}>{course.title}</Text>
          
          <View style={styles.instructorRow}>
             <View style={styles.avatar}>
                <Feather name="user" size={20} color={Colors.light.textSecondary} />
             </View>
             <Text style={styles.instructorName}>
                By {course.instructor?.firstName} {course.instructor?.lastName}
             </Text>
          </View>

          <Text style={styles.description}>{course.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="clock" size={20} color={Colors.light.primary} />
              <Text style={styles.statLabel}>{course.duration || '2h 30m'}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="book-open" size={20} color={Colors.light.primary} />
              <Text style={styles.statLabel}>{course.modules?.length || 0} Modules</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="users" size={20} color={Colors.light.primary} />
              <Text style={styles.statLabel}>1.2k Students</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Syllabus</Text>
          </View>

          <View style={styles.modulesList}>
            {course.modules?.map((module: any, index: number) => (
                <View key={module.id} style={styles.moduleItem}>
                    <View style={styles.moduleHeader}>
                        <Text style={styles.moduleIndex}>0{index + 1}</Text>
                        <View style={styles.moduleInfo}>
                            <Text style={styles.moduleTitle}>{module.title}</Text>
                            <Text style={styles.moduleLessons}>{module.lessons?.length || 0} Lessons</Text>
                        </View>
                    </View>
                </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <SafeAreaView edges={['bottom']} style={styles.actionBar}>
        <View style={styles.priceContainer}>
           <Text style={styles.priceLabel}>Price</Text>
           <Text style={styles.price}>Free</Text>
        </View>
        <Button 
            style={styles.actionButton}
            title={isEnrolled ? "Continue Learning" : "Enroll Now"}
            onPress={isEnrolled ? () => router.push(`/(app)/courses/${id}/learn`) : handleEnroll}
            loading={enrolling}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadProgress: {
    fontSize: 8,
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  contentContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: -24,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: Colors.light.primary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter_500Medium',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  instructorName: {
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: 'Inter_500Medium',
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter_500Medium',
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.light.text,
  },
  modulesList: {
    gap: Spacing.md,
  },
  moduleItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.light.secondary,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moduleIndex: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: 'rgba(0,0,0,0.1)',
    marginRight: Spacing.md,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  moduleLessons: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.lg,
  },
  priceContainer: {
    gap: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  price: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.light.primary,
  },
  actionButton: {
    minWidth: 180,
  },
});
