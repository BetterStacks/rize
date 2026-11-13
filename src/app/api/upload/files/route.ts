import { TUploadFilesResponse, UploadFilesWithTypeResponse } from "@/lib/types";
import { NextRequest } from "next/server";
import { uploadToS3, optimizeImage } from "@/lib/s3";
import { checkRateLimit } from "@/lib/rate-limit";
import { getServerSession } from "@/lib/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_REQUEST = 10;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
// Folders the app uploads into. Anything else is rejected.
const ALLOWED_FOLDERS = new Set([
  "uploads",
  "profiles",
  "projects",
  "certificates",
  "fyp-stacks/posts",
  "fyp-stacks/pages",
  "fyp-stacks/gallery",
]);
// Certificates are PDFs; no other folder takes documents.
const PDF_FOLDERS = new Set(["certificates"]);

export async function POST(req: NextRequest) {
  const session = await getServerSession().catch(() => null);
  if (!session?.user?.id) {
    return Response.json(
      { success: false, data: null, error: "Sign in to upload files" },
      { status: 401 }
    );
  }

  const { success, response } = await checkRateLimit('upload', session.user.id);
  if (!success) return response!;

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "uploads";
    if (!ALLOWED_FOLDERS.has(folder)) {
      return Response.json(
        { success: false, data: null, error: "Invalid upload folder" },
        { status: 400 }
      );
    }
    const allowedTypes = PDF_FOLDERS.has(folder) ? [...ALLOWED_TYPES, "application/pdf"] : ALLOWED_TYPES;
    const results: UploadFilesWithTypeResponse[] = [];

    if (files.length === 0) {
      return Response.json(
        { success: false, data: null, error: "No files provided" },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return Response.json(
        { success: false, data: null, error: `Maximum ${MAX_FILES_PER_REQUEST} files per request` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return Response.json(
          { success: false, data: null, error: `File "${file.name}" exceeds 10MB limit` },
          { status: 400 }
        );
      }
      if (!allowedTypes.includes(file.type)) {
        return Response.json(
          { success: false, data: null, error: `File type "${file.type}" is not allowed` },
          { status: 400 }
        );
      }
    }

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      let buffer: Buffer = Buffer.from(arrayBuffer);
      let contentType = file.type;
      let fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      // Optimize images (convert to WebP, resize if too large)
      if (file.type.startsWith("image/") && !file.type.includes("gif")) {
        const optimized = await optimizeImage(buffer);
        buffer = optimized.buffer as Buffer;
        contentType = optimized.contentType;
        fileName = fileName.replace(/\.[^.]+$/, '.webp');
      }

      const uploadResult = await uploadToS3(buffer, {
        folder: folder,
        contentType,
        fileName,
      });

      results.push({
        width: uploadResult.width || 0,
        height: uploadResult.height || 0,
        url: uploadResult.url,
        type: file.type.startsWith("video") ? "video" : "image",
      });
    }

    return Response.json(
      { success: true, data: results, error: null },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error uploading to S3:", error);
    return Response.json(
      { success: false, data: null, error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
