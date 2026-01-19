-- Course Management Tables Migration
-- Sprint 4/5: Course Management Foundation

-- Course categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Course levels and content types
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE lesson_content_type AS ENUM ('video', 'document', 'text', 'quiz', 'interactive', 'scorm');
CREATE TYPE course_status AS ENUM ('draft', 'pending_review', 'approved', 'published', 'unpublished', 'archived');
CREATE TYPE course_visibility AS ENUM ('public', 'private', 'restricted');

-- Main courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category_id UUID REFERENCES categories(id),
    level course_level NOT NULL DEFAULT 'beginner',
    duration_minutes INTEGER DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    thumbnail_url TEXT,
    trailer_url TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    status course_status DEFAULT 'draft',
    visibility course_visibility DEFAULT 'public',
    is_featured BOOLEAN DEFAULT FALSE,
    max_enrollments INTEGER,
    created_by UUID REFERENCES users(id) NOT NULL,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Course modules (sections)
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Course lessons
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type lesson_content_type NOT NULL,
    content_url TEXT,
    content_data JSONB,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- File storage for course content
CREATE TABLE course_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    processing_status VARCHAR(50) DEFAULT 'pending',
    uploaded_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_visibility ON courses(visibility);
CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_course_lessons_module ON course_lessons(module_id);
CREATE INDEX idx_course_files_course ON course_files(course_id);
CREATE INDEX idx_course_files_lesson ON course_files(lesson_id);

-- Insert default categories
INSERT INTO categories (name, description, slug) VALUES
('Technology', 'Programming, Web Development, Data Science', 'technology'),
('Business', 'Management, Marketing, Entrepreneurship', 'business'),
('Design', 'UI/UX, Graphic Design, Web Design', 'design'),
('Personal Development', 'Leadership, Communication, Productivity', 'personal-development'),
('Science', 'Mathematics, Physics, Chemistry, Biology', 'science');