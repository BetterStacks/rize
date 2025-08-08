'use client'
import React, { FC } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { useAlertDialog } from '../dialog-provider'

type AuthGuardDialogProps = {
  title?: string;
  description?: string;
  onClose?: () => void;
  onContinue?: () => void;
};

const AuthGuardDialog: FC<AuthGuardDialogProps> = ({
  description,
  onClose,
  onContinue,
  title,
}) => {
  const [open, setOpen] = useAlertDialog()
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ||
              'You need to be signed in to perform this action. Please sign in or create an account to continue.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onContinue}>Continue</AlertDialogAction>
          <AlertDialogCancel
            onClick={() => {
              onClose!()
              setOpen(false)
            }}
          >
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AuthGuardDialog
