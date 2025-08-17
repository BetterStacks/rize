import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'

type UpdateStateFunctionType = (isOpen: boolean) => void;

type DialogContextType = {
  isChangeAvatarDialogOpen: boolean;
  isCreatePageDialogOpen: boolean;
  isUpdateProfileDialogOpen?: boolean;
  isSocialLinksDialogOpen?: boolean;
  isAddExperienceDialogOpen?: boolean;
  isCommandMenuOpen?: boolean;
  isProjectsDialogOpen?: boolean;
  isCreatePostDialogOpen?: boolean;
  isPostDialogOpen: boolean;
  isAuthDialogOpen: boolean;
  isAlertDialogOpen: boolean;
  isCommentDialogOpen?: boolean;
  isSearchDialogOpen?: boolean;
};

type setDialogContextType = [
  DialogContextType,
  {
    setIsChangeAvatarDialogOpen: UpdateStateFunctionType;
    setIsUpdateProfileDialogOpen: UpdateStateFunctionType;
    setIsCreatePageDialogOpen: UpdateStateFunctionType;
    setIsSocialLinksDialogOpen: UpdateStateFunctionType;
    setIsAddExperienceDialogOpen: UpdateStateFunctionType;
    setIsCommandMenuOpen: UpdateStateFunctionType;
    setIsProjectsDialogOpen: UpdateStateFunctionType;
    setIsCreatePostDialogOpen: UpdateStateFunctionType;
    setIsPostDialogOpen: UpdateStateFunctionType;
    setIsAuthDialogOpen: UpdateStateFunctionType;
    setIsAlertDialogOpen: UpdateStateFunctionType;
    setIsCommentDialogOpen: UpdateStateFunctionType;
    setIsSearchDialogOpen: UpdateStateFunctionType;
  }
];

const defaultContextState: DialogContextType = {
  isChangeAvatarDialogOpen: false,
  isUpdateProfileDialogOpen: false,
  isCreatePageDialogOpen: false,
  isSocialLinksDialogOpen: false,
  isAddExperienceDialogOpen: false,
  isCommandMenuOpen: false,
  isProjectsDialogOpen: false,
  isCreatePostDialogOpen: false,
  isPostDialogOpen: false,
  isAuthDialogOpen: false,
  isAlertDialogOpen: false,
  isCommentDialogOpen: false,
  isSearchDialogOpen: false,
}

const DialogContext = createContext([
  defaultContextState,
  {
    setIsChangeAvatarDialogOpen: () => {},
    setIsUpdateProfileDialogOpen: () => {},
    setIsCreatePageDialogOpen: () => {},
    setIsSocialLinksDialogOpen: () => {},
    setIsAddExperienceDialogOpen: () => {},
    setIsCommandMenuOpen: () => {},
    setIsProjectsDialogOpen: () => {},
    setIsCreatePostDialogOpen: () => {},
    setIsPostDialogOpen: () => {},
    setIsAuthDialogOpen: () => {},
    setIsAlertDialogOpen: () => {},
    setIsCommentDialogOpen: () => {},
    setIsSearchDialogOpen: () => {},
  },
] as setDialogContextType)

export const useAvatarDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'useAvatarDialog must be used within DialogContextProvider'
    )
  }
  return [
    context[0].isChangeAvatarDialogOpen,
    context[1].setIsChangeAvatarDialogOpen,
  ] as const
}

export const useProfileDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'useProfileDialog must be used within DialogContextProvider'
    )
  }
  return [
    context[0].isUpdateProfileDialogOpen,
    context[1].setIsUpdateProfileDialogOpen,
  ] as const
}
export const usePageDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('usePageDialog must be used within DialogContextProvider')
  }
  return [
    context[0].isCreatePageDialogOpen,
    context[1].setIsCreatePageDialogOpen,
  ] as const
}
export const useSocialLinksDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'useSocialLinksDialog must be used within DialogContextProvider'
    )
  }
  return [
    context[0].isSocialLinksDialogOpen,
    context[1].setIsSocialLinksDialogOpen,
  ] as const
}
export const useExperienceDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'useExperienceDialog must be used within DialogContextProvider'
    )
  }
  return [
    context[0].isAddExperienceDialogOpen,
    context[1].setIsAddExperienceDialogOpen,
  ] as const
}
export const useCommandMenuDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'useCommandMenuDialog must be used within DialogContextProvider'
    )
  }
  return [
    context[0].isCommandMenuOpen,
    context[1].setIsCommandMenuOpen,
  ] as const
}
export const useProjectsDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'useProjectsDialog must be used within DialogContextProvider'
    )
  }
  return [
    context[0].isProjectsDialogOpen,
    context[1].setIsProjectsDialogOpen,
  ] as const
}

export const usePostsDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'useProjectsDialog must be used within DialogContextProvider'
    )
  }
  return [
    context[0].isCreatePostDialogOpen,
    context[1].setIsCreatePostDialogOpen,
  ] as const
}
export const usePostDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'useProjectsDialog must be used within DialogContextProvider'
    )
  }
  return [context[0].isPostDialogOpen, context[1].setIsPostDialogOpen] as const
}

export const useAuthDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useAuthDialog must be used within DialogContextProvider')
  }
  return [context[0].isAuthDialogOpen, context[1].setIsAuthDialogOpen] as const
}
export const useAlertDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useAlertDialog must be used within DialogContextProvider')
  }
  return [
    context[0].isAlertDialogOpen,
    context[1].setIsAlertDialogOpen,
  ] as const
}
export const useSearchDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'useSearchDialog must be used within DialogContextProvider'
    )
  }
  return [
    context[0].isSearchDialogOpen,
    context[1].setIsSearchDialogOpen,
  ] as const
}

const DialogContextProvider = ({ children }: { children: ReactNode }) => {
  const [openContext, setOpenContext] =
    useState<DialogContextType>(defaultContextState)
  const setIsChangeAvatarDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isChangeAvatarDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  const setIsCreatePageDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isCreatePageDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  const setIsUpdateProfileDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isUpdateProfileDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  const setIsSocialLinksDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isSocialLinksDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  const setIsAddExperienceDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isAddExperienceDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  const setIsCommandMenuOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isCommandMenuOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  const setIsProjectsDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isProjectsDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  const setIsCreatePostDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isCreatePostDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  const setIsPostDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isPostDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  const setIsAuthDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isAuthDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )

  const setIsAlertDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isAlertDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  const setIsCommentDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isCommentDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  const setIsSearchDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isSearchDialogOpen: isOpen })
    },
    [openContext, setOpenContext]
  )
  return (
    <DialogContext.Provider
      value={[
        openContext,
        {
          setIsChangeAvatarDialogOpen,
          setIsUpdateProfileDialogOpen,
          setIsCreatePageDialogOpen,
          setIsSocialLinksDialogOpen,
          setIsAddExperienceDialogOpen,
          setIsCommandMenuOpen,
          setIsProjectsDialogOpen,
          setIsCreatePostDialogOpen,
          setIsPostDialogOpen,
          setIsAuthDialogOpen,
          setIsAlertDialogOpen,
          setIsCommentDialogOpen,
          setIsSearchDialogOpen,
        },
      ]}
    >
      {children}
    </DialogContext.Provider>
  )
}

export default DialogContextProvider
