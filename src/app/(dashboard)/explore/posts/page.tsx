"use client";
import { deleteCustomFeed, getMyCustomFeeds } from "@/actions/custom-feed-actions";
import { FeedSort, getTopics } from "@/actions/post-actions";
import ExploreFeed from "@/components/explore/explore-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check, MoreVertical, Pencil, Plus, Settings2, Trash2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";


export type FeedMode = "recent" | "trending" | "following" | "custom" | (string & {});

const TABS: { value: FeedMode; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "trending", label: "Trending" },
  { value: "following", label: "Following" },
];

const page = () => {
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [mode, setMode] = useState<FeedMode>("recent");
  const [feedFormOpen, setFeedFormOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<any>(null);
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
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );

  const { mutate: deleteFeed, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteCustomFeed(id),
    onSuccess: () => {
      toast.success("Feed deleted");
      qc.invalidateQueries({ queryKey: ["my-custom-feeds"] });
      if (isCustomMode) setMode("recent");
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete feed"),
  });

  const selectedTopics = topics.filter((t) => selectedTopicIds.includes(t.id));
  const hasFilters = selectedTopicIds.length > 0;
  const isCustomMode = !["recent", "trending", "following", "custom"].includes(mode);

  return <div>

    {/* ── Linear-style tab bar ─────────────────────────────────────────── */}
    <div className="w-full sticky z-50  top-0 border-b border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-bg">

      {/* Row 1: tabs + filter pill action */}
      <div className="flex items-center justify-between px-4">

        {/* Tabs */}
        <div className="flex items-center gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setMode(tab.value);
                setSelectedTopicIds([]);
              }}
              className={cn(
                "relative px-3 h-14 py-3 text-sm font-medium transition-colors duration-150 select-none",
                mode === tab.value
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              )}
            >
              {tab.label}
              {mode === tab.value && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}

          {customFeeds.map((feed) => {
            const isActive = mode === feed.id;
            return (
              <div key={feed.id} className="group relative flex items-center">
                <button
                  onClick={() => {
                    setMode(feed.id);
                    setSelectedTopicIds([]);
                  }}
                  className={cn(
                    "relative px-3 h-14 py-3 text-sm font-medium transition-colors duration-150 select-none",
                    isActive
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  )}
                >
                  {feed.title}
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute -bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </button>

                {/* More options dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {/* <button className="h-14 px-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity"> */}
                    {/* </button> */}
                    <MoreVertical className="size-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40 mt-4 dark:bg-dark-bg dark:border-dark-border">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFeed(feed);
                        setFeedFormOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Pencil className="size-3.5" />
                      <span>Edit feed</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this feed?")) {
                          deleteFeed(feed.id);
                        }
                      }}
                      className="gap-2 text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}

          {/* + Create feed */}
          <button
            onClick={() => {
              setEditingFeed(null);
              setFeedFormOpen(true);
            }}
            className="px-2.5 h-14 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            title="Create custom feed"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Right: Filter topics button */}
        {mode !== "following" && (
          <div className="flex flex-row items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  size={"sm"}
                  className="flex items-center gap-1.5 transition-colors font-medium py-3"
                >
                  <Settings2 className="size-3" />
                  Feed Settings
                  {selectedTopicIds.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 px-1 h-4 min-w-4 flex items-center justify-center text-[10px] rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-none"
                    >
                      {selectedTopicIds.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 dark:bg-dark-bg dark:border-dark-border rounded-xl overflow-hidden p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search topics..." className="h-9" />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty>No matches found.</CommandEmpty>
                    <CommandGroup>
                      {topics.map((t) => (
                        <CommandItem
                          key={t.id}
                          onSelect={() => toggleTopic(t.id)}
                          className="flex rounded-md items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{t.emoji}</span>
                            <span className="text-xs">{t.name}</span>
                          </div>
                          {selectedTopicIds.includes(t.id) && (
                            <Check className="size-4 text-blue-500" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

          </div>
        )}
      </div>

      {/* Row 2: active topic filter chips (Linear filter row) */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t border-neutral-100 dark:border-dark-border flex justify-between px-4 py-2 items-center"
          >
            <div className="flex items-center gap-2  overflow-x-auto no-scrollbar">
              {selectedTopics.map((t) => (
                <span
                  key={t.id}
                  className="flex-shrink-0 flex items-center gap-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md px-2 py-1 font-medium"
                >
                  <span>{t.emoji}</span>
                  {t.name}
                  <button
                    onClick={() => toggleTopic(t.id)}
                    className="ml-0.5 hover:text-red-500 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <button
              className="flex-shrink-0 flex items-center gap-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md px-2 py-1 font-medium"
              onClick={() => setSelectedTopicIds([])}
            >
              Clear
              <button
                onClick={() => setSelectedTopicIds([])}
                className="ml-0.5 hover:text-red-500 transition-colors"
              >
                <X className="size-3" />
              </button>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* ── Topic pills row (horizontal scroll, shown below tabs) ─────────── */}
    {/* {!isCustomMode && mode !== "following" && topics.length > 0 && (
      <div className=" border-b border-neutral-100 dark:border-dark-border bg-neutral-50/60 dark:bg-dark-bg/60 overflow-hidden">
        <div className="flex flex-wrap items-center p-2 gap-2 px-4">

          <button
            onClick={() => setSelectedTopicIds([])}
            className={cn(
              "flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
              selectedTopicIds.length === 0
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            All
          </button>
          {topics.map((t) => (
            <Button
              size="sm"
              variant="outline"
              key={t.id}
              onClick={() => toggleTopic(t.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                selectedTopicIds.includes(t.id)
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              <span>{t.emoji}</span>
              {t.name}
            </Button>
          ))}
        </div>
      </div>
    )} */}

    <ExploreFeed
      selectedTopicIds={selectedTopicIds}
      activeSort={activeSort}
      mode={mode}
      feedFormOpen={feedFormOpen}
      setFeedFormOpen={setFeedFormOpen}
      setMode={setMode}
      initialData={editingFeed}
    />
  </div>
};

export default page;
