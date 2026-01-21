import { Injectable, Logger } from '@nestjs/common';
import { createApi } from 'unsplash-js';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UnsplashService {
  private readonly logger = new Logger(UnsplashService.name);
  private unsplash;

  constructor() {
    this.unsplash = createApi({
      accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
    });
  }

  /**
   * Tìm ảnh theo từ khóa (with timeout)
   */
  async searchPhoto(query: string): Promise<string | null> {
    try {
      // Early exit if no API key configured
      if (!process.env.UNSPLASH_ACCESS_KEY) {
        this.logger.warn('UNSPLASH_ACCESS_KEY not set, skipping photo search');
        return null;
      }

      // Create timeout promise (3 seconds)
      const timeoutMs = 1000;
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => {
          this.logger.warn(`Photo search timed out after ${timeoutMs}ms for "${query}"`);
          resolve(null);
        }, timeoutMs)
      );

      // Race between API call and timeout
      const searchPromise = this.unsplash.search.getPhotos({
        query,
        page: 1,
        perPage: 10,
        orientation: 'landscape',
      });

      const result = await Promise.race([searchPromise, timeoutPromise]);

      if (!result || result.type !== 'success' || result.response.results.length === 0) {
        return null;
      }

      // Lấy ảnh random từ top 10
      const randomIndex = Math.floor(Math.random() * result.response.results.length);
      const photo = result.response.results[randomIndex];

      return photo.urls.regular; // URL ảnh chất lượng cao
    } catch (error) {
      this.logger.error(`Failed to search photo for "${query}":`, error);
      return null;
    }
  }

  /**
   * Tìm nhiều ảnh theo từ khóa
   * @param query Từ khóa tìm kiếm
   * @param count Số lượng ảnh cần trả về
   * @returns Mảng URL của các ảnh
   */
  async searchMultiplePhotos(query: string, count: number): Promise<string[]> {
    // Giả sử bạn đã có method searchPhoto(query) trả về 1 URL
    // Nếu đã có method trả về nhiều ảnh thì dùng luôn, nếu chưa thì gọi API nhiều lần hoặc chỉnh lại cho hợp lý

    // Ví dụ: Nếu bạn đã có method searchPhotos(query, count)
    if (typeof (this as any).searchPhotos === 'function') {
      // Nếu đã có searchPhotos trả về nhiều ảnh
      return await (this as any).searchPhotos(query, count);
    }

    // Nếu chỉ có searchPhoto trả về 1 ảnh, gọi nhiều lần (có thể trùng lặp)
    const urls: string[] = [];
    for (let i = 0; i < count; i++) {
      const url = await this.searchPhoto(query);
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    }
    return urls;
  }

  /**
   * Download ảnh về local storage
   * @param url URL của ảnh
   * @param filename Tên file lưu (vd: "spring-rolls.jpg")
   * @returns Đường dẫn file đã lưu
   */
  async downloadPhoto(url: string, filename: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'menu-items');

    // Tạo thư mục nếu chưa có
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);

      https
        .get(url, (response) => {
          response.pipe(file);

          file.on('finish', () => {
            file.close();
            this.logger.log(`✅ Downloaded: ${filename}`);
            resolve(`/uploads/menu-items/${filename}`);
          });
        })
        .on('error', (err) => {
          fs.unlinkSync(filePath);
          reject(err);
        });
    });
  }
}
