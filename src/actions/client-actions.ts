import axios from "axios";

export const uploadMedia = async (formData: FormData) => {
  const res = await axios.post(
    "http://localhost:3000/api/upload/files",
    formData
  );
  if (res.status !== 200) throw new Error("Upload failed");
  return res.data?.data;
};
