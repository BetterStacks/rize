'use server'

/**
 * Server action to add a user to Letraz's allowlist
 * @param email - The user's email address
 * @returns Success status and optional error message
 */
export async function addUserToLetrazAllowlist(email: string) {
  try {
    const letrazBaseUrl = process.env.LETRAZ_ADMIN_URL
    const adminApiKey = process.env.LETRAZ_ADMIN_API_KEY

    if (!letrazBaseUrl) {
      console.error('Missing NEXT_PUBLIC_LETRAZ_URL environment variable')
      return {
        success: false,
        error: 'Letraz URL not configured',
      }
    }

    if (!adminApiKey) {
      console.error('Missing LETRAZ_ADMIN_API_KEY environment variable')
      return {
        success: false,
        error: 'Letraz admin API key not configured',
      }
    }

    if (!email) {
      return {
        success: false,
        error: 'Email is required',
      }
    }

    const response = await fetch(
      `${letrazBaseUrl}/api/admin/add-to-allowlist`,
      {
        method: 'POST',
        headers: {
          'x-admin-api-key': adminApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(
        `Failed to add user to Letraz allowlist: ${response.status} - ${errorText}`
      )
      return {
        success: false,
        error: `Failed to add user to allowlist: ${response.status}`,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error adding user to Letraz allowlist:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

