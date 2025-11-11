'use client'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import EmailVerificationModal from './email-verification-modal'
import { Button } from '../ui/button'
import OrganizationFormModal from './organization-form-modal'
import { useQuery } from '@tanstack/react-query'
import { getOrganizationsByUsername } from '@/actions/organization-actions'
import Image from 'next/image'
import Link from 'next/link'
import { OrganizationActions } from './organization-actions-modal'

type OrganizationSectionProps = {
    isMine: boolean
    isEmailVerified: boolean
    userEmail: string
    username: string
}

const OrganizationSection = ({ isMine, isEmailVerified, userEmail, username }: OrganizationSectionProps) => {
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editData, setEditData] = useState<any>(null)

    const { data: organizations = [] } = useQuery({
        queryKey: ['organizations', username],
        queryFn: () => getOrganizationsByUsername(username),
    })

    const handleCreateClick = () => {
        if (!isEmailVerified) {
            setShowVerificationModal(true)
            return
        }
        setShowCreateModal(true)
    }

    return (
        <div className="w-full max-w-2xl mt-4 relative">
            <div className="border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-3">
                {organizations.length === 0 && (
                    <p className="text-neutral-600 dark:text-neutral-400">
                        {isMine ? '' : 'No organizations yet'}
                    </p>
                )}
                    
                <div className="flex flex-wrap gap-2">
                    {isMine && (
                        <Button
                            onClick={handleCreateClick}
                            className="text-sm font-normal inline-flex items-center gap-2 whitespace-nowrap"
                        >
                            <Plus size={16} />
                            Add Organization
                        </Button>
                    )}
    
                    {organizations.map((org) => (
                        <div key={org.id} className="relative group">
                            <Link 
                                href={`/${username}/${org.slug}`}
                                className="flex items-center gap-3 px-5 py-[10px] dark:bg-neutral-700 bg-slate-100 hover:bg-slate-200 hover:dark:bg-neutral-600 rounded-2xl transition whitespace-nowrap"
                                target='blank'
                            >
                                <Image 
                                    src={org.logo?.url || ''} 
                                    alt={org.name} 
                                    width={20} 
                                    height={20} 
                                    className="rounded-md"
                                />
                                <span className="font-normal text-sm">{org.name}</span>
                            </Link>

                            {isMine && (
                                <OrganizationActions 
                                    orgId={org.id} 
                                    username={username} 
                                    onEdit={() => {
                                        setEditData(org)
                                        setShowCreateModal(true)
                                    }} 
                                />
                            )}
                        </div>
                    ))}
                </div>

            </div>

            <EmailVerificationModal 
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                userEmail={userEmail}
            />

            <OrganizationFormModal 
                isOpen={showCreateModal}
                editData={editData}
                onClose={() => {
                    setShowCreateModal(false)
                    setEditData(null)
                }}
                username={username}
            />

        </div>
    )
}

export default OrganizationSection
