import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
    imagingUploader: f({ image: { maxFileSize: "16MB", maxFileCount: 1 } })
        .middleware(async () => {
            const session = await getServerSession(authOptions);
            if (!session) throw new Error("Non autorisé");
            return { userId: (session.user as any).id };
        })
        .onUploadComplete(async ({ file }) => {
            return { url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
