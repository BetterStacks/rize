import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { parseResumeContent } from "@/lib/resume-parser";
import { cleanupOldResumeFiles } from "@/actions/resume-actions";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOC, and DOCX files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert file to base64 for Cloudinary upload
    const fileBuffer = await file.arrayBuffer();
    const mimeType = file.type;
    const encoding = "base64";
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

    // Upload file to Cloudinary
    const uploadOptions: UploadApiOptions = {
      folder: "fyp-stacks/resumes",
      resource_type: "raw", // Important for non-image files like PDFs
      public_id: `resume_${session.user.id}_${Date.now()}`,
      overwrite: true,
    };

    let cloudinaryUpload;
    try {
      cloudinaryUpload = await cloudinary.uploader.upload(fileUri, uploadOptions);
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      return NextResponse.json(
        { error: "Failed to upload file to Cloudinary" },
        { status: 500 }
      );
    }

    if (!cloudinaryUpload || !cloudinaryUpload.secure_url) {
      console.error("Cloudinary upload failed");
      return NextResponse.json(
        { error: "Failed to upload file to Cloudinary" },
        { status: 500 }
      );
    }

    // Parse resume content using Letraz API
    const extractedData = await parseResumeContent(file);

    return NextResponse.json({
      success: true,
      fileUrl: cloudinaryUpload.secure_url,
      fileName: file.name,
      cloudinaryId: cloudinaryUpload.public_id,
      ...extractedData,
    });

  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}