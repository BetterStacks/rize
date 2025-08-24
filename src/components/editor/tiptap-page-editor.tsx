'use client'

import { updatePage } from '@/actions/page-actions'
import { TProfile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Dot, Loader } from 'lucide-react'
import NextImage from 'next/image'
import { useParams } from 'next/navigation'
import { useCallback, useMemo, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import TextAreaAutosize from 'react-textarea-autosize'
import readingTime from 'reading-time'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { useEditorState } from './editor-context'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import TiptapImage from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import History from '@tiptap/extension-history'
import { createLowlight } from 'lowlight'

// Languages for syntax highlighting
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'

// Create lowlight instance
const lowlight = createLowlight()
lowlight.register('javascript', javascript)
lowlight.register('typescript', typescript)
lowlight.register('python', python)
lowlight.register('css', css)
lowlight.register('html', html)
lowlight.register('json', json)

type TiptapPageEditorProps = {
  author: Partial<TProfile & { name: string; email: string; image: string }>;
  isMyPage: boolean;
};

const TiptapPageEditor = ({ author, isMyPage }: TiptapPageEditorProps) => {
  const { state, setState } = useEditorState()
  const params = useParams()
  const [isSaving, setIsSaving] = useState(false)
  
  // Initialize Tiptap editor
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'tiptap-bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'tiptap-ordered-list',
        },
      }),
      ListItem,
      History,
      TiptapImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '<p></p>',
    editable: isMyPage,
    // onUpdate: ({ editor }) => {
    //   const html = editor.getHTML()
    //   setState((prev: any) => ({
    //     ...prev,
    //     content: html
    //   }))
    // },
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-lg max-w-none focus:outline-none p-4',
        spellcheck: 'false',
      },
      handleKeyDown: (_, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault()
          handleSave()
          return true
        }
        return false
      },
    },
  })

  // Set initial content from state
  const initializeContent = useCallback(() => {
    if (!editor || !state?.content) return
    
    let htmlContent = '<p></p>'
    
    try {
      // Check if content is already HTML
      if (state.content.startsWith('<')) {
        htmlContent = state.content
      } else {
        // Try to parse as Slate JSON and convert
        const parsed = JSON.parse(state.content)
        if (Array.isArray(parsed)) {
          htmlContent = parsed
            .map((node: any) => {
              if (node.type === 'paragraph') {
                const text = node.children?.map((child: any) => {
                  let content = child.text || ''
                  if (child.bold) content = `<strong>${content}</strong>`
                  if (child.italic) content = `<em>${content}</em>`
                  if (child.code) content = `<code>${content}</code>`
                  return content
                }).join('') || ''
                return `<p>${text}</p>`
              }
              if (node.type === 'heading') {
                const text = node.children?.map((child: any) => child.text || '').join('') || ''
                return `<h1>${text}</h1>`
              }
              if (node.type === 'heading-two') {
                const text = node.children?.map((child: any) => child.text || '').join('') || ''
                return `<h2>${text}</h2>`
              }
              if (node.type === 'bulleted-list') {
                const items = node.children?.map((item: any) => {
                  const text = item.children?.map((child: any) => child.text || '').join('') || ''
                  return `<li>${text}</li>`
                }).join('') || ''
                return `<ul>${items}</ul>`
              }
              if (node.type === 'block-quote') {
                const text = node.children?.map((child: any) => child.children?.map((c: any) => c.text || '').join('') || '').join('') || ''
                return `<blockquote>${text}</blockquote>`
              }
              return `<p>${node.children?.map((child: any) => child.text || '').join('') || ''}</p>`
            })
            .join('')
        }
      }
    } catch (error) {
      console.error('Error parsing content:', error)
      htmlContent = '<p></p>'
    }
    
    editor.commands.setContent(htmlContent, { emitUpdate: false })
  }, [editor, state?.content])

  // Initialize content when editor and state are ready
  useEffect(() => {
    if (editor && state?.content) {
      initializeContent()
    }
  }, [editor, state?.content, initializeContent])

  const time = useMemo(() => {
    if (!editor) return { text: '0 min read' }
    const textContent = editor.getText()
    return readingTime(textContent)
  }, [editor])

  const handleSave = useCallback(async () => {
    if (!state?.id || !editor || isSaving) return
    
    setIsSaving(true)
    try {
      // Get current content directly from the editor
      const currentContent = editor.getHTML()
      
      const result = await updatePage({
        id: state.id,
        title: state.title,
        content: currentContent, // Use current editor content
        thumbnail: state.thumbnail,
      })

      if (result.ok) {
        toast.success('Page saved successfully!')
      } else {
        toast.error('Failed to save page')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save page')
    } finally {
      setIsSaving(false)
    }
  }, [state, editor, isSaving])

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  const handleTitleChange = useCallback((title: string) => {
    setState((prev: any) => ({ ...prev, title }))
  }, [setState])


  if (!state) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-6">
      <div className="space-y-6 pb-32">
        {/* Header Section */}
        <div className="space-y-4">
          {/* Title Input */}
          <TextAreaAutosize
            value={state.title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className={cn(
              'w-full text-4xl font-bold leading-tight resize-none bg-transparent border-none outline-none placeholder:text-muted-foreground',
              !isMyPage && 'cursor-default pointer-events-none'
            )}
            readOnly={!isMyPage}
            maxRows={3}
          />

          {/* Author Info & Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {author?.image && (
                <NextImage
                  src={author.image}
                  alt={author.name || 'Author'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>{author?.name || 'Unknown Author'}</span>
            </div>
            <Dot className="w-2 h-2" />
            <span>{time.text}</span>
            {state.createdAt && (
              <>
                <Dot className="w-2 h-2" />
                <span>
                  {new Date(state.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </>
            )}
          </div>

          {/* Save Button for Owners */}
          {isMyPage && (
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="gap-2"
              >
                {isSaving && <Loader className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {/* Editor Section */}
        <div className="min-h-screen">
          {!editor ? (
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-gray-400">Loading editor...</div>
            </div>
          ) : (
            <div className="tiptap-container">
              {/* Editor Content */}
              <div className="relative">
                <EditorContent 
                  editor={editor} 
                  className="min-h-screen"
                />
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Fixed Bottom Toolbar - Only for page owners */}
        {isMyPage && editor && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-50">
            {/* Opacity gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/30 to-transparent dark:from-gray-900/70 dark:via-gray-900/30 dark:to-transparent"></div>
            
            <div className="relative flex justify-center pb-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 shadow-xl pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded-lg transition-colors ${
                    editor.isActive('bold')
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <strong>B</strong>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded-lg transition-colors ${
                    editor.isActive('italic')
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <em>I</em>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`p-2 rounded-lg transition-colors ${
                    editor.isActive('underline')
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <u>U</u>
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    editor.isActive('heading', { level: 1 })
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  H1
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    editor.isActive('heading', { level: 2 })
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  H2
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`p-2 rounded-lg transition-colors ${
                    editor.isActive('bulletList')
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  •
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`p-2 rounded-lg transition-colors ${
                    editor.isActive('orderedList')
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  1.
                </button>
              </div>
              </div>
            </div>
          </div>
        )}

    </div>
  )
}

export default TiptapPageEditor