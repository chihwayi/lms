import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface EduFlowDB extends DBSchema {
  courses: {
    key: string;
    value: any; // Course object
  };
  lessons: {
    key: string;
    value: any; // Lesson object including content
  };
  quizzes: {
    key: string;
    value: any; // Quiz object
  };
  progress: {
    key: string;
    value: {
      lessonId: string;
      courseId: string;
      completedAt: number;
      synced: boolean;
      progress?: number;
    };
  };
  enrollments: {
      key: string; // courseId
      value: {
          courseId: string;
          progress: number;
          completedLessons: string[];
          lastUpdated: number;
      };
  };
}

const DB_NAME = 'eduflow-offline';
const DB_VERSION = 2; // Increment version

class OfflineStorageService {
  private dbPromise: Promise<IDBPDatabase<EduFlowDB>>;

  constructor() {
    this.dbPromise = openDB<EduFlowDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('lessons')) {
          db.createObjectStore('lessons', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('quizzes')) {
          db.createObjectStore('quizzes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'lessonId' });
        }
        if (!db.objectStoreNames.contains('enrollments')) {
            db.createObjectStore('enrollments', { keyPath: 'courseId' });
        }
      },
    });
  }

  async saveCourse(course: any) {
    const db = await this.dbPromise;
    await db.put('courses', course);
  }

  async getCourse(courseId: string) {
    const db = await this.dbPromise;
    return db.get('courses', courseId);
  }

  async getAllCourses() {
    const db = await this.dbPromise;
    return db.getAll('courses');
  }

  async saveLesson(lesson: any) {
    const db = await this.dbPromise;
    await db.put('lessons', lesson);
  }

  async getLesson(lessonId: string) {
    const db = await this.dbPromise;
    return db.get('lessons', lessonId);
  }

  async saveQuiz(quiz: any) {
    const db = await this.dbPromise;
    await db.put('quizzes', quiz);
  }

  async getQuiz(quizId: string) {
    const db = await this.dbPromise;
    return db.get('quizzes', quizId);
  }

  async saveProgress(lessonId: string, courseId: string, progressPercent?: number) {
    const db = await this.dbPromise;
    await db.put('progress', {
      lessonId,
      courseId,
      progress: progressPercent,
      completedAt: Date.now(),
      synced: false,
    });
  }

  async saveCourseProgress(data: { courseId: string, progress: number, completedLessons: string[] }) {
      const db = await this.dbPromise;
      await db.put('enrollments', {
          ...data,
          lastUpdated: Date.now()
      });
  }

  async getCourseProgress(courseId: string) {
      const db = await this.dbPromise;
      return db.get('enrollments', courseId);
  }

  async getUnsyncedProgress() {
    const db = await this.dbPromise;
    const allProgress = await db.getAll('progress');
    return allProgress.filter(p => !p.synced);
  }

  async markProgressSynced(lessonId: string) {
    const db = await this.dbPromise;
    const progress = await db.get('progress', lessonId);
    if (progress) {
      progress.synced = true;
      await db.put('progress', progress);
    }
  }
  
  async isCourseOffline(courseId: string): Promise<boolean> {
    const course = await this.getCourse(courseId);
    return !!course;
  }
}

export const offlineStorage = new OfflineStorageService();
