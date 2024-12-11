import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  audioUploader: f({
    audio: { maxFileSize: "4MB" },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("✅ Upload complete:", { metadata, fileUrl: file.url });
  }),

  presetUploader: f({
    blob: { maxFileSize: "4MB" },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("✅ Upload complete:", { metadata, fileUrl: file.url });
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
