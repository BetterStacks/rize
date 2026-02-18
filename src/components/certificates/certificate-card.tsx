'use client'

import { TCertificate } from '@/lib/types'
import { Award, Calendar, Edit2, ExternalLink, FileText, MoreHorizontal, Shield, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'

type CertificateCardProps = {
    certificate: TCertificate
    onEdit?: (certificate: TCertificate) => void
    onDelete?: (id: string) => void
    isMine?: boolean
}

export default function CertificateCard({
    certificate,
    onEdit,
    onDelete,
    isMine = false,
}: CertificateCardProps) {
    const isExpired = certificate.expiryDate && new Date(certificate.expiryDate) < new Date()

    return (
        <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                            {certificate.name}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            {certificate.issuer}
                        </p>
                    </div>
                </div>

                {isMine && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="absolute right-4 top-4 ">
                            <Button variant={"outline"} size={"smallIcon"}>
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="mt-2 dark:bg-dark-bg dark:border-dark-border border-neutral-200/80 rounded-xl">
                            <DropdownMenuItem onClick={(e) => {
                                onEdit?.(certificate)

                            }}>
                                <Edit2 className="size-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="stroke-red-500 text-red-500" onClick={(e) => {
                                onDelete?.(certificate.id);
                            }}>
                                <Trash2 className="size-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Description */}
            {certificate.description && (
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4 line-clamp-2">
                    {certificate.description}
                </p>
            )}

            {/* Dates */}
            <div className="flex flex-wrap gap-4 mb-4 text-xs text-neutral-600 dark:text-neutral-400">
                {certificate.issueDate && (
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Issued: {format(new Date(certificate.issueDate), 'MMM yyyy')}</span>
                    </div>
                )}
                {certificate.expiryDate && (
                    <div className={`flex items-center gap-1.5 ${isExpired ? 'text-red-600 dark:text-red-400' : ''}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            {isExpired ? 'Expired: ' : 'Expires: '}
                            {format(new Date(certificate.expiryDate), 'MMM yyyy')}
                        </span>
                    </div>
                )}
            </div>

            {/* Credential ID */}
            {certificate.credentialId && (
                <div className="mb-4 text-xs">
                    <span className="text-neutral-500 dark:text-neutral-500">Credential ID: </span>
                    <span className="font-mono text-neutral-700 dark:text-neutral-300">
                        {certificate.credentialId}
                    </span>
                </div>
            )}

            {/* Action Links */}
            <div className="flex flex-wrap gap-2">
                {certificate.credentialUrl && (
                    <a
                        href={certificate.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Verify Certificate
                    </a>
                )}
                {certificate.fileUrl && (
                    <a
                        href={certificate.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        View Certificate
                    </a>
                )}
            </div>

            {/* Expired Badge */}
            {isExpired && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded">
                    Expired
                </div>
            )}
        </div>
    )
}
