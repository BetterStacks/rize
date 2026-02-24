"use server";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import urlMetadata from "url-metadata";
import { z } from "zod";

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
  const parsed = projectLinkSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message || "Invalid URL" };
  }

  const normalizedUrl = normalizeUrl(parsed.data.url);

  try {
    const metadata = (await urlMetadata(normalizedUrl)) as Record<string, unknown>;
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
