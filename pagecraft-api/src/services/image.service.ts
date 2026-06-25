import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "../lib/r2";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function uploadImage(
  env: {
    IMAGE_BUCKET: R2Bucket;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_ENDPOINT: string;
  },
  bookId: string,
  pageId: string,
  imageBuffer: ArrayBuffer,
): Promise<string> {
  const key = `books/${bookId}/pages/${pageId}/${Date.now()}.png`;

  // Upload to R2 using the binding for actual storage
  await env.IMAGE_BUCKET.put(key, imageBuffer, {
    httpMetadata: { contentType: "image/png" },
  });

  return key;
}

export async function getSignedImageUrl(
  env: {
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_ENDPOINT: string;
  },
  key: string,
): Promise<string> {
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const s3Client = getS3Client(env);
  const command = new GetObjectCommand({
    Bucket: "pagecraft-images", // Should probably be configurable
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getImageAsBase64(
  bucket: R2Bucket,
  r2Key: string,
): Promise<{ base64: string; mimeType: string }> {
  const object = await bucket.get(r2Key);
  if (!object) {
    throw new Error("Image not found in storage");
  }
  const buffer = await object.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);
  const mimeType = object.httpMetadata?.contentType ?? "image/png";
  return { base64, mimeType };
}
