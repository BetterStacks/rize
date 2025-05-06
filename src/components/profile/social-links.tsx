import { getSocialLinks } from "@/actions/social-links-actions";
import { capitalizeFirstLetter, getIcon } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { ArrowRight } from "lucide-react";

const SocialLinks = () => {
  const params = useParams<{ username: string }>();

  const { data: links = [], isLoading } = useQuery({
    enabled: !!params?.username,
    queryKey: ["get-social-links", params?.username],
    queryFn: () => getSocialLinks(params?.username),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const dummyLinks = [
    {
      platform: "github",
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
      platform: "instagram",
      url: "https://instagram.com/Ashpara10",
    },
  ];

  return (
    <div className="w-full mt-6">
      {/* <div className="max-w-2xl w-full border overflow-hidden border-neutral-300/60 dark:border-dark-border/80 rounded-xl  text-sm md:text-base flex flex-col  mt-4 items-center justify-start">
        {isLoading ? (
          <SocialLinkSkeleton />
        ) : links?.length === 0 ? (
          dummyLinks?.map((link, i) => (
            <NextLink className="" href={link?.url} key={i} target="_blank">
              <Button size={"sm"} variant={"outline"} className="w-full">
                <Image
                  src={`/${getIcon(link?.platform as any)}`}
                  className="aspect-square size-6"
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
        ) : (
          links?.map((link, i) => (
            <Button
              size={"sm"}
              variant={"ghost"}
              className=" w-full border-t px-4 group relative rounded-none justify-start py-3 first:border-none border-neutral-300/60 dark:border-dark-border/80"

              // className="w-full justify-start rounded-none"
            >
              <Image
                src={`/${getIcon(link?.platform as any)}`}
                className="aspect-square size-5"
                alt={link?.platform}
                width={20}
                height={20}
              />
              <NextLink href={link?.url} key={i} target="_blank">
                <span className="ml-2 opacity-75  tracking-tight leading-snug mr-2 ">
                  {capitalizeFirstLetter(link?.platform)}
                </span>
              </NextLink>
              <ArrowRight
                className="size-4 opacity-0 absolute right-4 transition-all ease-in group-hover:opacity-80"
                strokeWidth={1.6}
              />
            </Button>
          ))
        )}
      </div> */}

      <div className="max-w-2xl w-full gap-x-1 gap-y-1.5  text-sm md:text-base flex flex-wrap  mt-4 items-center justify-start">
        {isLoading ? (
          <SocialLinkSkeleton />
        ) : links?.length === 0 ? (
          dummyLinks?.map((link, i) => (
            <NextLink
              className="scale-95"
              href={link?.url}
              key={i}
              target="_blank"
            >
              <Button size={"sm"} variant={"outline"}>
                <Image
                  src={`/${getIcon(link?.platform as any)}`}
                  className="aspect-square size-6"
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
        ) : (
          links?.map((link, i) => (
            <NextLink
              className="scale-95"
              href={link?.url}
              key={i}
              target="_blank"
            >
              <Button size={"sm"} variant={"outline"}>
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
