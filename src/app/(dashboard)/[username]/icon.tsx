import { ImageResponse } from 'next/og'
import { getProfileByUsername } from '@/actions/profile-actions'

export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default async function Icon({ params }: { params: Promise<{ username: string }> }) {
    const username = (await params).username
    const user = await getProfileByUsername(username)

    // Satori (used by ImageResponse) can't rasterize dicebear's SVG output —
    // it lacks explicit width/height, only a viewBox. Use the PNG variant here.
    const profileImage = (user?.profileImage || 'https://rize.lol/favicon.ico').replace(
        '/9.x/initials/svg',
        '/9.x/initials/png'
    )

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    overflow: 'hidden',
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={profileImage}
                    alt={username}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                    }}
                />
            </div>
        ),
        {
            ...size,
        }
    )
}
