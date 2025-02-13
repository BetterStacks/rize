"use client";
import DialogContextProvider from "@/components/dialog-provider";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Context from "./context";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <NuqsAdapter>
        <SessionProvider>
          <Context>
            <DialogContextProvider>
              <Toaster />
              {children}
            </DialogContextProvider>
          </Context>
        </SessionProvider>
      </NuqsAdapter>
    </>
  );
};

export default Providers;
