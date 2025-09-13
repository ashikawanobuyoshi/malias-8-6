// composables/useS3.ts
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export const useS3 = () => {
  const config = useRuntimeConfig();

  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const listObjects = async (prefix: string) => {
    const command = new ListObjectsV2Command({
      Bucket: 'studiomalias-webselect-images',
      Prefix: prefix,
    });
    const response = await s3.send(command);
    return response.Contents?.map((item) => item.Key) ?? [];
  };

  const getObject = async (key: string) => {
    const command = new GetObjectCommand({
      Bucket: config.public.s3BucketName,
      Key: key
    });
    const response = await s3.send(command);
    return response.Body;
  };

  return { listObjects };
};

