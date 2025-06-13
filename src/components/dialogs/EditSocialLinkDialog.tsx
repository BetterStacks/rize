"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialPlatform } from "@/lib/types";
import toast from "react-hot-toast";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { editSocialLink } from "@/actions/social-links-actions";
import { queryClient } from "@/lib/providers";

interface EditSocialLinkProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: SocialPlatform;
  url: string;
  id: string;
  //   onSave: (url: string) => void;
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const EditSocialLink: React.FC<EditSocialLinkProps> = ({
  open,
  onOpenChange,
  platform,
  url,
  id,
}) => {
  const [editedUrl, setEditedUrl] = useState(url);

  useEffect(() => {
    setEditedUrl(url);
  }, [url, open]);

  const { mutate: editSocialLinkMutation, isPending } = useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) =>
      editSocialLink(id, url),
    onSuccess: () => {
      toast.success(`${capitalizeFirstLetter(platform)} link updated`);
      queryClient.invalidateQueries({ queryKey: ["get-social-links"] });
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  const handleSave = async () => {
    if (!editedUrl) {
      toast.error("Please enter a URL");
      return;
    }

    let processedUrl = editedUrl;
    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://")
    ) {
      processedUrl = "https://" + processedUrl;
    }

    if (!isValidUrl(processedUrl)) {
      toast.error("Please enter a valid URL");
      return;
    }

    editSocialLinkMutation({ id, url: processedUrl });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-dark-bg bg-white sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit {capitalizeFirstLetter(platform)} Link</DialogTitle>
          <DialogDescription>
            Update your social media profile link.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              id="url"
              placeholder="Enter URL (e.g., https://twitter.com/yourusername)"
              value={editedUrl}
              onChange={(e) => setEditedUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            variant="secondary"
            disabled={url.trim() === editedUrl.trim() || isPending}
            onClick={handleSave}
          >
            Save Changes
          </Button>
          <Button
            disabled={isPending}
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSocialLink;
