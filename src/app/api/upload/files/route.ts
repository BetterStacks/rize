import { TUploadFilesResponse } from "@/lib/types";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { NextRequest } from "next/server";

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const folder = formData.get("folder") as string;
  const results: TUploadFilesResponse[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    try {
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder, // Optional: specify a folder in Cloudinary
            resource_type: "auto", // Automatically detect resource type
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result!);
            }
          }
        );

        uploadStream.write(buffer);
        uploadStream.end();
      });

      results.push({
        width: result.width,
        height: result.height,
        url: result.secure_url,
      });
    } catch (uploadError) {
      console.error(`Error uploading `, uploadError);
      return Response.json(
        { success: false, data: null, error: uploadError },
        { status: 500 }
      );
    }
  }
  return Response.json(
    { success: true, data: results, error: null },
    { status: 200 }
  );
}
