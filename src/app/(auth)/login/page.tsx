import Login from "@/components/form/login";
import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex max-w-xs w-full flex-col">
        <Login />
        <div className="w-full mt-4 flex items-center justify-center">
          <span className="text-sm w-full text-center font-medium opacity-80">
            {" "}
            Dont have a profile yet? <Link href={"/signup"}>Create One</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Page;
