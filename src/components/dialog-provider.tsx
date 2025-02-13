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
  isUpdateProfileDialogOpen?: boolean;
};

type setDialogContextType = [
  DialogContextType,
  {
    setIsChangeAvatarDialogOpen: UpdateStateFunctionType;
    setIsUpdateProfileDialogOpen: UpdateStateFunctionType;
  }
];

const defaultContextState: DialogContextType = {
  isChangeAvatarDialogOpen: false,
};

const DialogContext = createContext([
  defaultContextState,
  {
    setIsChangeAvatarDialogOpen: () => {},
    setIsUpdateProfileDialogOpen: () => {},
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

const DialogContextProvider = ({ children }: { children: ReactNode }) => {
  const [openContext, setOpenContext] =
    useState<DialogContextType>(defaultContextState);
  const setIsChangeAvatarDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isChangeAvatarDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );
  const setIsUpdateProfileDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isUpdateProfileDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );
  return (
    <DialogContext.Provider
      value={[
        openContext,
        { setIsChangeAvatarDialogOpen, setIsUpdateProfileDialogOpen },
      ]}
    >
      {children}
    </DialogContext.Provider>
  );
};

export default DialogContextProvider;
