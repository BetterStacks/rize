import { SocialPlatform } from "@/lib/types";
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { FC, ReactNode, useState } from "react";
import toast from "react-hot-toast";
import { useSocialLinksDialog } from "../dialog-provider";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";

type SocialLinksProps = {
  value: string;
  name: string;
  icon: ReactNode;
  baseUrl: string;
};
const initial: SocialLinksProps[] = [
  {
    baseUrl: "instagram.com/",
    icon: <Instagram className="opacity-70 size-6" strokeWidth={1.4} />,
    name: "Instagram",
    value: "",
  },
  {
    baseUrl: "x.com/",
    icon: <Twitter className="opacity-70 size-6" strokeWidth={1.4} />,
    name: "X (Twitter)",
    value: "",
  },
  {
    baseUrl: "youtube.com/@",
    icon: <Youtube className="opacity-70 size-6" strokeWidth={1.4} />,
    name: "Youtube",
    value: "",
  },
  {
    baseUrl: "linkedin.com/in/",
    icon: <Linkedin className="opacity-70 size-6" strokeWidth={1.4} />,
    name: "LinkedIn",
    value: "",
  },
];

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

interface AddSocialLinkProps {
  onAdd: (platform: SocialPlatform, url: string) => void;
  existingPlatforms: SocialPlatform[];
}

const AddSocialLinksDialog: FC<AddSocialLinkProps> = ({
  existingPlatforms,
  onAdd,
}) => {
  const [socialLinks, setSocialLinks] = useState<SocialLinksProps[]>(initial);
  const [open, setOpen] = useSocialLinksDialog();
  const [platform, setPlatform] = useState<SocialPlatform>("other");
  const [url, setUrl] = useState("");

  const availablePlatforms: SocialPlatform[] = [
    "facebook",
    "twitter",
    "instagram",
    "linkedin",
    "github",
    "youtube",
    "reddit",
    "other",
  ].filter(
    (p) => p === "other" || !existingPlatforms.includes(p as SocialPlatform)
  ) as SocialPlatform[];

  const handleAdd = () => {
    if (!platform) {
      toast.error("Please select a social media platform");
      return;
    }

    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    let processedUrl = url;
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

    onAdd(platform, processedUrl);
    setOpen(false);
    setPlatform("other");
    setUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle>Add Social Link</DialogTitle>
          <DialogDescription>
            Add your social media profile link to share with others.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select
              value={platform}
              onValueChange={(value) => setPlatform(value as SocialPlatform)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Social Platforms</SelectLabel>
                  {availablePlatforms.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Input
              id="url"
              placeholder="Enter URL (e.g., https://twitter.com/yourusername)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setOpen(false);
              setPlatform("other");
              setUrl("");
            }}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleAdd}>
            Add Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSocialLinksDialog;
