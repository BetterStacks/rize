import { getAllSocialLinks } from "@/lib/server-actions";
import { TSocialLink } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";

const SocialLinks = () => {
  const { data, error } = useQuery<TSocialLink[]>({
    queryKey: ["get-social-links"],
    queryFn: getAllSocialLinks,
  });
  console.log({ data, error });
  return (
    <div className="w-full max-w-2xl mt-4 flex flex-col items-center justify-start">
      <h2 className="w-full   text-left   text-xl font-medium mb-4">Links</h2>
      <div className="w-full flex items-center justify-start gap-2">
        {data?.map((link) => {
          return (
            <button
              key={link?.id}
              className="flex rounded-2xl bg-neutral-100  px-4 py-1 dark:bg-dark-border items-center justify-center"
            >
              <Image
                src={link?.icon}
                alt={`${link?.name}`}
                width={20}
                height={20}
                className="size-6 "
              />
              <span className="ml-1">{link?.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLinks;
