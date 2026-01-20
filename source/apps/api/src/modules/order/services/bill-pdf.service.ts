import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class BillPdfService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate bill PDF for an order
   * @param orderId - Order ID
   * @returns PDF Buffer
   */
  async generateBillPdf(orderId: string): Promise<Buffer> {
    // Fetch order with all details
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: {
          select: {
            tableNumber: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        tenant: {
          select: {
            name: true,
            settings: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Restaurant Header
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(order.tenant.name || 'Restaurant', { align: 'center' });

      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .font('Helvetica')
        .text('BILL / INVOICE', { align: 'center' });

      doc.moveDown(1);

      // Separator line
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(1);

      // Order Information
      const orderInfoY = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');

      // Left column
      doc.text(`Order #: ${order.orderNumber}`, 50, orderInfoY);
      doc.text(`Table: ${order.table.tableNumber}`, 50, orderInfoY + 15);
      doc.text(
        `Date: ${order.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}`,
        50,
        orderInfoY + 30,
      );

      // Right column
      doc.text(
        `Time: ${order.createdAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        350,
        orderInfoY,
      );
      doc.text(`Status: ${order.status}`, 350, orderInfoY + 15);

      doc.moveDown(3);

      // Items Table Header
      const tableTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Item', 50, tableTop);
      doc.text('Qty', 350, tableTop, { width: 50, align: 'center' });
      doc.text('Price', 420, tableTop, { width: 60, align: 'right' });
      doc.text('Total', 500, tableTop, { width: 50, align: 'right' });

      // Line under header
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      doc.moveDown(1);

      // Items
      let itemY = doc.y;
      doc.font('Helvetica');

      for (const item of order.items) {
        const itemTotal = Number(item.price) * item.quantity;

        doc.text(item.menuItem.name, 50, itemY, { width: 280 });
        doc.text(item.quantity.toString(), 350, itemY, {
          width: 50,
          align: 'center',
        });
        doc.text(`$${Number(item.price).toFixed(2)}`, 420, itemY, {
          width: 60,
          align: 'right',
        });
        doc.text(`$${itemTotal.toFixed(2)}`, 500, itemY, {
          width: 50,
          align: 'right',
        });

        itemY += 20;

        // Add modifiers if any
        if (item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0) {
          doc.fontSize(9).fillColor('#666');
          for (const mod of item.modifiers) {
            doc.text(`  + ${mod}`, 50, itemY, { width: 280 });
            itemY += 15;
          }
          doc.fillColor('#000').fontSize(10);
        }
      }

      doc.moveDown(1);

      // Separator before totals
      doc
        .moveTo(350, itemY + 10)
        .lineTo(550, itemY + 10)
        .stroke();

      itemY += 25;

      // Subtotal
      doc.font('Helvetica');
      doc.text('Subtotal:', 400, itemY);
      doc.text(`$${Number(order.subtotal).toFixed(2)}`, 500, itemY, {
        width: 50,
        align: 'right',
      });

      itemY += 20;

      // Tax
      if (order.tax && Number(order.tax) > 0) {
        doc.text('Tax:', 400, itemY);
        doc.text(`$${Number(order.tax).toFixed(2)}`, 500, itemY, {
          width: 50,
          align: 'right',
        });
        itemY += 20;
      }

      // Service Charge
      if (order.serviceCharge && Number(order.serviceCharge) > 0) {
        doc.text('Service Charge:', 400, itemY);
        doc.text(`$${Number(order.serviceCharge).toFixed(2)}`, 500, itemY, {
          width: 50,
          align: 'right',
        });
        itemY += 20;
      }

      // Discount (Note: Order schema doesn't have discount field yet, using 0 for now)
      const discountAmount = 0; // TODO: Add discount field to Order schema if needed
      if (discountAmount > 0) {
        doc.fillColor('#e63946');
        doc.text('Discount:', 400, itemY);
        doc.text(`-$${discountAmount.toFixed(2)}`, 500, itemY, {
          width: 50,
          align: 'right',
        });
        doc.fillColor('#000');
        itemY += 20;
      }

      // Bold line before total
      doc
        .moveTo(350, itemY)
        .lineTo(550, itemY)
        .lineWidth(2)
        .stroke()
        .lineWidth(1);

      itemY += 15;

      // Total
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('TOTAL:', 400, itemY);
      doc.text(`$${Number(order.total).toFixed(2)}`, 500, itemY, {
        width: 50,
        align: 'right',
      });

      itemY += 30;

      // Payment Status
      doc.fontSize(10).font('Helvetica');
      const isPaid = order.paymentStatus === 'COMPLETED';
      doc.fillColor(isPaid ? '#2a9d8f' : '#e76f51');
      doc.text(
        `Payment Status: ${isPaid ? 'PAID' : 'UNPAID'}`,
        50,
        itemY,
        { align: 'center' },
      );
      doc.fillColor('#000');

      // Footer
      doc.moveDown(3);
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Thank you for dining with us!', { align: 'center' });

      doc.moveDown(0.5);
      doc
        .fontSize(8)
        .fillColor('#666')
        .text(
          `Generated on ${new Date().toLocaleString('en-US')}`,
          { align: 'center' },
        );

      doc.end();
    });
  }
}
