import Login from "@/components/form/login";

const Page = () => {
  return (
    <div className="w-full h-screen relative flex items-center justify-center px-4">
      {/* <div className="size-[600px] -z-10 absolute rounded-full bg-gradient-to-t blur-[100px] from-indigo-600 via-orange-500 to-transparent" /> */}
      <div className="flex max-w-sm w-full flex-col ">
        <Login />
      </div>
    </div>
  );
};

export default Page;
