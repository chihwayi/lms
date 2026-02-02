import json
import uuid

def generate_uuid():
    return str(uuid.uuid4())

def generate_sql():
    # Instructor ID for admin@test.com (assumed or fetched, usually fixed for seeding)
    instructor_id = "(SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1)"
    
    courses = [
        {
            "title": "O Level Mathematics: Algebra & Graphs",
            "level": "intermediate",
            "description": "Comprehensive guide to Algebra, Coordinate Geometry, and Graphs for O Level students. Master the fundamentals of linear and non-linear functions.",
            "modules": [
                {
                    "title": "Coordinate Geometry",
                    "lessons": [
                        {
                            "title": "The Equation of a Straight Line",
                            "content": r"""
                                <h3>Understanding the Line Equation</h3>
                                <p>The general equation of a straight line is given by:</p>
                                \[ y = mx + c \]
                                <p>Where:</p>
                                <ul>
                                    <li><strong>m</strong> is the gradient (slope)</li>
                                    <li><strong>c</strong> is the y-intercept (where the line crosses the y-axis)</li>
                                </ul>
                                <h3>Example 1: Finding Gradient and Intercept</h3>
                                <p>Given the equation \( y = 2x + 3 \):</p>
                                <ul>
                                    <li>Gradient \( m = 2 \)</li>
                                    <li>Y-intercept \( c = 3 \)</li>
                                </ul>
                                <h3>Example 2: Rearranging Equations</h3>
                                <p>Sometimes equations aren't in the form \( y = mx + c \). Let's rearrange \( 2y - 4x = 8 \):</p>
                                <p>Step 1: Add \( 4x \) to both sides:</p>
                                \[ 2y = 4x + 8 \]
                                <p>Step 2: Divide by 2:</p>
                                \[ y = 2x + 4 \]
                                <p>Now we can see \( m = 2 \) and \( c = 4 \).</p>
                            """
                        },
                        {
                            "title": "Calculating Gradients",
                            "content": r"""
                                <h3>The Gradient Formula</h3>
                                <p>The gradient \( m \) of a line passing through two points \( (x_1, y_1) \) and \( (x_2, y_2) \) is:</p>
                                \[ m = \frac{y_2 - y_1}{x_2 - x_1} \]
                                <h3>Worked Example</h3>
                                <p>Find the gradient of the line passing through A(2, 4) and B(6, 12).</p>
                                <p><strong>Solution:</strong></p>
                                <p>Let \( (x_1, y_1) = (2, 4) \) and \( (x_2, y_2) = (6, 12) \).</p>
                                \[ m = \frac{12 - 4}{6 - 2} \]
                                \[ m = \frac{8}{4} \]
                                \[ m = 2 \]
                                <p>The gradient is 2.</p>
                            """
                        },
                        {
                            "title": "Parallel and Perpendicular Lines",
                            "content": r"""
                                <h3>Parallel Lines</h3>
                                <p>Two lines are parallel if they have the <strong>same gradient</strong>.</p>
                                <p>Example: \( y = 3x + 1 \) and \( y = 3x - 5 \) are parallel because \( m = 3 \) for both.</p>
                                <h3>Perpendicular Lines</h3>
                                <p>Two lines are perpendicular if the product of their gradients is -1:</p>
                                \[ m_1 \times m_2 = -1 \]
                                <p>Or:</p>
                                \[ m_2 = -\frac{1}{m_1} \]
                                <h3>Worked Example</h3>
                                <p>Find the equation of a line perpendicular to \( y = 2x + 1 \) passing through (0, 0).</p>
                                <p><strong>Solution:</strong></p>
                                <p>1. Gradient of original line \( m_1 = 2 \).</p>
                                <p>2. Gradient of perpendicular line \( m_2 = -\frac{1}{2} \).</p>
                                <p>3. Equation: \( y = -\frac{1}{2}x + c \).</p>
                                <p>4. Since it passes through (0, 0), \( c = 0 \).</p>
                                <p>Final Equation: \( y = -\frac{1}{2}x \)</p>
                            """
                        },
                        {
                            "title": "Midpoint and Distance",
                            "content": r"""
                                <h3>Midpoint Formula</h3>
                                <p>The midpoint \( M \) between \( (x_1, y_1) \) and \( (x_2, y_2) \) is:</p>
                                \[ M = \left( \frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2} \right) \]
                                <h3>Distance Formula</h3>
                                <p>The distance \( d \) between two points is derived from Pythagoras' theorem:</p>
                                \[ d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} \]
                                <h3>Practice Problem</h3>
                                <p>Find the distance between P(1, 1) and Q(4, 5).</p>
                                \[ d = \sqrt{(4 - 1)^2 + (5 - 1)^2} \]
                                \[ d = \sqrt{3^2 + 4^2} \]
                                \[ d = \sqrt{9 + 16} = \sqrt{25} = 5 \]
                            """
                        }
                    ]
                },
                {
                    "title": "Simultaneous Equations",
                    "lessons": [
                        {
                            "title": "Substitution Method",
                            "content": r"""
                                <h3>Introduction</h3>
                                <p>The substitution method involves solving one equation for one variable and substituting it into the other.</p>
                                <h3>Example</h3>
                                <p>Solve:</p>
                                <ol>
                                    <li>\( y = x + 2 \)</li>
                                    <li>\( 2x + y = 11 \)</li>
                                </ol>
                                <p><strong>Step 1:</strong> Substitute (1) into (2):</p>
                                \[ 2x + (x + 2) = 11 \]
                                \[ 3x + 2 = 11 \]
                                <p><strong>Step 2:</strong> Solve for x:</p>
                                \[ 3x = 9 \implies x = 3 \]
                                <p><strong>Step 3:</strong> Substitute x back into (1):</p>
                                \[ y = 3 + 2 = 5 \]
                                <p><strong>Solution:</strong> \( x = 3, y = 5 \)</p>
                            """
                        },
                        {
                            "title": "Elimination Method",
                            "content": r"""
                                <h3>Introduction</h3>
                                <p>The elimination method involves adding or subtracting equations to remove one variable.</p>
                                <h3>Example</h3>
                                <p>Solve:</p>
                                <ol>
                                    <li>\( 3x + 2y = 12 \)</li>
                                    <li>\( 3x - y = 3 \)</li>
                                </ol>
                                <p><strong>Step 1:</strong> Subtract (2) from (1) to eliminate x:</p>
                                \[ (3x - 3x) + (2y - (-y)) = 12 - 3 \]
                                \[ 3y = 9 \]
                                \[ y = 3 \]
                                <p><strong>Step 2:</strong> Substitute y = 3 into (2):</p>
                                \[ 3x - 3 = 3 \]
                                \[ 3x = 6 \implies x = 2 \]
                                <p><strong>Solution:</strong> \( x = 2, y = 3 \)</p>
                            """
                        },
                        {
                            "title": "Graphical Method",
                            "content": r"""
                                <h3>Visualizing Solutions</h3>
                                <p>Simultaneous equations represent lines. The solution is the point where they intersect.</p>
                                <p>To solve graphically:</p>
                                <ol>
                                    <li>Plot the first line.</li>
                                    <li>Plot the second line.</li>
                                    <li>Read the coordinates of the intersection point.</li>
                                </ol>
                                <p>If the lines are parallel, there is no solution. If they are the same line, there are infinite solutions.</p>
                            """
                        }
                    ]
                },
                {
                    "title": "Quadratic Functions",
                    "lessons": [
                        {
                            "title": "Factorising Quadratics",
                            "content": r"""
                                <h3>Standard Form</h3>
                                <p>A quadratic is in the form \( ax^2 + bx + c \).</p>
                                <h3>Factorising \( x^2 + bx + c \)</h3>
                                <p>Find two numbers that multiply to give \( c \) and add to give \( b \).</p>
                                <p><strong>Example:</strong> Factorise \( x^2 + 5x + 6 \)</p>
                                <ul>
                                    <li>Factors of 6: 1 & 6, 2 & 3.</li>
                                    <li>2 + 3 = 5.</li>
                                </ul>
                                <p>So, \( (x + 2)(x + 3) \).</p>
                            """
                        },
                        {
                            "title": "The Quadratic Formula",
                            "content": r"""
                                <h3>The Formula</h3>
                                <p>For \( ax^2 + bx + c = 0 \), the solutions are:</p>
                                \[ x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \]
                                <h3>Example</h3>
                                <p>Solve \( 2x^2 + 5x - 3 = 0 \).</p>
                                <p>\( a = 2, b = 5, c = -3 \)</p>
                                \[ x = \frac{-5 \pm \sqrt{5^2 - 4(2)(-3)}}{2(2)} \]
                                \[ x = \frac{-5 \pm \sqrt{25 + 24}}{4} \]
                                \[ x = \frac{-5 \pm \sqrt{49}}{4} \]
                                \[ x = \frac{-5 \pm 7}{4} \]
                                <p>Solutions:</p>
                                \[ x_1 = \frac{2}{4} = 0.5, \quad x_2 = \frac{-12}{4} = -3 \]
                            """
                        },
                        {
                            "title": "Completing the Square",
                            "content": r"""
                                <h3>Method</h3>
                                <p>To express \( x^2 + bx \) as a perfect square:</p>
                                \[ \left(x + \frac{b}{2}\right)^2 - \left(\frac{b}{2}\right)^2 \]
                                <h3>Example</h3>
                                <p>Complete the square for \( x^2 + 6x + 5 \).</p>
                                \[ (x + 3)^2 - 3^2 + 5 \]
                                \[ (x + 3)^2 - 9 + 5 \]
                                \[ (x + 3)^2 - 4 \]
                                <p>This form helps find the turning point (vertex) of the parabola. Here, the minimum point is (-3, -4).</p>
                            """
                        }
                    ]
                },
                {
                    "title": "Inequalities",
                    "lessons": [
                        {
                            "title": "Linear Inequalities",
                            "content": r"""
                                <h3>Solving Basic Inequalities</h3>
                                <p>Treat the inequality sign like an equals sign, but remember: <strong>flip the sign when multiplying or dividing by a negative number</strong>.</p>
                                <h3>Example</h3>
                                <p>Solve \( 3 - 2x > 7 \).</p>
                                \[ -2x > 4 \]
                                <p>Divide by -2 (flip sign):</p>
                                \[ x < -2 \]
                                <h3>Number Line Representation</h3>
                                <p>An open circle means \( < \) or \( > \). A filled circle means \( \leq \) or \( \geq \).</p>
                            """
                        },
                        {
                            "title": "Quadratic Inequalities",
                            "content": r"""
                                <h3>Steps to Solve</h3>
                                <ol>
                                    <li>Find the critical values (roots) by solving the equation equal to zero.</li>
                                    <li>Sketch the quadratic curve.</li>
                                    <li>Determine the region where the curve is above (> 0) or below (< 0) the x-axis.</li>
                                </ol>
                                <h3>Example</h3>
                                <p>Solve \( x^2 - 4 < 0 \).</p>
                                <p>Roots: \( x^2 = 4 \implies x = \pm 2 \).</p>
                                <p>Sketch: U-shaped parabola crossing at -2 and 2.</p>
                                <p>We want where it is less than 0 (below axis).</p>
                                <p><strong>Solution:</strong> \( -2 < x < 2 \)</p>
                            """
                        }
                    ]
                },
                {
                    "title": "Real-Life Graphs",
                    "lessons": [
                        {
                            "title": "Distance-Time Graphs",
                            "content": r"""
                                <h3>Interpreting the Graph</h3>
                                <ul>
                                    <li><strong>Gradient:</strong> Represents Speed.</li>
                                    <li><strong>Flat line:</strong> Object is stationary.</li>
                                    <li><strong>Steeper line:</strong> Faster speed.</li>
                                </ul>
                                <h3>Calculating Speed</h3>
                                <p>Speed = Gradient = \( \frac{\text{Change in Distance}}{\text{Change in Time}} \).</p>
                            """
                        },
                        {
                            "title": "Speed-Time Graphs",
                            "content": r"""
                                <h3>Key Features</h3>
                                <ul>
                                    <li><strong>Gradient:</strong> Represents Acceleration.</li>
                                    <li><strong>Area under graph:</strong> Represents Distance travelled.</li>
                                </ul>
                                <h3>Example</h3>
                                <p>A car accelerates from 0 to 20 m/s in 10 seconds. Find acceleration.</p>
                                \[ a = \frac{20 - 0}{10} = 2 \, \text{m/s}^2 \]
                            """
                        }
                    ]
                }
            ]
        },
        {
            "title": "O Level Mathematics: Geometry & Trigonometry",
            "level": "intermediate",
            "description": "Master geometric properties, angles, and trigonometric ratios. Includes comprehensive coverage of mensuration and vectors.",
            "modules": [
                {
                    "title": "Angles and Polygons",
                    "lessons": [
                        {
                            "title": "Angle Properties",
                            "content": r"""
                                <h3>Basic Rules</h3>
                                <ul>
                                    <li>Angles on a straight line add to 180°.</li>
                                    <li>Angles around a point add to 360°.</li>
                                    <li>Vertically opposite angles are equal.</li>
                                </ul>
                                <h3>Parallel Lines</h3>
                                <ul>
                                    <li><strong>Alternate angles</strong> (Z-shape) are equal.</li>
                                    <li><strong>Corresponding angles</strong> (F-shape) are equal.</li>
                                    <li><strong>Co-interior angles</strong> (C-shape) add to 180°.</li>
                                </ul>
                            """
                        },
                        {
                            "title": "Polygons",
                            "content": r"""
                                <h3>Sum of Interior Angles</h3>
                                <p>For an n-sided polygon, sum = \( (n-2) \times 180^\circ \).</p>
                                <h3>Exterior Angles</h3>
                                <p>Sum of exterior angles is always 360°.</p>
                                <h3>Regular Polygons</h3>
                                <p>Each exterior angle = \( \frac{360}{n} \).</p>
                                <p>Each interior angle = \( 180 - \text{exterior angle} \).</p>
                            """
                        },
                        {
                            "title": "Circle Theorems",
                            "content": r"""
                                <h3>Key Theorems</h3>
                                <ol>
                                    <li>Angle at center is twice angle at circumference.</li>
                                    <li>Angle in a semicircle is 90°.</li>
                                    <li>Angles in the same segment are equal.</li>
                                    <li>Opposite angles in a cyclic quadrilateral sum to 180°.</li>
                                    <li>Tangent is perpendicular to radius.</li>
                                </ol>
                            """
                        }
                    ]
                },
                {
                    "title": "Trigonometry",
                    "lessons": [
                        {
                            "title": "Right-Angled Triangles (SOHCAHTOA)",
                            "content": r"""
                                <h3>Ratios</h3>
                                <ul>
                                    <li>\( \sin \theta = \frac{\text{Opposite}}{\text{Hypotenuse}} \)</li>
                                    <li>\( \cos \theta = \frac{\text{Adjacent}}{\text{Hypotenuse}} \)</li>
                                    <li>\( \tan \theta = \frac{\text{Opposite}}{\text{Adjacent}} \)</li>
                                </ul>
                                <h3>Example</h3>
                                <p>Find x if \( \sin(30^\circ) = \frac{x}{10} \).</p>
                                \[ x = 10 \times \sin(30^\circ) = 10 \times 0.5 = 5 \]
                            """
                        },
                        {
                            "title": "Sine and Cosine Rules",
                            "content": r"""
                                <h3>Sine Rule</h3>
                                <p>Use for non-right-angled triangles with matching pairs of angle/side.</p>
                                \[ \frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} \]
                                <h3>Cosine Rule</h3>
                                <p>Use when you have SAS (Side-Angle-Side) or SSS (Side-Side-Side).</p>
                                \[ a^2 = b^2 + c^2 - 2bc \cos A \]
                                <p>Rearranged for angle:</p>
                                \[ \cos A = \frac{b^2 + c^2 - a^2}{2bc} \]
                            """
                        },
                        {
                            "title": "Area of a Triangle",
                            "content": r"""
                                <h3>Formula</h3>
                                <p>Area = \( \frac{1}{2}ab \sin C \)</p>
                                <p>Where C is the included angle between sides a and b.</p>
                            """
                        }
                    ]
                },
                {
                    "title": "Vectors",
                    "lessons": [
                        {
                            "title": "Introduction to Vectors",
                            "content": r"""
                                <h3>Scalars vs Vectors</h3>
                                <p>A scalar has magnitude only. A vector has both magnitude and direction.</p>
                                <h3>Column Vectors</h3>
                                <p>Represented as \( \mathbf{v} = \begin{pmatrix} x \\ y \end{pmatrix} \).</p>
                                <h3>Magnitude</h3>
                                \[ |\mathbf{v}| = \sqrt{x^2 + y^2} \]
                                <h3>Vector Addition</h3>
                                \[ \begin{pmatrix} a \\ b \end{pmatrix} + \begin{pmatrix} c \\ d \end{pmatrix} = \begin{pmatrix} a+c \\ b+d \end{pmatrix} \]
                            """
                        }
                    ]
                },
                {
                    "title": "Mensuration",
                    "lessons": [
                        {
                            "title": "Area and Perimeter",
                            "content": r"""
                                <h3>Common Shapes</h3>
                                <ul>
                                    <li>Rectangle: Area = \( l \times w \)</li>
                                    <li>Triangle: Area = \( \frac{1}{2}bh \)</li>
                                    <li>Trapezium: Area = \( \frac{1}{2}(a+b)h \)</li>
                                    <li>Circle: Area = \( \pi r^2 \), Circumference = \( 2\pi r \)</li>
                                </ul>
                            """
                        },
                        {
                            "title": "Volume and Surface Area",
                            "content": r"""
                                <h3>3D Shapes</h3>
                                <ul>
                                    <li>Cylinder Volume = \( \pi r^2 h \)</li>
                                    <li>Cone Volume = \( \frac{1}{3}\pi r^2 h \)</li>
                                    <li>Sphere Volume = \( \frac{4}{3}\pi r^3 \)</li>
                                    <li>Sphere Surface Area = \( 4\pi r^2 \)</li>
                                </ul>
                            """
                        }
                    ]
                },
                {
                    "title": "Bearings",
                    "lessons": [
                        {
                            "title": "Understanding Bearings",
                            "content": r"""
                                <h3>Three Rules</h3>
                                <ol>
                                    <li>Measure from North.</li>
                                    <li>Measure clockwise.</li>
                                    <li>Always use 3 digits (e.g., 045°).</li>
                                </ol>
                                <h3>Example</h3>
                                <p>The bearing of B from A is 060°. Find the bearing of A from B.</p>
                                <p>Solution: Add 180° to return.</p>
                                \[ 060 + 180 = 240^\circ \]
                            """
                        }
                    ]
                }
            ]
        },
        {
            "title": "A Level Mathematics: Calculus",
            "level": "advanced",
            "description": "Deep dive into Differentiation and Integration. Essential for advanced mathematics and physics.",
            "modules": [
                {
                    "title": "Differentiation",
                    "lessons": [
                        {
                            "title": "First Principles",
                            "content": r"""
                                <h3>Definition</h3>
                                <p>The derivative is defined as the limit of the gradient of the chord:</p>
                                \[ f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h} \]
                                <h3>Power Rule</h3>
                                <p>If \( y = ax^n \), then:</p>
                                \[ \frac{dy}{dx} = anx^{n-1} \]
                                <p>Example: Differentiate \( y = 3x^4 \).</p>
                                \[ \frac{dy}{dx} = 3(4)x^{3} = 12x^3 \]
                            """
                        },
                        {
                            "title": "Tangents and Normals",
                            "content": r"""
                                <h3>Tangent</h3>
                                <p>The gradient of the tangent is \( m_t = \frac{dy}{dx} \) at that point.</p>
                                <h3>Normal</h3>
                                <p>The normal is perpendicular to the tangent, so its gradient is:</p>
                                \[ m_n = -\frac{1}{m_t} \]
                                <h3>Example</h3>
                                <p>Find tangent to \( y = x^2 \) at \( x = 1 \).</p>
                                <p>\( \frac{dy}{dx} = 2x \). At \( x=1 \), \( m=2 \). Point (1, 1).</p>
                                <p>Eq: \( y - 1 = 2(x - 1) \implies y = 2x - 1 \).</p>
                            """
                        },
                        {
                            "title": "Chain, Product, Quotient Rules",
                            "content": r"""
                                <h3>Chain Rule</h3>
                                <p>Function of a function:</p>
                                \[ \frac{dy}{dx} = \frac{dy}{du} \times \frac{du}{dx} \]
                                <h3>Product Rule</h3>
                                <p>For \( y = uv \):</p>
                                \[ \frac{dy}{dx} = u\frac{dv}{dx} + v\frac{du}{dx} \]
                                <h3>Quotient Rule</h3>
                                <p>For \( y = \frac{u}{v} \):</p>
                                \[ \frac{dy}{dx} = \frac{v\frac{du}{dx} - u\frac{dv}{dx}}{v^2} \]
                            """
                        }
                    ]
                },
                {
                    "title": "Integration",
                    "lessons": [
                        {
                            "title": "Indefinite Integration",
                            "content": r"""
                                <h3>Reverse of Differentiation</h3>
                                <p>If \( \frac{dy}{dx} = ax^n \), then:</p>
                                \[ y = \int ax^n \, dx = \frac{ax^{n+1}}{n+1} + C \]
                                <p><strong>Don't forget the constant of integration +C!</strong></p>
                                <h3>Example</h3>
                                <p>Integrate \( 3x^2 \).</p>
                                \[ \int 3x^2 \, dx = \frac{3x^3}{3} + C = x^3 + C \]
                            """
                        },
                        {
                            "title": "Definite Integration",
                            "content": r"""
                                <h3>Finding Area</h3>
                                <p>The area under a curve between \( x=a \) and \( x=b \) is:</p>
                                \[ \int_a^b f(x) \, dx = [F(x)]_a^b = F(b) - F(a) \]
                                <h3>Example</h3>
                                <p>Find area under \( y = 2x \) from 0 to 2.</p>
                                \[ \int_0^2 2x \, dx = [x^2]_0^2 = 2^2 - 0^2 = 4 \]
                            """
                        }
                    ]
                },
                {
                    "title": "Applications",
                    "lessons": [
                        {
                            "title": "Stationary Points",
                            "content": r"""
                                <h3>Finding Maxima and Minima</h3>
                                <p>At a stationary point, \( \frac{dy}{dx} = 0 \).</p>
                                <h3>Nature of Point</h3>
                                <ul>
                                    <li>Find second derivative \( \frac{d^2y}{dx^2} \).</li>
                                    <li>If \( > 0 \): Minimum.</li>
                                    <li>If \( < 0 \): Maximum.</li>
                                    <li>If \( = 0 \): Point of Inflection (check gradients).</li>
                                </ul>
                            """
                        }
                    ]
                },
                {
                    "title": "Kinematics",
                    "lessons": [
                        {
                            "title": "Displacement, Velocity, Acceleration",
                            "content": r"""
                                <h3>Relationships</h3>
                                <ul>
                                    <li>\( v = \frac{ds}{dt} \) (Differentiate displacement)</li>
                                    <li>\( a = \frac{dv}{dt} = \frac{d^2s}{dt^2} \) (Differentiate velocity)</li>
                                </ul>
                                <h3>Reverse</h3>
                                <ul>
                                    <li>\( s = \int v \, dt \)</li>
                                    <li>\( v = \int a \, dt \)</li>
                                </ul>
                            """
                        }
                    ]
                }
            ]
        },
        {
            "title": "A Level Mathematics: Probability & Statistics",
            "level": "advanced",
            "description": "Statistical analysis, representation of data, and probability theory.",
            "modules": [
                {
                    "title": "Representation of Data",
                    "lessons": [
                        {
                            "title": "Histograms",
                            "content": r"""
                                <h3>Frequency Density</h3>
                                <p>In a histogram, area represents frequency.</p>
                                \[ \text{Frequency Density} = \frac{\text{Frequency}}{\text{Class Width}} \]
                                <p>The height of the bar is the frequency density.</p>
                            """
                        },
                        {
                            "title": "Averages and Spread",
                            "content": r"""
                                <h3>Measures of Location</h3>
                                <ul>
                                    <li>Mean \( \bar{x} = \frac{\sum x}{n} \)</li>
                                    <li>Median: Middle value.</li>
                                    <li>Mode: Most common value.</li>
                                </ul>
                                <h3>Measures of Spread</h3>
                                <ul>
                                    <li>Range = Max - Min</li>
                                    <li>Variance \( \sigma^2 = \frac{\sum x^2}{n} - \bar{x}^2 \)</li>
                                    <li>Standard Deviation \( \sigma = \sqrt{\text{Variance}} \)</li>
                                </ul>
                            """
                        }
                    ]
                },
                {
                    "title": "Probability",
                    "lessons": [
                        {
                            "title": "Basic Probability",
                            "content": r"""
                                <h3>Formulas</h3>
                                <p>\( P(A) = \frac{\text{Number of successful outcomes}}{\text{Total outcomes}} \)</p>
                                <p>\( P(A') = 1 - P(A) \)</p>
                                <h3>Combined Events</h3>
                                <p><strong>Independent:</strong> \( P(A \cap B) = P(A) \times P(B) \)</p>
                                <p><strong>Mutually Exclusive:</strong> \( P(A \cup B) = P(A) + P(B) \)</p>
                            """
                        },
                        {
                            "title": "Conditional Probability",
                            "content": r"""
                                <h3>Formula</h3>
                                \[ P(A|B) = \frac{P(A \cap B)}{P(B)} \]
                                <p>Probability of A given B has happened.</p>
                            """
                        }
                    ]
                },
                {
                    "title": "Probability Distributions",
                    "lessons": [
                        {
                            "title": "Binomial Distribution",
                            "content": r"""
                                <h3>Conditions</h3>
                                <ul>
                                    <li>Fixed number of trials (n).</li>
                                    <li>Two outcomes (Success/Failure).</li>
                                    <li>Constant probability of success (p).</li>
                                    <li>Independent trials.</li>
                                </ul>
                                <h3>Formula</h3>
                                \[ P(X=r) = \binom{n}{r} p^r (1-p)^{n-r} \]
                            """
                        },
                        {
                            "title": "Normal Distribution",
                            "content": r"""
                                <h3>Bell Curve</h3>
                                <p>Symmetric about the mean \( \mu \).</p>
                                <h3>Standard Normal Variable Z</h3>
                                \[ Z = \frac{X - \mu}{\sigma} \]
                                <p>Use tables to find probabilities for \( Z \).</p>
                            """
                        }
                    ]
                }
            ]
        }
    ]

    sql = []
    
    # Clean up existing data
    sql.append("-- Clean up existing courses")
    sql.append("TRUNCATE course_modules, course_lessons, courses CASCADE;")
    sql.append("")

    for course in courses:
        course_id = generate_uuid()
        # Escape single quotes in description
        desc = course['description'].replace("'", "''")
        level = course.get('level', 'beginner')
        
        sql.append(f"-- Course: {course['title']}")
        sql.append(f"INSERT INTO courses (id, title, description, created_by, status, visibility, level, language, price, created_at, updated_at) VALUES")
        sql.append(f"('{course_id}', '{course['title']}', '{desc}', {instructor_id}, 'published', 'public', '{level}', 'en', 0, NOW(), NOW());")
        
        for i, module in enumerate(course['modules']):
            module_id = generate_uuid()
            module_title = module['title'].replace("'", "''")
            
            sql.append(f"INSERT INTO course_modules (id, course_id, title, order_index, created_at, updated_at) VALUES")
            sql.append(f"('{module_id}', '{course_id}', '{module_title}', {i}, NOW(), NOW());")
            
            for j, lesson in enumerate(module['lessons']):
                lesson_id = generate_uuid()
                lesson_title = lesson['title'].replace("'", "''")
                
                # Format content data as JSONB
                # Note: We need to be careful with JSON escaping.
                # Python's json.dumps will handle the JSON string escaping.
                # Then we need to escape single quotes for SQL.
                
                content_html = lesson['content']
                content_data = json.dumps({
                    "html": content_html,
                    "blocks": [
                        {
                            "id": generate_uuid(),
                            "type": "text",
                            "content": content_html,
                            "order": 0
                        }
                    ]
                })
                
                # Escape single quotes for SQL string
                content_data_sql = content_data.replace("'", "''")
                
                sql.append(f"INSERT INTO course_lessons (id, module_id, title, content_type, content_data, order_index, is_published, duration_minutes, created_at, updated_at) VALUES")
                sql.append(f"('{lesson_id}', '{module_id}', '{lesson_title}', 'text', '{content_data_sql}', {j}, true, 15, NOW(), NOW());")
        
        sql.append("")

    return "\n".join(sql)

if __name__ == "__main__":
    with open("rich_math_seeds.sql", "w") as f:
        f.write(generate_sql())
    print("SQL file generated: rich_math_seeds.sql")
