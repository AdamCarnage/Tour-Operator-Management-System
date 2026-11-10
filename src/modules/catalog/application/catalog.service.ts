import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { findOwned, paginate } from '../../../common/pagination';
import {
  ItineraryDay,
  ItineraryTemplate,
  Product,
  ServiceLine,
} from '../infrastructure/catalog.entities';
import type {
  CreateDayDto,
  CreateProductDto,
  CreateServiceLineDto,
  CreateTemplateDto,
  UpdateProductDto,
} from '../api/catalog.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ItineraryTemplate)
    private readonly templates: Repository<ItineraryTemplate>,
    @InjectRepository(ItineraryDay)
    private readonly days: Repository<ItineraryDay>,
    @InjectRepository(ServiceLine)
    private readonly lines: Repository<ServiceLine>,
  ) {}

  listProducts(organizationId: string, page?: number, limit?: number) {
    return paginate(this.products, organizationId, page, limit);
  }

  getProduct(organizationId: string, id: string) {
    return findOwned(this.products, organizationId, id, 'Product');
  }

  createProduct(user: AuthUser, dto: CreateProductDto) {
    return this.products.save(
      this.products.create({
        organizationId: user.organizationId,
        name: dto.name,
        kind: dto.kind,
        description: dto.description ?? '',
        durationDays: dto.durationDays,
        active: true,
      }),
    );
  }

  async updateProduct(user: AuthUser, id: string, dto: UpdateProductDto) {
    const product = await this.getProduct(user.organizationId, id);
    Object.assign(product, {
      name: dto.name ?? product.name,
      description: dto.description ?? product.description,
      durationDays: dto.durationDays ?? product.durationDays,
      active: dto.active ?? product.active,
    });
    return this.products.save(product);
  }

  async listTemplates(organizationId: string, productId: string) {
    await this.getProduct(organizationId, productId);
    return this.templates.find({
      where: { organizationId, productId },
      order: { createdAt: 'DESC' },
    });
  }

  async createTemplate(
    user: AuthUser,
    productId: string,
    dto: CreateTemplateDto,
  ) {
    await this.getProduct(user.organizationId, productId);
    return this.templates.save(
      this.templates.create({
        organizationId: user.organizationId,
        productId,
        name: dto.name,
      }),
    );
  }

  async getTemplate(organizationId: string, id: string) {
    const template = await findOwned(
      this.templates,
      organizationId,
      id,
      'Template',
    );
    const days = await this.days.find({
      where: { organizationId, templateId: id },
      order: { dayNumber: 'ASC' },
    });
    const dayIds = days.map((day) => day.id);
    const lines = dayIds.length
      ? await this.lines
          .createQueryBuilder('line')
          .where('line.organizationId = :organizationId', { organizationId })
          .andWhere('line.dayId IN (:...dayIds)', { dayIds })
          .getMany()
      : [];
    return {
      ...template,
      days: days.map((day) => ({
        ...day,
        lines: lines.filter((line) => line.dayId === day.id),
      })),
    };
  }

  async createDay(user: AuthUser, templateId: string, dto: CreateDayDto) {
    await findOwned(
      this.templates,
      user.organizationId,
      templateId,
      'Template',
    );
    return this.days.save(
      this.days.create({
        organizationId: user.organizationId,
        templateId,
        dayNumber: dto.dayNumber,
        title: dto.title,
        description: dto.description ?? '',
        location: dto.location ?? '',
      }),
    );
  }

  async createLine(user: AuthUser, dayId: string, dto: CreateServiceLineDto) {
    await findOwned(this.days, user.organizationId, dayId, 'Itinerary day');
    return this.lines.save(
      this.lines.create({
        organizationId: user.organizationId,
        dayId,
        supplierId: dto.supplierId ?? null,
        description: dto.description,
        category: dto.category,
        basis: dto.basis,
        quantity: dto.quantity,
        unitCostMinor: dto.unitCostMinor,
        unitSellMinor: dto.unitSellMinor,
        currency: dto.currency,
      }),
    );
  }
}
