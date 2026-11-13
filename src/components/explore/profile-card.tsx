"use client";

import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import PersonAvatar from "./person-avatar";

// Fields shared by the explore lists (new faces, all profiles).
type RecentlyJoinedProfile = {
  displayName: string | null;
  username: string | null;
  profileImage: string | null;
  image: string | null;
  name: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  personalMission?: string | null;
};

type ProfileCardProps = {
  profile: RecentlyJoinedProfile;
  className?: string;
};

const ProfileCard: FC<ProfileCardProps> = ({ profile, className }) => {
  const session = useSession();
  const isOwnProfile =
    (session?.data?.user as { username?: string } | undefined)?.username ===
    profile.username;

  if (!profile.username) return null;

  const name = profile.displayName || profile.name || profile.username;
  const line = profile.bio || profile.personalMission;

  return (
    <Link
      href={`/${profile.username}`}
      className={cn(
        "group flex h-full flex-col rounded-xl border p-4 transition-colors duration-150 ease-out",
        "border-[#E7E2D8] bg-white hover:border-[#D3CCBE]",
        "dark:border-[#2E2923] dark:bg-[#1C1916] dark:hover:border-[#3D362E]",
        "outline-none focus-visible:ring-2 focus-visible:ring-main-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#141210]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <PersonAvatar
          src={profile.profileImage || profile.image}
          name={name}
          size={44}
        />
        <div className="min-w-0">
          <p className="truncate font-instrument text-xl leading-tight text-[#1F1B16] dark:text-[#F3EEE6]">
            {name}
          </p>
          <p className="truncate text-[13px] text-[#5A5248] dark:text-[#B3A999]">
            @{profile.username}
          </p>
        </div>
      </div>

      {/* One line of their own words; the empty line keeps the grid even. */}
      <p className="mt-3 line-clamp-1 min-h-5 text-sm text-[#3D372F] dark:text-[#D9D1C4]">
        {line}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[13px] text-[#5A5248] dark:text-[#B3A999]">
        <span className="flex min-w-0 items-center gap-1">
          {profile.location ? (
            <>
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{profile.location}</span>
            </>
          ) : null}
        </span>
        <span className="shrink-0 rounded-full border border-[#E7E2D8] px-3 py-1 font-medium text-[#1F1B16] transition-colors group-hover:border-[#1F1B16] dark:border-[#2E2923] dark:text-[#F3EEE6] dark:group-hover:border-[#F3EEE6]">
          {isOwnProfile ? "Edit profile" : "View profile"}
        </span>
      </div>
    </Link>
  );
};

export default ProfileCard;
