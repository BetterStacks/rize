"use client";
import { TPage } from "@/lib/types";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { Slate, withReact } from "slate-react";
import { initialValue, withImages } from "./utils";

type EditorContextProviderProps = {
  children: ReactNode;
  state: typeof TPage;
  // setState: (state: string) => void;
};
type EditorContextProps = {
  state: typeof TPage;
  setState: (state: typeof TPage) => void;
} | null;

export const EditorContext = createContext<EditorContextProps>(null);

export const useEditorState = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("EditorContext not found");
  }
  return { state: ctx.state, setState: ctx.setState };
};

const EditorContextProvider = ({
  children,
  state,
}: EditorContextProviderProps) => {
  const [value, setValue] = useState<typeof TPage>({
    ...state,
    title: state?.title || "Untitled",
    content: state?.content || JSON.stringify(initialValue),
  });
  const editor = useMemo(
    () => withImages(withHistory(withReact(createEditor()))),
    []
  );

  return (
    <Slate
      editor={editor}
      initialValue={JSON.parse(value?.content as string)}
      onValueChange={(value) =>
        setValue((prev) => ({ ...prev, content: JSON.stringify(value) }))
      }
    >
      <EditorContext.Provider value={{ state: value, setState: setValue }}>
        {children}
      </EditorContext.Provider>
    </Slate>
  );
};

export default EditorContextProvider;
