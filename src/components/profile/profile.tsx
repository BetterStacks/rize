"use client";

import { useActiveSidebarTab } from "@/lib/context";
import { GetProfileByUsername } from "@/lib/types";
import { safeHref } from "@/lib/safe-href";
import { cleanUrl, cn } from "@/lib/utils";
import { CalendarDays, Link2, MapPin, Pencil } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import UserAvatar from "../user-avatar";
import { ink, inkSecondary } from "./profile-section";
import QRcode from "./QRcode";

type ProfileProps = {
  data: GetProfileByUsername;
  isLoading?: boolean;
  isMine: boolean;
  bioContainerClassName?: string;
  username?: string;
  /** One line under the name, e.g. the current role. */
  tagline?: string | null;
  /** Rendered under the meta line: social links, owner checklist. */
  children?: ReactNode;
};


const Profile = ({
  data,
  isMine,
  bioContainerClassName,
  username,
  tagline,
  children,
}: ProfileProps) => {
  const [, setActiveSidebarTab] = useActiveSidebarTab();
  const name = data?.displayName || data?.name || username || "";
  const joined = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
    : null;
  const website = safeHref(data?.website);
  const openEditProfile = () =>
    setActiveSidebarTab({ id: null, tab: "edit-profile" });

  return (
    <header className="mx-auto flex w-full max-w-2xl flex-col items-start pb-8">
      <div className="mb-5 flex w-full items-start justify-between gap-4">
        <UserAvatar
          isMyProfile={isMine}
          data={{
            image: data?.profileImage as string,
            name,
          }}
          size={88}
        />
        <div className="flex items-center gap-1">
          <QRcode
            username={username}
            profileImage={data?.profileImage as string}
            name={name}
          />
          {isMine && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openEditProfile}
              className={cn("h-11 gap-1.5 rounded-lg px-3 text-sm font-medium", inkSecondary, "hover:text-[#1F1B16] dark:hover:text-[#F4F4F5]")}
            >
              <Pencil className="size-3.5" aria-hidden />
              Edit profile
            </Button>
          )}
        </div>
      </div>

      <h1 className={cn("profile-displayName font-instrument text-[40px] leading-[1.05] tracking-normal sm:text-5xl", ink)}>
        {name}
      </h1>
      {tagline && (
        <p className={cn("mt-1.5 text-base", inkSecondary)}>{tagline}</p>
      )}

      <div className={cn("mt-4 w-full", bioContainerClassName)}>
        {data?.bio ? (
          <p className={cn("profile-Bio max-w-[60ch] whitespace-pre-line text-base leading-relaxed", ink)}>
            {data.bio}
          </p>
        ) : isMine ? (
          <button
            type="button"
            onClick={openEditProfile}
            className={cn(
              "min-h-11 text-left text-base underline decoration-main-yellow decoration-2 underline-offset-4",
              inkSecondary,
            )}
          >
            Add a line or two about yourself
          </button>
        ) : null}
      </div>

      <ul className={cn("mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm", inkSecondary)}>
        {data?.location && (
          <li className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            {data.location}
          </li>
        )}
        {joined && (
          <li className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden />
            Joined {joined}
          </li>
        )}
        {website && (
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer me"
              href={website}
              className="inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:text-[#1F1B16] hover:underline dark:hover:text-[#F4F4F5] sm:min-h-0"
            >
              <Link2 className="size-3.5 -rotate-45" aria-hidden />
              {cleanUrl(website)}
            </a>
          </li>
        )}
      </ul>

      {(data?.skills?.length ?? 0) > 0 && (
        <ul className="mt-4 flex flex-wrap items-center gap-1.5" aria-label="Skills">
          {data?.skills.slice(0, 10).map((skill) => (
            <li
              key={skill.id}
              className={cn(
                "rounded-md bg-[#F4F1EA] px-2 py-0.5 text-sm dark:bg-[#1A1A1D]",
                ink,
              )}
            >
              {skill?.name}
            </li>
          ))}
        </ul>
      )}

      {children && <div className="mt-5 flex w-full flex-col gap-4">{children}</div>}
    </header>
  );
};

export default Profile;
