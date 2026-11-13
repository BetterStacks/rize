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
  /** Optional tags under the bio (discover by skill). */
  skills?: Array<{ id: string; name: string }>;
  /** The skill being browsed, shown first and in ink. */
  activeSkillId?: string;
};

const ProfileCard: FC<ProfileCardProps> = ({ profile, className, skills, activeSkillId }) => {
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
        "group flex h-full flex-col rounded-xl border p-4 transition-colors duration-fast ease-calm",
        "border-hairline bg-surface hover:border-ink/20",
        "outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground",
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
          <p className="truncate font-instrument text-xl leading-tight text-ink">
            {name}
          </p>
          <p className="truncate text-[13px] text-ink-secondary">
            @{profile.username}
          </p>
        </div>
      </div>

      {/* One line of their own words; the empty line keeps the grid even. */}
      <p className="mt-3 line-clamp-1 min-h-5 text-sm text-ink/80">
        {line}
      </p>

      {skills && skills.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Skills">
          {[...skills]
            .sort((a, b) => Number(b.id === activeSkillId) - Number(a.id === activeSkillId))
            .slice(0, 4)
            .map((skill) => (
              <li
                key={skill.id}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs",
                  skill.id === activeSkillId
                    ? "border-ink/30 text-ink"
                    : "border-hairline text-ink-secondary",
                )}
              >
                {skill.name}
              </li>
            ))}
          {skills.length > 4 && (
            <li className="px-1 py-0.5 text-xs text-ink-secondary">
              +{skills.length - 4}
            </li>
          )}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[13px] text-ink-secondary">
        <span className="flex min-w-0 items-center gap-1">
          {profile.location ? (
            <>
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{profile.location}</span>
            </>
          ) : null}
        </span>
        <span className="shrink-0 rounded-full border border-hairline px-3 py-1 font-medium text-ink transition-colors duration-fast ease-calm group-hover:border-ink">
          {isOwnProfile ? "Edit profile" : "View profile"}
        </span>
      </div>
    </Link>
  );
};

export default ProfileCard;
