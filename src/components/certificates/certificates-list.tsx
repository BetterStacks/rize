'use client'

import { deleteCertificate, getAllCertificates } from '@/actions/certificate-actions'
import { useActiveSidebarTab } from '@/lib/context'
import { TCertificate } from '@/lib/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from '../ui/button'
import CertificateCard from './certificate-card'
import CertificateDrawer from './certificate-drawer'
import { EmptyLine, ProfileSection, SectionNewButton } from '../profile/profile-section'
import { PROFILE_STALE_TIME } from '@/lib/profile-query'

type CertificatesListProps = {
    certificates: TCertificate[]
    isMine?: boolean
}

export default function CertificatesList({ certificates, isMine = false }: CertificatesListProps) {
    const [, setActiveTab] = useActiveSidebarTab()
    const [isDownloading, setIsDownloading] = useState(false)
    const queryClient = useQueryClient()
    const params = useParams<{ username: string }>()


    const { data: certificatesData = [] } = useQuery({
        queryKey: ['get-certificates', params.username],
        queryFn: () => getAllCertificates(params.username!),
        initialData: certificates,
        enabled: !!params.username,
        staleTime: PROFILE_STALE_TIME,
        refetchOnWindowFocus: false,
    })
    const deleteMutation = useMutation({
        mutationFn: deleteCertificate,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['get-certificates', params.username],
            })
            toast.success('Certificate deleted successfully!')
        },
        onError: (error) => {
            toast.error('Failed to delete certificate')
            console.error('Error deleting certificate:', error)
        }
    })

    if (!isMine && certificatesData.length === 0) {
        return null
    }

    const handleEdit = (certificate: TCertificate) => {
        setActiveTab({ id: certificate.id, tab: 'certificates' })
    }

    const handleAdd = () => {
        setActiveTab({ id: null, tab: 'certificates' })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this certificate?')) {
            return
        }
        deleteMutation.mutate(id)
    }

    const handleDownloadAll = async () => {
        if (certificatesData.length === 0) return

        setIsDownloading(true)
        try {
            const JSZip = (await import('jszip')).default
            const zip = new JSZip()

            // Download all PDFs and add to zip
            for (const cert of certificatesData) {
                if (cert.fileUrl) {
                    try {
                        const response = await fetch(cert.fileUrl)
                        const blob = await response.blob()
                        const fileName = `${cert.name.replace(/[^a-z0-9]/gi, '_')}.pdf`
                        zip.file(fileName, blob)
                    } catch (error) {
                        console.error(`Failed to download ${cert.name}:`, error)
                    }
                }
            }

            // Generate zip and trigger download
            const content = await zip.generateAsync({ type: 'blob' })
            const url = window.URL.createObjectURL(content)
            const link = document.createElement('a')
            link.href = url
            link.download = 'certificates.zip'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success('All certificates downloaded!')
        } catch (error) {
            console.error('Download error:', error)
            toast.error('Failed to download certificates')
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <ProfileSection
            id="certificates"
            title="Certifications"
            actions={
                <>
                    {certificatesData.length > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleDownloadAll}
                            disabled={isDownloading}
                            className="h-11 gap-1.5 rounded-lg px-3 text-sm font-medium text-[#5A5248] dark:text-[#B3A999]"
                        >
                            <Download className="size-4" aria-hidden />
                            {isDownloading ? 'Downloading…' : 'Download all'}
                        </Button>
                    )}
                    {isMine && <SectionNewButton onClick={handleAdd} what="certificate" />}
                </>
            }
        >
            {certificatesData.length === 0 ? (
                <EmptyLine text="No certificates yet" actionLabel="Add a certificate" onAction={handleAdd} />
            ) : (
                <div className="flex flex-col gap-3">
                    {certificatesData.map((certificate) => (
                        <CertificateCard
                            key={certificate.id}
                            certificate={certificate}
                            isMine={isMine}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {isMine && <CertificateDrawer />}
        </ProfileSection>
    )
}
