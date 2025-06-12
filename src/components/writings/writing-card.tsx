import { TPage } from "@/lib/types";
import { Dot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FC, useMemo } from "react";
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
    <article className="flex w-full group  bg-white shadow-lg group relative dark:bg-neutral-800 transition-all  rounded-2xl border border-neutral-300/60 dark:border-dark-border overflow-hidden">
      <Link
        href={`/page/${data.id}`}
        className="mt-0 grid grid-cols-[120px,1fr] md:grid-cols-[160px,1fr] gap-6 md:items-start"
      >
        <div className="w-[120px] border-r border-neutral-300/60 dark:border-dark-border border md:w-[160px] h-full relative overflow-hidden">
          <Image
            src={data?.thumbnail!}
            alt="Thumbnail"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col mt-2 py-4 px-2 md:gap-2 gap-1">
          <h3 className="md:text-lg mr-4 text-neutral-800 dark:text-neutral-300  dark:group-hover:text-neutral-100 transition-colors group-hover:text-neutral-950 tracking-tight whitespace-pre-line line-clamp-2 ">
            {data?.title}
          </h3>

          <div className="text-neutral-400">{time?.text}</div>
        </div>
        {/* </div> */}
        {/* <div className="text-neutral-400 md:flex hidden">
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
        <div className="space-y-2 md:px-4 mt-2">
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
        </div> */}
      </Link>
    </article>
  );
};

export default WritingCard;
