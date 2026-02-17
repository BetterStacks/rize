"use client";

import { upsertCertificate } from "@/actions/certificate-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { FC, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const certificateSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, "Certificate name is required"),
    fileUrl: z.string().min(1, "Certificate PDF is required"),
    issuer: z.string().optional(),
    issueDate: z.string().optional(),
    expiryDate: z.string().optional(),
    description: z.string().optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

type CertificateFormProps = {
    defaultValues?: {
        id: string;
        createdAt: Date | null;
        updatedAt: Date;
        profileId: string;
        name: string;
        fileUrl: string;
        issuer: string | null;
        issueDate: Date | null;
        expiryDate: Date | null;
        description: string | null;
    };
    isFetchingValues?: boolean;
};

export const CertificateForm: FC<CertificateFormProps> = ({
    defaultValues,
    isFetchingValues,
}) => {
    console.log(defaultValues);
    const [activeTab, setActiveTab] = useActiveSidebarTab();
    const [, setIsRightSidebarOpen] = useRightSidebar();
    const { username } = useParams<{ username: string }>();
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const form = useForm<CertificateFormData>({
        resolver: zodResolver(certificateSchema),
    });

    const upsertMutation = useMutation({ mutationFn: upsertCertificate });
    const mutateUpsert = upsertMutation.mutateAsync;

    useEffect(() => {
        if (!defaultValues) return;
        try {
            form.reset({
                id: defaultValues.id,
                name: defaultValues.name ?? "",
                fileUrl: defaultValues.fileUrl ?? "",
                issuer: defaultValues.issuer ?? "",
                issueDate: defaultValues.issueDate
                    ? defaultValues.issueDate.toISOString().split("T")[0]
                    : "",
                expiryDate: defaultValues.expiryDate
                    ? defaultValues.expiryDate.toISOString().split("T")[0]
                    : "",
                description: defaultValues.description ?? "",
            });
            setUploadedFileUrl(defaultValues.fileUrl ?? "");
        } catch (err) {
            console.error("Error populating certificate form defaults", err);
        }
    }, [defaultValues, form]);

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append("files", file);
        formData.append("folder", "certificates");

        const response = await fetch("/api/upload/files", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (result.success && result.data?.[0]?.url) {
            return result.data[0].url as string;
        }
        throw new Error("Failed to upload certificate");
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.type !== "application/pdf") {
                toast.error("Please upload a PDF file");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be less than 10MB");
                return;
            }
            setPendingFile(file);
            form.setValue("fileUrl", file.name); // Set to file name to pass validation
            form.clearErrors("fileUrl");
        }
    }, [form]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        disabled: isUploading,
    });

    async function onSubmit(values: CertificateFormData) {
        try {
            setIsUploading(true);
            let fileUrl = values.fileUrl;

            // If there's a new file selected, upload it first
            if (pendingFile) {
                try {
                    fileUrl = await uploadFile(pendingFile);
                } catch (error) {
                    toast.error("Failed to upload certificate");
                    setIsUploading(false);
                    return;
                }
            }

            const payload = {
                ...values,
                fileUrl,
                ...(activeTab?.id && { id: activeTab?.id as string }),
                issueDate: values.issueDate ? new Date(values.issueDate) : undefined,
                expiryDate: values.expiryDate ? new Date(values.expiryDate) : undefined,
            };

            await mutateUpsert(payload, {
                onSuccess: async () => {
                    setActiveTab({ id: null, tab: "certificates" });
                    setIsRightSidebarOpen(false);
                    await queryClient.invalidateQueries({
                        queryKey: ["get-certificates", username],
                    });
                    toast.success(
                        activeTab?.id ? "Certificate updated" : "Certificate added"
                    );
                    setPendingFile(null);
                },
                onError: (error) => {
                    toast.error(
                        error?.message ||
                        `Failed to ${activeTab?.id ? "update" : "add"} certificate`
                    );
                },
                onSettled: () => {
                    setIsUploading(false);
                }
            });
        } catch (error) {
            console.error("Error preparing certificate payload", error);
            setIsUploading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-xl mt-8 tracking-tight font-medium">
                {activeTab?.id ? "Edit Certificate" : "Add Certificate"}
            </h2>
            <span className="text-neutral-300 text-sm">
                Showcase your professional certifications and achievements.
            </span>

            {isFetchingValues ? (
                <CertificateFormSkeleton />
            ) : (
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                    <div>
                        <Label className="dark:text-neutral-300 text-neutral-700">
                            Certificate Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            placeholder="e.g., AWS Certified Solutions Architect"
                            {...form.register("name")}
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label className="dark:text-neutral-300 text-neutral-700">
                            Certificate PDF <span className="text-red-500">*</span>
                        </Label>
                        <div
                            {...getRootProps()}
                            className={cn(
                                "mt-2 border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
                                isDragActive
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                    : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600",
                                isUploading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center gap-2">
                                {isUploading ? (
                                    <>
                                        <Loader className="size-8 animate-spin text-blue-500" />
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            {pendingFile ? "Uploading certificate..." : "Saving..."}
                                        </p>
                                    </>
                                ) : pendingFile ? (
                                    <>
                                        <FileText className="size-8 text-blue-500" />
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                            {pendingFile.name}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                                            Ready to upload. Click "Add certificate" to save.
                                        </p>
                                    </>
                                ) : uploadedFileUrl ? (
                                    <>
                                        <FileText className="size-8 text-green-500" />
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                            ✓ Certificate selected
                                        </p>
                                        <a
                                            href={uploadedFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 dark:text-blue-400 underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View current file
                                        </a>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                                            Click or drag to replace
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="size-8 text-neutral-400" />
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            {isDragActive
                                                ? "Drop the PDF here"
                                                : "Drag & drop a PDF here, or click to browse"}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Max file size: 10MB
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                        {form.formState.errors.fileUrl && (
                            <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.fileUrl.message}
                            </p>
                        )}
                    </div>

                    <Separator className="my-6" />

                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Optional Information
                    </p>

                    <div>
                        <Label className="dark:text-neutral-300 text-neutral-700">
                            Issuing Organization
                        </Label>
                        <Input
                            placeholder="e.g., Amazon Web Services"
                            {...form.register("issuer")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="dark:text-neutral-300 text-neutral-700">
                                Issue Date
                            </Label>
                            <Input
                                type="date"
                                {...form.register("issueDate")}
                            />
                        </div>
                        <div>
                            <Label className="dark:text-neutral-300 text-neutral-700">
                                Expiry Date
                            </Label>
                            <Input
                                type="date"
                                {...form.register("expiryDate")}
                            />
                        </div>
                    </div>



                    <div>
                        <Label className="dark:text-neutral-300 text-neutral-700">
                            Description
                        </Label>
                        <Textarea
                            rows={3}
                            placeholder="Additional details about this certificate..."
                            {...form.register("description")}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="w-full rounded-md"
                            variant="outline"
                            disabled={upsertMutation.isPending || isUploading}
                        >
                            {(upsertMutation.isPending || isUploading) && (
                                <Loader className="size-4 animate-spin mr-2" />
                            )}
                            {activeTab?.id ? "Save changes" : "Add certificate"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export const CertificateFormSkeleton = () => (
    <>
        <Skeleton className="h-6 w-24 mb-4" />
        {[...Array(4)].map((_, i) => (
            <div key={i} className="mt-4 space-y-2">
                <Skeleton
                    className={cn("h-[40px] w-full rounded-lg", i === 2 && "h-[100px]")}
                />
            </div>
        ))}
    </>
);
