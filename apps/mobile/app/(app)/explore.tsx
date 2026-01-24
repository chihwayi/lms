
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Shadows, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ExploreScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['All', 'Development', 'Design', 'Business', 'Marketing']);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient('/courses'); // Fetches all courses
      if (res.ok) {
        const data = await res.json();
        const courseList = Array.isArray(data) ? data : (data.courses || []);
        setCourses(courseList);
        setFilteredCourses(courseList);
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Load courses error:', error);
      showToast({ type: 'error', title: 'Failed to load courses' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    let result = courses;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category (Mocking category check as backend might not return category string directly or it matches)
    // In real app, check c.category.name or similar
    if (selectedCategory !== 'All') {
      result = result.filter(c => c.category?.name === selectedCategory || c.category === selectedCategory);
    }

    setFilteredCourses(result);
  }, [searchQuery, selectedCategory, courses]);

  const renderItem = ({ item }: { item: any }) => (
    <Card 
      style={styles.courseCard} 
      variant="elevated"
      onPress={() => router.push(`/(app)/courses/${item.id}`)}
    >
      <View style={styles.imageContainer}>
         {item.thumbnail_url ? (
            <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
         ) : (
            <View style={[styles.thumbnail, styles.placeholderThumb]}>
                <Feather name="book" size={32} color="white" />
            </View>
         )}
         <View style={styles.categoryBadge}>
             <Text style={styles.categoryText}>{item.category?.name || 'Course'}</Text>
         </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.instructorName}>
            <Feather name="user" size={12} /> {item.instructor?.firstName} {item.instructor?.lastName}
        </Text>
        
        <View style={styles.metaRow}>
            <View style={styles.metaItem}>
                <Feather name="clock" size={12} color={Colors.light.textMuted} />
                <Text style={styles.metaText}>{item.duration || '2h 30m'}</Text>
            </View>
            <View style={styles.metaItem}>
                <Feather name="book-open" size={12} color={Colors.light.textMuted} />
                <Text style={styles.metaText}>{item.modules?.length || 0} Modules</Text>
            </View>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Find your next course</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
            <Feather name="search" size={20} color={Colors.light.textMuted} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search courses..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.light.textMuted}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Feather name="x" size={16} color={Colors.light.textMuted} />
                </TouchableOpacity>
            )}
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
            keyExtractor={item => item}
            renderItem={({ item }) => (
                <TouchableOpacity 
                    style={[
                        styles.categoryChip, 
                        selectedCategory === item && styles.categoryChipActive
                    ]}
                    onPress={() => setSelectedCategory(item)}
                >
                    <Text style={[
                        styles.categoryChipText,
                        selectedCategory === item && styles.categoryChipTextActive
                    ]}>{item}</Text>
                </TouchableOpacity>
            )}
        />
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            !loading ? (
                <View style={styles.emptyState}>
                    <Feather name="search" size={48} color={Colors.light.textMuted} />
                    <Text style={styles.emptyText}>No courses found</Text>
                </View>
            ) : null
        }
      />
    </SafeAreaView>
  );
}

// Need to import Image since I used it above
import { Image } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: Colors.light.text,
    fontFamily: 'Inter_400Regular',
  },
  categoriesContainer: {
    marginBottom: Spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.secondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 100,
  },
  courseCard: {
    overflow: 'hidden',
    padding: 0,
    marginBottom: Spacing.sm,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderThumb: {
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
  },
  cardContent: {
    padding: Spacing.md,
  },
  courseTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.light.textMuted,
  },
});
