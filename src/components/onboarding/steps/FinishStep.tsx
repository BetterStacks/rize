import { Button } from "@/components/ui/button";

export function FinishStep({
  formData,
  onComplete,
}: {
  formData: any;
  onComplete: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <div className="mb-8">
        {/* <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={formData.avatar} />
          <AvatarFallback>{formData.username[0]}</AvatarFallback>
        </Avatar> */}
        <h2 className="text-5xl flex flex-col font-instrument font-semibold mb-4">
          You're all set,
          <span className="italic ml-1">{formData.username}! 🎉</span>
        </h2>
      </div>
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          Your profile is looking amazing! Ready to start connecting?
        </p>
        <Button variant={"secondary"} onClick={onComplete} className="w-full">
          Let's Go! 🚀
        </Button>
      </div>
    </div>
  );
}
