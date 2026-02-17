import { GetProfileByUsername } from '@/lib/types'
import UserAvatar from '../user-avatar'
import { cleanUrl, cn } from '@/lib/utils'
import QRcode from './QRcode'
import { Link2 } from 'lucide-react';

type ProfileProps = {
  data: GetProfileByUsername;
  isLoading: boolean;
  isMine: boolean;
  bioContainerClassName?: string;
  username?: string;
};

export const defaultBio = `I’m still setting up, but this is where it all starts 🌱.\n
A place to share what I do, what I love, and where I’m headed.It’s quiet for now, but trust me—it won’t stay that way for long.`

const Profile = ({
  data,
  isMine,
  isLoading,
  bioContainerClassName,
  username,
}: ProfileProps) => {
  return (
    <div className=" w-full flex flex-col items-center justify-start   mb-2">
      <div className=" max-w-2xl w-full flex flex-col items-start justify-start">
        <div className="mb-6 user-avatar  self-start flex justify-between items-center w-full max-w-2xl">
          <UserAvatar
            isMyProfile={isMine}
            isLoading={isLoading}
            data={{
              image: data?.profileImage as string,
              name: data?.displayName as string,
            }}
          />
          <QRcode
            username={username}
            profileImage={data?.profileImage as string}
          />
        </div>
        <h1 className="profile-displayName self-start text-xl font-medium md:text-xl lg:text-2xl tracking-tight">
          {' '}
          {data?.displayName || data?.name}
        </h1>

        {data?.website && (
          <div className="inline-flex items-center bg-neutral-100 dark:bg-dark-border px-3 py-1 rounded-3xl justify-start mt-4 text-xs md:text-sm font-medium text-neutral-600 dark:text-neutral-300 ">
            <Link2 strokeWidth={1.3} className="-rotate-45 size-4 mr-1 " />
            <span>{cleanUrl(data?.website)}</span>
          </div>
        )}
        <div
          className={cn(
            'w-full  flex flex-col items-start justify-center mt-4 mb-4',
            bioContainerClassName
          )}
        >
          <div className="profile-Bio flex flex-col items-start text-sm md:text-base  gap-y-0.5 text-neutral-800 dark:text-neutral-300  leading-tight   ">
            {(data?.bio || defaultBio)?.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile


