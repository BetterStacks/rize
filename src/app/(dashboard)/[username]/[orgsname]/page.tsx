import { getOrganizationBySlug } from '@/actions/organization-actions'
import { notFound } from 'next/navigation'
import Image from 'next/image'

type Props = {
    params: { 
        username: string; 
        orgsname: string 
    }
}

const OrgsProfile = async ({ params }: Props) => {
    const org = await getOrganizationBySlug(params.username, params.orgsname)
    
    if (!org) notFound()

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-screen mb-20 sm:mb-0">
            {/* Hero Section */}
            <div className="flex flex-col sm:flex-row items-start max-w-3xl mx-auto gap-6 p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <Image 
                    src={org.logo?.url || ''} 
                    alt={org.name}
                    width={100}
                    height={100}
                    className="rounded-sm sm:rounded-2xl shadow-lg h-12 w-12 sm:h-20 sm:w-20"
                />
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold">{org.name}</h1>
                    <span className="inline-block mt-2 px-3 py-1 bg-purple-100 dark:bg-yellow-400 text-purple-700 dark:text-black rounded-full text-sm font-medium">
                        {org.type}
                    </span>
                    <p className="mt-4 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">{org.description}</p>
                </div>
            </div>
    
            {/* Contact Info Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <div className="max-w-sm p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Address</p>
                    <p className="mt-1 font-medium">{org.address}</p>
                </div>
                <div className="max-w-sm p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Email</p>
                    <a href={`mailto:${org.email}`} className="mt-1 font-medium text-blue-600 hover:underline block truncate">{org.email}</a>
                </div>
                <div className="max-w-sm p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Phone</p>
                    <a href={`tel:${org.phone}`} className="mt-1 font-medium text-blue-600 hover:underline block">{org.phone}</a>
                </div>
                <div className="max-w-sm p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Website</p>
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="mt-1 font-medium text-blue-600 hover:underline block truncate">{org.website}</a>
                </div>
                <div className="max-w-[376px] p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 sm:col-span-2">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Founded</p>
                    <p className="mt-1 font-medium">{org.foundedYear}</p>
                </div>
            </div>
        </div>
    )
}

export default OrgsProfile