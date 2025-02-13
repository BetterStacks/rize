import SignUp from "@/components/form/signup";
import Link from "next/link";

const Page = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex max-w-xs w-full flex-col">
        <SignUp />
        <div className="w-full mt-4 flex items-center justify-center">
          <span className="text-sm w-full text-center font-medium opacity-80">
            Already have an Profile? <Link href={"/login"}>Login</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Page;
