"use client";
import { getRecentlyJoinedProfiles } from "@/actions/profile-actions";
import { TProfile } from "@/lib/types";
import { useDebouncedCallback } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCommandMenuDialog } from "../dialog-provider";

import axios from "axios";
import { Loader, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

type ProfileItemProps = Pick<
  TProfile,
  "username" | "displayName" | "profileImage"
> & { image?: string; name?: string };

const SearchDialog = () => {
  const [open, setOpen] = useCommandMenuDialog();
  const session = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileItemProps[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["recently-joined-profiles"],
    queryFn: () => getRecentlyJoinedProfiles(),
  });
  const { theme, setTheme } = useTheme();

  const viewProfilePayload = {
    displayName: session?.data?.user?.displayName,
    username: session?.data?.user?.username,
    profileImage: session?.data?.user?.profileImage,
    image: session?.data?.user?.image,
    name: session?.data?.user?.name,
  };

  const handleSearch = useDebouncedCallback(async (query: string) => {
    if (query.trim() === "") {
      // setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    const res = await axios.get("/api/search", {
      params: { query },
    });
    setLoading(false);
    setResults([...(res?.data as ProfileItemProps[])]);
  }, 300);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          handleSearch(value);
        }}
        placeholder="Type a command or search..."
      />
      <ScrollArea className="overflow-y-auto max-h-[300px]  h-fit">
        <CommandList className="">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="animate-spin h-4 w-4" />
            </div>
          ) : results?.length > 0 ? (
            <CommandGroup heading="Search Results" className="">
              {results?.map((profile) => (
                <CommandItem
                  className=""
                  onSelect={() => {
                    router.push(profile?.username as string);
                    setOpen(false);
                  }}
                  value={`${profile?.username} ${profile?.displayName} `}
                  key={`${profile?.username} ${profile?.displayName} `}
                >
                  <ProfileItem payload={{ ...profile } as any} />
                </CommandItem>
              ))}
            </CommandGroup>
          ) : (
            hasSearched && <CommandEmpty>No results found.</CommandEmpty>
          )}

          {session?.data && (
            <CommandGroup heading="View Profile">
              <CommandItem
                onSelect={() => {
                  router.push(`/${session?.data?.user?.username}`);
                  setOpen(false);
                }}
              >
                <ProfileItem payload={{ ...(viewProfilePayload as any) }} />
              </CommandItem>
            </CommandGroup>
          )}
          <CommandSeparator className="mt-1" />
          <CommandGroup heading="Actions">
            <CommandItem
              value={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
              onSelect={() => {
                setTheme((prev) => (prev === "dark" ? "light" : "dark"));
              }}
            >
              {theme === "light" ? (
                <Moon strokeWidth={1.2} className="opacity-80 size-4" />
              ) : (
                <Sun strokeWidth={1.2} className="opacity-80 size-4" />
              )}
              <span className="">
                {theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"}
              </span>
            </CommandItem>
            {session?.status === "authenticated" && (
              <CommandItem
                value="Logout"
                onSelect={() => {
                  signOut();
                }}
              >
                <LogOut strokeWidth={1.2} className="opacity-80 size-4" />
                <span className="">Logout</span>
              </CommandItem>
            )}
          </CommandGroup>
          <CommandSeparator className="mt-1" />

          <CommandGroup heading="Recently Joined" className="">
            {data?.length > 0 &&
              data
                ?.filter((p) => p?.username !== session?.data?.user?.username)
                ?.map((profile) => {
                  return (
                    <CommandItem
                      className="last:mb-20"
                      onSelect={() => router.push(profile?.username as string)}
                      key={profile?.username}
                    >
                      <ProfileItem payload={{ ...profile } as any} />
                    </CommandItem>
                  );
                })}
          </CommandGroup>
          {/* </>
          )} */}
          <div className="mb-10" />
        </CommandList>
      </ScrollArea>
      <Separator className="h-[0.5px]" />
      <div className="h-10 w-full"></div>
    </CommandDialog>
  );
};

const ProfileItem = ({ payload }: { payload: ProfileItemProps }) => {
  return (
    <>
      <Image
        src={payload?.profileImage || (payload?.image as string)}
        alt="image"
        width={50}
        height={50}
        className="aspect-square size-8 rounded-full"
      />

      <div className="ml-1 flex flex-col items-start justify-start ">
        <h3 className=" leading-tight text-sm truncate">
          {payload?.displayName}
        </h3>
        <span className="dark:text-neutral-400 text-neutral-600 text-sm leading-tight truncate">
          @{payload?.username}
        </span>
      </div>
    </>
  );
};

export default SearchDialog;

// <Command.Dialog
//   open={open}
//   onOpenChange={setOpen}
//   className="max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border border-neutral-300/80 dark:border-dark-border overflow-hidden  drop-shadow-2xl rounded-3xl w-full bg-dark-bg"
// >
//   <Command.Input />
//   <Command.List>
//     {/* {loading && <Command.Loading>Hang on…</Command.Loading>} */}

//     <Command.Empty>No results found.</Command.Empty>

//     <Command.Group heading="Fruits">
//       <Command.Item>Apple</Command.Item>
//       <Command.Item>Orange</Command.Item>
//       <Command.Separator />
//       <Command.Item>Pear</Command.Item>
//       <Command.Item>Blueberry</Command.Item>
//     </Command.Group>

//     <Command.Item>Fish</Command.Item>
//   </Command.List>
// </Command.Dialog>
