import SignUp from "@/components/form/signup";

const Page = () => {
  return (
    <div className="w-full h-screen flex items-center px-4 justify-center">
      <div className="flex max-w-sm w-full flex-col ">
        <SignUp />
      </div>
    </div>
  );
};

export default Page;
