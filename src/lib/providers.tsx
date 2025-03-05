"use client";
import DialogContextProvider from "@/components/dialog-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Context from "./context";

export const queryClient = new QueryClient();
const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <NuqsAdapter>
        <SessionProvider>
          <ThemeProvider attribute={"class"} defaultTheme="system">
            <QueryClientProvider client={queryClient}>
              <Context>
                <DialogContextProvider>
                  <Toaster />
                  {children}
                </DialogContextProvider>
              </Context>
            </QueryClientProvider>
          </ThemeProvider>
        </SessionProvider>
      </NuqsAdapter>
    </>
  );
};

export default Providers;
