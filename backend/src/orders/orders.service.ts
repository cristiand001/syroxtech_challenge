import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrderStatus } from "@prisma/client";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        history: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        history: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async create(dto: CreateOrderDto) {
    // Validar que los productos existan y tengan stock
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException("One or more products not found");
    }

    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product)
        throw new BadRequestException(`Product #${item.productId} not found`);
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.name}"`,
        );
      }
    }

    // Calcular total
    const total = dto.items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return acc + product.price * item.quantity;
    }, 0);

    // Crear orden y descontar stock
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          address: dto.address,
          paymentMethod: dto.paymentMethod,
          paymentStatus: dto.paymentStatus,
          notes: dto.notes,
          total,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: products.find((p) => p.id === item.productId)!.price,
            })),
          },
          history: {
            create: {
              status: OrderStatus.PREPARING,
              note: "Orden creada",
            },
          },
        },
        include: {
          items: { include: { product: true } },
          history: { orderBy: { createdAt: "desc" } },
        },
      });

      // Descontar stock
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return order;
  }

  async update(id: number, dto: UpdateOrderDto) {
    const order = await this.findOne(id);

    const updated = await this.prisma.$transaction(async (tx) => {
      // Si cambió el estado, agregar al historial
      if (dto.status && dto.status !== order.status) {
        await tx.orderHistory.create({
          data: {
            orderId: id,
            status: dto.status,
            note: dto.note,
          },
        });
      }

      return tx.order.update({
        where: { id },
        data: {
          status: dto.status,
          paymentMethod: dto.paymentMethod,
          paymentStatus: dto.paymentStatus,
          trackingNumber: dto.trackingNumber,
          address: dto.address,
          notes: dto.notes,
        },
        include: {
          items: { include: { product: true } },
          history: { orderBy: { createdAt: "desc" } },
        },
      });
    });

    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.order.delete({ where: { id } });
  }
}
