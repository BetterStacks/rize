import { deletePage } from "@/actions/page-actions";
import { useSession } from "@/hooks/useAuth";
import { TPage } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, FileText, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FC, useMemo } from "react";
import toast from "react-hot-toast";
import readingTime from "reading-time";
import { Node } from "slate";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type WrtingCardProps = {
  data: typeof TPage & { thumbnail: string };
};

const WritingCard: FC<WrtingCardProps> = ({ data }) => {
  const session = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { username } = useParams<{ username: string }>();

  const isMine = session?.data?.user?.username === username;

  const time = useMemo(() => {
    try {
      const editorContent = JSON.parse(data?.content || "[]");
      const stringifiedContent = editorContent
        .map((node: Node) => Node.string(node))
        .join("\n");
      return readingTime(stringifiedContent);
    } catch {
      return { text: "1 min read" };
    }
  }, [data?.content]);

  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePage(data.id!),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Page deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["get-writings", username] });
      } else {
        toast.error(result.error || "Failed to delete page");
      }
    },
    onError: () => {
      toast.error("Failed to delete page");
    },
  });

  const confirmDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this page? This action cannot be undone."
      )
    ) {
      handleDelete();
    }
  };

  return (
    <article className="flex w-full group bg-white shadow-lg relative dark:bg-neutral-800 transition-all rounded-2xl border border-neutral-300/60 dark:border-dark-border overflow-hidden hover:shadow-xl hover:border-neutral-400 dark:hover:border-dark-border/80">
      {/* Thumbnail */}
      <div className="w-[120px] md:w-[160px] h-[120px] md:h-[140px] relative overflow-hidden border-r border-neutral-300/60 dark:border-dark-border bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
        {data?.thumbnail ? (
          <Image
            src={data.thumbnail}
            alt={`${data.title} thumbnail`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800">
            <FileText className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <Link href={`/page/${data.id}`} className="flex-1">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors leading-tight line-clamp-2">
              {data?.title || "Untitled"}
            </h3>

            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <span>{time?.text}</span>
              {data?.createdAt && (
                <>
                  <span>•</span>
                  <span>
                    {new Date(data.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year:
                        data.createdAt.getFullYear() !==
                        new Date().getFullYear()
                          ? "numeric"
                          : undefined,
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Actions (only for own pages) */}
        {isMine && (
          <div className="flex items-center justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  disabled={isDeleting}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => router.push(`/page/${data.id}`)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Page
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete Page"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </article>
  );
};

export default WritingCard;
