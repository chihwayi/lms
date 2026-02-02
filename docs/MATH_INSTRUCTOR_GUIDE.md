# Math Instructor Guide: Creating Rich Mathematical Content

Welcome to the Course Builder! This guide is designed to help you create clear, professional, and mathematically rich content for your students. Our platform supports advanced mathematical notation using **LaTeX** (pronounced "Lay-tech"), the global standard for scientific and mathematical writing.

## 1. Accessing the Math Editor

There are two ways to insert mathematical formulas into your lessons:

### Option A: The Math Button (Recommended for Beginners)
1.  In the Rich Text Editor toolbar, look for the **Sigma ($\Sigma$)** icon.
2.  Click it to open the "Insert Math" dialog.
3.  Type your formula code (LaTeX) into the input box.
4.  Click **Save**. The formula will appear in your text.

### Option B: The Quick Shortcut (For Power Users)
You can type formulas directly while writing text by surrounding your code with dollar signs (`$`).
*   **Example:** Type `$E=mc^2$` and it will automatically convert to $E=mc^2$.

---

## 2. Common Scenarios & Formula Examples

Here is a cheat sheet for the most common mathematical scenarios you will encounter. You can copy and paste these codes directly into the editor.

### Arithmetic & Algebra
| Description | You Type (LaTeX) | What Students See |
| :--- | :--- | :--- |
| **Fractions** | `\frac{a}{b}` | $\frac{a}{b}$ |
| **Square Root** | `\sqrt{x}` | $\sqrt{x}$ |
| **Nth Root** | `\sqrt[3]{x}` | $\sqrt[3]{x}$ |
| **Exponents** | `x^2` | $x^2$ |
| **Subscripts** | `x_1` | $x_1$ |
| **Multiplication** | `\times` or `\cdot` | $\times$ or $\cdot$ |
| **Division** | `\div` | $\div$ |
| **Infinity** | `\infty` | $\infty$ |

### Geometry
| Description | You Type (LaTeX) | What Students See |
| :--- | :--- | :--- |
| **Triangle** | `\triangle ABC` | $\triangle ABC$ |
| **Angle** | `\angle ABC` | $\angle ABC$ |
| **Degree** | `90^\circ` | $90^\circ$ |
| **Perpendicular** | `\perp` | $\perp$ |
| **Parallel** | `\parallel` | $\parallel$ |
| **Similar** | `\sim` | $\sim$ |
| **Congruent** | `\cong` | $\cong$ |
| **Pi** | `\pi` | $\pi$ |
| **Theta** | `\theta` | $\theta$ |

### Calculus & Analysis
| Description | You Type (LaTeX) | What Students See |
| :--- | :--- | :--- |
| **Integral** | `\int_{a}^{b} f(x) dx` | $\int_{a}^{b} f(x) dx$ |
| **Summation** | `\sum_{i=1}^{n} i^2` | $\sum_{i=1}^{n} i^2$ |
| **Limit** | `\lim_{x \to \infty}` | $\lim_{x \to \infty}$ |
| **Derivative** | `\frac{dy}{dx}` | $\frac{dy}{dx}$ |
| **Partial** | `\frac{\partial f}{\partial x}` | $\frac{\partial f}{\partial x}$ |

### Logic & Set Theory
| Description | You Type (LaTeX) | What Students See |
| :--- | :--- | :--- |
| **For All** | `\forall` | $\forall$ |
| **Exists** | `\exists` | $\exists$ |
| **Element Of** | `\in` | $\in$ |
| **Subset** | `\subset` | $\subset$ |
| **Union** | `\cup` | $\cup$ |
| **Intersection** | `\cap` | $\cap$ |
| **Not Equal** | `\neq` | $\neq$ |
| **Approximate** | `\approx` | $\approx$ |

---

## 3. Creating Complex Equations

### Systems of Equations
To align multiple equations (like a system), use the `\begin{aligned} ... \end{aligned}` block. Use `&` to specify alignment points and `\\` for new lines.

**Code:**
```latex
\begin{aligned} 
2x + y &= 10 \\ 
x - y &= 4 
\end{aligned}
```

### Matrices
**Code:**
```latex
\begin{pmatrix} 
a & b \\ 
c & d 
\end{pmatrix}
```
**Result:**
$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$

---

## 4. Graphs and Plotting

We have integrated a powerful graphing engine that allows you to render interactive 2D function plots directly in your lessons. This is perfect for visualizing algebraic concepts, calculus functions, and systems of equations.

### How to Add a Graph

1.  In the Course Builder, click the **"Add Graph"** button (Graph Icon) in the block menu.
2.  A new Graph Editor block will appear.

### Configuring Your Graph

The Graph Editor has three main sections:

#### A. Graph Title
*   Give your graph a descriptive title (e.g., "Intersection of Two Lines" or "Parabola").

#### B. Axis Domains (Window Size)
*   **X Axis Domain**: Set the minimum and maximum values for the horizontal axis (default: -10 to 10).
*   **Y Axis Domain**: Set the minimum and maximum values for the vertical axis (default: -10 to 10).
*   *Tip: Adjust these to "zoom in" or "zoom out" to show the most important features of your graph.*

#### C. Functions
You can plot multiple functions on the same graph.

1.  Click **"Add Function"**.
2.  **Equation**: Type your function in terms of `x`.
    *   **Linear:** `2x + 1`
    *   **Quadratic:** `x^2`
    *   **Trigonometric:** `sin(x)`, `cos(x)`
    *   **Exponential:** `exp(x)`
    *   **Logarithmic:** `log(x)`
    *   **Root:** `sqrt(x)`
3.  **Color**: Choose a color for the line to distinguish it from others.

### Example: Visualizing a System of Equations

To show the solution to the system:
*   $y = 2x + 1$
*   $y = -x + 4$

**Steps:**
1.  Set **X Domain** to `-5` to `5`.
2.  Set **Y Domain** to `-5` to `10`.
3.  Add Function 1: `2x + 1` (Select Blue).
4.  Add Function 2: `-x + 4` (Select Red).

The graph will automatically render the intersection point at $(1, 3)$.
