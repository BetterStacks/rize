import { getProjectByID } from '@/actions/project-actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { appSidebarSlot } from '@/components/layout/app-sidebar-slot'
import ProjectPage from '@/components/project-details-page';
import { Metadata } from 'next';
import { FC } from 'react';

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const id = (await params).id
    const project = await getProjectByID(id)

    if (!project) {
        return {
            title: 'Project Not Found - Rize',
        }
    }

    return {
        title: `${project.name} | Rize`,
        description: project.tagline || '',
        openGraph: {
            title: `${project.name} | Rize`,
            description: project.tagline || '',
            images: project.logo ? [project.logo] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${project.name} | Rize`,
            description: project.tagline || '',
            images: project.logo ? [project.logo] : [],
        },
        icons: {
            icon: project.logo || '/favicon.ico',
        },
    }
}

const Page: FC<PageProps> = async ({ params }) => {
    const id = (await params)?.id as string
    const data = await getProjectByID(id)

    if (!data) {
        return (
            <DashboardLayout
                variant="post"
                contentMaxWidth="max-w-2xl"
                contentPadding="px-0"
                leftSidebarSlot={appSidebarSlot}
            >
                <div className="px-4 pt-16 sm:px-6">
                    <h1 className="font-instrument text-4xl leading-tight text-ink">Project not found</h1>
                    <p className="mt-2 text-base text-ink-secondary">It may have been removed, or the link is wrong.</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <ProjectPage
            initialProjectData={data}
            id={id}
        />
    )
}

export default Page;
