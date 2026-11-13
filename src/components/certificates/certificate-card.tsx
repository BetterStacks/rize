'use client'

import { TCertificate } from '@/lib/types'
import { safeHref } from '@/lib/safe-href'
import { cn } from '@/lib/utils'
import { ExternalLink, FileText } from 'lucide-react'
import { hairline, ink, inkSecondary } from '../profile/profile-section'
import { OwnerItemMenu } from '../profile/timeline-item'

type CertificateCardProps = {
    certificate: TCertificate
    onEdit?: (certificate: TCertificate) => void
    onDelete?: (id: string) => void
    isMine?: boolean
}

const isHttpUrl = (url?: string | null) => !!url && /^(https?:\/\/|\/[^/])/i.test(url)

const linkClass = cn(
    'inline-flex min-h-11 items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline sm:min-h-0',
    ink,
)

export default function CertificateCard({
    certificate,
    onEdit,
    onDelete,
    isMine = false,
}: CertificateCardProps) {
    const isExpired = certificate.expiryDate && new Date(certificate.expiryDate) < new Date()
    const issued = certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : null
    const expiry = certificate.expiryDate ? new Date(certificate.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : null

    return (
        <div className={cn('grid grid-cols-[1fr_auto] gap-x-4 border-b pb-4 last:border-b-0 last:pb-0', hairline)}>
            <div className="min-w-0">
                <h3 className={cn('text-[15px] font-medium leading-snug', ink)}>{certificate.name}</h3>
                {certificate.issuer && (
                    <p className={cn('text-[15px] leading-snug', inkSecondary)}>{certificate.issuer}</p>
                )}
                <p className={cn('mt-1 text-sm tabular-nums', inkSecondary)}>
                    {[
                        issued && `Issued ${issued}`,
                        expiry && `${isExpired ? 'Expired' : 'Expires'} ${expiry}`,
                        certificate.credentialId && `ID ${certificate.credentialId}`,
                    ]
                        .filter(Boolean)
                        .join(' · ')}
                </p>
                {certificate.description && (
                    <p className={cn('mt-2 line-clamp-2 text-sm leading-relaxed', inkSecondary)}>
                        {certificate.description}
                    </p>
                )}
                <div className="mt-2 flex flex-wrap gap-x-4">
                    {safeHref(certificate.credentialUrl) && (
                        <a href={safeHref(certificate.credentialUrl)!} target="_blank" rel="noopener noreferrer" className={linkClass}>
                            <ExternalLink className="size-3.5" aria-hidden />
                            Verify
                        </a>
                    )}
                    {isHttpUrl(certificate.fileUrl) && (
                        <a href={certificate.fileUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                            <FileText className="size-3.5" aria-hidden />
                            View certificate
                        </a>
                    )}
                </div>
            </div>

            {isMine && (
                <OwnerItemMenu
                    label={certificate.name}
                    onEdit={() => onEdit?.(certificate)}
                    onDelete={() => onDelete?.(certificate.id)}
                />
            )}
        </div>
    )
}
