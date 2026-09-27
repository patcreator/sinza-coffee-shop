import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicBase = process.env.R2_PUBLIC_BASE_URL;

export const r2Configured = Boolean(accountId && accessKeyId && secretAccessKey && bucket);

function client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
  });
}

export async function uploadToR2(file: File, folder = "uploads") {
  const ext = file.name.split(".").pop() || "bin";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  if (!r2Configured) {
    // Graceful local fallback: return a data URL for small files so the CMS keeps working.
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.byteLength > 900_000) {
      throw new Error(
        "Cloudflare R2 is not configured and the file is too large for the local fallback.",
      );
    }
    return {
      key,
      url: `data:${file.type || "application/octet-stream"};base64,${buf.toString("base64")}`,
      storage: "inline" as const,
    };
  }

  const body = Buffer.from(await file.arrayBuffer());
  await client().send(
    new PutObjectCommand({
      Bucket: bucket!,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
    }),
  );

  const url = publicBase
    ? `${publicBase.replace(/\/$/, "")}/${key}`
    : `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${key}`;
  return { key, url, storage: "r2" as const };
}
