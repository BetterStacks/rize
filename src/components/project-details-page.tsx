"use client";

import { getProjectByID } from "@/actions/project-actions";
import { GetAllProjects } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Globe, Tags } from "lucide-react";
import Image from "next/image";
import React, { FC, useState } from "react";
import { EmptyGalleryState } from "./gallery/gallery-empty-state";
import { ProjectDialogOptions } from "./projects/ProjectDetailsDialog";
import ProjectDrawer from "./projects/ProjectDrawer";
import { Button } from "./ui/button";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import BottomBanner from "./bottom-banner";
import { Separator } from "./ui/separator";

type ProjectPageProps = {
    id: string;
    initialProjectData: GetAllProjects;
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

    const [index, setIndex] = useState(0);

    if (!project) return null;

    const medias = project.attachments || [];
    const prev = () => setIndex((i) => Math.max(0, i - 1));
    const next = () => setIndex((i) => Math.min(medias.length > 1 ? medias.length - 2 : 0, i + 1));

    return (
        <div className="w-full ">
            <ProjectDrawer />
            <div className="w-full mt-24 shadow-none bg-transparent dark:bg-transparent border-none">
                <div className="px-0 mt-4 z-50 pt-0 backdrop-blur-md pb-4">
                    <div className="flex items-start justify-between px-4 mt-4">
                        <div className="flex items-start">
                            {project.logo ? (
                                <div className="relative size-12 md:size-14 aspect-square rounded-lg overflow-hidden border-2 border-neutral-200 dark:border-dark-border">
                                    <Image src={project.logo} alt={project.name} fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="size-12 md:size-14 aspect-square rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-dark-border border-2 border-neutral-200 dark:border-dark-border">
                                    <Globe className="size-6 md:size-8 opacity-50" />
                                </div>
                            )}
                            <div className={cn("flex flex-col items-start justify-start", "ml-4")}>
                                <div className="flex items-center justify-start">
                                    <h1 className="text-lg md:text-xl text-gray-900 font-medium dark:text-white tracking-tight">{project.name}</h1>
                                </div>
                                {project.tagline && (
                                    <span className="text-base md:text-lg dark:text-gray-400 text-gray-600 flex items-center justify-start">
                                        {project.tagline}
                                    </span>
                                )}

                            </div>
                        </div>
                        <ProjectDialogOptions
                            projectId={project.id}
                            profileId={project.profileId as string}
                        />
                    </div>
                </div>

                <div className="px-4 mt-1">
                    {project?.categories!?.length > 0 && <div className="flex items-center justify-start dark:text-gray-400 text-gray-700 gap-2">
                        <Tags className="mr-2 size-5" />
                        {project?.categories!?.map((category, index) => (
                            <React.Fragment key={category.id} >
                                <span className="cursor-pointer hover:dark:text-main-yellow hover:text-yellow-500 hover:underline transition-all ease-in duration-75 underline-offset-2">
                                    {category.name}
                                </span>
                                {project.categories!.length - 1 !== index && <span className="">•</span>}
                            </React.Fragment>
                        ))}
                    </div>}
                    <div className="mt-6 mb-4 flex flex-row items-center justify-center gap-4">
                        {project?.url && <Link className="w-full" href={project?.url} target="_blank">
                            <Button variant={"secondary"} className="w-full" >
                                {/* <span className="font-medium"> */}
                                Visit Website
                                {/* </span> */}
                                <ArrowUpRight className="size-4 ml-2" />
                            </Button>
                        </Link>}
                        {/* <Button className="w-full" >
                            Save
                        </Button> */}
                    </div>

                    {medias.length > 0 && (
                        <div className="relative mb-6 mt-6 w-full overflow-hidden">
                            <div className="w-full flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-neutral-400 tracking-wider ">Attachments</h3>
                                <div className="flex items-center gap-2">
                                    {index > 0 && <Button variant={"outline"} className='' size={"smallIcon"} onClick={prev}>
                                        <ArrowLeft className="size-4" />
                                    </Button>}
                                    {index < (medias.length > 1 ? medias.length - 2 : 0) && <Button variant={"outline"} className='' size={"smallIcon"} onClick={next}>
                                        <ArrowRight className="size-4" />
                                    </Button>}
                                </div>
                            </div>
                            <motion.div
                                className="flex gap-4 cursor-grab active:cursor-grabbing"
                                animate={{ x: `calc(-${index * 50}% - ${index * 8}px)` }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={(_, info) => {
                                    if (info.offset.x < -100 && index < (medias.length > 1 ? medias.length - 2 : 0)) next();
                                    else if (info.offset.x > 100 && index > 0) prev();
                                }}
                            >
                                {medias.map((media, i) => (
                                    <div
                                        key={media.id}
                                        className="relative min-w-[calc(50%-8px)] aspect-[16/10] border-2 border-neutral-200 dark:border-dark-border rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 shadow-sm flex-shrink-0"
                                    >
                                        {media.type === "video" ? (
                                            <video
                                                src={media.url}
                                                className="w-full h-full object-cover"
                                                controls
                                            />
                                        ) : (
                                            <Image
                                                src={media.url}
                                                alt={`media-${i}`}
                                                fill
                                                className="object-cover w-full h-full"
                                                priority={i === index}
                                            />
                                        )}
                                    </div>
                                ))}
                            </motion.div>

                            {/* Navigation Buttons */}
                            {/* <AnimatePresence>
                                {index > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        onClick={prev}
                                        className="absolute left-4 top-[calc(40%)] -translate-y-1/2 z-10 p-2 bg-white/90 dark:bg-dark-bg/90 shadow-2xl border border-neutral-200/50 dark:border-dark-border rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                        <ArrowLeft className="size-4 text-neutral-800 dark:text-white" />
                                    </motion.button>
                                )}
                                {index < medias.length - 1 && (
                                    <motion.button
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        onClick={next}
                                        className="absolute right-4 top-[calc(40%)] -translate-y-1/2 z-10 p-2 bg-white/90 dark:bg-dark-bg/90 shadow-2xl border border-neutral-200/50 dark:border-dark-border rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                        <ArrowRight className="size-4 text-neutral-800 dark:text-white" />
                                    </motion.button>
                                )}
                            </AnimatePresence> */}

                            {/* Pagination Dots */}
                            <div className="mt-8 flex items-center justify-center gap-2.5">
                                {medias.length > 1 ? medias.slice(0, medias.length - 1).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setIndex(i)}
                                        className={cn(
                                            "transition-all duration-300 rounded-full",
                                            i === index
                                                ? "size-2.5 bg-main-yellow" // Active dot: Vibrant orange-red from the ref
                                                : "size-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700"
                                        )}
                                        aria-label={`Go to slide ${i + 1}`}
                                    />
                                )) : null}
                            </div>
                        </div>
                    )}

                    {project.description && (
                        <p className="text-gray-700 mt-3 dark:text-gray-300 leading-relaxed mb-10 whitespace-pre-wrap ">
                            {project.description}
                        </p>
                    )}

                    {(project.skills?.length || 0) > 0 && (
                        <div className="mt-4 mb-6">
                            <h3 className="text-sm font-semibold text-neutral-400 tracking-wider mb-4">Built With</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.skills?.map(skill => (
                                    <Button key={skill?.slug} variant={"outline"} >
                                        {skill?.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {project?.collaborators!?.length > 0 && (
                        <div className="mt-4 mb-6">
                            <h3 className="text-sm font-semibold text-neutral-400 tracking-wider mb-4">Collaborators</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.collaborators!?.map(collaborator => (
                                    <Button key={collaborator.id} variant={"outline"} >
                                        <div className="size-5 rounded-full overflow-hidden relative mr-2">
                                            {collaborator.profileImage && <Image src={collaborator.profileImage} alt={collaborator.username!} fill className="object-cover" />}
                                        </div>
                                        @{collaborator.username}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}



                    {/* {(project.categories?.length || 0) > 0 && (
                        <div className="mt-12">
                            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.categories?.map(cat => (
                                    <span key={cat.id} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-dark-border text-neutral-600 dark:text-neutral-300 text-sm border border-neutral-200 dark:border-neutral-800">
                                        #{cat.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )} */}


                </div>
                {!session?.data && <div className="px-4 flex flex-col gap-2 mt-12 justify-center">
                    <div className=" w-full h-2 border-t dark:border-dark-border/60 border-neutral-200" />
                    <BottomBanner className="max-w-3xl w-full" />
                </div>
                }
            </div>
        </div>
    );
};

export default ProjectPage;
