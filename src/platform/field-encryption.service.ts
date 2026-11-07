import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { decryptField, encryptField } from '../common/field-encryption';
import type { AppEnv } from '../config/env.schema';

@Injectable()
export class FieldEncryptionService {
  private readonly key: Buffer;

  constructor(config: ConfigService<AppEnv, true>) {
    this.key = Buffer.from(
      config.get('DATA_ENCRYPTION_KEY', { infer: true }),
      'base64',
    );
  }

  encrypt(plain: string): string {
    return encryptField(this.key, plain);
  }

  decrypt(payload: string): string {
    return decryptField(this.key, payload);
  }
}
