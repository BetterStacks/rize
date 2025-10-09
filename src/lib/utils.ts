import { clsx, type ClassValue } from "clsx";
import { Area } from "react-easy-crop";
import { twMerge } from "tailwind-merge";
import { ClassifiedWord, SocialPlatform } from "./types";

export const MAX_GALLERY_ITEMS = 8;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPublicIdFromUrl(url: string) {
  const matches = url.match(/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return matches ? matches[1] : null;
}

export const createImage = (url: string) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  }) as Promise<HTMLImageElement>;

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");

  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    return null;
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob((file) => {
      resolve(URL.createObjectURL(file as File));
    }, "image/jpeg");
  });
}

export async function toBase64(blobUrl: string) {
  const blob = await fetch(blobUrl).then((response) => response.blob());

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function getBase64Image(file: File, image: string) {
  const mimeType = file!.type;
  const encoding = "base64";
  const base64Data = await toBase64(image as string);
  const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;
  return fileUri;
}

export function cleanUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

export const isImageUrl = (url: string): boolean => {
  const imageRegex = /\.(jpeg|jpg|png|gif|bmp|webp|svg)$/i;
  return imageRegex.test(url);
};
export const isVideoUrl = (url: string): boolean => {
  const videoRegex = /\.(mp4|webm)$/i;
  return videoRegex.test(url);
};

export const capitalizeFirstLetter = (str: string) => {
  return str?.charAt(0)?.toUpperCase() + str?.slice(1);
};

export const availablePlatforms: SocialPlatform[] = [
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "github",
  "youtube",
  "reddit",
  "other",
  "discord",
  "snapchat",
  "spotify",
  "pinterest",
];

export const getIcon = (platform: SocialPlatform) => {
  switch (platform) {
    case "facebook":
      return "facebook.svg";
    case "twitter":
      return "x.svg";
    case "instagram":
      return "instagram.svg";
    case "linkedin":
      return "linkedin.svg";
    case "github":
      return "github.svg";
    case "youtube":
      return "youtube.svg";
    case "reddit":
      return "reddit.svg";
    case "discord":
      return "discord.svg";
    case "snapchat":
      return "snapchat.svg";
    case "spotify":
      return "spotify.svg";
    case "pinterest":
      return "pinterest.svg";
    case "other":
      return "globe.svg";
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject("Failed to convert file to base64.");
      }
    };

    reader.onerror = (error) => reject(error);
  });
};

export function isEqual(a: unknown, b: unknown): boolean {
  // Handle same reference or primitive equality
  if (a === b) return true;

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle null or undefined (your existing check is perfect)
  if (a == null || b == null) return a === b;

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => isEqual(item, b[i]));
  }

  // Handle objects - THIS IS THE CORRECTED PART
  if (typeof a === "object" && typeof b === "object") {
    // Assert that a and b are objects that can be indexed by a string.
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;

    const aKeys = Object.keys(objA);
    const bKeys = Object.keys(objB);

    if (aKeys.length !== bKeys.length) return false;

    // Now TypeScript allows indexing with 'key'
    return aKeys.every((key) => isEqual(objA[key], objB[key]));
  }

  // Fallback for all other cases
  return false;
}

export function classifyText(input: string): ClassifiedWord[] {
  const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
  const urlRegex =
    /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

  const tokens: ClassifiedWord[] = [];

  const parts = input.split(/(\n|\s+)/);

  for (const part of parts) {
    if (part.includes("\n")) {
      tokens.push({ type: "newline", value: part });
    } else if (/^\s+$/.test(part)) {
      // skip whitespace
    } else if (emailRegex.test(part)) {
      tokens.push({ type: "email", value: part });
    } else if (urlRegex.test(part)) {
      tokens.push({ type: "link", value: part });
    } else if (part.length > 0) {
      tokens.push({ type: "word", value: part });
    }
  }

  return tokens;
}

const options = {
  // Customize the default request headers:
  requestHeaders: {
    "User-Agent": "url-metadata (+https://www.npmjs.com/package/url-metadata)",
    From: "example@example.com",
  },

  // (Node.js v18+ only)
  // To prevent SSRF attacks, the default option below blocks
  // requests to private network & reserved IP addresses via:
  // https://www.npmjs.com/package/request-filtering-agent
  // Browser security policies prevent SSRF automatically.
  requestFilteringAgentOptions: undefined,

  // (Node.js v6+ only)
  // Pass in your own custom `agent` to override the
  // built-in request filtering agent above
  // https://www.npmjs.com/package/node-fetch/v/2.7.0#custom-agent
  agent: undefined,

  // (Browser only) `fetch` API cache setting
  cache: "no-cache",

  // (Browser only) `fetch` API mode (ex: 'cors', 'same-origin', etc)
  mode: "cors",

  // Maximum redirects in request chain, defaults to 10
  maxRedirects: 10,

  // `fetch` timeout in milliseconds, default is 10 seconds
  timeout: 10000,

  // (Node.js v6+ only) max size of response in bytes (uncompressed)
  // Default set to 0 to disable max size
  size: 0,

  // (Node.js v6+ only) compression defaults to true
  // Support gzip/deflate content encoding, set `false` to disable
  compress: true,

  // Charset to decode response with (ex: 'auto', 'utf-8', 'EUC-JP')
  // defaults to auto-detect in `Content-Type` header or meta tag
  // if none found, default `auto` option falls back to `utf-8`
  // override by passing in charset here (ex: 'windows-1251'):
  decode: "auto",

  // Number of characters to truncate description to
  descriptionLength: 750,

  // Force image urls in selected tags to use https,
  // valid for images & favicons with full paths
  ensureSecureImageRequest: true,

  // Include raw response body as string
  includeResponseBody: false,

  // Alternate use-case: pass in `Response` object here to be parsed
  // see example below
  parseResponseObject: undefined,
};

export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
export function bytesToMB(bytes: number, decimals = 2): number {
  if (bytes === 0) return 0;
  const mb = bytes / (1024 * 1024);
  return parseFloat(mb.toFixed(decimals));
}
