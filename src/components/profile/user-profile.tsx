"use client";
import Writings from "../writings/writings";
import Gallery from "./gallery";
import Profile from "./profile";

const UserProfile = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start">
      <Profile />
      {/* <SocialLinks /> */}
      <Gallery />
      <Writings />
      {/* {sections.map((section) => (
        <div
          key={section?.id}
          className="border-t border-neutral-200 dark:border-dark-border mb-2  flex flex-col items-center justify-center p-4"
        >
          <h2 className="w-full max-w-4xl text-2xl font-semibold">
            {section?.name}
          </h2>
          <div className="max-w-4xl w-full flex flex-col">
            {section?.component}
          </div>
        </div>
      ))} */}
    </div>
  );
};

// function Writings() {
//   const { data } = useQuery({
//     queryKey: ["get-writings"],
//     queryFn: getAllPages,
//   });
//   return (
//     <div className="flex flex-col gap-y-2 items-center justify-start w-full">
//       {data?.map((writing, i) => {
//         return (
//           <Link key={i} href={`/page/${writing?.id}`}>
//             <div className="w-full rounded-xl">
//               <h3 className="line-clamp-1 truncate">{writing?.title}</h3>
//             </div>
//           </Link>
//         );
//       })}
//     </div>
//   );
// }
export default UserProfile;
