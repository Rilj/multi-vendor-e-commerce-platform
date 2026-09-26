import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {}

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    folder: string = "uploads",
  ): Promise<UploadResult> {
    const awsConfig = {
      accessKeyId: this.configService.get<string>("aws.accessKeyId"),
      secretAccessKey: this.configService.get<string>("aws.secretAccessKey"),
      bucket: this.configService.get<string>("aws.s3Bucket"),
      region: this.configService.get<string>("aws.s3Region"),
    };

    if (!awsConfig.bucket || !awsConfig.accessKeyId) {
      return this.uploadLocal(buffer, filename, folder);
    }

    try {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const s3 = new S3Client({
        region: awsConfig.region || "",
        credentials: {
          accessKeyId: awsConfig.accessKeyId!,
          secretAccessKey: awsConfig.secretAccessKey!,
        },
      } as any);

      const key = `${folder}/${Date.now()}-${filename}`;
      const uploadResult = await s3.send(
        new PutObjectCommand({
          Bucket: awsConfig.bucket,
          Key: key,
          Body: buffer,
          ContentType: this.getContentType(filename),
          ACL: "public-read",
        }),
      );

      const url = `https://${awsConfig.bucket}.s3.${awsConfig.region}.amazonaws.com/${key}`;
      this.logger.log(`File uploaded to S3: ${key}`);
      return { url, key, bucket: awsConfig.bucket };
    } catch (error: any) {
      this.logger.error(`S3 upload failed: ${error.message}`);
      throw error;
    }
  }

  private async uploadLocal(
    buffer: Buffer,
    filename: string,
    folder: string,
  ): Promise<UploadResult> {
    const path = require("path");
    const fs = require("fs").promises;
    const uploadDir = path.join(process.cwd(), "uploads", folder);

    await fs.mkdir(uploadDir, { recursive: true });
    const fileKey = `${Date.now()}-${filename}`;
    const filePath = path.join(uploadDir, fileKey);

    await fs.writeFile(filePath, buffer);
    const url = `/uploads/${folder}/${fileKey}`;

    return { url, key: fileKey, bucket: "local" };
  }

  private getContentType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase() || "application/octet-stream";
    const mimeTypes: Record<string, string> = {
      "jpg": "image/jpeg",
      "jpeg": "image/jpeg",
      "png": "image/png",
      "webp": "image/webp",
      "avif": "image/avif",
      "gif": "image/gif",
      "pdf": "application/pdf",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }

  async deleteFile(key: string): Promise<void> {
    this.logger.log(`Deleting file: ${key}`);
  }
}
