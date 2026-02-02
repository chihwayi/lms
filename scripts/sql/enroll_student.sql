-- Enroll student@test.com in all courses
INSERT INTO enrollments (id, user_id, course_id, status, enrolled_at)
SELECT 
  uuid_generate_v4(),
  (SELECT id FROM users WHERE email = 'student@test.com'),
  c.id,
  'enrolled',
  NOW()
FROM courses c
WHERE NOT EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.user_id = (SELECT id FROM users WHERE email = 'student@test.com') 
    AND e.course_id = c.id
);
