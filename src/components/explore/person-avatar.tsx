"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

/** Up to two initials from a name or handle, e.g. "Maya Chen" -> "MC". */
export const initialsFor = (name?: string | null) => {
  const words = (name ?? "")
    .replace(/^@/, "")
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  const letters =
    words.length === 1 ? words[0].slice(0, 1) : words[0][0] + words[1][0];
  return letters.toUpperCase();
};

const normalizeSrc = (raw?: string | null) => {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith("/") ? raw : `/${raw}`;
};

type PersonAvatarProps = {
  src?: string | null;
  name?: string | null;
  /** Rendered size in px; also used for next/image `sizes`. */
  size?: number;
  className?: string;
};

/**
 * Round avatar. Falls back to initials on a soft yellow tint when there is no
 * image or it fails to load. The image is decorative (alt="") because the
 * person's name is always shown next to it.
 */
const PersonAvatar = ({ src, name, size = 48, className }: PersonAvatarProps) => {
  const normalized = normalizeSrc(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = normalized && failedSrc !== normalized;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-[#FFF6CC] text-[#1F1B16] dark:bg-[#3A3220] dark:text-[#F3EEE6]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {showImage ? (
        <Image
          src={normalized}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setFailedSrc(normalized)}
        />
      ) : (
        <span
          className="font-inter font-medium select-none"
          style={{ fontSize: Math.max(11, Math.round(size * 0.36)) }}
        >
          {initialsFor(name)}
        </span>
      )}
    </span>
  );
};

export default PersonAvatar;
