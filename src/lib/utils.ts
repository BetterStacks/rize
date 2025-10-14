import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const MAX_GALLERY_ITEMS = 10 as const

export const availablePlatforms = []

export function bytesToMB() {}

export function cleanUrl() {}

export function getIcon() {}

export function capitalizeFirstLetter() {}

export function isValidUrl() {}

export function isImageUrl() {}

export function isEqual() {}

export async function getBase64Image() {}

export async function getCroppedImg() {}