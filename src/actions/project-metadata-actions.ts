"use server";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import urlMetadata from "url-metadata";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { safeFetch } from "@/lib/safe-url";

// Both actions fetch remote URLs and one calls an AI model, so they need a
// signed-in user and share the AI rate limit.
const requireAiQuota = async (): Promise<string | null> => {
  const session = await getServerSession().catch(() => null);
  if (!session?.user?.id) return "Sign in to continue";
  const { success } = await checkRateLimit("ai", session.user.id);
  return success ? null : "Too many requests. Please try again later.";
};

const projectLinkSchema = z.object({
  url: z.string().min(1, "Project URL is required"),
});

type ProjectMetadataResult = {
  name: string;
  description: string;
  logo?: string | null;
  tagline?: string | null;
  normalizedUrl: string;
};

const normalizeUrl = (input: string) => {
  const trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const coerceString = (value: unknown) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
};

const pickFirst = (...values: Array<unknown>) => {
  for (const value of values) {
    const str = coerceString(value);
    if (str && str.trim()) return str.trim();
  }
  return "";
};

const fallbackNameFromUrl = (url: string) => {
  try {
    const { hostname } = new URL(url);
    const host = hostname.replace(/^www\./i, "");
    return host.split(".")[0]?.replace(/[-_]+/g, " ").trim() || "Project";
  } catch {
    return "Project";
  }
};

const clampTagline = (value: string) => {
  const cleaned = value.replace(/^["“”]+|["“”]+$/g, "").trim();
  if (cleaned.length <= 60) return cleaned;
  return cleaned.slice(0, 60).trim();
};

const fallbackTagline = (name: string, description: string) => {
  const base = description || `${name} project`;
  const firstSentence = base.split(/[.!?]/)[0] || base;
  return clampTagline(firstSentence);
};

export const getProjectMetadataFromUrl = async (payload: {
  url: string;
}): Promise<{ ok: boolean; data?: ProjectMetadataResult; error?: string }> => {
  const denied = await requireAiQuota();
  if (denied) return { ok: false, error: denied };

  const parsed = projectLinkSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message || "Invalid URL" };
  }

  const normalizedUrl = normalizeUrl(parsed.data.url);

  try {
    const response = await safeFetch(normalizedUrl);
    const metadata = (await urlMetadata(null, { parseResponseObject: response })) as Record<string, unknown>;
    console.log({ metadata: JSON.stringify(metadata, null, 2) })
    const name =
      pickFirst(metadata.title, metadata["og:title"], metadata["twitter:title"]) ||
      fallbackNameFromUrl(normalizedUrl);
    const description =
      pickFirst(
        metadata.description,
        metadata["og:description"],
        metadata["twitter:description"]
      ) || "";
    const logo =
      pickFirst(
        metadata.favicon,
        metadata.icon,
        metadata.image,
        metadata["og:image"],
        metadata["twitter:image"]
      ) || null;

    let tagline: string | null = null;
    if (name || description) {
      try {
        const prompt = `Create a concise project tagline (max 60 characters). Return only the tagline text with no quotes.\nProject name: ${name}\nProject description: ${description || "N/A"}`;
        const { text } = await generateText({
          model: google("gemini-2.0-flash-exp"),
          prompt,
        });
        tagline = clampTagline(text || "");
      } catch {
        tagline = fallbackTagline(name, description);
      }
    }

    return {
      ok: true,
      data: {
        name,
        description,
        logo,
        tagline: tagline || fallbackTagline(name, description),
        normalizedUrl,
      },
    };
  } catch (error) {
    return { ok: false, error: (error as Error)?.message || "Failed to fetch metadata" };
  }
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const fetchImageAsBase64 = async (url: string): Promise<{ ok: boolean; data?: { base64: string; contentType: string }; error?: string }> => {
  const denied = await requireAiQuota();
  if (denied) return { ok: false, error: denied };

  try {
    const response = await safeFetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const type = response.headers.get("content-type") || "";
    if (!type.startsWith("image/")) {
      throw new Error("That link isn't an image");
    }
    const declared = Number(response.headers.get("content-length") || 0);
    if (declared > MAX_IMAGE_BYTES) {
      throw new Error("Image is too large");
    }
    const blob = await response.blob();
    if (blob.size > MAX_IMAGE_BYTES) {
      throw new Error("Image is too large");
    }
    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";

    return {
      ok: true,
      data: {
        base64,
        contentType,
      },
    };
  } catch (error) {
    console.error("Error fetching image as base64:", error);
    return { ok: false, error: (error as Error)?.message || "Failed to fetch image" };
  }
};
