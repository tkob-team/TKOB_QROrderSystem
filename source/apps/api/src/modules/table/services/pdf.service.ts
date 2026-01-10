import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '../../../config/env.validation';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface QrPdfOptions {
  tableNumber: string;
  qrCodeDataUrl: string; // Base64 data URL from QrService
  restaurantName?: string;
  location?: string;
  instructions?: string;
}

@Injectable()
export class PdfService {
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {}

  /**
   * Generate a single-page PDF with QR code
   * Layout optimized for printing (A4 size, centered)
   */
  async generateSingleQrPdf(options: QrPdfOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `QR Code - Table ${options.tableNumber}`,
            Author: options.restaurantName || 'Smart Restaurant',
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text(options.restaurantName || 'Smart Restaurant', {
            align: 'center',
          });

        doc.moveDown(0.5);

        // Table number
        doc
          .fontSize(36)
          .font('Helvetica-Bold')
          .fillColor('#2563eb')
          .text(`Table ${options.tableNumber}`, {
            align: 'center',
          });

        doc.fillColor('#000000'); // Reset color

        if (options.location) {
          doc.moveDown(0.3);
          doc.fontSize(14).font('Helvetica').text(options.location, {
            align: 'center',
          });
        }

        doc.moveDown(1.5);

        // QR Code image (centered)
        const qrImageBuffer = this.dataUrlToBuffer(options.qrCodeDataUrl);
        const pageWidth = doc.page.width;
        const qrSize = 300;
        const xPosition = (pageWidth - qrSize) / 2;

        doc.image(qrImageBuffer, xPosition, doc.y, {
          width: qrSize,
          height: qrSize,
        });

        doc.moveDown(30); // Move past QR code

        // Instructions
        const instructionText = options.instructions || 'Scan to view menu and place order';
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#059669').text(instructionText, {
          align: 'center',
        });

        doc.moveDown(1);

        // Footer instructions
        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor('#6b7280')
          .text('1. Open your camera app', { align: 'center' })
          .text('2. Point at the QR code', { align: 'center' })
          .text('3. Tap the notification to open menu', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate multi-page PDF with multiple QR codes
   * Each table gets its own page
   */
  async generateMultiPageQrPdf(tables: QrPdfOptions[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `QR Codes - All Tables`,
            Author: tables[0]?.restaurantName || 'Smart Restaurant',
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        tables.forEach((tableOptions, index) => {
          if (index > 0) {
            doc.addPage();
          }

          // Header
          doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text(tableOptions.restaurantName || 'Smart Restaurant', {
              align: 'center',
            });

          doc.moveDown(0.5);

          // Table number
          doc
            .fontSize(32)
            .font('Helvetica-Bold')
            .fillColor('#2563eb')
            .text(`Table ${tableOptions.tableNumber}`, {
              align: 'center',
            });

          doc.fillColor('#000000');

          if (tableOptions.location) {
            doc.moveDown(0.3);
            doc.fontSize(12).font('Helvetica').text(tableOptions.location, {
              align: 'center',
            });
          }

          doc.moveDown(1.5);

          // QR Code
          const qrImageBuffer = this.dataUrlToBuffer(tableOptions.qrCodeDataUrl);
          const pageWidth = doc.page.width;
          const qrSize = 250;
          const xPosition = (pageWidth - qrSize) / 2;

          doc.image(qrImageBuffer, xPosition, doc.y, {
            width: qrSize,
            height: qrSize,
          });

          doc.moveDown(20);

          // Instructions
          doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#059669')
            .text('Scan to view menu and place order', {
              align: 'center',
            });

          // Page number
          doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#9ca3af')
            .text(`Page ${index + 1} of ${tables.length}`, {
              align: 'center',
            });
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Convert base64 data URL to Buffer
   */
  private dataUrlToBuffer(dataUrl: string): Buffer {
    // Remove data URL prefix (e.g., "data:image/png;base64,")
    const base64Data = dataUrl.split(',')[1] || dataUrl;
    return Buffer.from(base64Data, 'base64');
  }

  /**
   * Convert Buffer to stream (for archiver)
   */
  bufferToStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}
