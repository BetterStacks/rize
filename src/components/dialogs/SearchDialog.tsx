"use client";
import { getRecentlyJoinedProfiles } from "@/actions/profile-actions";
import { TProfile } from "@/lib/types";
import { useDebouncedCallback } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearchDialog } from "../dialog-provider";

import axios from "axios";
import { ArrowRight, FileText, FolderOpen, Hash, Loader, LogOut, MessageCircle, Moon, Sun, User, Users, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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
  const [open, setOpen] = useSearchDialog();
  
  // Add keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setOpen]);
  const session = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    people: ProfileItemProps[];
    posts: any[];
    projects: any[];
    total: number;
  }>({ people: [], posts: [], projects: [], total: 0 });
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
    setResults(res?.data);
  }, 300);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          handleSearch(value);
        }}
        placeholder="Search people, posts, or type a command..."
      />
      <ScrollArea className="overflow-y-auto max-h-[400px] h-fit">
        <CommandList className="">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="animate-spin h-4 w-4" />
            </div>
          ) : results?.total > 0 ? (
            <>
              {results?.people?.length > 0 && (
                <CommandGroup heading={`👥 People (${results.people.length})`} className="">
                  {results.people.slice(0, 5).map((profile) => (
                    <CommandItem
                      className="py-3"
                      onSelect={() => {
                        router.push(`/${profile?.username}`);
                        setOpen(false);
                      }}
                      value={`${profile?.username} ${profile?.displayName} `}
                      key={`person-${profile?.username}`}
                    >
                      <ProfileItem payload={{ ...profile } as any} />
                      <ArrowRight className="ml-auto h-4 w-4 opacity-40" />
                    </CommandItem>
                  ))}
                  {results.people.length > 5 && (
                    <CommandItem
                      className="text-center justify-center text-sm text-muted-foreground"
                      value=""
                    >
                      +{results.people.length - 5} more people
                    </CommandItem>
                  )}
                </CommandGroup>
              )}

              {results?.posts?.length > 0 && (
                <CommandGroup heading={`💬 Posts (${results.posts.length})`} className="">
                  {results.posts.slice(0, 3).map((post) => (
                    <CommandItem
                      className="py-3 items-start"
                      onSelect={() => {
                        router.push(`/${post?.username}`);
                        setOpen(false);
                      }}
                      value={`${post?.content} ${post?.displayName}`}
                      key={`post-${post?.id}`}
                    >
                      <MessageCircle className="h-4 w-4 mt-1 mr-3 flex-shrink-0 opacity-60" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Image
                            src={post?.profileImage}
                            alt={post?.displayName}
                            width={16}
                            height={16}
                            className="rounded-full"
                          />
                          <span className="text-xs text-muted-foreground">@{post?.username}</span>
                        </div>
                        <p className="text-sm truncate">
                          {post?.content?.substring(0, 60)}{post?.content?.length > 60 ? '...' : ''}
                        </p>
                      </div>
                      <ArrowRight className="ml-auto h-4 w-4 opacity-40 flex-shrink-0" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results?.projects?.length > 0 && (
                <CommandGroup heading={`📁 Projects (${results.projects.length})`} className="">
                  {results.projects.slice(0, 3).map((project) => (
                    <CommandItem
                      className="py-3 items-start"
                      onSelect={() => {
                        if (project?.url) {
                          window.open(project.url, '_blank');
                        } else {
                          router.push(`/${project?.username}`);
                        }
                        setOpen(false);
                      }}
                      value={`${project?.name} ${project?.description} ${project?.displayName}`}
                      key={`project-${project?.id}`}
                    >
                      <FolderOpen className="h-4 w-4 mt-1 mr-3 flex-shrink-0 opacity-60" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">{project?.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            project?.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            project?.status === 'wip' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                          }`}>
                            {project?.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {project?.description?.substring(0, 50)}{project?.description?.length > 50 ? '...' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">by @{project?.username}</p>
                      </div>
                      <ArrowRight className="ml-auto h-4 w-4 opacity-40 flex-shrink-0" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          ) : (
            hasSearched && (
              <CommandEmpty className="py-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 opacity-40" />
                    <MessageCircle className="h-6 w-6 opacity-40" />
                    <FolderOpen className="h-6 w-6 opacity-40" />
                  </div>
                  <p className="text-sm font-medium">No results found</p>
                  <p className="text-xs text-muted-foreground">Try searching for people, posts, or projects</p>
                </div>
              </CommandEmpty>
            )
          )}

          {!hasSearched && session?.data && (
            <CommandGroup heading="🏠 Quick Actions">
              <CommandItem
                onSelect={() => {
                  router.push(`/${session?.data?.user?.username}`);
                  setOpen(false);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Go to my profile</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.push('/explore');
                  setOpen(false);
                }}
              >
                <Hash className="mr-2 h-4 w-4" />
                <span>Explore feed</span>
              </CommandItem>
            </CommandGroup>
          )}
          <CommandSeparator className="mt-1" />
          {!hasSearched && (
            <CommandGroup heading="⚡ Actions">
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
                  <Moon strokeWidth={1.2} className="mr-2 h-4 w-4" />
                ) : (
                  <Sun strokeWidth={1.2} className="mr-2 h-4 w-4" />
                )}
                <span>
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
                  <LogOut strokeWidth={1.2} className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </CommandItem>
              )}
            </CommandGroup>
          )}
          <CommandSeparator className="mt-1" />

          {!hasSearched && (
            <CommandGroup heading="🌟 Recently Joined" className="">
              {data?.length > 0 &&
                data
                  ?.filter((p) => p?.username !== session?.data?.user?.username)
                  ?.slice(0, 4)
                  ?.map((profile) => {
                    return (
                      <CommandItem
                        className="py-3"
                        onSelect={() => {
                          router.push(`/${profile?.username}`);
                          setOpen(false);
                        }}
                        key={profile?.username}
                      >
                        <ProfileItem payload={{ ...profile } as any} />
                        <ArrowRight className="ml-auto h-4 w-4 opacity-40" />
                      </CommandItem>
                    );
                  })}
            </CommandGroup>
          )}
          {/* </>
          )} */}
          <div className="mb-10" />
        </CommandList>
      </ScrollArea>
      <Separator className="h-[0.5px]" />
      <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground bg-muted/50">
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">⌘K</kbd>
          <span>to search</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">↑↓</kbd>
            <span>navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">↵</kbd>
            <span>select</span>
          </div>
        </div>
      </div>
    </CommandDialog>
  );
};

const ProfileItem = ({ payload }: { payload: ProfileItemProps }) => {
  return (
    <>
      <Image
        src={payload?.profileImage || (payload?.image as string)}
        alt={payload?.displayName || payload?.name || 'Profile'}
        width={40}
        height={40}
        className="aspect-square size-10 rounded-full border-2 border-neutral-200 dark:border-neutral-700"
      />

      <div className="ml-3 flex flex-col items-start justify-start min-w-0 flex-1">
        <h3 className="leading-tight text-sm font-medium truncate">
          {payload?.displayName || payload?.name}
        </h3>
        <span className="dark:text-neutral-400 text-neutral-600 text-xs leading-tight truncate">
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
