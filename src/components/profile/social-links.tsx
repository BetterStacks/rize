import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSocialLinks } from "@/lib/server-actions";
import { SocialPlatform } from "@/lib/types";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Link, Linkedin, Twitter } from "lucide-react";
import NextLink from "next/link";
import { useParams } from "next/navigation";

const SocialLinks = () => {
  const params = useParams<{ username: string }>();
  const getIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case "facebook":
        return <Facebook strokeWidth={1.6} className="size-6 opacity-75" />;
      case "twitter":
        return <Twitter strokeWidth={1.6} className="size-6 opacity-75" />;
      case "instagram":
        return <Instagram strokeWidth={1.6} className="size-6 opacity-75" />;
      case "linkedin":
        return <Linkedin strokeWidth={1.6} className="size-6 opacity-75" />;
      default:
        return <Link strokeWidth={1.6} className="size-6 opacity-75" />;
    }
  };

  const { data: links = [] } = useQuery({
    enabled: !!params?.username,
    queryKey: ["get-social-links", params?.username],
    queryFn: () => getSocialLinks(params?.username),
  });
  return (
    links?.length > 0 && (
      <div className="w-full px-2">
        <TooltipProvider>
          <div className="flex w-full max-w-2xl mt-4 mb-4">
            {links?.map((link, i) => (
              <NextLink
                className="mr-4"
                href={link?.url}
                key={i}
                target="_blank"
              >
                <Tooltip>
                  <TooltipTrigger>
                    {getIcon(link?.platform as any)}
                  </TooltipTrigger>
                  <TooltipContent>
                    {capitalizeFirstLetter(link?.platform as string)}
                  </TooltipContent>
                </Tooltip>
              </NextLink>
            ))}
          </div>
        </TooltipProvider>
      </div>
    )
  );
};

export default SocialLinks;
