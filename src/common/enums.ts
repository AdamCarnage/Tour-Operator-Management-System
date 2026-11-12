export const RoleName = {
  PlatformAdmin: 'platform_admin',
  Owner: 'owner',
  Admin: 'admin',
  Sales: 'sales',
  Operations: 'operations',
  Accountant: 'accountant',
  Guide: 'guide',
  Driver: 'driver',
} as const;
export type RoleName = (typeof RoleName)[keyof typeof RoleName];
export const ROLE_NAMES = Object.values(RoleName);
/** Roles seeded for operator organizations (excludes platform admin). */
export const ORGANIZATION_ROLE_NAMES = ROLE_NAMES.filter(
  (role) => role !== RoleName.PlatformAdmin,
);

export const ProductKind = {
  Tour: 'tour',
  Trek: 'trek',
  DayTrip: 'day_trip',
} as const;
export type ProductKind = (typeof ProductKind)[keyof typeof ProductKind];

export const CostBasis = {
  PerPerson: 'per_person',
  PerVehicle: 'per_vehicle',
  Flat: 'flat',
} as const;
export type CostBasis = (typeof CostBasis)[keyof typeof CostBasis];

export const LeadStatus = {
  New: 'new',
  Contacted: 'contacted',
  Qualified: 'qualified',
  Quoted: 'quoted',
  Won: 'won',
  Lost: 'lost',
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const QuoteStatus = {
  Draft: 'draft',
  Sent: 'sent',
  Accepted: 'accepted',
  Rejected: 'rejected',
  Expired: 'expired',
} as const;
export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export const BookingStatus = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  InProgress: 'in_progress',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const BookingSource = {
  Office: 'office',
  Website: 'website',
} as const;
export type BookingSource = (typeof BookingSource)[keyof typeof BookingSource];

export const PaymentMethod = {
  Card: 'card',
  MobileMoney: 'mobile_money',
  Bank: 'bank',
  Cash: 'cash',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const ConversationChannel = {
  InternalStaff: 'internal_staff',
  ExternalPlatform: 'external_platform',
} as const;
export type ConversationChannel =
  (typeof ConversationChannel)[keyof typeof ConversationChannel];

export const MessageSenderType = {
  User: 'user',
  External: 'external',
  System: 'system',
} as const;
export type MessageSenderType =
  (typeof MessageSenderType)[keyof typeof MessageSenderType];

export const EmailFolder = {
  Inbox: 'inbox',
  Sent: 'sent',
  Important: 'important',
  Draft: 'draft',
  Trash: 'trash',
} as const;
export type EmailFolder = (typeof EmailFolder)[keyof typeof EmailFolder];

export const EmailCategory = {
  Work: 'work',
  Private: 'private',
  Support: 'support',
  Social: 'social',
  General: 'general',
} as const;
export type EmailCategory = (typeof EmailCategory)[keyof typeof EmailCategory];

export const CalendarItemKind = {
  Task: 'task',
  Event: 'event',
} as const;
export type CalendarItemKind =
  (typeof CalendarItemKind)[keyof typeof CalendarItemKind];

export const PaymentStatus = {
  Pending: 'pending',
  Received: 'received',
  Failed: 'failed',
  Refunded: 'refunded',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const InvoiceStatus = {
  Draft: 'draft',
  Issued: 'issued',
  Paid: 'paid',
  Void: 'void',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const StaffKind = {
  Guide: 'guide',
  Driver: 'driver',
  Porter: 'porter',
  Cook: 'cook',
} as const;
export type StaffKind = (typeof StaffKind)[keyof typeof StaffKind];

export const AvailabilityStatus = {
  Available: 'available',
  Leave: 'leave',
  Assigned: 'assigned',
} as const;
export type AvailabilityStatus =
  (typeof AvailabilityStatus)[keyof typeof AvailabilityStatus];

export const AssignmentRole = {
  Guide: 'guide',
  Driver: 'driver',
  Porter: 'porter',
  Cook: 'cook',
  Vehicle: 'vehicle',
} as const;
export type AssignmentRole =
  (typeof AssignmentRole)[keyof typeof AssignmentRole];

export const DepartureStatus = {
  Planned: 'planned',
  Dispatched: 'dispatched',
  InField: 'in_field',
  Closed: 'closed',
} as const;
export type DepartureStatus =
  (typeof DepartureStatus)[keyof typeof DepartureStatus];

export const PermitStatus = {
  Draft: 'draft',
  Submitted: 'submitted',
  Paid: 'paid',
  Cancelled: 'cancelled',
} as const;
export type PermitStatus = (typeof PermitStatus)[keyof typeof PermitStatus];

export const ControlNumberStatus = {
  Pending: 'pending',
  Paid: 'paid',
  Expired: 'expired',
} as const;
export type ControlNumberStatus =
  (typeof ControlNumberStatus)[keyof typeof ControlNumberStatus];

export const IncidentSeverity = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
} as const;
export type IncidentSeverity =
  (typeof IncidentSeverity)[keyof typeof IncidentSeverity];

export const IncidentStatus = {
  Open: 'open',
  Monitoring: 'monitoring',
  Closed: 'closed',
} as const;
export type IncidentStatus =
  (typeof IncidentStatus)[keyof typeof IncidentStatus];

export const SupplierRequestStatus = {
  Requested: 'requested',
  Confirmed: 'confirmed',
  Declined: 'declined',
  Cancelled: 'cancelled',
} as const;
export type SupplierRequestStatus =
  (typeof SupplierRequestStatus)[keyof typeof SupplierRequestStatus];

export const PayableStatus = {
  Open: 'open',
  Approved: 'approved',
  Paid: 'paid',
} as const;
export type PayableStatus = (typeof PayableStatus)[keyof typeof PayableStatus];

export const InspectionResult = {
  Pass: 'pass',
  Fail: 'fail',
} as const;
export type InspectionResult =
  (typeof InspectionResult)[keyof typeof InspectionResult];

export const MaintenanceStatus = {
  Scheduled: 'scheduled',
  Done: 'done',
  Cancelled: 'cancelled',
} as const;
export type MaintenanceStatus =
  (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

export const NotificationChannel = {
  Email: 'email',
  Sms: 'sms',
  Whatsapp: 'whatsapp',
  Webhook: 'webhook',
} as const;
export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationStatus = {
  Pending: 'pending',
  Stored: 'stored',
  Queued: 'queued',
  Processed: 'processed',
  Failed: 'failed',
} as const;
export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];
