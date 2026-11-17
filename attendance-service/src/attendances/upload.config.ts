import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';

export const getUploadDir = () =>
  join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads');

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const photoUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const dir = getUploadDir();
      mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    // Ini diacak untuk uniqueness
    filename: (_req, file, cb) =>
      cb(null, `${randomUUID()}${EXTENSIONS[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // coba aku set 5 MB
  fileFilter: (_req, file, cb) => {
    if (!EXTENSIONS[file.mimetype]) {
      return cb(
        new BadRequestException('Only JPG, PNG, or WEBP are allowed'),
        false,
      );
    }
    cb(null, true);
  },
};