// server/api/loadImages.get.ts
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getQuery } from "h3";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const folder = query.folder || "omiyamairi_2025";

  const config = useRuntimeConfig();
  console.log(config.smtpUser, config.smtpPass)
  console.log("config in loadImages:", config)
  console.log('S3 Bucket Name:', config.s3BucketName);
  // --- 環境変数確認 ---
  console.log("AWS_ACCESS_KEY_ID:", !!config.awsAccessKeyId);
  console.log("AWS_SECRET_ACCESS_KEY:", !!config.awsSecretAccessKey);
  console.log("AWS_REGION:", !!config.awsRegion);
  console.log("S3_BUCKET_NAME:", config.s3BucketName);

  if (!config.s3BucketName || !config.awsAccessKeyId || !config.awsSecretAccessKey || !config.awsRegion) {
    console.error("S3 設定が正しくありません。環境変数を確認してください。");
    return [];
  }

  const s3 = new S3Client({
    region: config.awsRegion,
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  });

  try {
    const command = new ListObjectsV2Command({
      Bucket: config.s3BucketName,
      Prefix: folder + "/",
    });

    const result = await s3.send(command);

    return (result.Contents || [])
      .filter((obj) => obj.Key && (obj.Key.endsWith(".jpg") || obj.Key.endsWith(".png")))
      .map((obj) => ({
        url: `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/${obj.Key}`,
        fileName: obj.Key?.split("/").pop() || "unknown",
      }));
  } catch (err) {
    console.error("S3取得失敗", err);
    return [];
  }
});



