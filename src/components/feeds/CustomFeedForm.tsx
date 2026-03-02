"use client";

import { createCustomFeed, updateCustomFeed } from "@/actions/custom-feed-actions";
import type { CustomFeedPayload } from "@/lib/schemas/custom-feed";
import { getTopics } from "@/actions/post-actions";
import { searchProfiles } from "@/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Globe, Loader, Lock, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CreativeAvatar } from "@/components/ui/creative-avatar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Props {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    /** For editing an existing feed */
    initialData?: {
        id: string;
        title: string;
        description: string | null;
        isPublic: boolean;
        topics: { topicId: string }[];
        profiles: { profileId: string }[];
    };
    /** Called after successful save so the parent can use the feed */
    onSaved?: (feed: CustomFeedPayload & { title: string }) => void;
}

export const CustomFeedForm = ({ open, onOpenChange, onSaved, initialData }: Props) => {
    const qc = useQueryClient();

    // ── Form state ────────────────────────────────────────────────────────────
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
    const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
    const [profileSearch, setProfileSearch] = useState("");
    const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
    const [topicPopoverOpen, setTopicPopoverOpen] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description ?? "");
            setIsPublic(initialData.isPublic);
            setSelectedTopicIds(initialData.topics.map((t) => t.topicId));
            setSelectedProfileIds(initialData.profiles.map((p) => p.profileId));
        } else {
            reset();
        }
    }, [initialData, open]);

    // ── Data ─────────────────────────────────────────────────────────────────
    const { data: topics = [] } = useQuery({
        queryKey: ["topics"],
        queryFn: getTopics,
        staleTime: Infinity,
    });

    const { data: profileResults = [] } = useQuery({
        queryKey: ["search-profiles", profileSearch],
        queryFn: () => searchProfiles(profileSearch),
        enabled: profileSearch.length >= 1,
    });

    // ── Toggles ───────────────────────────────────────────────────────────────
    const toggleTopic = (id: string) =>
        setSelectedTopicIds((p) =>
            p.includes(id) ? p.filter((t) => t !== id) : [...p, id]
        );

    const toggleProfile = (id: string) =>
        setSelectedProfileIds((p) =>
            p.includes(id) ? p.filter((t) => t !== id) : [...p, id]
        );

    // ── Mutation ──────────────────────────────────────────────────────────────
    const { mutate, isPending: isCreatePending } = useMutation({
        mutationFn: (payload: CustomFeedPayload) => createCustomFeed(payload),
        onSuccess: (_, vars) => {
            toast.success("Feed saved!");
            qc.invalidateQueries({ queryKey: ["my-custom-feeds"] });
            onSaved?.({ ...vars, title });
            reset();
            onOpenChange(false);
        },
        onError: (e: Error) => toast.error(e.message ?? "Failed to save feed"),
    });

    const { mutate: mutateUpdate, isPending: isUpdatePending } = useMutation({
        mutationFn: (payload: CustomFeedPayload) => updateCustomFeed(initialData!.id, payload),
        onSuccess: (_, vars) => {
            toast.success("Feed updated!");
            qc.invalidateQueries({ queryKey: ["my-custom-feeds"] });
            onSaved?.({ ...vars, title });
            onOpenChange(false);
        },
        onError: (e: Error) => toast.error(e.message ?? "Failed to update feed"),
    });

    const isPending = isCreatePending || isUpdatePending;

    const reset = () => {
        setTitle("");
        setDescription("");
        setIsPublic(false);
        setSelectedTopicIds([]);
        setSelectedProfileIds([]);
        setProfileSearch("");
    };

    const canSave =
        title.trim().length > 0 &&
        (selectedTopicIds.length > 0 || selectedProfileIds.length > 0);

    const handleSave = () => {
        if (!canSave) {
            toast.error("Add a title and at least one topic or profile");
            return;
        }
        if (initialData?.id) {
            mutateUpdate({
                title: title.trim(),
                description: description.trim() || undefined,
                isPublic,
                topicIds: selectedTopicIds,
                profileIds: selectedProfileIds,
            });
        } else {
            mutate({
                title: title.trim(),
                description: description.trim() || undefined,
                isPublic,
                topicIds: selectedTopicIds,
                profileIds: selectedProfileIds,
            });
        }
    };

    // Helper: get topic/profile objects for selected ids
    const selectedTopics = topics.filter((t) => selectedTopicIds.includes(t.id));
    const selectedProfiles = profileResults.filter((p) =>
        selectedProfileIds.includes(p.id)
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md flex flex-col gap-0 p-0 dark:bg-dark-bg [&>button]:hidden"
            >
                {/* Header */}
                <SheetHeader className="px-6 py-4 border-b dark:border-dark-border">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg font-semibold">
                            {initialData ? "Update feed" : "Create feed"}
                        </SheetTitle>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 text-left">
                        Your personalised stream of posts by topic &amp; people.
                    </p>
                </SheetHeader>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="feed-title">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="feed-title"
                            placeholder="e.g. Design Inspo, AI Weekly…"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                            className="dark:bg-neutral-900 dark:border-dark-border"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="feed-desc">Description</Label>
                        <Textarea
                            id="feed-desc"
                            placeholder="What is this feed about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="resize-none dark:bg-neutral-900 dark:border-dark-border"
                        />
                    </div>

                    <Separator className="dark:bg-dark-border" />

                    {/* Topics */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Topics</Label>
                            <span className="text-xs text-neutral-400">{selectedTopicIds.length} selected</span>
                        </div>

                        <Popover open={topicPopoverOpen} onOpenChange={setTopicPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between dark:bg-neutral-900 dark:border-dark-border font-normal"
                                >
                                    {selectedTopicIds.length === 0
                                        ? "Pick topics…"
                                        : `${selectedTopicIds.length} topic${selectedTopicIds.length > 1 ? "s" : ""} selected`}
                                    <ChevronsUpDown className="size-4 opacity-50 ml-2 shrink-0" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 dark:bg-neutral-900 dark:border-dark-border" align="start">
                                <Command>
                                    <CommandInput placeholder="Search topics…" />
                                    <CommandList className="max-h-52">
                                        <CommandEmpty>No topics found.</CommandEmpty>
                                        <CommandGroup>
                                            {topics.map((t) => (
                                                <CommandItem
                                                    key={t.id}
                                                    value={t.name}
                                                    onSelect={() => toggleTopic(t.id)}
                                                    className="gap-2"
                                                >
                                                    <span>{t.emoji}</span>
                                                    {t.name}
                                                    {selectedTopicIds.includes(t.id) && (
                                                        <Check className="ml-auto size-4 text-green-500" />
                                                    )}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Selected topic chips */}
                        {selectedTopics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {selectedTopics.map((t) => (
                                    <Badge
                                        key={t.id}
                                        variant="secondary"
                                        className="gap-1 pr-1 dark:bg-neutral-800"
                                    >
                                        {t.emoji} {t.name}
                                        <button onClick={() => toggleTopic(t.id)} className="ml-1 hover:text-red-500">
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator className="dark:bg-dark-border" />

                    {/* Profiles */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Profiles</Label>
                            <span className="text-xs text-neutral-400">{selectedProfileIds.length} selected</span>
                        </div>

                        <Popover open={profilePopoverOpen} onOpenChange={setProfilePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between dark:bg-neutral-900 dark:border-dark-border font-normal"
                                >
                                    {selectedProfileIds.length === 0
                                        ? "Search people to follow…"
                                        : `${selectedProfileIds.length} profile${selectedProfileIds.length > 1 ? "s" : ""} selected`}
                                    <ChevronsUpDown className="size-4 opacity-50 ml-2 shrink-0" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 dark:bg-neutral-900 dark:border-dark-border" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder="Type a name or @username…"
                                        value={profileSearch}
                                        onValueChange={setProfileSearch}
                                    />
                                    <CommandList className="max-h-52">
                                        <CommandEmpty>
                                            {profileSearch.length < 1
                                                ? "Start typing to search…"
                                                : "No profiles found."}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {profileResults.map((p) => (
                                                <CommandItem
                                                    key={p.id}
                                                    value={p.username ?? p.id}
                                                    onSelect={() => toggleProfile(p.id)}
                                                    className="gap-2"
                                                >
                                                    <CreativeAvatar
                                                        src={p.profileImage ?? undefined}
                                                        name={p.displayName ?? "?"}
                                                        size="xs"
                                                        variant="auto"
                                                        showHoverEffect={false}
                                                    />
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="text-sm font-medium">{p.displayName}</span>
                                                        <span className="text-xs text-neutral-400">@{p.username}</span>
                                                    </div>
                                                    {selectedProfileIds.includes(p.id) && (
                                                        <Check className="ml-auto size-4 text-green-500" />
                                                    )}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Selected profile chips */}
                        {selectedProfiles.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {selectedProfiles.map((p) => (
                                    <Badge
                                        key={p.id}
                                        variant="secondary"
                                        className="gap-1.5 pr-1 dark:bg-neutral-800"
                                    >
                                        <CreativeAvatar
                                            src={p.profileImage ?? undefined}
                                            name={p.displayName ?? "?"}
                                            size="xs"
                                            variant="auto"
                                            showHoverEffect={false}
                                        />
                                        {p.displayName ?? p.username}
                                        <button onClick={() => toggleProfile(p.id)} className="ml-1 hover:text-red-500">
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator className="dark:bg-dark-border" />

                    {/* Visibility toggle */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="flex items-center gap-1.5">
                                {isPublic ? <Globe className="size-4" /> : <Lock className="size-4" />}
                                {isPublic ? "Public feed" : "Private feed"}
                            </Label>
                            <p className="text-xs text-neutral-400">
                                {isPublic
                                    ? "Anyone on Rize can view this feed"
                                    : "Only you can access this feed"}
                            </p>
                        </div>
                        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t dark:border-dark-border flex items-center justify-between gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!canSave || isPending}
                        className="rounded-full px-6"
                    >
                        {isPending && <Loader className="size-4 mr-2 animate-spin" />}
                        Save feed
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CustomFeedForm;
