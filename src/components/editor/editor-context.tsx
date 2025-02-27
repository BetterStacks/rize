import { ReactNode, useMemo } from "react";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { Slate, withReact } from "slate-react";
import { initialValue, withLayout } from "./utils";

const EditorContext = ({ children }: { children: ReactNode }) => {
  const editor = useMemo(
    () => withLayout(withHistory(withReact(createEditor()))),
    []
  );

  return (
    <Slate editor={editor} initialValue={initialValue}>
      {children}
    </Slate>
  );
};

export default EditorContext;
