import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: {
          include: {
            _count: { select: { products: true, children: true } },
          },
        },
        _count: { select: { products: true, children: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true, children: true } },
      },
    });
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });
    if (existing)
      throw new ConflictException(`Category "${dto.name}" already exists`);

    if (dto.parentId) {
      await this.findOne(dto.parentId);
    }

    return this.prisma.category.create({
      data: { name: dto.name, parentId: dto.parentId ?? null },
      include: {
        parent: true,
        _count: { select: { products: true, children: true } },
      },
    });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.category.findUnique({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Category "${dto.name}" already exists`);
      }
    }

    if (dto.parentId === id) {
      throw new ConflictException("A category cannot be its own parent");
    }

    return this.prisma.category.update({
      where: { id },
      data: { name: dto.name, parentId: dto.parentId ?? null },
      include: {
        parent: true,
        _count: { select: { products: true, children: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (category._count.products > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría "${category.name}" porque tiene ${category._count.products} producto(s) asociado(s).`,
      );
    }

    if (category._count.children > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría "${category.name}" porque tiene ${category._count.children} subcategoría(s).`,
      );
    }

    return this.prisma.category.delete({ where: { id } });
  }
}
