"use client";

import { createCustomFeed, updateCustomFeed } from "@/actions/custom-feed-actions";
import { getTopics } from "@/actions/post-actions";
import { searchProfiles } from "@/actions/profile-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { CreativeAvatar } from "@/components/ui/creative-avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CustomFeedPayload } from "@/lib/schemas/custom-feed";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Globe, Lock, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
            toast.success("Feed saved");
            qc.invalidateQueries({ queryKey: ["my-custom-feeds"] });
            onSaved?.({ ...vars, title });
            reset();
            onOpenChange(false);
        },
        onError: (e: Error) => toast.error(e.message ?? "Couldn't save the feed"),
    });

    const { mutate: mutateUpdate, isPending: isUpdatePending } = useMutation({
        mutationFn: (payload: CustomFeedPayload) => updateCustomFeed(initialData!.id, payload),
        onSuccess: (_, vars) => {
            toast.success("Feed updated");
            qc.invalidateQueries({ queryKey: ["my-custom-feeds"] });
            onSaved?.({ ...vars, title });
            onOpenChange(false);
        },
        onError: (e: Error) => toast.error(e.message ?? "Couldn't update the feed"),
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
                className="flex w-full flex-col gap-0 border-hairline bg-ground p-0 sm:max-w-md [&>button]:hidden"
            >
                {/* Header */}
                <SheetHeader className="flex-row items-start justify-between gap-4 space-y-0 px-5 pb-4 pt-5 text-left sm:px-6 sm:pt-6">
                    <div className="min-w-0">
                        <SheetTitle className="font-instrument text-3xl font-normal leading-tight text-ink">
                            {initialData ? "Edit feed" : "New feed"}
                        </SheetTitle>
                        <SheetDescription className="mt-1 text-sm text-ink-secondary">
                            Posts from the topics and people you pick.
                        </SheetDescription>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Close"
                        onClick={() => onOpenChange(false)}
                        className="-mr-2 -mt-1 shrink-0 text-ink-secondary hover:text-ink"
                    >
                        <X className="size-5" aria-hidden />
                    </Button>
                </SheetHeader>

                {/* Scrollable body */}
                <div className="flex-1 space-y-6 overflow-y-auto border-t border-hairline px-5 py-5 sm:px-6">

                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="feed-title">
                            Name
                        </Label>
                        <Input
                            id="feed-title"
                            placeholder="Design, Climate, Friends…"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="feed-desc">
                            Description <span className="font-normal text-ink-secondary">(optional)</span>
                        </Label>
                        <Textarea
                            id="feed-desc"
                            placeholder="What is this feed about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="resize-none"
                        />
                    </div>

                    <Separator className="bg-hairline" />

                    {/* Topics */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Topics</Label>
                            <span className="text-xs tabular-nums text-ink-secondary">{selectedTopicIds.length} chosen</span>
                        </div>

                        <Popover open={topicPopoverOpen} onOpenChange={setTopicPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="h-11 w-full justify-between rounded-xl font-normal"
                                >
                                    {selectedTopicIds.length === 0
                                        ? "Pick topics"
                                        : `${selectedTopicIds.length} topic${selectedTopicIds.length > 1 ? "s" : ""} selected`}
                                    <ChevronsUpDown className="size-4 opacity-50 ml-2 shrink-0" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search topics" />
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
                                                    {t.name}
                                                    {selectedTopicIds.includes(t.id) && (
                                                        <Check className="ml-auto size-4 text-ink" aria-hidden />
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
                                        variant="outline"
                                        className="h-8 gap-1 rounded-full pl-3 pr-1 text-[13px] font-normal"
                                    >
                                        {t.name}
                                        <button
                                            type="button"
                                            onClick={() => toggleTopic(t.id)}
                                            aria-label={`Remove ${t.name}`}
                                            className="touch-target inline-flex size-6 items-center justify-center rounded-full text-ink-secondary hover:bg-subtle hover:text-ink"
                                        >
                                            <X className="size-3.5" aria-hidden />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator className="bg-hairline" />

                    {/* Profiles */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Profiles</Label>
                            <span className="text-xs tabular-nums text-ink-secondary">{selectedProfileIds.length} chosen</span>
                        </div>

                        <Popover open={profilePopoverOpen} onOpenChange={setProfilePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="h-11 w-full justify-between rounded-xl font-normal"
                                >
                                    {selectedProfileIds.length === 0
                                        ? "Find people"
                                        : `${selectedProfileIds.length} profile${selectedProfileIds.length > 1 ? "s" : ""} selected`}
                                    <ChevronsUpDown className="size-4 opacity-50 ml-2 shrink-0" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder="Name or @username"
                                        value={profileSearch}
                                        onValueChange={setProfileSearch}
                                    />
                                    <CommandList className="max-h-52">
                                        <CommandEmpty>
                                            {profileSearch.length < 1
                                                ? "Start typing to search"
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
                                                        <span className="text-xs text-ink-secondary">@{p.username}</span>
                                                    </div>
                                                    {selectedProfileIds.includes(p.id) && (
                                                        <Check className="ml-auto size-4 text-ink" aria-hidden />
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
                                        variant="outline"
                                        className="h-8 gap-1.5 rounded-full pl-1 pr-1 text-[13px] font-normal"
                                    >
                                        <CreativeAvatar
                                            src={p.profileImage ?? undefined}
                                            name={p.displayName ?? "?"}
                                            size="xs"
                                            variant="auto"
                                            showHoverEffect={false}
                                        />
                                        {p.displayName ?? p.username}
                                        <button
                                            type="button"
                                            onClick={() => toggleProfile(p.id)}
                                            aria-label={`Remove ${p.displayName ?? p.username}`}
                                            className="touch-target inline-flex size-6 items-center justify-center rounded-full text-ink-secondary hover:bg-subtle hover:text-ink"
                                        >
                                            <X className="size-3.5" aria-hidden />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator className="bg-hairline" />

                    {/* Visibility toggle */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="feed-public" className="flex items-center gap-1.5">
                                {isPublic ? <Globe className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />}
                                {isPublic ? "Public" : "Private"}
                            </Label>
                            <p className="text-[13px] text-ink-secondary">
                                {isPublic
                                    ? "Anyone on Rize can see this feed"
                                    : "Only you can see this feed"}
                            </p>
                        </div>
                        <Switch id="feed-public" checked={isPublic} onCheckedChange={setIsPublic} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-hairline px-5 py-4 sm:px-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!canSave || isPending}
                        loading={isPending}
                        className="px-5"
                    >
                        Save feed
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CustomFeedForm;
