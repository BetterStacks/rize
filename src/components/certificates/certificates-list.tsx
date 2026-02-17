'use client'

import { deleteCertificate, getAllCertificates } from '@/actions/certificate-actions'
import { useActiveSidebarTab } from '@/lib/context'
import { TCertificate } from '@/lib/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Award, Download, Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import CertificateCard from './certificate-card'
import CertificateDrawer from './certificate-drawer'

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
        <div
            id="certificates"
            className="w-full my-12 px-2 md:px-4 flex flex-col items-center justify-start"
        >
            <div className="max-w-2xl w-full flex mb-2 md:mb-4 items-center justify-between">
                <h2 className="text-lg md:text-xl font-medium ">Certifications</h2>
                <div className="flex gap-2">
                    {certificatesData.length > 0 && (
                        <Button
                            className="rounded-lg scale-90 text-sm"
                            onClick={handleDownloadAll}
                            size={'sm'}
                            variant={'outline'}
                            disabled={isDownloading}
                        >
                            <Download className="opacity-80 mr-2 size-4" />
                            {isDownloading ? 'Downloading...' : 'Download All'}
                        </Button>
                    )}
                    {isMine && (
                        <Button
                            className="rounded-lg scale-90 text-sm"
                            onClick={handleAdd}
                            size={'sm'}
                            variant={'outline'}
                        >
                            <Plus className="opacity-80 mr-2 size-4" />
                            New Certificate
                        </Button>
                    )}
                </div>
            </div>

            <div className="w-full max-w-2xl mt-4 grid grid-cols-1 gap-6 ">
                {certificatesData.length === 0 ? (
                    <EmptyCertificatesState onCreateNew={handleAdd} />
                ) : (
                    certificatesData.map((certificate, i) => (
                        <motion.div key={certificate.id} custom={i}>
                            <CertificateCard
                                certificate={certificate}
                                isMine={isMine}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </motion.div>
                    ))
                )}
            </div>

            {isMine && <CertificateDrawer />}
        </div>
    )
}

interface EmptyCertificatesStateProps {
    title?: string
    description?: string
    ctaText?: string
    onCreateNew?: () => void
}

export function EmptyCertificatesState({
    title = 'Showcase Your Achievements',
    description = 'Your certifications demonstrate your expertise. Add them to highlight your professional accomplishments.',
    ctaText = 'Add Your First Certificate',
    onCreateNew = () => { },
}: EmptyCertificatesStateProps) {
    const [isHovering, setIsHovering] = useState(false)

    return (
        <div className="flex h-full min-h-[400px] border-2 border-neutral-300/60 dark:border-dark-border/80 rounded-3xl border-dashed w-full items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex max-w-md flex-col items-center text-center"
            >
                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20">
                    <motion.div
                        animate={{ rotate: isHovering ? 15 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                        <div className="relative">
                            <Award
                                className="size-6 text-yellow-500 dark:text-yellow-400"
                                strokeWidth={1.5}
                            />
                        </div>
                    </motion.div>
                </div>
                <h3 className="mb-2 md:text-xl font-medium tracking-tight">{title}</h3>
                <p className="mb-6 opacity-80 text-sm md:text-base leading-tight px-6">
                    {description}
                </p>
                <Button
                    size="sm"
                    className="gap-2 !bg-main-yellow text-black rounded-lg scale-90"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onClick={onCreateNew}
                >
                    <Plus className="h-4 w-4" />
                    {ctaText}
                </Button>
            </motion.div>
        </div>
    )
}
