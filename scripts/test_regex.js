
const html = `Introduction to Vectors 
 Introduction to Vectors 
 Vectors 
 
 A vector has both magnitude and direction. 
 
 Represented as column vectors: 
 
 \\[ \\mathbf{v} = \\begin{pmatrix} x \\\\ y \\end{pmatrix} \\] 
 
 Magnitude: $|\\mathbf{v}| = \\sqrt{x^2 + y^2}$ 
 
 Addition: $\\begin{pmatrix} a \\\\ b \\end{pmatrix} + \\begin{pmatrix} c \\\\ d \\end{pmatrix} = \\begin{pmatrix} a+c \\\\ b+d \\end{pmatrix}$ 
 Lesson Notes 
 
 Scalars vs Vectors.`;

const processContent = (html) => {
    if (!html) return '';
    console.log('processContent input length:', html.length);
    let processed = html;

    // Handle \[ ... \] block math
    processed = processed.replace(/\\\[([\s\S]+?)\\\]/g, (match, equation) => {
      console.log('Found block math:', equation);
      return `<span data-type="mathematics" data-content="${equation.replace(/"/g, '&quot;')}"></span>`;
    });

    // Handle \( ... \) inline math
    processed = processed.replace(/\\\(([\s\S]+?)\\\)/g, (match, equation) => {
      console.log('Found inline math \\( ... \\):', equation);
      return `<span data-type="mathematics" data-content="${equation.replace(/"/g, '&quot;')}"></span>`;
    });

    // Handle $ ... $ inline math
    processed = processed.replace(/\$([^$]+)\$/g, (match, equation) => {
      console.log('Found inline math $ ... $:', equation);
      return `<span data-type="mathematics" data-content="${equation.replace(/"/g, '&quot;')}"></span>`;
    });

    return processed;
};

const result = processContent(html);
console.log('Result:', result);
