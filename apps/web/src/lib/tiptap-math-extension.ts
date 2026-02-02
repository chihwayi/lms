import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core'
import katex from 'katex'

export interface MathematicsOptions {
  HTMLAttributes: Record<string, any>
}

export const Mathematics = Node.create<MathematicsOptions>({
  name: 'mathematics',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'inline',

  inline: true,

  selectable: true,

  atom: true,

  addAttributes() {
    return {
      content: {
        default: '',
        parseHTML: element => element.getAttribute('data-content'),
        renderHTML: attributes => {
          return {
            'data-content': attributes.content,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="mathematics"]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'mathematics',
      }),
      `$${node.attrs.content}$`,
    ]
  },

  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const dom = document.createElement('span')
      const content = node.attrs.content

      dom.classList.add('mathematics', 'cursor-pointer', 'px-1', 'rounded', 'hover:bg-gray-100')
      
      // Merge attributes
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        dom.setAttribute(key, value)
      })

      try {
        katex.render(content, dom, {
          throwOnError: false,
          displayMode: false, // Inline math
          output: 'html', // Avoid MathML deprecation warnings
        })
      } catch (e: any) {
        console.error('KaTeX rendering error:', e);
        dom.innerHTML = `<span class="text-red-500 font-mono text-xs p-1 border border-red-200 bg-red-50 rounded" title="${e.message}">Math Error</span> $${content}$`;
      }

      // Add click listener to allow "editing"
      dom.addEventListener('click', () => {
        // This is a hacky way to edit, but works for MVP
        // Ideally we would use a proper react node view
        // For now, we rely on the toolbar button or deleting and retyping
      })

      return {
        dom,
      }
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /\$([^$]+)\$/,
        type: this.type,
        getAttributes: (match) => {
          return {
            content: match[1],
          }
        },
      }),
    ]
  },
})
