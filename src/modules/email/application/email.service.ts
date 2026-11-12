import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { EmailCategory, EmailFolder } from '../../../common/enums';
import { findOwned, pageWindow } from '../../../common/pagination';
import { EmailMessage, Mailbox } from '../infrastructure/email.entities';
import type {
  CreateMailboxDto,
  EmailQueryDto,
  IngestEmailDto,
  UpdateEmailDto,
} from '../api/email.dto';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(Mailbox) private readonly mailboxes: Repository<Mailbox>,
    @InjectRepository(EmailMessage)
    private readonly emails: Repository<EmailMessage>,
  ) {}

  listMailboxes(organizationId: string) {
    return this.mailboxes.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  createMailbox(user: AuthUser, dto: CreateMailboxDto) {
    return this.mailboxes.save(
      this.mailboxes.create({
        organizationId: user.organizationId,
        address: dto.address.toLowerCase(),
        provider: dto.provider,
        label: dto.label ?? '',
        active: true,
      }),
    );
  }

  async listEmails(organizationId: string, query: EmailQueryDto) {
    const window = pageWindow(query.page, query.limit);
    const qb = this.emails
      .createQueryBuilder('email')
      .where('email.organizationId = :organizationId', { organizationId });
    if (query.folder) {
      qb.andWhere('email.folder = :folder', { folder: query.folder });
    }
    if (query.category) {
      qb.andWhere('email.category = :category', { category: query.category });
    }
    if (query.mailboxId) {
      qb.andWhere('email.mailboxId = :mailboxId', {
        mailboxId: query.mailboxId,
      });
    }
    if (query.q) {
      qb.andWhere(
        '(email.subject ILIKE :q OR email.fromAddress ILIKE :q OR email.bodyText ILIKE :q)',
        { q: `%${query.q}%` },
      );
    }
    const [data, total] = await qb
      .orderBy('email.receivedAt', 'DESC')
      .skip(window.skip)
      .take(window.limit)
      .getManyAndCount();
    return {
      data,
      meta: { page: window.page, limit: window.limit, total },
    };
  }

  getEmail(organizationId: string, id: string) {
    return findOwned(this.emails, organizationId, id, 'Email');
  }

  async updateEmail(user: AuthUser, id: string, dto: UpdateEmailDto) {
    const email = await findOwned(
      this.emails,
      user.organizationId,
      id,
      'Email',
    );
    if (dto.folder !== undefined) email.folder = dto.folder;
    if (dto.category !== undefined) email.category = dto.category;
    if (dto.isRead !== undefined) email.isRead = dto.isRead;
    if (dto.isStarred !== undefined) email.isStarred = dto.isStarred;
    return this.emails.save(email);
  }

  async folderCounts(organizationId: string) {
    const rows: unknown = await this.emails
      .createQueryBuilder('email')
      .select('email.folder', 'folder')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        'SUM(CASE WHEN email.isRead = false THEN 1 ELSE 0 END)',
        'unread',
      )
      .where('email.organizationId = :organizationId', { organizationId })
      .groupBy('email.folder')
      .getRawMany();
    return (Array.isArray(rows) ? rows : []).map((row) => {
      const item = row as { folder: string; total: string; unread: string };
      return {
        folder: item.folder,
        total: Number(item.total),
        unread: Number(item.unread),
      };
    });
  }

  async ingest(user: AuthUser, dto: IngestEmailDto) {
    let mailboxId = dto.mailboxId ?? null;
    if (!mailboxId && dto.mailboxAddress) {
      const mailbox = await this.mailboxes.findOne({
        where: {
          organizationId: user.organizationId,
          address: dto.mailboxAddress.toLowerCase(),
        },
      });
      if (!mailbox) {
        throw new NotFoundException('Mailbox not found');
      }
      mailboxId = mailbox.id;
    }
    if (dto.externalMessageId) {
      const existing = await this.emails.findOne({
        where: {
          organizationId: user.organizationId,
          externalMessageId: dto.externalMessageId,
          provider: dto.provider,
        },
      });
      if (existing) {
        return existing;
      }
    }
    return this.emails.save(
      this.emails.create({
        organizationId: user.organizationId,
        mailboxId,
        folder: dto.folder ?? EmailFolder.Inbox,
        category: dto.category ?? EmailCategory.General,
        fromAddress: dto.fromAddress,
        fromName: dto.fromName ?? '',
        toAddresses: dto.toAddresses,
        ccAddresses: dto.ccAddresses ?? [],
        subject: dto.subject ?? '',
        bodyText: dto.bodyText ?? '',
        bodyHtml: dto.bodyHtml ?? null,
        provider: dto.provider,
        externalMessageId: dto.externalMessageId ?? null,
        isRead: false,
        isStarred: false,
        receivedAt: dto.receivedAt ?? new Date(),
      }),
    );
  }
}
