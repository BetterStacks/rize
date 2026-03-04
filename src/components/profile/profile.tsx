"use client";

import { useActiveSidebarTab } from "@/lib/context";
import { GetProfileByUsername } from "@/lib/types";
import { cleanUrl, cn } from "@/lib/utils";
import { Link2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import UserAvatar from "../user-avatar";
import QRcode from "./QRcode";

type ProfileProps = {
  data: GetProfileByUsername;
  isLoading: boolean;
  isMine: boolean;
  bioContainerClassName?: string;
  username?: string;
};

export const defaultBio = `I'm still setting up, but this is where it all starts 🌱.\n
A place to share what I do, what I love, and where I'm headed.It's quiet for now, but trust me, it won't stay that way for long.`;

const Profile = ({
  data,
  isMine,
  isLoading,
  bioContainerClassName,
  username,
}: ProfileProps) => {
  const [, setActiveSidebarTab] = useActiveSidebarTab();

  return (
    <div className=" w-full flex flex-col items-center justify-start   mb-2">
      <div className=" max-w-2xl w-full flex flex-col items-start justify-start">
        <div className="mb-6 w-full flex justify-between items-center">
          <UserAvatar
            isMyProfile={isMine}
            isLoading={isLoading}
            data={{
              image: data?.profileImage as string,
              name: data?.displayName as string,
            }}
          />
          <QRcode
            username={username}
            profileImage={data?.profileImage as string}
          />
        </div>
        <h1 className="profile-displayName self-start text-base sm:text-lg font-medium md:text-xl lg:text-2xl tracking-tight">
          {" "}
          {data?.displayName || data?.name}
        </h1>
        <div className="flex mt-2 text-gray-700 dark:text-gray-300 justify-start items-center">
          {/* {data?.website && (
                    <div className="inline-flex items-center bg-neutral-100 dark:bg-dark-border px-3 py-1 rounded-3xl justify-start mt-4 text-xs md:text-sm font-medium text-neutral-600 dark:text-neutral-300 ">
                        <Link2 strokeWidth={1.3} className="-rotate-45 size-4 mr-1 " />
                        <span>{cleanUrl(data?.website)}</span>
                    </div>
                )} */}
          <span className="text-sm font-medium tracking-tight md:text-base">
            Joined at{" "}
            {(data?.createdAt as Date)?.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>

          {data?.website && (
            <>
              <span className="mx-2">•</span>
              <Link
                target="_blank"
                href={data?.website}
                className="inline-flex tracking-tight items-center justify-start text-sm md:text-base font-medium hover:underline underline-offset-2 cursor-pointer"
              >
                <Link2 strokeWidth={1.3} className="-rotate-45 size-4 mr-1 " />
                <span>{cleanUrl(data?.website)}</span>
              </Link>
            </>
          )}
        </div>
        <div
          className={cn(
            "w-full  flex flex-col items-start justify-center mt-4 mb-4",
            bioContainerClassName,
          )}
        >
          <div className="profile-Bio flex flex-col items-start text-sm md:text-base gap-y-0.5 text-neutral-800 dark:text-neutral-300  leading-tight">
            {(data?.bio || defaultBio)?.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </div>
        </div>
        {data?.skills!?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {data?.skills.slice(0, 10).map((skill) => (
              <Button key={skill.id} variant="outline" size="sm">
                {skill?.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
