"use client";

import ClaimUsernameForm from "@/components/claim-username";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
export default function Home() {
  const session = useSession();
  console.log(session);
  return (
    <div className="w-full h-screen flex items-center justify-center">
      {session?.data?.user?.image && (
        <div className="absolute top-4 right-4">
          <Link href={`/${session?.data?.user?.username}`}>
            <Image
              src={session?.data?.user?.image}
              alt="pfp"
              width={50}
              height={50}
              className=" size-10 aspect-square rounded-full"
            />
          </Link>
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-3">
        <h1 className="text-3xl md:text-4xl text-center font-semibold font-instrument tracking-wide">
          {/* {session?.data ? (
            <> */}
          Your Digital Passport <br />
          to the GenZ world
          {/* </>
          ) : (
            <>
              {" "}
              The Professional Network <br /> to show & tell what you are
              working on!
            </>
          )} */}
        </h1>
        <div className="w-full">
          {" "}
          <ClaimUsernameForm />
          {!session?.data?.user?.isOnboarded && (
            <Link href={"/onboarding"}>Onboarding</Link>
          )}
        </div>
        {/* <Button
          onClick={async () => {
            const data = await authClient.signIn.social({
              provider: "google",
              // disableRedirect: true,
            });
            console.log(data);
          }}
          variant={"secondary"}
        >
          SignIn with Google
        </Button>
        <Button
          onClick={async () => {
            const data = await authClient.signIn.social({
              provider: "github",
              // disableRedirect: true,
            });
            console.log(data);
          }}
          variant={"secondary"}
        >
          SignIn with Github
        </Button> */}
      </div>
    </div>
  );
}
