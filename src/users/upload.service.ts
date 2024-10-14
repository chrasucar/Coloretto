import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()

export class UploadService {
  constructor() {

    cloudinary.config({

      url: process.env.CLOUDINARY_URL,

    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {

    return new Promise((resolve, reject) => {

      cloudinary.uploader.upload_stream(
        { resource_type: 'image', public_id: `profile-pictures/${Date.now()}-${file.originalname.split('.')[0]}` },
        (error, result) => {
          if (error) {

            reject(error);

          } else {

            resolve(result.secure_url);

          }
        },
      ).end(file.buffer);
    });
  }
}
