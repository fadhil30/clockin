import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_KEY ?? '',
    );
    this.bucket = process.env.SUPABASE_BUCKET || 'attendance-photos';
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${uuidv4()}${ext}`;

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new InternalServerErrorException(`Photo upload failed: ${error.message}`);

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(filename);
    return data.publicUrl;
  }
}
