import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { findOwned, paginate } from '../../../common/pagination';
import { Communication, Customer, Lead } from '../infrastructure/crm.entities';
import type {
  CreateCommunicationDto,
  CreateCustomerDto,
  CreateLeadDto,
  UpdateCustomerDto,
  UpdateLeadDto,
} from '../api/crm.dto';
import type { LeadStatus } from '../../../common/enums';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
    @InjectRepository(Communication)
    private readonly communications: Repository<Communication>,
  ) {}

  listCustomers(organizationId: string, page?: number, limit?: number) {
    return paginate(this.customers, organizationId, page, limit);
  }

  getCustomer(organizationId: string, id: string) {
    return findOwned(this.customers, organizationId, id, 'Customer');
  }

  createCustomer(user: AuthUser, dto: CreateCustomerDto) {
    return this.customers.save(
      this.customers.create({
        organizationId: user.organizationId,
        name: dto.name,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        kind: dto.kind ?? 'traveler',
        notes: dto.notes ?? '',
      }),
    );
  }

  async updateCustomer(user: AuthUser, id: string, dto: UpdateCustomerDto) {
    const customer = await this.getCustomer(user.organizationId, id);
    Object.assign(customer, {
      name: dto.name ?? customer.name,
      email: dto.email ?? customer.email,
      phone: dto.phone ?? customer.phone,
      notes: dto.notes ?? customer.notes,
    });
    return this.customers.save(customer);
  }

  listLeads(
    organizationId: string,
    page?: number,
    limit?: number,
    status?: LeadStatus,
  ) {
    return paginate(
      this.leads,
      organizationId,
      page,
      limit,
      status ? { status } : {},
    );
  }

  getLead(organizationId: string, id: string) {
    return findOwned(this.leads, organizationId, id, 'Lead');
  }

  async createLead(user: AuthUser, dto: CreateLeadDto) {
    if (dto.customerId) {
      await this.getCustomer(user.organizationId, dto.customerId);
    }
    return this.leads.save(
      this.leads.create({
        organizationId: user.organizationId,
        customerId: dto.customerId ?? null,
        name: dto.name,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        source: dto.source ?? 'manual',
        notes: dto.notes ?? '',
      }),
    );
  }

  async updateLead(user: AuthUser, id: string, dto: UpdateLeadDto) {
    const lead = await this.getLead(user.organizationId, id);
    if (dto.customerId) {
      await this.getCustomer(user.organizationId, dto.customerId);
    }
    Object.assign(lead, {
      status: dto.status ?? lead.status,
      notes: dto.notes ?? lead.notes,
      customerId: dto.customerId ?? lead.customerId,
    });
    return this.leads.save(lead);
  }

  async addCommunication(
    user: AuthUser,
    leadId: string,
    dto: CreateCommunicationDto,
  ) {
    const lead = await this.getLead(user.organizationId, leadId);
    return this.communications.save(
      this.communications.create({
        organizationId: user.organizationId,
        leadId: lead.id,
        customerId: dto.customerId ?? lead.customerId,
        channel: dto.channel,
        direction: dto.direction,
        body: dto.body,
      }),
    );
  }

  listCommunications(organizationId: string, leadId: string) {
    return this.communications.find({
      where: { organizationId, leadId },
      order: { createdAt: 'DESC' },
    });
  }
}
