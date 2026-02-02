#!/usr/bin/env node

const API_BASE = 'http://localhost:3001/api/v1';
const credentials = {
  email: 'instructor@eduflow.com',
  password: 'Instructor123!'
};

let authToken = '';
let testCourseId = '';
let testModuleId = '';
let testLessonId = '';

async function apiCall(method, endpoint, data = null, headers = {}) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    }
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    console.log(`${method} ${endpoint}: ${response.status}`);
    if (!response.ok) {
      console.log('  Error:', result);
      return null;
    }
    return result;
  } catch (error) {
    console.log(`${method} ${endpoint}: ERROR - ${error.message}`);
    return null;
  }
}

async function testAuthentication() {
  console.log('\n=== TESTING AUTHENTICATION ===');
  
  const loginResult = await apiCall('POST', '/auth/login', credentials);
  if (loginResult?.accessToken) {
    authToken = loginResult.accessToken;
    console.log('✅ Authentication successful');
    return true;
  }
  
  console.log('❌ Authentication failed');
  return false;
}

async function testCourseManagement() {
  console.log('\n=== TESTING COURSE MANAGEMENT ===');
  
  // Create course
  const courseData = {
    title: 'Test Course API',
    description: 'Testing Sprint 5 APIs',
    short_description: 'API Test Course',
    level: 'beginner',
    price: 99.99,
    category_id: null
  };
  
  const course = await apiCall('POST', '/courses', courseData);
  if (course?.id) {
    testCourseId = course.id;
    console.log('✅ Course created:', testCourseId);
  }
  
  // Get courses
  await apiCall('GET', '/courses');
  
  // Get single course
  await apiCall('GET', `/courses/${testCourseId}`);
  
  // Update course
  await apiCall('PATCH', `/courses/${testCourseId}`, { title: 'Updated Test Course' });
  
  // Get categories
  await apiCall('GET', '/courses/categories');
  
  // Search courses
  await apiCall('GET', '/courses/search?q=test');
  
  // Featured courses
  await apiCall('GET', '/courses/featured');
  
  // Course preview
  await apiCall('GET', `/courses/${testCourseId}/preview`);
}

async function testModuleManagement() {
  console.log('\n=== TESTING MODULE MANAGEMENT ===');
  
  if (!testCourseId) return;
  
  // Create module
  const moduleData = {
    title: 'Test Module',
    description: 'Testing module APIs',
    order_index: 1
  };
  
  const module = await apiCall('POST', `/courses/${testCourseId}/modules`, moduleData);
  if (module?.id) {
    testModuleId = module.id;
    console.log('✅ Module created:', testModuleId);
  }
  
  // Update module
  await apiCall('PUT', `/courses/${testCourseId}/modules/${testModuleId}`, {
    title: 'Updated Test Module'
  });
  
  // Reorder modules
  await apiCall('PUT', `/courses/${testCourseId}/modules/reorder`, {
    moduleIds: [testModuleId]
  });
}

async function testLessonManagement() {
  console.log('\n=== TESTING LESSON MANAGEMENT ===');
  
  if (!testModuleId) return;
  
  // Create lesson
  const lessonData = {
    title: 'Test Lesson',
    description: 'Testing lesson APIs',
    content_type: 'video',
    duration_minutes: 30,
    order_index: 1,
    is_preview: true
  };
  
  const lesson = await apiCall('POST', `/courses/modules/${testModuleId}/lessons`, lessonData);
  if (lesson?.id) {
    testLessonId = lesson.id;
    console.log('✅ Lesson created:', testLessonId);
  }
  
  // Update lesson
  await apiCall('PUT', `/courses/modules/${testModuleId}/lessons/${testLessonId}`, {
    title: 'Updated Test Lesson'
  });
  
  // Reorder lessons
  await apiCall('PUT', `/courses/modules/${testModuleId}/lessons/reorder`, {
    lessonIds: [testLessonId]
  });
  
  // Get lesson content
  await apiCall('GET', `/courses/lessons/${testLessonId}/content`);
}

async function testPublishingWorkflow() {
  console.log('\n=== TESTING PUBLISHING WORKFLOW ===');
  
  if (!testCourseId) return;
  
  // Get publishing status
  await apiCall('GET', `/courses/${testCourseId}/publishing-status`);
  
  // Schedule publish
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);
  await apiCall('POST', `/courses/${testCourseId}/schedule-publish`, {
    publishDate: futureDate.toISOString()
  });
  
  // Publish course
  await apiCall('POST', `/courses/${testCourseId}/publish`);
  
  // Unpublish course
  await apiCall('POST', `/courses/${testCourseId}/unpublish`);
}

async function testContentManagement() {
  console.log('\n=== TESTING CONTENT MANAGEMENT ===');
  
  // Initiate upload
  const uploadData = {
    fileName: 'test-video.mp4',
    fileSize: 1024000,
    courseId: testCourseId
  };
  
  const upload = await apiCall('POST', '/content/upload/initiate', uploadData);
  if (upload?.uploadId) {
    console.log('✅ Upload initiated:', upload.uploadId);
    
    // Upload chunk
    await apiCall('POST', '/content/upload/chunk', {
      uploadId: upload.uploadId,
      chunkIndex: 0,
      chunkData: 'dGVzdCBkYXRh' // base64 test data
    });
    
    // Complete upload
    await apiCall('POST', '/content/upload/complete', {
      uploadId: upload.uploadId
    });
    
    // Get status
    await apiCall('GET', `/content/${upload.uploadId}/status`);
    
    // Get versions
    await apiCall('GET', `/content/${upload.uploadId}/versions`);
    
    // Update progress
    await apiCall('POST', `/content/${upload.uploadId}/progress`, {
      currentTime: 30,
      duration: 120
    });
    
    // Get bookmarks
    await apiCall('GET', `/content/${upload.uploadId}/bookmarks`);
    
    // Create bookmark
    await apiCall('POST', `/content/${upload.uploadId}/bookmarks`, {
      time: 45,
      note: 'Important point'
    });
  }
}

async function testFileManagement() {
  console.log('\n=== TESTING FILE MANAGEMENT ===');
  
  if (!testCourseId) return;
  
  // Get course files
  await apiCall('GET', `/files/course/${testCourseId}`);
}

async function cleanup() {
  console.log('\n=== CLEANUP ===');
  
  if (testCourseId) {
    await apiCall('DELETE', `/courses/${testCourseId}`);
    console.log('✅ Test course deleted');
  }
}

async function runAllTests() {
  console.log('🚀 Starting Sprint 5 API Tests...');
  
  const authSuccess = await testAuthentication();
  if (!authSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  await testCourseManagement();
  await testModuleManagement();
  await testLessonManagement();
  await testPublishingWorkflow();
  await testContentManagement();
  await testFileManagement();
  await cleanup();
  
  console.log('\n🎉 All Sprint 5 API tests completed!');
}

// Run tests
runAllTests().catch(console.error);