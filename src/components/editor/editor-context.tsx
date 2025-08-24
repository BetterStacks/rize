'use client'
import { TPage } from '@/lib/types'
import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { Slate, withReact } from 'slate-react'
import { initialValue, withImages } from './utils'

type EditorContextProviderProps = {
  children: ReactNode;
  state: typeof TPage;
  // setState: (state: string) => void;
};
type EditorContextProps = {
  state: typeof TPage;
  setState: (state: typeof TPage) => void;
} | null;

export const EditorContext = createContext<EditorContextProps>(null)

export const useEditorState = () => {
  const ctx = useContext(EditorContext)
  if (!ctx) {
    throw new Error('EditorContext not found')
  }
  return { state: ctx.state, setState: ctx.setState }
}

const EditorContextProvider = ({
  children,
  state,
}: EditorContextProviderProps) => {
  // Handle both HTML and JSON content formats
  const getInitialContent = () => {
    if (!state?.content) {
      return JSON.stringify(initialValue)
    }
    
    // If content starts with '<', it's HTML, convert to JSON for compatibility
    if (state.content.startsWith('<')) {
      // For now, just wrap HTML in a simple JSON structure
      return JSON.stringify([{ type: 'paragraph', children: [{ text: state.content }] }])
    }
    
    // Try to parse as JSON, fallback to default if invalid
    try {
      JSON.parse(state.content)
      return state.content
    } catch {
      return JSON.stringify(initialValue)
    }
  }

  const [value, setValue] = useState<typeof TPage>({
    ...state,
    title: state?.title || 'Untitled',
    content: getInitialContent(),
  })
  
  const editor = useMemo(
    () => withImages(withHistory(withReact(createEditor()))),
    []
  )

  // Parse content safely for Slate
  const getSlateContent = () => {
    try {
      return JSON.parse(value?.content as string)
    } catch {
      return initialValue
    }
  }

  return (
    <Slate
      editor={editor}
      initialValue={getSlateContent()}
      onValueChange={(value) =>
        setValue((prev) => ({ ...prev, content: JSON.stringify(value) }))
      }
    >
      <EditorContext.Provider value={{ state: value, setState: setValue }}>
        {children}
      </EditorContext.Provider>
    </Slate>
  )
}

export default EditorContextProvider
