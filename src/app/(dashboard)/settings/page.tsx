import { auth } from '@/lib/auth'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { StoryElementsForm } from '@/components/settings/StoryElementsForm'
import { ResumeForm } from '@/components/settings/ResumeForm'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const Page = async () => {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Back Button */}
      <div className="w-full max-w-3xl mb-6 pt-6">
        <Link 
          href={session.user.username ? `/${session.user.username}` : '/explore'}
          className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 h-8 px-3 text-xs rounded-2xl hover:bg-neutral-100 dark:hover:bg-dark-border/60 backdrop-blur-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {session.user.username ? 'Back to Profile' : 'Back to Explore'}
        </Link>
      </div>
      
      <div className="space-y-8 max-w-3xl py-12 rounded-3xl w-full flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your profile, story, and resume</p>
        </div>
        
        <ProfileForm />
        <StoryElementsForm />
        <ResumeForm />
      </div>
    </div>
  )
}

export default Page
