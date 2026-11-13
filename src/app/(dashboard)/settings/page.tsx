import { getServerSession } from '@/lib/auth'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { StoryElementsForm } from '@/components/settings/StoryElementsForm'
import { ResumeForm } from '@/components/settings/ResumeForm'
import { DeleteAccountCard } from '@/components/settings/DeleteAccountCard'
import { SettingsHeader, SettingsLink, SettingsSection } from '@/components/settings/settings-section'
import { redirect } from 'next/navigation'
import { BarChart3, PhoneCall } from 'lucide-react'

const Page = async () => {
	const session = await getServerSession()

	if (!session?.user) {
		redirect('/login')
	}

	const confirmValue = session.user.username || session.user.email

	return (
		<>
			<SettingsHeader
				title="Settings"
				description="Your profile details, story and resume, and your account."
				back={
					session.user.username
						? { href: `/${session.user.username}`, label: 'Back to profile' }
						: { href: '/explore', label: 'Back to explore' }
				}
			/>

			<ul className="border-t border-hairline" aria-label="More settings">
				<SettingsLink
					href="/settings/voice"
					icon={PhoneCall}
					title="Voice journal"
					description="Rize calls you about your week and keeps it in your private journal."
				/>
				<SettingsLink
					href="/settings/analytics"
					icon={BarChart3}
					title="Stats"
					description="Views on your profile, and likes, comments and saves on your posts."
				/>
			</ul>

			<SettingsSection
				id="profile"
				title="Profile"
				description="What people see at the top of your profile."
				className="mt-10"
			>
				<ProfileForm bare />
			</SettingsSection>

			<SettingsSection
				id="story"
				title="Story"
				description="What drives you, beyond your resume."
			>
				<StoryElementsForm />
			</SettingsSection>

			<SettingsSection
				id="resume"
				title="Resume"
				description="Upload a resume to fill in your experience, education, skills and projects. You pick what gets added."
			>
				<ResumeForm bare />
			</SettingsSection>

			{confirmValue && (
				<SettingsSection
					id="delete-account"
					title="Delete account"
					description="Permanently delete your account and everything in it. This can't be undone."
					className="mt-16"
				>
					<DeleteAccountCard confirmValue={confirmValue} />
				</SettingsSection>
			)}
		</>
	)
}

export default Page
