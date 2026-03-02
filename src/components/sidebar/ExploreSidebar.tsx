"use client"
import { cn } from '@/lib/utils';
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useQuery } from '@tanstack/react-query';
import { getRecentlyJoinedProfilesCached } from '@/actions/profile-actions';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type ExploreSidebarProps = {
    className?: string;
}

const ExploreSidebar = ({ className }: ExploreSidebarProps) => {
    const { data: recentlyJoinedProfiles, isLoading } = useQuery(
        {
            queryKey: ['get-recently-joined-profiles'],
            queryFn: () => getRecentlyJoinedProfilesCached(3)
        }
    )
    return (
        <div className={cn(`size-full flex flex-col`, className)}>
            <div className="px-4 mt-4 pb-4 border-b dark:border-dark-border border-neutral-200">
                {/* <Input placeholder='Search' className='dark:bg-dark-border bg-neutral-100 rounded-full px-6 h-12' /> */}
            </div>
            <div className="mt-4 border-b dark:border-dark-border border-neutral-200">
                <div className='flex px-4 items-center justify-between'>
                    <h3 className='text-gray-500 dark:text-gray-400 text-sm  font-medium'>Recently Joined</h3>
                    {/* <Button variant='ghost' size="sm">See All</Button> */}
                </div>
                <div className='flex flex-col mt-2 '>
                    {recentlyJoinedProfiles?.map((profile, i) => (
                        <Link href={`/${profile.username}`} key={i} className="px-4 group flex w-full py-2 cursor-pointer hover:bg-neutral-100 hover:dark:bg-dark-border last:pb-3 items-center gap-2">
                            {profile.profileImage && <Image className='size-8 rounded-full' src={profile.profileImage as string} alt={profile.displayName as string} width={40} height={40} />}
                            <div className='flex flex-col ml-1 flex-1'>
                                <h4 className='font-medium text-gray-700 dark:text-gray-200'>{profile.displayName}</h4>
                                {/* <span className='text-sm leading-tight text-gray-500 dark:text-gray-400'>@{profile.username}</span> */}
                                <span className='text-sm leading-tight text-gray-500 dark:text-gray-300'>
                                    Joined at {(profile.createdAt as Date)?.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                            </div>
                            <div className=' opacity-0 group-hover:opacity-100'>
                                <Button variant='ghost' size="smallIcon"><ArrowRight className='size-4' /></Button>
                            </div>

                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ExploreSidebar