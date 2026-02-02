SET standard_conforming_strings = on;

DO $$
DECLARE
    admin_id UUID;
    student_id UUID;
    course_calc_id UUID;
    course_alg_id UUID;
    course_geo_id UUID;
    mod_id UUID;
BEGIN
    -- 1. Get Users
    SELECT id INTO admin_id FROM users WHERE email = 'admin@test.com';
    SELECT id INTO student_id FROM users WHERE email = 'student@test.com';

    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;

    -- 2. Create/Get "Calculus & Graphs"
    SELECT id INTO course_calc_id FROM courses WHERE title = 'Calculus & Graphs';
    IF course_calc_id IS NULL THEN
        INSERT INTO courses (title, description, level, status, visibility, created_by)
        VALUES ('Calculus & Graphs', 'Master the fundamentals of Calculus and Graphs.', 'advanced', 'published', 'public', admin_id)
        RETURNING id INTO course_calc_id;
    END IF;

    -- 3. Create/Get "Advanced Algebra"
    SELECT id INTO course_alg_id FROM courses WHERE title = 'Advanced Algebra';
    IF course_alg_id IS NULL THEN
        INSERT INTO courses (title, description, level, status, visibility, created_by)
        VALUES ('Advanced Algebra', 'Deep dive into algebraic structures and equations.', 'intermediate', 'published', 'public', admin_id)
        RETURNING id INTO course_alg_id;
    END IF;

    -- 4. Get "Geometry Masterclass"
    SELECT id INTO course_geo_id FROM courses WHERE title = 'Geometry Masterclass: Triangles & Circles';
    -- If not found, create it (fallback)
    IF course_geo_id IS NULL THEN
         INSERT INTO courses (title, description, level, status, visibility, created_by)
        VALUES ('Geometry Masterclass: Triangles & Circles', 'Angles in the Same Segment', 'intermediate', 'published', 'public', admin_id)
        RETURNING id INTO course_geo_id;
    END IF;


    -- ==========================================
    -- POPULATE CALCULUS & GRAPHS
    -- ==========================================

    -- Module: Fundamentals of Differentiation
    INSERT INTO course_modules (course_id, title, description, order_index, is_published)
    VALUES (course_calc_id, 'Fundamentals of Differentiation', 'Limits, First Principles, and Rules of Differentiation.', 1, true)
    RETURNING id INTO mod_id;

    INSERT INTO course_lessons (module_id, title, description, content_type, order_index, is_published, content_data)
    VALUES (mod_id, 'Differentiation from First Principles', 'The definition of the derivative.', 'text', 0, true, 
    jsonb_build_object('content', '
        <h3>The Derivative Definition</h3>
        <p>The derivative of a function $f(x)$ is defined as the limit of the secant slope as $h$ approaches zero:</p>
        <p style="text-align: center; font-size: 1.2em; padding: 10px; background: #f0f0f0; border-radius: 8px;">
          \[ f''(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h} \]
        </p>
        <p><strong>Example:</strong> Find $f''(x)$ for $f(x) = x^2$.</p>
        <p>
          \[ f(x+h) = (x+h)^2 = x^2 + 2xh + h^2 \]<br>
          \[ f(x+h) - f(x) = 2xh + h^2 = h(2x + h) \]<br>
          \[ \frac{h(2x+h)}{h} = 2x + h \]<br>
          \[ \lim_{h \to 0} (2x + h) = 2x \]
        </p>
    '));

    -- Module: Integration and Area
    INSERT INTO course_modules (course_id, title, description, order_index, is_published)
    VALUES (course_calc_id, 'Integration and Area', 'Indefinite and Definite Integrals.', 2, true)
    RETURNING id INTO mod_id;

    INSERT INTO course_lessons (module_id, title, description, content_type, order_index, is_published, content_data)
    VALUES (mod_id, 'The Fundamental Theorem of Calculus', 'Connecting differentiation and integration.', 'text', 0, true,
    jsonb_build_object('content', '
        <h3>Definite Integrals</h3>
        <p>The area under the curve $y=f(x)$ from $x=a$ to $x=b$ is given by:</p>
        <p style="text-align: center; font-size: 1.2em;">
          \[ \int_{a}^{b} f(x) \, dx = F(b) - F(a) \]
        </p>
        <p>Where $F''(x) = f(x)$.</p>
        <p><strong>Example:</strong> $\int_{0}^{2} 3x^2 \, dx$</p>
        <p>Antiderivative $F(x) = x^3$.</p>
        <p>Value $= [x^3]_0^2 = 2^3 - 0^3 = 8$.</p>
    '));

    -- Module: Trigonometric Graphs
    INSERT INTO course_modules (course_id, title, description, order_index, is_published)
    VALUES (course_calc_id, 'Trigonometric Graphs', 'Visualizing Sin, Cos, and Tan functions.', 3, true)
    RETURNING id INTO mod_id;

    INSERT INTO course_lessons (module_id, title, description, content_type, order_index, is_published, content_data)
    VALUES (mod_id, 'The Sine and Cosine Waves', 'Amplitude, period, and phase shift.', 'text', 0, true,
    jsonb_build_object('content', '
        <h3>The Sine Function $y = a\sin(bx + c) + d$</h3>
        <ul>
          <li><strong>Amplitude ($|a|$):</strong> Peak deviation from center.</li>
          <li><strong>Period ($2\pi/|b|$):</strong> Length of one cycle.</li>
          <li><strong>Phase Shift ($-c/b$):</strong> Horizontal translation.</li>
        </ul>
        <p>Standard $y = \sin(x)$ starts at $(0,0)$, peaks at $(\pi/2, 1)$, crosses at $(\pi, 0)$.</p>
        <p>Standard $y = \cos(x)$ starts at $(0,1)$, crosses at $(\pi/2, 0)$, troughs at $(\pi, -1)$.</p>
    '));


    -- ==========================================
    -- POPULATE ADVANCED ALGEBRA
    -- ==========================================

    -- Module: Quadratics Equations & Functions
    INSERT INTO course_modules (course_id, title, description, order_index, is_published)
    VALUES (course_alg_id, 'Quadratics Equations & Functions', 'Solving quadratics via formula and completing the square.', 1, true)
    RETURNING id INTO mod_id;

    -- Lesson: Quadratic Formula
    INSERT INTO course_lessons (module_id, title, description, content_type, order_index, is_published, content_data)
    VALUES (mod_id, 'The Quadratic Formula', 'Derivation and application.', 'text', 0, true,
    jsonb_build_object('content', '
        <h3>The Quadratic Formula</h3>
        <p>For any quadratic equation $ax^2 + bx + c = 0$, the roots are given by:</p>
        <p style="text-align: center; font-size: 1.2em;">
          \[ x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \]
        </p>
        <p><strong>The Discriminant:</strong> $\Delta = b^2 - 4ac$ determines the nature of roots.</p>
        <ul>
          <li>If $\Delta > 0$: Two distinct real roots.</li>
          <li>If $\Delta = 0$: One repeated real root.</li>
          <li>If $\Delta < 0$: No real roots (complex roots).</li>
        </ul>
    '));

    -- Lesson: Completing the Square
    INSERT INTO course_lessons (module_id, title, description, content_type, order_index, is_published, content_data)
    VALUES (mod_id, 'Completing the Square', 'Transforming quadratics into vertex form.', 'text', 1, true,
    jsonb_build_object('content', '
        <h3>Completing the Square</h3>
        <p>To convert $ax^2 + bx + c$ into $a(x+p)^2 + q$:</p>
        <ol>
          <li>Factor out $a$: $a(x^2 + \frac{b}{a}x) + c$</li>
          <li>Add and subtract $(\frac{b}{2a})^2$: $a[(x + \frac{b}{2a})^2 - (\frac{b}{2a})^2] + c$</li>
          <li>Simplify.</li>
        </ol>
        <p><strong>Example:</strong> $x^2 + 6x + 5$</p>
        <p>$(x+3)^2 - 9 + 5 = (x+3)^2 - 4$</p>
        <p>Vertex is at $(-3, -4)$.</p>
    '));


    -- ==========================================
    -- POPULATE GEOMETRY MASTERCLASS
    -- ==========================================

    -- Module: Vectors
    INSERT INTO course_modules (course_id, title, description, order_index, is_published)
    VALUES (course_geo_id, 'Vectors', 'Magnitude, direction, and operations.', 2, true)
    RETURNING id INTO mod_id;

    INSERT INTO course_lessons (module_id, title, description, content_type, order_index, is_published, content_data)
    VALUES (mod_id, 'Introduction to Vectors', 'Scalars vs Vectors.', 'text', 0, true,
    jsonb_build_object('content', '
        <h3>Vectors</h3>
        <p>A vector has both <strong>magnitude</strong> and <strong>direction</strong>.</p>
        <p>Represented as column vectors:</p>
        <p>
          \[ \mathbf{v} = \begin{pmatrix} x \\ y \end{pmatrix} \]
        </p>
        <p><strong>Magnitude:</strong> $|\mathbf{v}| = \sqrt{x^2 + y^2}$</p>
        <p><strong>Addition:</strong> $\begin{pmatrix} a \\ b \end{pmatrix} + \begin{pmatrix} c \\ d \end{pmatrix} = \begin{pmatrix} a+c \\ b+d \end{pmatrix}$</p>
    '));

    -- Module: Triangle Trigonometry
    INSERT INTO course_modules (course_id, title, description, order_index, is_published)
    VALUES (course_geo_id, 'Triangle Trigonometry', 'Sine and Cosine rules.', 3, true)
    RETURNING id INTO mod_id;

    INSERT INTO course_lessons (module_id, title, description, content_type, order_index, is_published, content_data)
    VALUES (mod_id, 'Sine and Cosine Rules', 'Solving non-right-angled triangles.', 'text', 0, true,
    jsonb_build_object('content', '
        <h3>The Sine Rule</h3>
        <p>For any triangle with sides $a, b, c$ opposite angles $A, B, C$:</p>
        <p>
          \[ \frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} \]
        </p>
        
        <h3>The Cosine Rule</h3>
        <p>Use when you have SAS (Side-Angle-Side) or SSS:</p>
        <p>
          \[ c^2 = a^2 + b^2 - 2ab\cos C \]
        </p>
        <p>Or for angles:</p>
        <p>
          \[ \cos C = \frac{a^2 + b^2 - c^2}{2ab} \]
        </p>
    '));


    -- ==========================================
    -- ENROLL STUDENT
    -- ==========================================
    IF student_id IS NOT NULL THEN
        -- Enroll in Calculus
        IF NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = student_id AND course_id = course_calc_id) THEN
            INSERT INTO enrollments (user_id, course_id, status)
            VALUES (student_id, course_calc_id, 'enrolled');
        END IF;

        -- Enroll in Algebra
        IF NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = student_id AND course_id = course_alg_id) THEN
            INSERT INTO enrollments (user_id, course_id, status)
            VALUES (student_id, course_alg_id, 'enrolled');
        END IF;

        -- Enroll in Geometry (if not already)
        IF NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = student_id AND course_id = course_geo_id) THEN
            INSERT INTO enrollments (user_id, course_id, status)
            VALUES (student_id, course_geo_id, 'enrolled');
        END IF;
    END IF;

END $$;
