import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_DIR = (FileSystem.documentDirectory || '') + 'offline_content/';

class OfflineStorageService {
  constructor() {
    // Directories are ensured lazily
  }

  private async ensureDirExists() {
    if (Platform.OS === 'web') return;
    const types = ['courses', 'lessons', 'quizzes'];
    for (const type of types) {
      const dir = BASE_DIR + type + '/';
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
    }
  }

  // --- Static Content (FileSystem for Native, AsyncStorage for Web) ---

  async saveCourse(course: any) {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(`@offline:courses:${course.id}`, JSON.stringify(course));
      return;
    }
    await this.ensureDirExists();
    const path = BASE_DIR + `courses/${course.id}.json`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(course));
  }

  async getCourse(courseId: string) {
    if (Platform.OS === 'web') {
      const content = await AsyncStorage.getItem(`@offline:courses:${courseId}`);
      return content ? JSON.parse(content) : undefined;
    }
    const path = BASE_DIR + `courses/${courseId}.json`;
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return undefined;
    const content = await FileSystem.readAsStringAsync(path);
    return JSON.parse(content);
  }

  async getAllCourses() {
    if (Platform.OS === 'web') {
      const keys = await AsyncStorage.getAllKeys();
      const courseKeys = keys.filter(k => k.startsWith('@offline:courses:'));
      const courses = [];
      for (const key of courseKeys) {
        const content = await AsyncStorage.getItem(key);
        if (content) {
          try {
            courses.push(JSON.parse(content));
          } catch (e) {
            console.error('Failed to parse course', key);
          }
        }
      }
      return courses;
    }
    
    const dir = BASE_DIR + 'courses/';
    await this.ensureDirExists();
    const files = await FileSystem.readDirectoryAsync(dir);
    
    const courses = [];
    for (const file of files) {
        if (file.endsWith('.json')) {
            const content = await FileSystem.readAsStringAsync(dir + file);
            try {
                courses.push(JSON.parse(content));
            } catch (e) {
                console.error('Failed to parse course file', file);
            }
        }
    }
    return courses;
  }

  async saveLesson(lesson: any) {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(`@offline:lessons:${lesson.id}`, JSON.stringify(lesson));
      return;
    }
    await this.ensureDirExists();
    const path = BASE_DIR + `lessons/${lesson.id}.json`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(lesson));
  }

  async getLesson(lessonId: string) {
    if (Platform.OS === 'web') {
      const content = await AsyncStorage.getItem(`@offline:lessons:${lessonId}`);
      return content ? JSON.parse(content) : undefined;
    }
    const path = BASE_DIR + `lessons/${lessonId}.json`;
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return undefined;
    const content = await FileSystem.readAsStringAsync(path);
    return JSON.parse(content);
  }

  async saveQuiz(quiz: any) {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(`@offline:quizzes:${quiz.id}`, JSON.stringify(quiz));
      return;
    }
    await this.ensureDirExists();
    const path = BASE_DIR + `quizzes/${quiz.id}.json`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(quiz));
  }

  async getQuiz(quizId: string) {
    if (Platform.OS === 'web') {
      const content = await AsyncStorage.getItem(`@offline:quizzes:${quizId}`);
      return content ? JSON.parse(content) : undefined;
    }
    const path = BASE_DIR + `quizzes/${quizId}.json`;
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return undefined;
    const content = await FileSystem.readAsStringAsync(path);
    return JSON.parse(content);
  }

  // --- User Progress (AsyncStorage) ---

  async saveProgress(lessonId: string, courseId: string, progressPercent?: number) {
    const key = `progress_${lessonId}`;
    const data = {
      lessonId,
      courseId,
      completedAt: Date.now(),
      synced: false,
      progress: progressPercent
    };
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }

  async getProgress(lessonId: string) {
    const key = `progress_${lessonId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  }

  async getUnsyncedProgress() {
    const keys = await AsyncStorage.getAllKeys();
    const progressKeys = keys.filter(k => k.startsWith('progress_'));
    const items = await AsyncStorage.multiGet(progressKeys);
    
    const unsynced = [];
    for (const [key, value] of items) {
      if (value) {
        const parsed = JSON.parse(value);
        if (!parsed.synced) {
          unsynced.push(parsed);
        }
      }
    }
    return unsynced;
  }

  async markProgressSynced(lessonId: string) {
    const key = `progress_${lessonId}`;
    const item = await AsyncStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      parsed.synced = true;
      await AsyncStorage.setItem(key, JSON.stringify(parsed));
    }
  }

  // --- Course Level Progress (Enrollments) ---

  async saveCourseProgress(data: { courseId: string, progress: number, completedLessons: string[] }) {
    const key = `enrollment_${data.courseId}`;
    const record = {
        ...data,
        lastUpdated: Date.now()
    };
    await AsyncStorage.setItem(key, JSON.stringify(record));
  }

  async getCourseProgress(courseId: string) {
    const key = `enrollment_${courseId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  }
}

export const offlineStorage = new OfflineStorageService();
