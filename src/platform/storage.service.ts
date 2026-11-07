import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config/env.schema';

@Injectable()
export class StorageService {
  private readonly client: S3Client | null;
  private readonly bucket: string | null;

  constructor(config: ConfigService<AppEnv, true>) {
    const endpoint = config.get('S3_ENDPOINT', { infer: true });
    const bucket = config.get('S3_BUCKET', { infer: true });
    const accessKeyId = config.get('S3_ACCESS_KEY_ID', { infer: true });
    const secretAccessKey = config.get('S3_SECRET_ACCESS_KEY', { infer: true });
    if (endpoint && bucket && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: config.get('S3_REGION', { infer: true }),
        endpoint,
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.bucket = bucket;
    } else {
      this.client = null;
      this.bucket = null;
    }
  }

  get configured(): boolean {
    return this.client !== null && this.bucket !== null;
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    const client = this.requireClient();
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket ?? '',
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async get(key: string): Promise<Buffer> {
    const client = this.requireClient();
    const result = await client.send(
      new GetObjectCommand({
        Bucket: this.bucket ?? '',
        Key: key,
      }),
    );
    if (!result.Body) {
      throw new ServiceUnavailableException('Stored object has no body');
    }
    const bytes = await result.Body.transformToByteArray();
    return Buffer.from(bytes);
  }

  private requireClient(): S3Client {
    if (!this.client || !this.bucket) {
      throw new ServiceUnavailableException(
        'Object storage is not configured. Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.',
      );
    }
    return this.client;
  }
}
