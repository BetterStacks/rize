import { GetProfileByUsername } from "@/lib/types";
import { classifyText, cleanUrl, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link2 } from "lucide-react";
import UserAvatar from "../user-avatar";
import Link from "next/link";

type ProfileProps = {
  data: GetProfileByUsername;
  isLoading: boolean;
  isMine: boolean;
};

export const defaultBio = `I’m still setting up, but this is where it all starts 🌱.\n
A place to share what I do, what I love, and where I’m headed.It’s quiet for now, but trust me—it won’t stay that way for long.`;

const Profile = ({ data, isMine, isLoading }: ProfileProps) => {
  const bio = classifyText(data?.bio || defaultBio);
  return (
    <div className=" w-full flex flex-col items-center justify-start   mb-2">
      <div className=" max-w-2xl w-full flex flex-col items-start justify-start">
        <div className="mb-6 user-avatar  self-start">
          <UserAvatar
            isMyProfile={isMine}
            isLoading={isLoading}
            data={{
              image: data?.profileImage as string,
              name: data?.displayName as string,
            }}
          />
        </div>
        <h1 className="  profile-displayName self-start text-xl font-medium md:text-xl lg:text-2xl    tracking-tight">
          {" "}
          {data?.displayName || data?.name}
        </h1>
        {/* 
        {data?.website && (
          <div className="inline-flex items-center bg-dark-border px-3 py-1 rounded-3xl justify-start mt-4 text-xs md:text-sm font-medium text-neutral-600 dark:text-neutral-300">
            <Link2 strokeWidth={1.3} className="-rotate-45 size-4 mr-1 " />
            <span>{cleanUrl(data?.website)}</span>
          </div>
        )} */}
        <div className="w-full  flex flex-col items-start justify-center mt-4 mb-4">
          <div className="profile-Bio flex flex-col items-start text-sm md:text-base  gap-y-0.5 text-neutral-800 dark:text-neutral-300  leading-tight   ">
            {(data?.bio || defaultBio)?.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

{
  /* {bio.map((token, i) => {
  switch (token.type) {
    case "email":
      return (
        <Link key={i} href={`mailto:${token.value}`}>
          <span className="text-blue-500   mr-1">
            {token.value}{" "}
          </span>
        </Link>
      );
    case "link":
      return (
        <Link
          key={i}
          href={
            token.value.startsWith("http")
              ? token.value
              : `https://${token.value}`
          }
          className="mr-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span
            key={i}
            className="bg-neutral-200/60 dark:bg-dark-border scale-95  flex text-sm font-medium items-center justify-center rounded-xl px-2 py-1 "
          >
            <Link2
              className="-rotate-45 font-medium size-4 mr-1"
              strokeWidth={1.4}
            />
            {cleanUrl(token?.value)}
          </span>{" "}
        </Link>
      );
    case "newline":
      return <span key={i} className="w-full " />;
    case "word":
    default:
      return (
        <span key={i} className="mr-1">
          {token.value}{" "}
        </span>
      );
  }
})}{" "} */
}
