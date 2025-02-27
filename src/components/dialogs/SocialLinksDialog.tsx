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
    icon: <Instagram className="opacity-80 size-4" />,
    name: "Instagram",
    value: "",
  },
  {
    baseUrl: "x.com/",
    icon: <Twitter className="opacity-80 size-4" />,
    name: "X",
    value: "",
  },
  {
    baseUrl: "youtube.com/@",
    icon: <Youtube className="opacity-80 size-4" />,
    name: "Youtube",
    value: "",
  },
  {
    baseUrl: "linkedin.com/in/",
    icon: <Linkedin className="opacity-80 size-4" />,
    name: "LinkedIn",
    value: "",
  },
];
const SocialLinksDialog = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLinksProps[]>(initial);
  const [open, setOpen] = useSocialLinksDialog();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:rounded-3xl dark:bg-neutral-800">
        <DialogHeader>
          <DialogTitle>Social Links</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col gap-y-2">
          {socialLinks.map((link) => (
            <div
              key={link.name}
              className="w-full flex justify-start items-center "
            >
              <div className="flex items-center justify-center">
                {link.icon}
                <span className="ml-1 opacity-80">/</span>
                {/* <span>{link.baseUrl}</span> */}
              </div>
              <input
                type="text"
                value={link.value}
                className="bg-transparent px-1 focus-visible:outline-none"
                placeholder={`${link.name.toLocaleLowerCase()} url`}
                onChange={(e) => {
                  setSocialLinks((prev) =>
                    prev.map((l) =>
                      l.name === link.name ? { ...l, value: e.target.value } : l
                    )
                  );
                }}
              />
            </div>
          ))}
          <Button className="w-full mt-3 rounded-lg">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialLinksDialog;
