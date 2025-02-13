"use client";

import ClaimUsernameForm from "@/components/claim-username";
import { useSession } from "next-auth/react";
export default function Home() {
  const session = useSession();
  console.log(session);
  return (
    <div className="w-full h-screen flex items-center justify-center">
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
