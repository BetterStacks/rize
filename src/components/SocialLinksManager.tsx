import {
  addSocialLink,
  getSocialLinks,
  removeSocialLink,
} from "@/lib/server-actions";
import { SocialPlatform } from "@/lib/types";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Trash2,
  Link,
  Edit3,
  Loader,
  Plus,
} from "lucide-react";
import NextLink from "next/link";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React from "react";
import SocialLinksDialog from "./dialogs/AddSocialLinksDialog";
import toast from "react-hot-toast";
import { queryClient } from "@/lib/providers";
import { useSocialLinksDialog } from "./dialog-provider";
import { Copy, Share2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { capitalizeFirstLetter, cleanUrl, cn } from "@/lib/utils";
import { Button } from "./ui/button";
import EditSocialLink from "./dialogs/EditSocialLinkDialog";

const SocialLinksManager = () => {
  const params = useParams<{ username: string }>();
  const setSocialLinksDialogOpen = useSocialLinksDialog()[1];

  const [linkToEdit, setLinkToEdit] = React.useState<{
    id: string;
    url: string;
    platform: SocialPlatform;
  } | null>(null);

  const [editLinkDialogOpen, setEditLinkDialogOpen] = React.useState(false);
  const { data: links = [] } = useQuery({
    enabled: !!params?.username,
    queryKey: ["get-social-links", params?.username],
    queryFn: () => getSocialLinks(params?.username),
  });

  const existingPlatforms = links!.map(
    (link) => link.platform
  ) as SocialPlatform[];

  const { mutate: addSocialLinkMutation } = useMutation({
    mutationFn: ({
      url,
      platform,
    }: {
      url: string;
      platform: SocialPlatform;
    }) => addSocialLink(url, platform),
    onSuccess: (data) => {
      toast.success("Social link added");
      queryClient.invalidateQueries({ queryKey: ["get-social-links"] });
      setSocialLinksDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });
  const handleEditLink = ({
    id,
    platform,
    url,
  }: {
    id: string;
    url: string;
    platform: SocialPlatform;
  }) => {
    setLinkToEdit({ id, url, platform });
    setEditLinkDialogOpen(true);
  };
  return (
    <div className="w-full px-4 flex flex-col items-center justify-center mb-6">
      <Card className="bg-white w-full mt-4 shadow-xl dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium dark:text-white">
            Social Link Manager
          </CardTitle>
          <CardDescription className="text-left leading-snug">
            Add and manage your social media <br /> links in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {links.length > 0 ? (
            <div className="">
              {links.map((link) => (
                <SocialLink
                  key={link.id}
                  id={link.id}
                  platform={link.platform as SocialPlatform}
                  url={link.url}
                  // onDelete={() => handleDeleteLink(link.id)}
                  onEdit={handleEditLink}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground animate-fade-in">
              <Share2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <h2 className="tracking-tighter text-lg font-medium leading-tight">
                No social links added yet.
              </h2>
              <p className="text-sm mt-2 opacity-80">
                Add your first social media link below.
              </p>
            </div>
          )}
          <CardFooter>
            <Button
              className="w-full"
              variant={"outline"}
              onClick={() => setSocialLinksDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Social Link
            </Button>
          </CardFooter>
        </CardContent>
      </Card>{" "}
      <SocialLinksDialog
        onAdd={(platform, url) => addSocialLinkMutation({ platform, url })}
        existingPlatforms={existingPlatforms}
      />
      {linkToEdit && (
        <EditSocialLink
          open={editLinkDialogOpen}
          onOpenChange={setEditLinkDialogOpen}
          url={linkToEdit.url}
          platform={linkToEdit.platform}
          id={linkToEdit.id}
        />
      )}
    </div>
  );
};

export default SocialLinksManager;

interface SocialLinkProps {
  id: string;
  platform: any;
  url: string;
  onEdit: (link: { id: string; url: string; platform: SocialPlatform }) => void;
}

const SocialLink: React.FC<SocialLinkProps> = ({
  platform,
  url,
  id,
  onEdit,
}) => {
  const getIcon = () => {
    switch (platform) {
      case "facebook":
        return <Facebook strokeWidth={1.7} className="size-6 opacity-80" />;
      case "twitter":
        return <Twitter strokeWidth={1.7} className="size-6 opacity-80" />;
      case "instagram":
        return <Instagram strokeWidth={1.7} className="size-6 opacity-80" />;
      case "linkedin":
        return <Linkedin strokeWidth={1.7} className="size-6 opacity-80" />;
      default:
        return <Link strokeWidth={1.7} className="size-6 opacity-80" />;
    }
  };
  const { mutate: deleteSocialLinkMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: ({ id }: { id: string }) => removeSocialLink(id),
      onSuccess: () => {
        toast.success("Social link Deleted");
        queryClient.invalidateQueries({ queryKey: ["get-social-links"] });
      },
      onError: (error) => {
        toast.error(error?.message);
      },
    });

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 rounded-lg mb-2"
        // getBgColor()
      )}
    >
      <div className="flex items-center">
        <div className={cn("p-2 rounded-full opacity-80 mr-3")}>
          {getIcon()}
        </div>
        <div className="flex flex-col">
          <h3 className={cn("font-medium leading-tight tracking-tight")}>
            {capitalizeFirstLetter(platform)}
          </h3>
          <NextLink
            href={url}
            target="_blank"
            className="text-sm opacity-80 leading-tight hover:underline"
          >
            {cleanUrl(url)}
          </NextLink>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          size="icon"
          variant={"ghost"}
          className=""
          onClick={() => onEdit({ id, url, platform })}
        >
          <Edit3 className="size-4 opacity-80" />
        </Button>
        <Button
          size="icon"
          variant={"ghost"}
          className=""
          onClick={() => deleteSocialLinkMutation({ id: id })}
        >
          {isDeleting ? (
            <Loader className="opacity-80 size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4 opacity-80" />
          )}
        </Button>
      </div>
    </div>
  );
};

// export default SocialLink;
