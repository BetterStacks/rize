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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { signOut } from '@/lib/auth-client'
import { Trash2 } from 'lucide-react'
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Delete account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and everything in it. This can't be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <Button variant="destructive" className="w-full">
              Delete account
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
              <label htmlFor="delete-account-confirm" className="text-sm">
                Type <span className="font-medium">{confirmValue}</span> to confirm
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
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={onDelete} disabled={!matches || pending}>
                {pending ? 'Deleting…' : 'Delete account'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
