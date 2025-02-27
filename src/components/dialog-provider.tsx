import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type UpdateStateFunctionType = (isOpen: boolean) => void;

type DialogContextType = {
  isChangeAvatarDialogOpen: boolean;
  isCreatePageDialogOpen: boolean;
  isUpdateProfileDialogOpen?: boolean;
  isSocialLinksDialogOpen?: boolean;
  isAddExperienceDialogOpen?: boolean;
};

type setDialogContextType = [
  DialogContextType,
  {
    setIsChangeAvatarDialogOpen: UpdateStateFunctionType;
    setIsUpdateProfileDialogOpen: UpdateStateFunctionType;
    setIsCreatePageDialogOpen: UpdateStateFunctionType;
    setIsSocialLinksDialogOpen: UpdateStateFunctionType;
    setIsAddExperienceDialogOpen: UpdateStateFunctionType;
  }
];

const defaultContextState: DialogContextType = {
  isChangeAvatarDialogOpen: false,
  isUpdateProfileDialogOpen: false,
  isCreatePageDialogOpen: false,
  isSocialLinksDialogOpen: false,
  isAddExperienceDialogOpen: false,
};

const DialogContext = createContext([
  defaultContextState,
  {
    setIsChangeAvatarDialogOpen: () => {},
    setIsUpdateProfileDialogOpen: () => {},
    setIsCreatePageDialogOpen: () => {},
    setIsSocialLinksDialogOpen: () => {},
    setIsAddExperienceDialogOpen: () => {},
  },
] as setDialogContextType);

export const useAvatarDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(
      "useAvatarDialog must be used within DialogContextProvider"
    );
  }
  return [
    context[0].isChangeAvatarDialogOpen,
    context[1].setIsChangeAvatarDialogOpen,
  ] as const;
};

export const useProfileDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(
      "useProfileDialog must be used within DialogContextProvider"
    );
  }
  return [
    context[0].isUpdateProfileDialogOpen,
    context[1].setIsUpdateProfileDialogOpen,
  ] as const;
};
export const usePageDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("usePageDialog must be used within DialogContextProvider");
  }
  return [
    context[0].isCreatePageDialogOpen,
    context[1].setIsCreatePageDialogOpen,
  ] as const;
};
export const useSocialLinksDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(
      "useSocialLinksDialog must be used within DialogContextProvider"
    );
  }
  return [
    context[0].isSocialLinksDialogOpen,
    context[1].setIsSocialLinksDialogOpen,
  ] as const;
};
export const useExperienceDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(
      "useExperienceDialog must be used within DialogContextProvider"
    );
  }
  return [
    context[0].isAddExperienceDialogOpen,
    context[1].setIsAddExperienceDialogOpen,
  ] as const;
};

const DialogContextProvider = ({ children }: { children: ReactNode }) => {
  const [openContext, setOpenContext] =
    useState<DialogContextType>(defaultContextState);
  const setIsChangeAvatarDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isChangeAvatarDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );
  const setIsCreatePageDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isCreatePageDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );
  const setIsUpdateProfileDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isUpdateProfileDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );
  const setIsSocialLinksDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isSocialLinksDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );
  const setIsAddExperienceDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isAddExperienceDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );
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
        },
      ]}
    >
      {children}
    </DialogContext.Provider>
  );
};

export default DialogContextProvider;
