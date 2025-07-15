import { getSocialLinks } from "@/actions/social-links-actions";
import { capitalizeFirstLetter, cn, getIcon } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export const dummyLinks = [
  {
    platform: "reddit",
    url: "https://github.com/Ashpara10",
  },
  {
    platform: "twitter",
    url: "https://twitter.com/Ashpara10",
  },
  {
    platform: "linkedin",
    url: "https://linkedin.com/in/Ashpara10",
  },
  {
    platform: "youtube",
    url: "https://instagram.com/Ashpara10",
  },
  {
    platform: "github",
    url: "https://instagram.com/Ashpara10",
  },
  {
    platform: "instagram",
    url: "https://instagram.com/Ashpara10",
  },
];

const SocialLinks = ({ isMine }: { isMine: boolean }) => {
  const params = useParams<{ username: string }>();

  const { data: links = [], isLoading } = useQuery({
    enabled: !!params?.username,
    queryKey: ["get-social-links", params?.username],
    queryFn: () => getSocialLinks(params?.username),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  if (!isMine && links?.length === 0) {
    return;
  }

  return (
    <div className="w-full  flex items-center justify-center ">
      <div className="max-w-2xl social-links w-full gap-x-0.5 gap-y-1.5  text-sm md:text-base flex flex-wrap  mt-4 items-center justify-start">
        {isLoading ? (
          <SocialLinkSkeleton />
        ) : links?.length === 0 ? (
          dummyLinks?.map((link, i) => (
            <SocialLinkButton
              key={i}
              platform={link?.platform}
              url={link?.url}
              className="opacity-70"
            />
          ))
        ) : (
          links?.map((link, i) => (
            <SocialLinkButton
              key={i}
              platform={link?.platform}
              url={link?.url}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SocialLinks;

const SocialLinkSkeleton = () => {
  return [...Array.from({ length: 12 })].map((_, i) => (
    <Skeleton
      key={i}
      className="h-9 rounded-md px-3 w-[100px] m-1 bg-neutral-200/60 dark:bg-dark-border animate-none"
    />
  ));
};

export const SocialLinkButton = ({
  platform,
  url,
  className,
  buttonClassName,
}: {
  platform: string;
  url: string;
  className?: string;
  buttonClassName?: string;
}) => {
  return (
    <NextLink className={cn("scale-95", className)} href={url} target="_blank">
      <Button
        variant={"outline"}
        className={cn("bg-white shadow-lg", buttonClassName)}
      >
        <Image
          src={`/${getIcon(platform as any)}`}
          className="aspect-square size-5"
          alt={platform}
          width={20}
          height={20}
          loading="eager"
          quality={100}
        />
        <span className="ml-2 dark:text-neutral-300 text-neutral-800 font-medium  tracking-tight leading-snug mr-2 ">
          {capitalizeFirstLetter(platform)}
        </span>
      </Button>
    </NextLink>
  );
};
