"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { usePostsDialog } from "../dialog-provider";
import { PostForm } from "./PostForm";

const PostDrawer = () => {
  const [open, setOpen] = usePostsDialog();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className="dark:bg-neutral-900 overflow-y-auto p-0 dark:border-dark-border sm:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* <div className="flex items-center justify-between px-6 pt-6">
          <h3 className="text-base font-semibold tracking-tight">Create Post</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="rounded-full"
          >
            <X className="size-4" />
          </Button>
        </div> */}
        <PostForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

export default PostDrawer;
