"use client";

import { getAllCategories, getAllSkills, getProjectByID, upsertProject } from "@/actions/project-actions";
import { searchProfiles } from "@/actions/profile-actions";
import { fetchImageAsBase64 } from "@/actions/project-metadata-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useActiveSidebarTab, useProjectDraft } from "@/lib/context";
import { toIsoString } from "@/lib/date";
import { uploadToS3 } from "@/lib/s3";
import { UploadFilesWithTypeResponse, UpsertProjectPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import Image from "next/image";
import { useParams } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import ProjectLinkImportCard from "../sidebar/components/ProjectLinkImportCard";
import { uploadMedia } from "@/actions/client-actions";

// ── Schema ────────────────────────────────────────────────────────────────
const ProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    tagline: z
        .string()
        .min(1, "Tagline is required")
        .max(120, "Tagline must not exceed 120 characters"),
    url: z.string().url("Invalid URL"),
    description: z.string().optional(),
    categoryIds: z.array(z.string()).max(3, "Maximum 3 categories allowed").optional(),
    skillIds: z.array(z.string()).max(10, "Maximum 10 skills allowed").optional(),
    collaboratorProfileIds: z.array(z.string()).max(6, "Maximum 6 collaborators allowed").optional(),
});

type FormData = z.infer<typeof ProjectSchema>;

// ── Props ─────────────────────────────────────────────────────────────────
interface ProjectFormProps {
    id: string | null;
}

export const ProjectForm: FC<ProjectFormProps> = ({ id }) => {
    const mode = id ? "edit" : "create";
    const projectId = id ?? undefined;
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useActiveSidebarTab();
    const [projectDraft, setProjectDraft] = useProjectDraft();
    const { username } = useParams<{ username: string }>();

    // ── State ───────────────────────────────────────────────────────────────
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<
        Array<{ id: string; url: string; type: string; width: number; height: number }>
    >([]);
    const [removeMediaIds, setRemoveMediaIds] = useState<
        { id: string; url: string }[]
    >([]);
    const [selectedCollaborators, setSelectedCollaborators] = useState<any[]>([]);
    const [collaboratorSearchQuery, setCollaboratorSearchQuery] = useState("");
    const [openCollaboratorSearch, setOpenCollaboratorSearch] = useState(false);

    // ── Fetch existing data (edit mode) ────────────────────────────────────
    const { data: categoriesData } = useQuery({
        queryKey: ["get-all-categories"],
        queryFn: () => getAllCategories(),
    });

    const { data: skillsData } = useQuery({
        queryKey: ["get-all-skills"],
        queryFn: () => getAllSkills(),
    });

    const { data: defaultValues, isLoading: isFetchingValues } = useQuery<any>({
        queryKey: ["get-project-by-id", projectId],
        enabled: Boolean(projectId),
        queryFn: () => getProjectByID(projectId as string),
    });

    const form = useForm<FormData>({
        resolver: zodResolver(ProjectSchema),
        defaultValues: {
            name: "",
            tagline: "",
            url: "",
            description: "",
            categoryIds: [],
            skillIds: [],
            collaboratorProfileIds: [],
        },
    });

    // watch existing logo for edit mode
    const existingLogo = defaultValues?.logo;

    // ── Populate form defaults ─────────────────────────────────────────────
    const initializedRef = useRef(false);

    useEffect(() => {
        if (mode === "create") {
            initializedRef.current = true;
            return;
        }
        if (!defaultValues || initializedRef.current) return;

        try {
            form.reset({
                name: defaultValues.name ?? "",
                tagline: defaultValues.tagline ?? "",
                url: defaultValues.url ?? "",
                description: defaultValues.description ?? "",
                categoryIds: defaultValues.categories?.map((c: any) => c.id) || [],
                skillIds: defaultValues.skills?.map((s: any) => s.id) || [],
                collaboratorProfileIds: defaultValues.collaborators?.map((c: any) => c.id) || [],
            });
            setExistingAttachments(defaultValues.attachments ?? []);
            setSelectedCollaborators(defaultValues.collaborators || []);
        } catch (err) {
            console.error("Error populating project form defaults", err);
        }
        initializedRef.current = true;
    }, [defaultValues, mode, form]);

    // reset initialized flag when id changes
    useEffect(() => {
        initializedRef.current = false;
        // Only clear if switching to create mode (id is null)
        if (!id) {
            setSelectedCollaborators([]);
        }
    }, [id]);

    // ── Local Storage Persistence ──────────────────────────────────────────
    useEffect(() => {
        if (mode !== "create") return;
        const saved = localStorage.getItem("project-form-draft");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                form.reset(parsed);
                // If there are specific states like collaborators, we might need to handle them
            } catch (e) {
                console.error("Error loading saved project draft", e);
            }
        }
    }, [mode, form]);

    useEffect(() => {
        if (mode !== "create") return;
        const subscription = form.watch((value) => {
            localStorage.setItem("project-form-draft", JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [form, mode]);

    const { data: profileResults, isLoading: isSearchingProfiles } = useQuery({
        queryKey: ["search-profiles", collaboratorSearchQuery],
        queryFn: () => searchProfiles(collaboratorSearchQuery),
        enabled: openCollaboratorSearch,
    });

    const addCollaborator = (p: any) => {
        const current = form.getValues("collaboratorProfileIds") || [];
        if (current.includes(p.id)) return;
        if (current.length >= 6) {
            toast.error("Maximum 6 collaborators allowed");
            return;
        }
        form.setValue("collaboratorProfileIds", [...current, p.id]);
        setSelectedCollaborators(prev => [...prev, p]);
        setCollaboratorSearchQuery("");
        setOpenCollaboratorSearch(false);
    };

    const removeCollaborator = (profileId: string) => {
        const current = form.getValues("collaboratorProfileIds") || [];
        form.setValue("collaboratorProfileIds", current.filter(id => id !== profileId));
        setSelectedCollaborators(prev => prev.filter(p => p.id !== profileId));
    };

    useEffect(() => {
        if (mode !== "create" || !projectDraft) return;

        form.reset({
            name: projectDraft.name || "",
            tagline: projectDraft.tagline || "",
            url: projectDraft.url || "",
            description: projectDraft.description || "",
        });

        if (projectDraft.logo) {
            fetchImageAsBase64(projectDraft.logo).then(res => {
                if (res.ok && res.data) {
                    const byteCharacters = atob(res.data.base64);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: res.data.contentType });
                    const file = new File([blob], "logo.png", { type: res.data.contentType });
                    setLogoFile(file);
                }
            }).catch(err => console.error("Error fetching logo via proxy", err));
        } else {
            setLogoFile(null);
        }
        setProjectDraft(null);
    }, [projectDraft, mode, form, setProjectDraft]);

    // ── Logo dropzone ──────────────────────────────────────────────────────
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: useCallback((files: File[]) => {
            setLogoFile(files[0]);
        }, []),
        multiple: false,
        accept: { "image/*": [] },
    });

    // ── Attachments dropzone ───────────────────────────────────────────────
    const onDropAttachments = useCallback(
        (acceptedFiles: File[]) => {
            setAttachments((prev) => {
                const keptExisting = existingAttachments.filter(
                    (a) => !removeMediaIds.some((rm) => rm.id === a.id)
                );
                const space = Math.max(0, 4 - keptExisting.length - prev.length);
                return [...prev, ...acceptedFiles.slice(0, space)];
            });
        },
        [existingAttachments, removeMediaIds]
    );

    const { getRootProps: getAttachRoot, getInputProps: getAttachInput } =
        useDropzone({
            onDrop: onDropAttachments,
            multiple: true,
            accept: { "image/*": [], "video/*": [] },
            disabled:
                existingAttachments.filter(
                    (a) => !removeMediaIds.some((rm) => rm.id === a.id)
                ).length +
                attachments.length >=
                4,
        });

    // ── Mutations ──────────────────────────────────────────────────────────
    const { mutateAsync: mutateUpload, isPending: isUploading } = useMutation({
        mutationFn: uploadMedia,
    });

    const { mutateAsync: mutateUpsert, isPending: isUpserting } = useMutation({
        mutationFn: upsertProject,
    });

    // ── Submit ─────────────────────────────────────────────────────────────
    const onSubmit = async (data: FormData) => {
        try {
            // Upload logo
            let logoUploaded: UploadFilesWithTypeResponse | null = null;
            if (logoFile) {
                const fd = new FormData();
                fd.append("files", logoFile);
                fd.append("folder", "projects");
                const res = await mutateUpload(fd);
                logoUploaded = res[0]
            }

            // Upload attachments
            const uploadedAttachments: UploadFilesWithTypeResponse[] = [];
            for (const f of attachments) {
                const fd = new FormData();
                fd.append("files", f);
                fd.append("folder", "projects");
                const res = await mutateUpload(fd);
                uploadedAttachments.push(...res);
            }

            // Build payload
            let payload: UpsertProjectPayload = {
                name: data.name,
                tagline: data.tagline,
                description: data.description || "",
                url: data.url,
                categoryIds: data.categoryIds,
                skillIds: data.skillIds,
                collaboratorProfileIds: data.collaboratorProfileIds,
                ...(mode === "edit" && { id: projectId }),
            };

            if (logoUploaded) {
                payload.logo = logoUploaded.url;
                payload.width = String(logoUploaded.width);
                payload.height = String(logoUploaded.height);
            }

            if (uploadedAttachments.length > 0) {
                // payload.media = uploadedAttachments.map((it: UploadFilesWithTypeResponse) => ({
                //     url: it.url,
                //     width: it.width,
                //     height: it.height,
                //     type: it.type,
                // }));

                payload = { ...payload, media: uploadedAttachments }
            }

            if (removeMediaIds.length > 0) {
                payload = { ...payload, removeMediaPayload: [...removeMediaIds] }
            }

            const res = await mutateUpsert(payload);

            if (res?.ok) {
                toast.success(mode === "edit" ? "Project updated" : "Project created");
                if (mode === "create") {
                    localStorage.removeItem("project-form-draft");
                }
                setActiveTab({ id: null, tab: "gallery" });
                await queryClient.invalidateQueries({
                    queryKey: ["get-projects", username],
                });
                if (mode === "edit") {
                    await queryClient.invalidateQueries({
                        queryKey: ["get-project-by-id", projectId],
                    });
                }
            } else {
                const errorMsg = res?.error || "Something went wrong";
                toast.error(errorMsg);
                throw new Error(errorMsg);
            }
        } catch (err: any) {
            console.error(err);
            // Error is already toasted in the else block above, but we'll keep this for unexpected errors

            toast.error((err as Error)?.message || "Error saving project");

        }
    };

    // ── Derived ────────────────────────────────────────────────────────────
    const busy = isUploading || isUpserting;
    const logoPreviewUrl = logoFile
        ? URL.createObjectURL(logoFile)
        : existingLogo || null;

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-xl mt-8 tracking-tight font-medium">
                {mode === "edit" ? "Update Project Details" : "Tell us more about your project."}
            </h2>
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                {mode === "edit"
                    ? "Update your project details below."
                    : "We'll need its name, tagline, links, launch tags, and description."}
            </span>
            {mode === "create" &&
                <>
                    <Separator className="w-full h-px bg-neutral-200 mt-4 dark:bg-dark-border" />
                    <div className="w-full py-4 flex justify-center">
                        <ProjectLinkImportCard />
                    </div>
                </>
            }
            <Separator className="w-full h-px bg-neutral-200 mt-4 dark:bg-dark-border" />

            {isFetchingValues && mode === "edit" ? (
                <ProjectFormSkeleton />
            ) : (
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                    {/* Logo */}
                    <div className="mt-2 flex items-center justify-start">
                        <div
                            {...getRootProps()}
                            className="border-2 relative border-neutral-200 dark:border-dark-border size-20 aspect-square rounded-full"
                        >
                            {logoPreviewUrl ? (
                                <>
                                    <Button
                                        size="smallIcon"
                                        variant="outline"
                                        type="button"
                                        className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 right-0 bottom-0 z-[2]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLogoFile(null);
                                        }}
                                    >
                                        <X className="size-3" />
                                    </Button>
                                    <div className="relative rounded-full size-full overflow-hidden">
                                        <Image
                                            className="object-cover"
                                            src={logoPreviewUrl}
                                            fill
                                            alt="Logo"
                                            unoptimized={mode === "edit" && !logoFile}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Button
                                        size="smallIcon"
                                        variant="outline"
                                        className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 bottom-0 right-0 z-[2]"
                                        type="button"
                                        aria-label="Add project logo"
                                    >
                                        <Plus className="size-3" />
                                    </Button>
                                    <input {...getInputProps()} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <Label className="dark:text-neutral-300 text-neutral-700">Name</Label>
                        <Input {...form.register("name")} />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Tagline */}
                    <div>
                        <Label className="dark:text-neutral-300 text-neutral-700">Tagline</Label>
                        <Input {...form.register("tagline")} />
                        {form.formState.errors.tagline && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.tagline.message}
                            </p>
                        )}
                    </div>

                    {/* Categories */}
                    <div className="space-y-2">
                        <Label className="dark:text-neutral-300 text-neutral-700">Categories</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <div
                                    role="combobox"
                                    className={cn(
                                        buttonVariants({ variant: "outline" }),
                                        "w-full dark:border-dark-border dark:bg-transparent justify-between h-auto min-h-10 px-3 py-2 flex-wrap gap-2 hover:bg-neutral-50 dark:hover:bg-dark-border/20 active:scale-100 cursor-pointer"
                                    )}
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {form.watch("categoryIds") && form.watch("categoryIds")!.length > 0 ? (
                                            form.watch("categoryIds")!.map((catId) => {
                                                const category = categoriesData?.find((c) => c.id === catId);
                                                return (
                                                    <Button
                                                        key={catId}
                                                        size={"sm"}
                                                        variant="outline"
                                                        className="flex items-center"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const current = form.getValues("categoryIds") || [];
                                                            form.setValue("categoryIds", current.filter((id) => id !== catId));
                                                        }}
                                                    >
                                                        {category?.name}
                                                        <X className="size-4 ml-2" />
                                                    </Button>
                                                );
                                            })
                                        ) : (
                                            <span className="text-neutral-400 font-normal">Select categories...</span>
                                        )}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] dark:border-dark-border sm:rounded-lg max-h-[260px] h-auto p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search categories..." />
                                    <CommandList className="max-h-[220px] overflow-y-auto">
                                        <CommandEmpty>No category found.</CommandEmpty>
                                        <CommandGroup>
                                            {categoriesData?.filter(cat => !(form.watch("categoryIds") || []).includes(cat.id)).map((category) => (
                                                <CommandItem
                                                    className="rounded-md"
                                                    key={category.id}
                                                    value={category.name}
                                                    onSelect={() => {
                                                        const current = form.getValues("categoryIds") || [];
                                                        if (!current.includes(category.id)) {
                                                            if (current.length >= 3) {
                                                                toast.error("Maximum 3 categories allowed");
                                                                return;
                                                            }
                                                            form.setValue("categoryIds", [...current, category.id]);
                                                        }
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            (form.watch("categoryIds") || []).includes(category.id)
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {category.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {form.formState.errors.categoryIds && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.categoryIds.message}
                            </p>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                        <Label className="dark:text-neutral-300 text-neutral-700">Built with</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <div
                                    role="combobox"
                                    className={cn(
                                        buttonVariants({ variant: "outline" }),
                                        "w-full dark:border-dark-border dark:bg-transparent justify-between h-auto min-h-10 px-3 py-2 flex-wrap gap-2 hover:bg-neutral-50 dark:hover:bg-dark-border/20 active:scale-100 cursor-pointer"
                                    )}
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {form.watch("skillIds") && form.watch("skillIds")!.length > 0 ? (
                                            form.watch("skillIds")!.map((skillId) => {
                                                const skill = skillsData?.find((s) => s.id === skillId);
                                                return (
                                                    <Button
                                                        key={skillId}
                                                        size={"sm"}
                                                        variant="outline"
                                                        className="flex items-center"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const current = form.getValues("skillIds") || [];
                                                            form.setValue("skillIds", current.filter((id) => id !== skillId));
                                                        }}
                                                    >
                                                        {skill?.name}
                                                        <X className="size-4 ml-2" />
                                                    </Button>
                                                );
                                            })
                                        ) : (
                                            <span className="text-neutral-400 font-normal">Select skills...</span>
                                        )}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] dark:border-dark-border sm:rounded-lg max-h-[260px] h-auto p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search skills..." />
                                    <CommandList className="max-h-[220px] overflow-y-auto">
                                        <CommandEmpty>No skill found.</CommandEmpty>
                                        <CommandGroup>
                                            {skillsData?.filter(skill => !(form.watch("skillIds") || []).includes(skill.id)).map((skill) => (
                                                <CommandItem
                                                    className="rounded-md"
                                                    key={skill.id}
                                                    value={skill.name}
                                                    onSelect={() => {
                                                        const current = form.getValues("skillIds") || [];
                                                        if (!current.includes(skill.id)) {
                                                            if (current.length >= 10) {
                                                                toast.error("Maximum 10 skills allowed");
                                                                return;
                                                            }
                                                            form.setValue("skillIds", [...current, skill.id]);
                                                        }
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            (form.watch("skillIds") || []).includes(skill.id)
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {skill.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {form.formState.errors.skillIds && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.skillIds.message}
                            </p>
                        )}
                    </div>

                    {/* Collaborators */}
                    <div className="space-y-2">
                        <Label className="dark:text-neutral-300 text-neutral-700">Collaborators</Label>
                        <Popover open={openCollaboratorSearch} onOpenChange={setOpenCollaboratorSearch}>
                            <PopoverTrigger asChild>
                                <div
                                    role="combobox"
                                    className={cn(
                                        buttonVariants({ variant: "outline" }),
                                        "w-full justify-between h-auto min-h-12 py-2 dark:border-dark-border dark:bg-dark-bg/50 active:scale-100 cursor-pointer"
                                    )}
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCollaborators.length > 0 ? (
                                            selectedCollaborators.map((p) => (
                                                <Button
                                                    key={p.id}
                                                    variant="outline"
                                                    className="flex items-center"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeCollaborator(p.id);
                                                    }}
                                                >
                                                    <div className="size-5 rounded-full overflow-hidden relative mr-2">
                                                        {p.profileImage && <Image src={p.profileImage} alt={p.username} fill className="object-cover" />}
                                                    </div>
                                                    {p?.username}
                                                    <X className="size-4 ml-2" />
                                                </Button>
                                            ))
                                        ) : (
                                            <span className="text-neutral-400 font-normal">Type @ to search profiles...</span>
                                        )}
                                    </div>
                                    <ChevronsUpDown className="size-4 opacity-50 ml-2" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 dark:border-dark-border" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Search by @username..."
                                        value={collaboratorSearchQuery}
                                        onValueChange={setCollaboratorSearchQuery}
                                    />
                                    <CommandList className="max-h-[300px]">
                                        {isSearchingProfiles ? (
                                            <div className="p-4 flex justify-center"><Loader className="animate-spin size-4 opacity-50" /></div>
                                        ) : (
                                            <>
                                                <CommandEmpty>No profiles found.</CommandEmpty>
                                                <CommandGroup>
                                                    {profileResults?.filter(p => !(form.watch("collaboratorProfileIds") || []).includes(p.id)).map((p) => (
                                                        <CommandItem
                                                            key={p.id}
                                                            onSelect={() => addCollaborator(p)}
                                                            className="flex items-center gap-3 p-2 rounded-md"
                                                        >
                                                            <div className="size-8 rounded-full overflow-hidden relative bg-neutral-100 dark:bg-neutral-800">
                                                                {p.profileImage && <Image src={p.profileImage} alt={p.username!} fill className="object-cover" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium dark:text-neutral-200">{p.displayName}</span>
                                                                <span className="text-xs text-neutral-500">@{p.username}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Link */}
                    <div>
                        <Label className="dark:text-neutral-300 text-neutral-700">Link</Label>
                        <Input {...form.register("url")} />
                        {form.formState.errors.url && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.url.message}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <Separator className="my-6" />
                        <Label className="dark:text-neutral-300 text-neutral-700">
                            Description
                        </Label>
                        <Textarea rows={6} {...form.register("description")} />
                    </div>

                    {/* Attachments */}
                    <div>
                        <Separator className="my-6" />
                        <div
                            {...getAttachRoot()}
                            className="border-dashed h-[250px] dark:bg-dark-bg dark:border-dark-border bg-neutral-50 border-neutral-200 flex flex-col items-center justify-center border-2 p-4 rounded-lg"
                        >
                            <h3 className="dark:text-neutral-200">
                                Choose Images &amp; Video drag &amp; drop files here
                            </h3>
                            <span className="text-sm text-neutral-700 dark:text-neutral-400">
                                JPG, PNG, GIF, MP4 up to 10MB each
                            </span>
                            <input {...getAttachInput()} />
                        </div>

                        <div className="w-full flex flex-row items-center justify-start gap-4 mt-4 overflow-x-auto">
                            {/* Existing attachments (edit mode) */}
                            {existingAttachments.map((f) => (
                                <div
                                    key={`existing-${f.id}`}
                                    className="relative border border-neutral-200 dark:border-dark-border overflow-hidden rounded-xl size-32"
                                >
                                    <Button
                                        size="smallIcon"
                                        variant="outline"
                                        type="button"
                                        onClick={() => {
                                            setRemoveMediaIds((prev) => [
                                                ...prev,
                                                { id: f.id, url: f.url },
                                            ]);
                                            setExistingAttachments((prev) =>
                                                prev.filter((it) => it.id !== f.id)
                                            );
                                        }}
                                        className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 right-1 top-1 z-[2]"
                                    >
                                        <X className="size-3" />
                                    </Button>
                                    {f.type === "image" ? (
                                        <Image
                                            src={f.url}
                                            alt={f.url}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <video src={f.url} className="size-full object-cover" />
                                    )}
                                </div>
                            ))}

                            {/* New attachments */}
                            {attachments.map((file, idx) => (
                                <div
                                    key={`new-${idx}`}
                                    className="relative border border-neutral-200 dark:border-dark-border overflow-hidden rounded-xl size-32"
                                >
                                    <Button
                                        size="smallIcon"
                                        variant="outline"
                                        type="button"
                                        onClick={() =>
                                            setAttachments((prev) => prev.filter((_, i) => i !== idx))
                                        }
                                        className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 right-1 top-1 z-[2]"
                                    >
                                        <X className="size-3" />
                                    </Button>
                                    {file.type.startsWith("image") ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="object-cover size-full"
                                        />
                                    ) : (
                                        <video
                                            src={URL.createObjectURL(file)}
                                            className="size-full object-cover"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        variant="outline"
                        className="w-full rounded-md"
                        disabled={busy}
                    >
                        {busy ? (
                            <span className="flex items-center gap-2">
                                <Loader className="size-4 animate-spin" /> Saving...
                            </span>
                        ) : mode === "edit" ? (
                            "Save changes"
                        ) : (
                            "Create Project"
                        )}
                    </Button>
                </form>
            )}
        </div>
    );
};

// ── Skeleton ──────────────────────────────────────────────────────────────
const ProjectFormSkeleton = () => (
    <div className="mt-6 space-y-4">
        <Skeleton className="size-20 rounded-full" />
        {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton
                    className={cn("h-[40px] w-full rounded-lg", i === 2 && "h-[100px]")}
                />
            </div>
        ))}
    </div>
);
