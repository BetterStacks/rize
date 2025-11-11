'use client'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { deleteOrganization } from '@/actions/organization-actions'
import { toast } from 'sonner'
import { queryClient } from '@/lib/providers'
import { useRouter } from 'next/navigation'

export function OrganizationActions({ orgId, username, onEdit }: { orgId: string, username: string, onEdit: () => void }) {
    const [showDelete, setShowDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setDeleting(true)
        const result = await deleteOrganization(orgId)
        if (result.success) {
            toast.success('Deleted!')
            queryClient.invalidateQueries({ queryKey: ['organizations', username] })
            router.push(`/${username}`)
        } else {
            toast.error(result.error)
        }
        setDeleting(false)
    }

    return (
        <>
            <div className="absolute top-1.5 right-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={onEdit} className="p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                    <Edit size={12} />
                </button>
                <button onClick={() => setShowDelete(true)} className="p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-red-500">
                    <Trash2 size={12} />
                </button>
            </div>

            <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Organization?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}