import { v2 as cloudinary } from "cloudinary";
import { NextRequest } from "next/server";

cloudinary.config({
  api_key: "537392939961543",
  api_secret: "ao9f7xxkcT3qjMyTqe-JjYPgGNM",
  cloud_name: "dfccipzwz",
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as string; // file
    if (!file) {
      throw new Error("No file found");
    }
    const upload = await cloudinary.uploader.upload(file, {
      folder: "fyp-stacks/avatar",
      transformation: [{ radius: "max" }],
    });
    console.log({ upload });
    return Response.json({
      message: "File uploaded successfully",
      url: upload.secure_url,
    });
  } catch (error) {
    return Response.json(
      { message: "Cloudinary upload failed", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// const fileBuffer = await file.arrayBuffer();
// const mimeType = file.type;
// const encoding = "base64";
// const base64Data = Buffer.from(fileBuffer).toString("base64");
// const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;
// // console.log({ file, fileUri });
// // const img = cloudinary.image(fileBuffer, {
// //   transformation: { width: 200, height: 200, crop: "fill" },
// // });
// console.log({ img });
// const upload = await cloudinary.uploader.upload(fileUri, {
//   folder: "fyp-stacks",
// });

// // Upload with transformations
// const result = await new Promise((resolve, reject) => {
//   const uploadStream = cloudinary.uploader.upload_stream(
//     {
//       folder: "uploads", // Optional: Folder in Cloudinary
//       transformation: [
//         { width: 500, height: 500, crop: "fill" }, // Resize to 500x500 and crop
//         { format: "png" }, // Convert to JPEG
//         { quality: "auto" }, // Automatic quality
//       ],
//     },
//     (error, result) => {
//       if (error) reject(error);
//       else resolve(result);
//     }
//   );

//   uploadStream.end(buffer);
// });
