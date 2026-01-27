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

**Current Capability:**
Our platform focuses on rendering high-quality mathematical text. We **do not** currently have a built-in graphing calculator or plotter (like Desmos or GeoGebra) embedded directly in the text editor.

**Recommended Workflow for Graphs:**
To include graphs of functions, geometric figures, or statistical charts:

1.  **Create the Graph:** Use a specialized free tool:
    *   **Desmos** (Best for functions/algebra): [www.desmos.com](https://www.desmos.com)
    *   **GeoGebra** (Best for geometry): [www.geogebra.org](https://www.geogebra.org)
2.  **Export as Image:**
    *   Take a screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows).
    *   Or use the "Export Image" feature within those tools.
3.  **Upload to Lesson:**
    *   In the Lesson Builder, use the **"Add Content Block"** feature.
    *   Select **"Image"** (once image block support is enabled) or simply paste the image into the text area if supported.
    *   *Note: Currently, we recommend adding images as separate content blocks if the text editor supports basic image pasting, otherwise ask your admin to enable Image Blocks.*

---

## 5. Advanced Tips for Instructors

*   **Clarity is Key:** Don't overuse symbols. Use text to explain the steps between formulas.
*   **Spacing:** LaTeX ignores normal spaces.
    *   To force a small space: `\,`
    *   To force a medium space: `\;`
    *   To force a large space: `\quad`
*   **Text inside Formulas:** If you need to write normal words inside a formula, use `\text{...}`.
    *   *Example:* `$x = 5 \text{ meters}$`
*   **Preview:** Always use the "Preview" button in the Course Builder to see how your lesson looks to students.

---

## 6. Need Help?

If you are trying to write a specific formula and can't figure out the code:
1.  Search Google for "LaTeX code for [symbol name]".
2.  Use a visual editor like [CodeCogs](https://editor.codecogs.com/) to build it visually, then copy the LaTeX code into our platform.
