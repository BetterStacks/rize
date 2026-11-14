import { deleteExperience } from "@/actions/experience-actions";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { queryClient } from "@/lib/providers";
import { TExperience } from "@/lib/types";
import { safeHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { useMediaQuery } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { FC } from "react";
import toast from "react-hot-toast";
import { OwnerItemMenu, TimelineItem } from "../profile/timeline-item";

type ExperienceCardProps = {
  experience: TExperience;
  isMine: boolean;
};

const monthYear = (date?: Date | string | null) =>
  date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" })
    : null;

const ExperienceCard: FC<ExperienceCardProps> = ({ experience, isMine }) => {
  const session = useSession();
  const [, setActiveTab] = useActiveSidebarTab();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const setOpen = useRightSidebar()[1];
  const { mutate: handleDeleteExperience, isPending } = useMutation({
    mutationFn: deleteExperience,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [
          "get-all-experience",
          (session?.data?.user as any)?.username,
        ],
      });
      toast.success("Experience deleted");
    },
    onError() {
      toast.error("Couldn’t delete that. Try again.");
    },
  });

  const start = monthYear(experience?.startDate);
  const end =
    !experience?.endDate || experience?.currentlyWorking
      ? "Present"
      : monthYear(experience?.endDate);
  const dates = `${start ?? "—"} – ${end}`;
  const meta = [experience?.location?.split(",")[0], experience?.employmentType]
    .filter(Boolean)
    .join(" · ");

  return (
    <TimelineItem
      title={experience?.title}
      subtitle={
        safeHref(experience?.website) ? (
          <a
            href={safeHref(experience?.website)!}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            {experience?.company}
          </a>
        ) : (
          experience?.company
        )
      }
      meta={meta || undefined}
      dates={dates}
      menu={
        isMine ? (
          <OwnerItemMenu
            label={`${experience?.title} at ${experience?.company}`}
            isDeleting={isPending}
            onEdit={() => {
              setActiveTab({ id: experience?.id, tab: "experience" });
              if (!isDesktop) setOpen(true);
            }}
            onDelete={() => handleDeleteExperience(experience?.id)}
          />
        ) : undefined
      }
    >
      {experience?.description && (
        <div
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none mt-2 text-[#5A5248] dark:text-[#A9A9AE]",
            "prose-p:my-1 prose-p:leading-relaxed",
          )}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(experience.description ?? "") }}
        />
      )}
    </TimelineItem>
  );
};

export default ExperienceCard;
