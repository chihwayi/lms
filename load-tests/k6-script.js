import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 500 },  // Spike to 500 users (simulating 10k user base peak)
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Relax threshold slightly for high load on local machine
    http_req_failed: ['rate<0.01'],    // Error rate must be < 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';

export default function () {
  // 1. Health Check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, { 'status was 200': (r) => r.status == 200 });

  // 2. Simulate Login (if you have a test user, otherwise just public endpoints)
  // For this load test, we'll focus on public endpoints to avoid auth complexity in the example script
  
  // 3. View Public Courses
  const coursesRes = http.get(`${BASE_URL}/courses`);
  check(coursesRes, { 'status was 200': (r) => r.status == 200 });

  sleep(1);
}
