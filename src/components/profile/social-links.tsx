import { getSocialLinks } from "@/actions/social-links-actions";
import { capitalizeFirstLetter, getIcon } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

const SocialLinks = () => {
  const params = useParams<{ username: string }>();

  const { data: links = [], isLoading } = useQuery({
    enabled: !!params?.username,
    queryKey: ["get-social-links", params?.username],
    queryFn: () => getSocialLinks(params?.username),
  });

  return (
    <div className="w-full ">
      <div className="max-w-2xl w-full gap-2 text-sm md:text-base flex flex-wrap  mt-4 items-center justify-start">
        {isLoading ? (
          <SocialLinkSkeleton />
        ) : (
          links?.map((link, i) => (
            <NextLink className="" href={link?.url} key={i} target="_blank">
              <Button size={"sm"}>
                <Image
                  src={`/${getIcon(link?.platform as any)}`}
                  className="aspect-square size-5"
                  alt={link?.platform}
                  width={20}
                  height={20}
                />
                <span className="ml-2 opacity-75  tracking-tight leading-snug mr-2 ">
                  {capitalizeFirstLetter(link?.platform)}
                </span>
              </Button>
            </NextLink>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialLinks;

const SocialLinkSkeleton = () => {
  return [...Array.from({ length: 8 })].map((_, i) => (
    <Skeleton
      key={i}
      className="h-9 rounded-md px-3 w-[100px] bg-neutral-200/60 dark:bg-dark-border animate-none"
    />
  ));
};
