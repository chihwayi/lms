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
        })
      } catch (e) {
        dom.innerText = `$${content}$`
      }

      // Add click listener to allow "editing" via prompt (simple version)
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
