import { TUploadFilesResponse } from "@/lib/types";
import { NextRequest } from "next/server";
import { uploadToS3 } from "@/lib/s3";

type UploadFilesWithTypeResponse = TUploadFilesResponse & { type: string };

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "uploads";
    const results: UploadFilesWithTypeResponse[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await uploadToS3(buffer, {
        folder: folder,
        contentType: file.type,
        fileName: `${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
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
      { success: false, data: null, error: error.message },
      { status: 500 }
    );
  }
}
