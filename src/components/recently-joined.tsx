import { getRecentlyJoinedProfiles } from "@/actions/profile-actions";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { use } from "react";
import { Separator } from "./ui/separator";
import Link from "next/link";

const RecentlyJoined = () => {
  const profiles = use(getRecentlyJoinedProfiles());
  return (
    <>
      <div className="w-full flex flex-col mt-10 pb-8 px-6">
        <h3 className="dark:text-neutral-300 text-neutral-800 font-medium mb-4 tracking-tight">
          Recently{" "}
          <span className="dark:text-neutral-500 text-neutral-600">Joined</span>
        </h3>
        <div className="flex flex-col items-start gap-y-1">
          {profiles?.map((profile) => (
            <Link
              key={profile.username}
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <div className="flex items-center  w-full  ">
                <div className={cn(" flex flex-col items-start ", "")}>
                  <h2
                    className={cn(
                      " tracking-tight  dark:text-neutral-400 text-neutral-600 "
                    )}
                  >
                    {profile?.displayName}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Separator className="w-full h-[0.5px] " />
    </>
    // <Card className="h-fit rounded-3xl w-full border bg-white mt-10 shadow-xl dark:bg-dark-bg  p-0">
    //   <CardHeader className="mb-2 px-4 py-4">
    //     <CardTitle className="text font-medium tracking-tight">
    //       Recently Joined
    //     </CardTitle>
    //   </CardHeader>
    //   <CardContent className="p-0 space-y-2 mb-8 ">
    //     {profiles?.map((profile) => (
    //       <div
    //         className="flex items-center  w-full px-4  "
    //         key={profile.username}
    //       >
    //         {/* <div className="size-8 border rounded-full border-neutral-300 dark:border-dark-border aspect-square flex  relative overflow-hidden">
    //           <Image
    //             style={{ objectFit: "cover" }}
    //             src={
    //               profile.profileImage || profile.image || "/default-avatar.png"
    //             }
    //             alt={profile.name || profile.displayName || "User Avatar"}
    //             fill
    //           />
    //         </div> */}
    //         <div className={cn(" flex flex-col items-start ", "ml-2")}>
    //           <h2 className={cn(" dark:text-neutral-200 font-medium text-sm")}>
    //             {profile?.displayName}
    //           </h2>
    //         </div>
    //       </div>
    //     ))}
    //   </CardContent>
    // </Card>
  );
};

export default RecentlyJoined;

{
  /* <div className="size-7 border rounded-full border-neutral-300 dark:border-dark-border aspect-square flex  relative overflow-hidden">
  <Image
    style={{ objectFit: "cover" }}
    src={
      profile.profileImage ||
      profile.image ||
      "/default-avatar.png"
    }
    alt={profile.name || profile.displayName || "User Avatar"}
    fill
  />
</div> */
}
