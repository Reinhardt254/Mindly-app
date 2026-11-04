import {
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { env } from "../config/env";

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3 = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    forcePathStyle: true,
    credentials: { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY },
  });

  async onModuleInit() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
    } catch {
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
        this.logger.log(`Created bucket ${env.S3_BUCKET}`);
      } catch (e) {
        this.logger.error(`Bucket ${env.S3_BUCKET} is not reachable: ${(e as Error).message}`);
      }
    }
  }

  uploadUrl(key: string, contentType: string, expiresIn = 600) {
    return getSignedUrl(this.s3, new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, ContentType: contentType }), {
      expiresIn,
    });
  }

  downloadUrl(key: string, expiresIn = 3600) {
    return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }), { expiresIn });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async remove(key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
  }

  async removeMany(keys: string[]) {
    for (let i = 0; i < keys.length; i += 1000) {
      await this.s3.send(
        new DeleteObjectsCommand({
          Bucket: env.S3_BUCKET,
          Delete: { Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })) },
        }),
      );
    }
  }
}
