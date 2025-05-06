import { GetProfileByUsername } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import SocialLinks from "./social-links";
import UserAvatar from "../user-avatar";

type ProfileProps = {
  data: GetProfileByUsername;
  isLoading: boolean;
  isMine: boolean;
};

const defaultBio = `I’m still setting up, but this is where it all starts 🌱.\n
A place to share what I do, what I love, and where I’m headed.It’s quiet for now, but trust me—it won’t stay that way for long.`;

const Profile = ({ data, isMine, isLoading }: ProfileProps) => {
  return (
    <div className=" w-full flex flex-col items-center justify-start   mb-2">
      <div className=" max-w-2xl mb-4 w-full flex flex-col items-center justify-start">
        <div className="mb-6 self-start">
          <UserAvatar
            isMyProfile={isMine}
            isLoading={isLoading}
            data={{
              image: data?.profileImage as string,
              name: data?.displayName as string,
            }}
          />
        </div>
        <h1 className=" font-serif self-start text-4xl md:text-5xl  font-medium tracking-tight">
          {" "}
          {data?.displayName || data?.name}
        </h1>
        <motion.div className="w-full flex flex-col items-start justify-center mt-6">
          <div className="dark:opacity-80 gap-y-2  opacity-80 leading-tight  flex flex-col ">
            {data?.bio
              ? data?.bio?.split("\n").map((line, i) => {
                  return (
                    <span className={cn("")} key={i}>
                      {line} <br className="" />
                    </span>
                  );
                })
              : defaultBio?.split("\n").map((line, i) => {
                  return (
                    <span className={cn("")} key={i}>
                      {line} <br className="" />
                    </span>
                  );
                })}{" "}
          </div>
        </motion.div>
        <SocialLinks />
      </div>
    </div>
  );
};

export default Profile;
