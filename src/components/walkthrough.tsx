"use client";

import { updateProfile } from "@/actions/profile-actions";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Joyride, { EVENTS, STATUS, TooltipRenderProps } from "react-joyride";
import { Button } from "./ui/button";

const Walkthrough = ({ isMine }: { isMine: boolean }) => {
  const [mounted, setMounted] = useState(false);
  const { data: session, update } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps = [
    {
      target: ".user-avatar",
      content: "Edit your profile picture here",
      // disableBeacon: true,
    },
    {
      target: ".profile-displayName",
      content: "Edit your display name here",
    },
    {
      target: ".profile-Bio",
      content: "Edit your profile bio here",
    },
    {
      target: ".social-links",
      content: "Add your social links here",
      // placement: "bottom",
    },
    {
      target: ".social-links-manager",
      content: "Manage your social links in one place",
    },
    {
      target: ".gallery-editor",
      content: "This is my super awesome feature!",
    },
  ];

  return (
    <Joyride
      run={true}
      steps={[
        {
          target: ".user-avatar",
          title: "Personalise your Profile",
          content: "Edit your profile picture here",
          placement: "right-start",
          styles: {
            spotlight: {
              borderRadius: "6rem",
            },
          },
        },
        {
          target: ".profile-displayName",
          content: "Edit your display name here",
          placement: "right-start",
          title: "Change your Profile Details",
        },
        {
          target: ".profile-Bio",
          title: "Edit your Bio",
          content: "Edit your profile bio here",
        },
        {
          target: ".social-links",
          title: "Social Links",
          content: "Add your own social links here",
          placement: "right-start",
        },
        {
          target: ".social-links-manager",
          placement: "left-start",
          title: "Manage your Social Links",
          content: "Create, edit and delete all your social links in one place",
          spotlightPadding: 2,
          styles: {
            spotlight: {
              borderRadius: "1.4rem",
            },
          },
        },
        {
          target: ".gallery-editor",
          placement: "left-center" as any,
          title: "Add Images and Videos",
          spotlightPadding: 2,
          styles: {
            spotlight: {
              borderRadius: "1.4rem",
            },
          },
          content:
            "Add images and videos to share your favourite moments and memories",
        },
      ]}
      continuous
      styles={{
        spotlight: {
          borderRadius: "1rem",
        },
      }}
      floaterProps={{
        hideArrow: true,
        offset: 10,
      }}
      callback={async (data) => {
        if (
          data?.status === STATUS.FINISHED &&
          data?.type === EVENTS.TOUR_END
        ) {
          await updateProfile({ hasCompletedWalkthrough: true });
          await update();
        } else if (data?.type === EVENTS.STEP_AFTER) {
          console.log(data);
        }
      }}
      tooltipComponent={CustomTooltip}
      scrollToFirstStep
    />
  );
};

function CustomTooltip(props: TooltipRenderProps) {
  const {
    backProps,
    closeProps,
    continuous,
    index,
    primaryProps,
    skipProps,
    step,
    tooltipProps,
  } = props;

  return (
    <div
      className="p-6 bg-white dark:bg-dark-bg shadow-2xl max-w-xs w-full rounded-xl"
      {...tooltipProps}
    >
      {step.title && (
        <h4 className="font-medium text-lg md:text-xl tracking-tight">
          {step.title}
        </h4>
      )}
      <div className="mt-2 text-neutral-400 text-sm">{step.content}</div>
      <div className="inline-flex w-full items-center justify-between mt-6 gap-4">
        <Button variant={"outline"} size={"sm"} {...skipProps}>
          {skipProps.title}
        </Button>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <Button variant={"outline"} size={"sm"} {...backProps}>
              {backProps.title}
            </Button>
          )}
          {continuous && (
            <Button variant={"outline"} size={"sm"} {...primaryProps}>
              {primaryProps.title}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Walkthrough;
