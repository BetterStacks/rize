import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { NextRequest } from "next/server";

cloudinary.config({
  api_key: "537392939961543",
  api_secret: "ao9f7xxkcT3qjMyTqe-JjYPgGNM",
  cloud_name: "dfccipzwz",
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const type = data.get("type") as string;
    const file = data.getAll("file") as string[]; // file

    let options: UploadApiOptions = {};
    const results: string[] = [];

    console.log({ data });
    if (!file || file.length === 0) {
      throw new Error("No file found");
    }
    if (type === "avatar") {
      options = {
        folder: "fyp-stacks/avatar",
        transformation: [{ radius: "max" }],
      };
      const upload = await cloudinary.uploader.upload(file[0], options);
      return Response.json(
        {
          message: "File uploaded successfully",
          url: upload.secure_url,
        },
        { status: 200 }
      );
    } else if (type === "gallery") {
      options = {
        folder: "fyp-stacks/gallery",
        resource_type: "auto",
      };
    }

    const uploadFiles = Promise.allSettled(
      file.map(async (f) => await cloudinary.uploader.upload(f, options))
    );

    (await uploadFiles).map((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value.secure_url);
      } else {
        console.log({ err: result.reason });
      }
    });
    console.log(results);
    return Response.json(
      {
        message: "File uploaded successfully",
        url: results,
      },
      { status: 200 }
    );
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
