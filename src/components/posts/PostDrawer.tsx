"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { usePostsDialog } from "../dialog-provider";
import { PostForm } from "./PostForm";

const PostDrawer = () => {
  const [open, setOpen] = usePostsDialog();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className="flex w-full flex-col gap-0 border-hairline bg-ground p-0 sm:max-w-xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <SheetHeader className="flex-row items-start justify-between gap-4 space-y-0 px-5 pb-2 pt-5 text-left sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <SheetTitle className="font-instrument text-3xl font-normal leading-tight text-ink">
              New post
            </SheetTitle>
            <SheetDescription className="mt-1 text-sm text-ink-secondary">
              Share an update, a photo or video, or a link.
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close"
              className="-mr-2 -mt-1 shrink-0 text-ink-secondary hover:text-ink"
            >
              <X className="size-5" aria-hidden />
            </Button>
          </SheetClose>
        </SheetHeader>
        <PostForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

export default PostDrawer;
