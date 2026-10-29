export type Role = 'admin' | 'manager' | 'viewer';

export interface AssetGroup {
  id: string;
  name: string;
  icon: string; // lucide icon identifier
  customFieldLabels: string[];
  description?: string;
}

export interface PermitCategory {
  id: string;
  name: string;
  assetGroupId: string;
  issuingAuthority: string;
  defaultLeadDays: number[];
  color?: string;
}

export type AssetStatus = 'active' | 'maintenance' | 'archived';

export interface Asset {
  id: string;
  assetGroupId: string;
  identifier: string; // e.g. "DXB CC 12345", "SHJ AA 88412", "Mainland HQ - Dubai"
  name: string; // e.g. "Toyota Hilux - Mobile Unit 01"
  metadata: Record<string, string>; // e.g. { "Plate No": "12345", "Traffic File": "8829102", "Chassis No": "JTE..." }
  status: AssetStatus;
  location?: string;
  assignedDepartment?: string;
}

export type PermitStatus = 'active' | 'in_renewal' | 'expired';

export interface Permit {
  id: string;
  assetId: string;
  categoryId: string;
  permitNumber: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  cost: number; // in AED
  status: PermitStatus;
  leadDays: number[]; // e.g. [60, 30, 14, 7, 1]
  assignedToEmail: string;
  ccEmails: string[];
  fileName?: string;
  notes?: string;
  lastRenewedAt?: string;
}

export interface RenewalHistory {
  id: string;
  permitId: string;
  previousExpiryDate: string;
  renewedOnDate: string;
  cost: number;
  renewedBy: string;
  archivedFileName?: string;
  notes?: string;
}

export interface NotificationLog {
  id: string;
  permitId: string;
  assetIdentifier: string;
  milestoneDays: number;
  sentAt: string;
  recipientEmail: string;
  status: 'sent' | 'queued' | 'failed';
  digestSubject?: string;
}

export type UrgencyFilter = 'all' | 'critical' | 'warning' | 'in_renewal' | 'active' | 'expired';

export interface DependencyAlert {
  hasAlert: boolean;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  relatedPermitIds: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  jobTitle: string;
  department: string;
  lastActive?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  encryption: 'TLS' | 'SSL' | 'STARTTLS' | 'NONE';
  user: string;
  pass: string;
  senderEmail: string;
  senderName: string;
  replyTo: string;
  connectionStatus: 'connected' | 'error' | 'untested';
  lastTestedAt?: string;
  rateLimitPerHour: number;
}

export interface RbacPermission {
  key: string;
  label: string;
  description: string;
  admin: boolean;
  manager: boolean;
  viewer: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  addedAt: string;
  avatar: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'urgent_expiry' | 'lead_warning' | 'weekly_digest' | 'renewal_receipt';
  subject: string;
  preheader: string;
  headline: string;
  body: string;
  actionButtonText: string;
  footerNote: string;
  accentColor: string;
  includeLogo: boolean;
  isHighPriority: boolean;
  lastUpdated: string;
}
