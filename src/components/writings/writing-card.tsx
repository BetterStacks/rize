import { TPage } from "@/lib/types";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { FC, useMemo } from "react";
import readingTime from "reading-time";
import { Node } from "slate";

type WrtingCardProps = {
  data: typeof TPage & { thumbnail: string };
};

const WritingCard: FC<WrtingCardProps> = ({ data }) => {
  const time = useMemo(() => {
    const editorContent = JSON.parse(data?.content);
    const stringifiedContent = editorContent
      .map((node: Node) => Node.string(node))
      .join("\n");
    return readingTime(stringifiedContent);
  }, [data?.content]);
  return (
    <article className="group w-full ">
      <Link
        href={`/page/${data.id}`}
        className="flex flex-col mt-2 md:mt-0 md:grid md:grid-cols-[60px,1fr,160px] gap-6 md:items-start"
      >
        <div className="text-neutral-400 md:flex hidden">
          {new Date(data?.createdAt!).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
        <div className="relative flex md:hidden  border border-neutral-200 dark:border-dark-border/80 h-[250px] aspect-square rounded-2xl overflow-hidden bg-neutral-200 dark:bg-dark-border">
          {data?.thumbnail ? (
            <Image
              src={data?.thumbnail!}
              alt="Thumbnail"
              fill
              className="object-cover"
            />
          ) : (
            <></>
          )}
        </div>
        <div className="space-y-2 md:px-4">
          <h3 className="text-lg tracking-tight opacity-80 group-hover:opacity-100 leading-tight  ">
            {data?.title}
          </h3>
          <div className="text-neutral-400">{time?.text}</div>
        </div>
        <div className="relative hidden md:flex w-[160px] border border-neutral-200 dark:border-dark-border/80 h-[120px] rounded-2xl overflow-hidden bg-neutral-200 dark:bg-dark-border">
          {data?.thumbnail ? (
            <Image
              src={data?.thumbnail!}
              alt="Thumbnail"
              fill
              className="object-cover"
            />
          ) : (
            <></>
          )}
        </div>
      </Link>
    </article>
  );
};

export default WritingCard;
