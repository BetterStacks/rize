import { TPage } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React, { FC, useMemo } from "react";
import readingTime from "reading-time";
import { Node } from "slate";

type WrtingCardProps = {
  data: typeof TPage;
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
        className="grid md:grid-cols-[60px,1fr,160px] gap-6 items-start"
      >
        <div className="text-neutral-400">
          {new Date(data?.createdAt!).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            //   dateStyle: "full",
          })}
        </div>
        <div className="space-y-2 px-4">
          <h3 className="text-lg tracking-tight opacity-80 group-hover:opacity-100 leading-tight  ">
            {data?.title}
          </h3>
          <div className="text-neutral-400">{time?.text}</div>
        </div>
        <div className="relative  w-[160px] h-[120px] rounded-xl overflow-hidden bg-dark-border">
          <Image
            src={data?.thumbnail!}
            alt="Thumbnail"
            fill
            className="object-cover"
          />
        </div>
      </Link>
    </article>
  );
};

export default WritingCard;
