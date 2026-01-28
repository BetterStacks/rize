import { Button } from '@/components/ui/button'

export function FinishStep({
  formData,
  onComplete,
}: {
  formData: any;
  onComplete: (redirectToAi?: boolean) => void;
}) {
  return (
    <div className="p-8 text-center">
      <div className="mb-8">
        {/* <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={formData.avatar} />
          <AvatarFallback>{formData.username[0]}</AvatarFallback>
        </Avatar> */}
        <h2 className="text-5xl flex flex-col font-instrument font-semibold mb-4">
          You&apos;re all set,
          <span className="italic ml-1">{formData.username}! 🎉</span>
        </h2>
      </div>
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          Your profile is looking amazing! Ready to start connecting?
        </p>
        {formData.resumeData && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              📄 We'll import your resume data including{' '}
              {formData.resumeData.experience?.length || 0} work experiences and{' '}
              {formData.resumeData.education?.length || 0} education entries.
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Button variant={'default'} onClick={() => onComplete()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all group">
            Let&apos;s Go! 🚀
          </Button>
        </div>
      </div>
    </div>
  )
}
