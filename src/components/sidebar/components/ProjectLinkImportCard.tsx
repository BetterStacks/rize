"use client";

import { getProjectMetadataFromUrl } from "@/actions/project-metadata-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActiveSidebarTab, useProjectDraft } from "@/lib/context";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

const ProjectLinkImportCard = ({ className }: { className?: string }) => {
  const [, setActiveTab] = useActiveSidebarTab();
  const [, setProjectDraft] = useProjectDraft();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: getProjectMetadataFromUrl,
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Project URL is required");
      return;
    }

    try {
      const res = await mutateAsync({ url });
      if (!res?.ok || !res.data) {
        throw new Error(res?.error || "Failed to fetch metadata");
      }

      console.log({ res })

      setProjectDraft({
        name: res.data.name,
        description: res.data.description,
        tagline: res.data.tagline || "",
        url: res.data.normalizedUrl,
        logo: res.data.logo,
      });
      setActiveTab({ id: null, tab: "projects" });
      toast.success("Project details loaded");
    } catch (err) {
      const message = (err as Error)?.message || "Failed to fetch metadata";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="gap-y-1">
        <h3 className="text-base font-medium text-balance">Import a project</h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 text-pretty">
          Paste a project link to auto-fill the name, description, logo, and tagline.
        </p>
      </div>
      <div className="mt-2">
        <form onSubmit={handleSubmit} className="flex flex-row items-center gap-2">
          <Input
            id="project-url"
            placeholder="https://dub.sh/ashwin.wtf"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            autoComplete="off"
          />
          <Button type="submit" variant="outline" className="" disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader className="size-4 animate-spin" />
              </span>
            ) : (
              "Auto Fill"
            )}
          </Button>
        </form>
        <div className="w-full">
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProjectLinkImportCard;
