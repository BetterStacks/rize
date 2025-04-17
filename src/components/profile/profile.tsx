import { GetProfileByUsername } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import SocialLinks from "./social-links";

type ProfileProps = {
  data: GetProfileByUsername;
  isLoading: boolean;
  isMine: boolean;
};

const Profile = ({ data }: ProfileProps) => {
  return (
    <div className=" w-full flex flex-col items-center justify-start   mb-2">
      <div className=" max-w-2xl mb-4 w-full flex flex-col items-center justify-start">
        <h1 className=" font-serif self-start text-4xl md:text-5xl  font-medium tracking-tight">
          {" "}
          {data?.displayName || data?.name}
        </h1>
        <motion.div className="w-full flex flex-col items-start justify-center mt-6">
          <div className="dark:opacity-80 gap-y-2 text-base opacity-80 leading-tight  flex flex-col ">
            {data?.bio?.split("\n").map((line, i) => {
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
