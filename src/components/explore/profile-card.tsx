// Type definition based on getRecentlyJoinedProfiles return type
type RecentlyJoinedProfile = {
  displayName: string | null;
  username: string | null;
  profileImage: string | null;
  image: string | null;
  name: string | null;
  bio?: string;
  location?: string;
  website?: string;
  personalMission?: string;
};
import { cn } from "@/lib/utils";
import { User2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { Button } from "../ui/button";
import { useSession } from "@/lib/auth-client";
import { PostCardContainer } from "./post-interactions";

type ProfileCardProps = {
  profile: RecentlyJoinedProfile;
  className?: string;
};

const ProfileCard: FC<ProfileCardProps> = ({ profile, className }) => {
  const session = useSession();
  const isOwnProfile =
    (session?.data?.user as any)?.username === profile.username;

  const handleViewProfile = () => {
    // PostCardContainer handles the navigation
  };

  // Don't render if username is missing
  if (!profile.username) {
    return null;
  }
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  // normalize image src: next/image requires absolute URL or leading slash
  const rawSrc = profile.profileImage || profile.image || "";
  let normalizedSrc: string | null = null;
  if (rawSrc) {
    if (isValidUrl(rawSrc)) {
      normalizedSrc = rawSrc;
    } else {
      // ensure relative paths start with a leading slash
      normalizedSrc = rawSrc.startsWith("/") ? rawSrc : `/${rawSrc}`;
    }
  }

  return (
    <PostCardContainer
      handlePostClick={() => window.open(`/${profile.username}`, "_blank")}
      className={cn(
        "group hover:shadow-md shadow transition-all duration-200",
        className
      )}
    >
      {/* Profile Content */}
      <div className="p-5">
        {/* Profile Image */}
        <div className="flex justify-center mb-4">
          <div className="size-16 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-700 ring-2 ring-neutral-200 dark:ring-neutral-600">
            {normalizedSrc ? (
              <Image
                src={normalizedSrc}
                alt={profile.displayName || profile.username || "User"}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User2 className="size-8 opacity-40" />
              </div>
            )}
          </div>
        </div>

        {/* Name and Username */}
        <div className="text-center mb-3">
          <Link href={`/${profile.username}`} target="_blank">
            <h3 className="font-semibold text-base text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {profile.displayName || profile.name || profile.username}
            </h3>
          </Link>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            @{profile.username}
          </p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-neutral-600 dark:text-neutral-300 text-center leading-relaxed mb-4 line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Key Details */}
        <div className="flex flex-col items-center gap-2 mb-4">
          {profile.location && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <MapPin className="size-3" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.personalMission && (
            <p className="text-xs text-neutral-600 dark:text-neutral-300 text-center line-clamp-1 italic">
              "{profile.personalMission}"
            </p>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/${profile.username}`} target="_blank" className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-9 rounded-full border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all duration-200 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {isOwnProfile ? "Edit Profile" : "View Profile"}
          </Button>
        </Link>
      </div>
    </PostCardContainer>
  );
};

export default ProfileCard;
