import { Media } from "@/db/schema";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { NextRequest } from "next/server";

cloudinary.config({
  api_key: "537392939961543",
  api_secret: "ao9f7xxkcT3qjMyTqe-JjYPgGNM",
  cloud_name: "dfccipzwz",
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const results: string[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    try {
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "fyp-stacks/gallery", // Optional: specify a folder in Cloudinary
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
      results.push(result?.secure_url as string);
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
