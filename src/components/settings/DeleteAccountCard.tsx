'use client'

import { deleteMyAccount } from '@/actions/account-actions'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signOut } from '@/lib/auth-client'
import { useState } from 'react'

// confirmValue is the username, or the email for accounts without a profile.
export function DeleteAccountCard({ confirmValue }: { confirmValue: string }) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const matches = typed.trim().toLowerCase() === confirmValue.toLowerCase()

  const onDelete = async () => {
    setPending(true)
    setError(null)
    try {
      const result = await deleteMyAccount(typed)
      if (!result.success) {
        setError(result.error)
        setPending(false)
        return
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setPending(false)
      return
    }
    // The session is already gone on the server; this clears the cookie.
    try {
      await signOut()
    } catch {
      // ignore
    }
    window.location.assign('/')
  }

  // The section around this (settings page) gives the title and warning; this
  // is only the quiet trigger and the confirmation.
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return
        setOpen(next)
        if (!next) {
          setTyped('')
          setError(null)
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-danger hover:text-danger">
          Delete account…
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                This deletes your profile, posts, writings, projects, gallery, experience and
                education, plus your calls, recordings, transcripts and drafts. Comments and
                bookmarks on your posts go too.
              </p>
              <p>It can't be undone.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <label htmlFor="delete-account-confirm" className="text-sm text-ink-secondary">
            Type <span className="font-medium text-ink">{confirmValue}</span> to confirm
          </label>
          <Input
            id="delete-account-confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={pending}
          />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={onDelete} disabled={!matches || pending}>
            {pending ? 'Deleting…' : 'Delete account'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
