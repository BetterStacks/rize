"use client";

import { getProjectByID } from "@/actions/project-actions";
import { useToggleProjectBookmark } from "@/hooks/useToggleProjectBookmark";
import { useVoteProject } from "@/hooks/useVoteProject";
import { useSession } from "@/lib/auth-client";
import { sanitizeHtml } from "@/lib/sanitize";
import { GetAllProjects } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ArrowUpRight, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";
import BottomBanner from "./bottom-banner";
import DashboardLayout from "./layout/DashboardLayout";
import PersonAvatar, { canOptimize, usableImageSrc } from "./profile/person-avatar";
import { ProfileSection } from "./profile/profile-section";
import { ProjectDialogOptions } from "./projects/ProjectDetailsDialog";
import ProjectDrawer from "./projects/ProjectDrawer";
import ProjectInteractions from "./projects/ProjectInteractions";
import Sidebar from "./sidebar/Sidebar";
import { Button } from "./ui/button";

type ProjectPageProps = {
    id: string;
    initialProjectData: GetAllProjects;
};

type Attachment = NonNullable<GetAllProjects["attachments"]>[number];

const hostOf = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
};

/** The project's logo, or its first letter if there's none or it fails. */
const ProjectLogo: FC<{ src?: string | null; name: string }> = ({ src, name }) => {
    const usable = usableImageSrc(src);
    const [failed, setFailed] = useState(false);
    return (
        <span className="relative inline-flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hairline bg-subtle md:size-16">
            {usable && !failed ? (
                <Image
                    src={usable}
                    alt=""
                    fill
                    sizes="64px"
                    unoptimized={!canOptimize(usable)}
                    className="object-cover"
                    onError={() => setFailed(true)}
                />
            ) : (
                <span aria-hidden className="font-instrument text-3xl leading-none text-ink">
                    {name.trim().charAt(0).toUpperCase() || "·"}
                </span>
            )}
        </span>
    );
};

/** One picture or clip in the strip; gone if it can't load. */
const MediaTile: FC<{ media: Attachment; single: boolean; priority: boolean }> = ({
    media,
    single,
    priority,
}) => {
    const usable = usableImageSrc(media.url);
    const [failed, setFailed] = useState(false);
    if (!usable || failed) return null;
    return (
        <div
            className={cn(
                "relative aspect-[16/10] shrink-0 snap-start overflow-hidden rounded-xl border border-hairline bg-subtle",
                single ? "w-full" : "w-[85%] sm:w-[75%]",
            )}
        >
            {media.type === "video" ? (
                <video
                    src={usable}
                    className="size-full object-cover"
                    controls
                    playsInline
                    onError={() => setFailed(true)}
                />
            ) : (
                <Image
                    src={usable}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 560px, 85vw"
                    unoptimized={!canOptimize(usable)}
                    className="object-cover"
                    priority={priority}
                    onError={() => setFailed(true)}
                />
            )}
        </div>
    );
};

const ProjectMedia: FC<{ medias: Attachment[] }> = ({ medias }) => {
    const stripRef = useRef<HTMLDivElement>(null);
    const scroll = (dir: 1 | -1) => {
        const el = stripRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
    };
    const many = medias.length > 1;

    return (
        <div className="mt-8">
            <div
                ref={stripRef}
                className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6"
                aria-label="Project media"
            >
                {medias.map((media, i) => (
                    <MediaTile key={media.id} media={media} single={!many} priority={i === 0} />
                ))}
            </div>
            {many && (
                <div className="mt-2 flex justify-end gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="smallIcon"
                        aria-label="Previous"
                        onClick={() => scroll(-1)}
                        className="text-ink-secondary hover:text-ink"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="smallIcon"
                        aria-label="Next"
                        onClick={() => scroll(1)}
                        className="text-ink-secondary hover:text-ink"
                    >
                        <ArrowRight className="size-4" aria-hidden />
                    </Button>
                </div>
            )}
        </div>
    );
};

const ProjectPage: FC<ProjectPageProps> = ({
    initialProjectData,
    id,
}) => {
    const session = useSession()
    const { data: project } = useQuery({
        initialData: initialProjectData,
        queryKey: ["get-project-by-id", id],
        queryFn: () => getProjectByID(id),
    });

    const voteMutation = useVoteProject({
        projectId: id,
        userVote: project?.userVote ?? null,
    });

    const bookmarkMutation = useToggleProjectBookmark({
        projectId: id,
        isBookmarked: !!project?.bookmarked,
    });

    const handleShareClick = async () => {
        const url = `${window.location.origin}/project/${id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: project?.name,
                    url: url,
                });
            } catch (err) {
                console.error("Error sharing", err);
            }
        } else {
            navigator.clipboard.writeText(url);
            toast.success("Link copied");
        }
    };

    if (!project) return null;

    const medias = project.attachments || [];
    const topics = project.topics ?? [];
    const skills = project.skills ?? [];
    const collaborators = (project.collaborators ?? []).filter((c) => c.username);

    return (
        <DashboardLayout
            variant="full"
            contentMaxWidth="max-w-3xl"
            contentPadding="px-0"
            className="w-full "
            leftSidebarSlot={{ content: <Sidebar className='border-none w-full' />, size: 5, minSize: 5, maxSize: 5 }}
            rightSidebarSlot={undefined}
        >
            <ProjectDrawer />
            <article className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6 sm:px-6 md:pt-10">
                {project.username && (
                    <Link
                        href={`/${project.username}`}
                        className="-ml-2 mb-6 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm text-ink-secondary transition-colors duration-fast ease-calm hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        @{project.username}
                    </Link>
                )}

                <header>
                    <div className="flex items-start justify-between gap-3">
                        <ProjectLogo src={project.logo} name={project.name} />
                        <ProjectDialogOptions
                            projectId={project.id}
                            profileId={project.profileId as string}
                        />
                    </div>
                    <h1 className="mt-5 font-instrument text-4xl leading-[1.05] text-ink md:text-5xl">
                        {project.name}
                    </h1>
                    {project.tagline && (
                        <p className="mt-2 text-lg leading-snug text-ink-secondary">
                            {project.tagline}
                        </p>
                    )}
                    {topics.length > 0 && (
                        <p className="mt-3 text-sm text-ink-secondary">
                            {topics.map((t) => t.name).join(" · ")}
                        </p>
                    )}

                    <div className="mt-5 border-y border-hairline py-1.5">
                        <ProjectInteractions
                            className="-ml-2"
                            upvoteCount={Number(project.upvoteCount)}
                            downvoteCount={Number(project.downvoteCount)}
                            userVote={project.userVote ?? null}
                            handleVoteClick={(value) => voteMutation.mutate(value)}
                            isBookmarked={!!project.bookmarked}
                            handleBookmarkClick={() => bookmarkMutation.mutate()}
                            handleShareClick={handleShareClick}
                        />
                    </div>
                </header>

                {medias.length > 0 && <ProjectMedia medias={medias} />}

                {project.description && (
                    <div
                        className={cn(
                            "prose mt-8 max-w-none break-words text-[17px] leading-relaxed text-ink dark:prose-invert",
                            "prose-headings:font-instrument prose-headings:font-normal prose-headings:text-ink prose-h1:text-3xl prose-h2:text-2xl",
                            "prose-a:text-ink prose-a:underline-offset-4",
                        )}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.description ?? "") }}
                    />
                )}

                {project.url && (
                    <ProfileSection id="project-links" title="Links" className="mt-10">
                        <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex min-h-11 items-center gap-3 rounded-lg text-[15px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                        >
                            <Globe className="size-4 shrink-0 text-ink-secondary" aria-hidden />
                            <span className="truncate underline decoration-hairline underline-offset-4 group-hover:decoration-ink">
                                {hostOf(project.url)}
                            </span>
                            <ArrowUpRight className="size-4 shrink-0 text-ink-secondary" aria-hidden />
                        </a>
                    </ProfileSection>
                )}

                {skills.length > 0 && (
                    <ProfileSection id="project-skills" title="Built with" className={cn(!project.url && "mt-10")}>
                        <ul className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <li
                                    key={skill.slug}
                                    className="rounded-full border border-hairline px-3 py-1 text-sm text-ink"
                                >
                                    {skill.name}
                                </li>
                            ))}
                        </ul>
                    </ProfileSection>
                )}

                {collaborators.length > 0 && (
                    <ProfileSection
                        id="project-collaborators"
                        title="Collaborators"
                        className={cn(!project.url && skills.length === 0 && "mt-10")}
                    >
                        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {collaborators.map((c) => (
                                <li key={c.id}>
                                    <Link
                                        href={`/${c.username}`}
                                        className="-mx-2 flex min-h-11 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-fast ease-calm hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                                    >
                                        <PersonAvatar
                                            src={c.profileImage}
                                            name={c.displayName || c.username}
                                            size={36}
                                        />
                                        <span className="min-w-0 leading-tight">
                                            <span className="block truncate text-sm font-medium text-ink">
                                                {c.displayName || c.username}
                                            </span>
                                            <span className="block truncate text-[13px] text-ink-secondary">
                                                @{c.username}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </ProfileSection>
                )}

                {!session?.data && (
                    <div className="mt-12 border-t border-hairline pt-8">
                        <BottomBanner className="max-w-2xl w-full" />
                    </div>
                )}
            </article>
        </DashboardLayout>
    );
};

export default ProjectPage;
