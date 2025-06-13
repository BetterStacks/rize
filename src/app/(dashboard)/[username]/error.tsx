"use client";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { setCookie } from "cookies-next";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  const params = useParams(); // Access route params here
  const router = useRouter();
  const { theme } = useTheme();
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  const handleClaim = () => {
    setCookie("username", params?.username);
    router.push(`/signup`);
  };

  return (
    <>
      <head>
        <title>Claim Username</title>
        <meta name="robots" content="noindex" />
      </head>
      <div className="flex flex-col items-center justify-start relative pt-24 h-[96vh] md:h-screen overflow-hidden w-full text-center px-4">
        <Logo className="size-12 md:size-14 rounded-2xl mb-2" />

        <span className="text-neutral-500 mb-4  dark:text-neutral-400 mt-4 max-w-md">
          Get started by creating a <br />
          profile at{" "}
          <Link
            href="https://rize.so"
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            rize.so
          </Link>
        </span>

        <div className="border relative px-4 py-2 mb-10 font-semibold tracking-tight text-xl rounded-xl flex items-center justify-start dark:border-dark-border  border-neutral-200 max-w-md w-fit">
          <div className="text-neutral-400">rize.so/</div>
          <div>{String(params?.username)?.toLowerCase()}</div>

          <div className="absolute -right-3 -top-2 rotate-3 ">
            <Badge />
          </div>
        </div>

        <div className="w-full flex items-center justify-center absolute -bottom-[4%] md:-bottom-[20%]">
          <div className="aspect-video border border-neutral-300 shadow-2xl dark:border-dark-border rotate-6 max-w-3xl relative overflow-hidden rounded-3xl w-full">
            {theme === "light" ? (
              <Image
                src={"/minimal3.png"}
                alt=""
                quality={100}
                className="md:scale-110"
                style={{ objectFit: "cover" }}
                fill
              />
            ) : (
              <Image
                src={"/minimal2.png"}
                alt=""
                quality={100}
                className="md:scale-110"
                style={{ objectFit: "cover" }}
                fill
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const Badge = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      fill="green"
      className="size-8 "
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M19.965 8.521C19.988 8.347 20 8.173 20 8c0-2.379-2.143-4.288-4.521-3.965C14.786 2.802 13.466 2 12 2s-2.786.802-3.479 2.035C6.138 3.712 4 5.621 4 8c0 .173.012.347.035.521C2.802 9.215 2 10.535 2 12s.802 2.785 2.035 3.479A3.976 3.976 0 0 0 4 16c0 2.379 2.138 4.283 4.521 3.965C9.214 21.198 10.534 22 12 22s2.786-.802 3.479-2.035C17.857 20.283 20 18.379 20 16c0-.173-.012-.347-.035-.521C21.198 14.785 22 13.465 22 12s-.802-2.785-2.035-3.479zm-9.01 7.895-3.667-3.714 1.424-1.404 2.257 2.286 4.327-4.294 1.408 1.42-5.749 5.706z"></path>
      </g>
    </svg>
  );
};
