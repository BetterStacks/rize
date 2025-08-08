import {
  ImageElement,
  ParagraphElement,
  TitleElement,
  VideoElement,
} from '@/lib/types'
import { isImageUrl } from '@/lib/utils'
import {
  Descendant,
  Editor,
  Node,
  Element as SlateElement,
  Transforms,
} from 'slate'

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

export function extractTextFromEditor(editor: Editor): string {
  return editor.children.map((node) => Node.string(node)).join('\n')
}
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Content goes here!!' }],
  },
]

const withLayout = (editor: Editor) => {
  const { normalizeNode } = editor

  editor.normalizeNode = ([node, path]) => {
    if (path.length === 0) {
      if (editor.children.length <= 1 && Editor.string(editor, [0, 0]) === '') {
        const title: TitleElement = {
          type: 'title',
          children: [{ text: 'Untitled' }],
        }
        Transforms.insertNodes(editor, title, {
          at: path.concat(0),
          select: true,
        })
      }

      if (editor.children.length < 2) {
        const paragraph: ParagraphElement = {
          type: 'paragraph',
          children: [{ text: '' }],
        }
        Transforms.insertNodes(editor, paragraph, { at: path.concat(1) })
      }

      for (const [child, childPath] of Node.children(editor, path)) {
        let type: string
        const slateIndex = childPath[0]
        const enforceType = (type: any) => {
          if (SlateElement.isElement(child) && child.type !== type) {
            const newProperties: Partial<SlateElement> = { type }
            Transforms.setNodes<SlateElement>(editor, newProperties, {
              at: childPath,
            })
          }
        }

        switch (slateIndex) {
          case 0:
            type = 'title'
            enforceType(type)
            break
          case 1:
            type = 'paragraph'
            enforceType(type)
          default:
            break
        }
      }
    }

    return normalizeNode([node, path])
  }
  return editor
}

const insertImage = (editor: any, url: string) => {
  const image: ImageElement = { type: 'image', url, children: [{ text: '' }] }
  Transforms.insertNodes(editor, image)
}
const insertVideo = (editor: any, url: any) => {
  const v: VideoElement = { type: 'video', url, children: [{ text: '' }] }
  Transforms.insertNodes(editor, v)
}

export const withImages = (editor: Editor) => {
  const { insertData, isVoid } = editor
  editor.isVoid = (element: any) => {
    return element.type === 'image' ? true : isVoid(element)
  }
  editor.isVoid = (element: any) => {
    return element.type === 'video' ? true : isVoid(element)
  }

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            insertImage(editor, url as string)
          })
          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

const toggleBlock = (editor: Editor, format: any) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  )
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      // @ts-ignore
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
  let newProperties: Partial<SlateElement>
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      // @ts-ignore

      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      // @ts-ignore
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor: Editor, format: any) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor: Editor, format: any, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as any)[blockType] === format,
    })
  )

  return !!match
}

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor)
  return marks ? (marks as any)[format] === true : false
}

export {
  initialValue,
  insertImage,
  insertVideo,
  isBlockActive,
  isMarkActive,
  LIST_TYPES,
  TEXT_ALIGN_TYPES,
  toggleBlock,
  toggleMark,
  withLayout,
}
