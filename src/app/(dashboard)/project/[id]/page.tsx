import { getProjectByID } from '@/actions/project-actions'
import ProjectPage from '@/components/project-details-page'
import DashboardLayout from '@/components/layout/DashboardLayout'
import React, { FC } from 'react'

type PageProps = {
    params: Promise<{ id: string }>;
};

const Page: FC<PageProps> = async ({ params }) => {
    const id = (await params)?.id as string
    const data = await getProjectByID(id)

    if (!data) {
        return (
            <DashboardLayout
                variant="post"
                contentMaxWidth="max-w-2xl"
                contentPadding="px-0"
            >
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <h1 className="text-2xl font-bold">Project not found</h1>
                    <p className="text-neutral-500">The project you are looking for does not exist or has been removed.</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout
            variant="full"
            contentMaxWidth="max-w-3xl"
            contentPadding="px-0"
            className="w-full "
        >
            <ProjectPage
                initialProjectData={data}
                id={id}
            />
        </DashboardLayout>
    )
}

export default Page
