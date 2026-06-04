import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;
  private readonly uploadDir: string;
  private readonly supabaseConfigured: boolean;

  constructor() {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_KEY ?? '';
    this.bucket = process.env.SUPABASE_BUCKET || 'attendance-photos';

    // Valid keys: legacy JWT ('eyJ...') or new Supabase format ('sb_secret_...')
    this.supabaseConfigured =
      !!url && !!key && (key.startsWith('eyJ') || key.startsWith('sb_secret_'));

    this.client = createClient(
      url || 'https://placeholder.supabase.co',
      key || 'placeholder',
    );

    this.uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }

    if (!this.supabaseConfigured) {
      console.warn('[SupabaseService] Supabase not configured — using local disk storage');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `${Date.now()}-${uuidv4()}${ext}`;

    if (this.supabaseConfigured) {
      try {
        const { error } = await this.client.storage
          .from(this.bucket)
          .upload(filename, file.buffer, { contentType: file.mimetype, upsert: false });

        if (!error) {
          const { data } = this.client.storage.from(this.bucket).getPublicUrl(filename);
          return data.publicUrl;
        }
        console.warn(`[SupabaseService] Upload failed (${error.message}), falling back to local disk`);
      } catch (err) {
        console.warn(`[SupabaseService] Supabase unreachable (${(err as Error).message}), falling back to local disk`);
      }
    }

    // Local disk fallback
    const filePath = join(this.uploadDir, filename);
    writeFileSync(filePath, file.buffer);
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}/uploads/${filename}`;
  }
}
