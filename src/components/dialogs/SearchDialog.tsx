import { searchProfiles } from "@/actions/profile-actions";
import { TProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useSearchDialog } from "../dialog-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";

const SearchDialog = () => {
  const [open, setOpen] = useSearchDialog();
  const [query, setQuery] = React.useState<string>("");
  const [results, setResults] = React.useState<TProfile[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const search = useDebouncedCallback(async (query: string) => {
    if (query.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await searchProfiles(query);
    if (res.length === 0) {
      setLoading(false);
      setResults([]);
      return;
    }
    setResults(res);
    setLoading(false);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md dark:bg-dark-bg px-0 py-3 flex flex-col justify-start sm:rounded-3xl w-full max-h-[500px]  h-fit">
        <DialogHeader className="p-0">
          <DialogTitle className="text-lg hidden font-semibold text-center">
            Search
          </DialogTitle>
          <div className="w-full  flex px-4 items-center justify-center  ">
            <Search className="size-5 opacity-70" />
            <input
              value={query}
              onChange={handleChange}
              className="w-full bg-transparent focus-visible:outline-none ml-2 placeholder:text-sm placeholder:opacity-70"
              placeholder="Search for people, posts, or topics..."
              type="text"
            />
          </div>
        </DialogHeader>
        {query.length > 2 && (
          <div className="flex flex-col w-full border-t pt-2 border-neutral-300/60  dark:border-dark-border">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex border-t px-4 py-1 cursor-pointer first:border-none dark:border-dark-border border-neutral-300/60  items-center space-x-2 animate-pulse "
                  >
                    <Skeleton
                      className={cn(
                        "relative overflow-hidden size-12 rounded-full bg-neutral-300 dark:bg-neutral-700"
                      )}
                    />
                    <div className="flex space-y-1 flex-col">
                      <Skeleton className="rounded-lg  bg-neutral-300 dark:bg-neutral-700 w-[60%] h-4" />
                      <Skeleton className="rounded-lg opacity-60 bg-neutral-300 dark:bg-neutral-700 w-24 h-3" />
                    </div>
                  </div>
                ))
              : results.map((item) => (
                  <div
                    key={item.id}
                    className="flex border-t px-4 py-1 cursor-pointer first:border-none dark:border-dark-border border-neutral-300/60 justify-start items-center space-x-2 "
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden size-12 rounded-full"
                      )}
                    >
                      <Image
                        src={item.profileImage!}
                        alt=""
                        fill
                        style={{ objectFit: "cover" }}
                        className=""
                      />
                    </div>
                    {/* )} */}
                    <div className="flex flex-col mb-1">
                      <Link
                        prefetch
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                        }}
                        href={`/${item.username}`}
                      >
                        <span className="tracking-tight hover:underline text-sm leading-tight font-medium">
                          {item.displayName}
                        </span>
                      </Link>
                      <span className="leading-none opacity-60 text-sm">
                        @{item.username}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
