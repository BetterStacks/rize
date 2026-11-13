"use client";
import {
  deleteCustomFeed,
  getMyCustomFeeds,
} from "@/actions/custom-feed-actions";
import { FeedSort, getTopics } from "@/actions/post-actions";
import ExploreFeed from "@/components/explore/explore-feed";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export type FeedMode =
  | "recent"
  | "trending"
  | "following"
  | "custom"
  | (string & {});

const TABS: { value: FeedMode; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "trending", label: "Trending" },
  { value: "following", label: "Following" },
];

/** A segment in the quiet track; the active one lifts onto surface. */
const segmentClass = (active: boolean) =>
  cn(
    "inline-flex h-9 shrink-0 select-none items-center rounded-md px-3 text-sm font-medium transition-colors duration-fast ease-calm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
    active
      ? "bg-surface text-ink shadow-raised"
      : "text-ink-secondary hover:text-ink",
  );

const Page = () => {
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [mode, setMode] = useState<FeedMode>("recent");
  const [feedFormOpen, setFeedFormOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<any>(null);
  const [feedToDelete, setFeedToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const activeSort: FeedSort = mode === "trending" ? "trending" : "recent";
  const qc = useQueryClient();

  const { data: topicsData } = useQuery({
    queryKey: ["topics"],
    queryFn: getTopics,
    staleTime: Infinity,
  });

  const { data: customFeedsData } = useQuery({
    queryKey: ["my-custom-feeds"],
    queryFn: getMyCustomFeeds,
  });

  const topics = topicsData ?? [];
  const customFeeds = customFeedsData ?? [];
  const toggleTopic = (id: string) =>
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );

  const isCustomMode = !["recent", "trending", "following", "custom"].includes(
    mode,
  );

  const { mutate: deleteFeed, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteCustomFeed(id),
    onSuccess: () => {
      toast.success("Feed deleted");
      setFeedToDelete(null);
      qc.invalidateQueries({ queryKey: ["my-custom-feeds"] });
      if (isCustomMode) setMode("recent");
    },
    onError: (e: any) => toast.error(e.message || "Couldn't delete the feed"),
  });

  const selectedTopics = topics.filter((t) => selectedTopicIds.includes(t.id));
  const hasFilters = selectedTopicIds.length > 0;

  const selectMode = (value: FeedMode) => {
    setMode(value);
    setSelectedTopicIds([]);
  };

  return (
    <div className="w-full">
      <header className="mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6 md:pt-14">
        <h1 className="font-instrument text-4xl leading-[1.05] text-ink md:text-5xl">
          Posts
        </h1>
        <p className="mt-2 max-w-md text-base text-ink-secondary">
          What people on Rize are sharing, newest first or most voted.
        </p>
      </header>

      {/* Feed controls: sort, saved feeds, topics */}
      <div className="sticky top-0 z-20 border-b border-hairline bg-ground/95 backdrop-blur supports-[backdrop-filter]:bg-ground/80">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <div className="no-scrollbar -my-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1">
            <div
              role="group"
              aria-label="Feed"
              className="flex shrink-0 items-center gap-0.5 rounded-lg bg-subtle p-0.5"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={mode === tab.value}
                  onClick={() => selectMode(tab.value)}
                  className={segmentClass(mode === tab.value)}
                >
                  {tab.label}
                </button>
              ))}
              {customFeeds.map((feed) => (
                <button
                  key={feed.id}
                  type="button"
                  aria-pressed={mode === feed.id}
                  onClick={() => selectMode(feed.id)}
                  className={segmentClass(mode === feed.id)}
                >
                  <span className="max-w-[10rem] truncate">{feed.title}</span>
                </button>
              ))}
            </div>

            {isCustomMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="smallIcon"
                    aria-label={`Options for ${customFeeds.find((f) => f.id === mode)?.title ?? "this feed"}`}
                    className="shrink-0 text-ink-secondary hover:text-ink"
                  >
                    <MoreHorizontal className="size-4" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem
                    onSelect={() => {
                      const feed = customFeeds.find((f) => f.id === mode);
                      if (!feed) return;
                      setEditingFeed(feed);
                      setFeedFormOpen(true);
                    }}
                  >
                    <Pencil className="size-4" aria-hidden />
                    <span>Edit feed</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const feed = customFeeds.find((f) => f.id === mode);
                      if (feed) setFeedToDelete({ id: feed.id, title: feed.title });
                    }}
                    className="text-danger focus:text-danger"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingFeed(null);
                setFeedFormOpen(true);
              }}
              className="h-9 shrink-0 gap-1.5 px-2.5 text-sm text-ink-secondary hover:text-ink"
            >
              <Plus className="size-4" aria-hidden />
              New feed
            </Button>
          </div>

          {mode !== "following" && !isCustomMode && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 gap-1.5 rounded-full px-3 text-sm"
                >
                  Topics
                  {hasFilters ? (
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-on-ink">
                      {selectedTopicIds.length}
                    </span>
                  ) : (
                    <ChevronDown className="size-3.5 text-ink-secondary" aria-hidden />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search topics" className="h-10" />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty>No topics match.</CommandEmpty>
                    <CommandGroup>
                      {topics.map((t) => {
                        const selected = selectedTopicIds.includes(t.id);
                        return (
                          <CommandItem
                            key={t.id}
                            value={t.name}
                            onSelect={() => toggleTopic(t.id)}
                            aria-selected={selected}
                            className="flex items-center justify-between rounded-lg py-2 text-sm"
                          >
                            <span>{t.name}</span>
                            {selected && (
                              <Check className="size-4 text-ink" aria-hidden />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Active topic filters */}
        {hasFilters && (
          <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 pb-2.5 sm:px-6">
            <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
              {selectedTopics.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-hairline bg-surface pl-3 pr-1 text-[13px] text-ink"
                >
                  {t.name}
                  <button
                    type="button"
                    onClick={() => toggleTopic(t.id)}
                    aria-label={`Remove ${t.name}`}
                    className="touch-target inline-flex size-6 items-center justify-center rounded-full text-ink-secondary hover:bg-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSelectedTopicIds([])}
              className="min-h-8 shrink-0 rounded-md px-1 text-[13px] font-medium text-ink-secondary underline-offset-4 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <ExploreFeed
        selectedTopicIds={selectedTopicIds}
        activeSort={activeSort}
        mode={mode}
        feedFormOpen={feedFormOpen}
        setFeedFormOpen={setFeedFormOpen}
        setMode={setMode}
        initialData={editingFeed}
      />

      <AlertDialog
        open={!!feedToDelete}
        onOpenChange={(open) => !open && setFeedToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{feedToDelete?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The feed goes away. The posts and people in it stay where they
              are.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                if (feedToDelete) deleteFeed(feedToDelete.id);
              }}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Page;
