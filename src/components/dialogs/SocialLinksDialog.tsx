import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useSocialLinksDialog } from "../dialog-provider";
import { Button } from "../ui/button";

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
const SocialLinksDialog = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLinksProps[]>(initial);
  const [open, setOpen] = useSocialLinksDialog();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:rounded-3xl dark:bg-neutral-800 max-w-[360px] w-full">
        <DialogHeader>
          <DialogTitle>Social Links</DialogTitle>
        </DialogHeader>
        <div>
          {socialLinks.map((link) => (
            <div className="flex items-center justify-start " key={link.name}>
              {link.icon}
              <span className="ml-2 text-lg text-opacity-70">{link.name}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialLinksDialog;
