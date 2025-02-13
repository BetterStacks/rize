"use client";
import { useSections } from "@/lib/context";

const UserProfile = () => {
  const { sections } = useSections();
  return (
    <div className="w-full flex flex-col">
      {sections.map((section) => (
        <div
          key={section?.id}
          className="border-t border-neutral-200 mb-2  flex flex-col items-center justify-center p-4"
        >
          <h2 className="w-full max-w-4xl text-2xl font-semibold">
            {section?.name}
          </h2>
          <div className="max-w-4xl w-full flex flex-col">
            {section?.component}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserProfile;
