import ProfileChat from '@/components/profile-builder/ProfileChat';
import { profile } from '@/db/schema';
import { getServerSession } from '@/lib/auth';
import db from '@/lib/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
// import { Navbar } from '@/components/navbar';

export default async function AIProfileBuilderPage() {
    const session = await getServerSession();
    if (!session?.user) {
        redirect('/login');
    }

    const userProfile = await db.query.profile.findFirst({
        where: eq(profile.userId, session.user.id),
    });

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-black">
            {/* <Navbar isMine={true} /> */}
            {/* <main className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-instrument font-bold text-neutral-900 dark:text-white">
                            Build your profile with AI
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
                            Answer a few questions and our AI will craft a professional, high-impact profile for you.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl opacity-50 -z-10" />
                        <ProfileChat initialData={userProfile as any} />
                    </div>

                    <div className="flex justify-center pt-8">
                        <a
                            href={userProfile?.username ? `/${userProfile.username}` : '/'}
                            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white transition-colors"
                        >
                            Skip for now and go to profile
                        </a>
                    </div>
                </div>
            </main> */}
        </div>
    );
}
