import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CloseTableDto, BillResponseDto } from '../dtos/bill.dto';
import { PaymentStatus, Prisma, OrderStatus } from '@prisma/client';

@Injectable()
export class BillService {
  private readonly logger = new Logger(BillService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Close table and generate bill by grouping all unpaid orders
   */
  async closeTableAndGenerateBill(
    tenantId: string,
    tableId: string,
    sessionId: string,
    dto: CloseTableDto,
  ): Promise<BillResponseDto> {
    // 1. Get all completed AND paid orders for this table session
    // Flow: waiter marks completed -> marks paid -> closes table
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        tableId,
        sessionId,
        status: { in: [OrderStatus.COMPLETED, OrderStatus.SERVED] },
        paymentStatus: PaymentStatus.COMPLETED,
      },
      include: {
        items: true,
      },
    });

    if (orders.length === 0) {
      throw new BadRequestException('No completed and paid orders found for this table. Please mark all orders as paid first.');
    }

    // 2. Calculate bill totals
    const subtotal = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const serviceCharge = orders.reduce((sum, order) => sum + Number(order.serviceCharge), 0);
    const tax = orders.reduce((sum, order) => sum + Number(order.tax), 0);

    const discount = dto.discount || 0;
    const tip = dto.tip || 0;

    // Total = subtotal - discount + tip
    const total = subtotal - discount + tip;

    // 3. Generate bill number
    const billNumber = await this.generateBillNumber(tenantId);

    // 4. Create bill and update orders in transaction
    const bill = await this.prisma.$transaction(async (tx) => {
      // Create bill
      const newBill = await tx.bill.create({
        data: {
          billNumber,
          tenantId,
          tableId,
          sessionId,
          subtotal,
          discount,
          tip,
          serviceCharge,
          tax,
          total,
          paymentMethod: dto.paymentMethod,
          paymentStatus: dto.paymentMethod === 'BILL_TO_TABLE' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
          paidAt: dto.paymentMethod === 'BILL_TO_TABLE' ? new Date() : null,
          notes: dto.notes,
        },
        include: {
          table: true,
        },
      });

      // Update all orders to link to this bill and mark as COMPLETED
      await tx.order.updateMany({
        where: {
          id: { in: orders.map((o) => o.id) },
        },
        data: {
          billId: newBill.id,
          status: OrderStatus.PAID,
          paymentStatus: dto.paymentMethod === 'BILL_TO_TABLE' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
          paidAt: dto.paymentMethod === 'BILL_TO_TABLE' ? new Date() : null,
        },
      });

      // Get updated orders for response
      const updatedOrders = await tx.order.findMany({
        where: { billId: newBill.id },
        include: { items: true },
      });

      return { ...newBill, orders: updatedOrders };
    });

    this.logger.log(`Bill ${billNumber} created for table ${tableId}, total: ${total}`);

    return this.mapToBillResponse(bill);
  }

  /**
   * Get bill by ID
   */
  async getBillById(billId: string): Promise<BillResponseDto> {
    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
      include: {
        orders: {
          include: {
            items: true,
          },
        },
        table: true,
      },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    return this.mapToBillResponse(bill);
  }

  /**
   * Get bills by tenant with filters
   */
  async getBills(
    tenantId: string,
    filters?: {
      tableId?: string;
      paymentStatus?: PaymentStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const where: Prisma.BillWhereInput = {
      tenantId,
      ...(filters?.tableId && { tableId: filters.tableId }),
      ...(filters?.paymentStatus && { paymentStatus: filters.paymentStatus }),
      ...(filters?.startDate &&
        filters?.endDate && {
          createdAt: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        }),
    };

    const bills = await this.prisma.bill.findMany({
      where,
      include: {
        orders: {
          include: {
            items: true,
          },
        },
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return bills.map((bill) => this.mapToBillResponse(bill));
  }

  /**
   * Generate unique bill number
   */
  private async generateBillNumber(tenantId: string): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastBill = await this.prisma.bill.findFirst({
      where: {
        tenantId,
        billNumber: { startsWith: `BILL-${datePrefix}` },
      },
      orderBy: { billNumber: 'desc' },
    });

    const sequence = lastBill ? parseInt(lastBill.billNumber.slice(-4)) + 1 : 1;

    return `BILL-${datePrefix}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Map Prisma Bill to BillResponseDto
   */
  private mapToBillResponse(bill: any): BillResponseDto {
    return {
      id: bill.id,
      billNumber: bill.billNumber,
      tenantId: bill.tenantId,
      tableId: bill.tableId,
      sessionId: bill.sessionId,
      subtotal: Number(bill.subtotal),
      discount: Number(bill.discount),
      tip: Number(bill.tip),
      serviceCharge: Number(bill.serviceCharge),
      tax: Number(bill.tax),
      total: Number(bill.total),
      paymentMethod: bill.paymentMethod,
      paymentStatus: bill.paymentStatus,
      paidAt: bill.paidAt,
      notes: bill.notes,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
      orders: bill.orders || [],
      table: bill.table,
    };
  }
}
