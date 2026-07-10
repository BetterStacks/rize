'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getMyDailyCheckinSettings, updateDailyCheckinSettings } from '@/actions/daily-checkin-actions'

// Cron stores/matches time in UTC; the picker shows IST (UTC+5:30) — fixed
// offset, not the browser's local timezone, since users are India-based.
const IST_OFFSET_MINUTES = 5 * 60 + 30

function addMinutesToHHMM(hhmm: string, delta: number) {
	const [h, m] = hhmm.split(':').map(Number)
	const total = ((h * 60 + m + delta) % 1440 + 1440) % 1440
	return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const utcToLocalHHMM = (utcHHMM: string) => addMinutesToHHMM(utcHHMM, IST_OFFSET_MINUTES)
const localToUtcHHMM = (istHHMM: string) => addMinutesToHHMM(istHHMM, -IST_OFFSET_MINUTES)

export function DailyCheckinForm() {
	const queryClient = useQueryClient()
	const { data } = useQuery({
		queryKey: ['daily-checkin-settings'],
		queryFn: getMyDailyCheckinSettings,
	})

	const [enabled, setEnabled] = useState<boolean | null>(null)
	const [time, setTime] = useState<string | null>(null)
	const [phone, setPhone] = useState<string | null>(null)

	const currentEnabled = enabled ?? data?.dailyCallEnabled ?? false
	const currentTime = time ?? (data?.preferredCallTime ? utcToLocalHHMM(data.preferredCallTime) : '09:00')
	const currentPhone = phone ?? data?.phoneNumber ?? ''
	const hasValidPhone = !!currentPhone && isValidPhoneNumber(currentPhone)

	const mutation = useMutation({
		mutationFn: () =>
			updateDailyCheckinSettings({
				enabled: currentEnabled,
				preferredCallTime: localToUtcHHMM(currentTime),
				phoneNumber: currentPhone || undefined,
			}),
		onSuccess: (res) => {
			if (res.success) {
				toast.success('Daily check-in settings saved')
				queryClient.invalidateQueries({ queryKey: ['daily-checkin-settings'] })
			} else {
				toast.error(res.error || 'Failed to save')
			}
		},
		onError: () => toast.error('Failed to save'),
	})

	return (
		<Card className="w-full dark:bg-dark-bg dark:border-dark-border sm:rounded-3xl">
			<CardHeader>
				<CardTitle>Daily Check-in Call</CardTitle>
				<CardDescription>Get a short daily voice call to check in — pick a time (IST).</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="daily-call-phone">Phone number</Label>
					<div className="flex h-10 w-full items-center rounded-lg border border-gray-300 dark:border-neutral-800 px-3 py-2 text-sm">
						<PhoneInput
							id="daily-call-phone"
							international
							defaultCountry="IN"
							value={currentPhone}
							onChange={(value) => setPhone(value || '')}
							flagComponent={() => <span className="hidden" />}
							internationalIcon={() => <></>}
							addInternationalOption={false}
							countrySelectProps={{ className: 'w-24 focus:outline-none dark:bg-dark-bg' }}
							numberInputProps={{ className: 'flex-1 ml-3 outline-none dark:bg-dark-bg' }}
							className="flex w-full items-center [&_.PhoneInputCountryIcon]:hidden"
						/>
					</div>
				</div>

				<div className="flex items-center justify-between">
					<Label htmlFor="daily-call-enabled">Enable daily call</Label>
					<Switch
						id="daily-call-enabled"
						checked={currentEnabled}
						disabled={!hasValidPhone}
						onCheckedChange={(checked) => setEnabled(checked)}
					/>
				</div>

				{currentEnabled && (
					<div className="flex items-center justify-between">
						<Label htmlFor="daily-call-time">Preferred time (IST)</Label>
						<Input
							id="daily-call-time"
							type="time"
							value={currentTime}
							onChange={(e) => setTime(e.target.value)}
							className="w-32"
						/>
					</div>
				)}

				<Button
					onClick={() => mutation.mutate()}
					disabled={mutation.isPending || (currentEnabled && !hasValidPhone)}
					className="w-full"
				>
					{mutation.isPending ? 'Saving...' : 'Save'}
				</Button>
			</CardContent>
		</Card>
	)
}
