import { ProfileForm } from "@/components/settings/ProfileForm";
import { ResumeForm } from "@/components/settings/ResumeForm";

const Page = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="space-y-8 max-w-3xl py-20 rounded-3xl w-full flex flex-col items-center justify-center">
        <ProfileForm />
        <ResumeForm />
      </div>
    </div>
  );
};

export default Page;
