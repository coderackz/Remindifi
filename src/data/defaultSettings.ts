import { User, SmtpConfig, RbacPermission, TeamMember, EmailTemplate } from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Hassan Al-Maktoum',
    email: 'admin@remindifi.ae',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    jobTitle: 'VP Fleet Operations & Compliance',
    department: 'Executive Fleet Management',
    lastActive: 'Just now',
  },
  {
    id: 'user-manager',
    name: 'Rashid Khan',
    email: 'rashid.pro@remindifi.ae',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    jobTitle: 'Senior PRO & Licensing Officer',
    department: 'Government Relations & RTA',
    lastActive: '12m ago',
  },
  {
    id: 'user-viewer',
    name: 'Sarah Jenkins',
    email: 'sarah.audit@deloitte-partner.com',
    role: 'viewer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    jobTitle: 'External Compliance Auditor',
    department: 'Risk, Audit & Governance',
    lastActive: '1h ago',
  },
];

export const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  host: 'smtp.office365.com',
  port: 587,
  encryption: 'STARTTLS',
  user: 'alerts@remindifi.ae',
  pass: '••••••••••••••••',
  senderEmail: 'compliance-alerts@remindifi.ae',
  senderName: 'Remindifi UAE Fleet Compliance Alert',
  replyTo: 'support@remindifi.ae',
  connectionStatus: 'connected',
  lastTestedAt: '2026-10-29 08:30:00 GST',
  rateLimitPerHour: 500,
};

export const INITIAL_RBAC_PERMISSIONS: RbacPermission[] = [
  {
    key: 'create_reminder',
    label: 'Create Compliance Reminders & Permits',
    description: 'Add new compliance deadline tracking records bound to parent assets',
    admin: true,
    manager: true,
    viewer: false,
  },
  {
    key: 'quick_add_reminder',
    label: 'Quick Add Single Reminder',
    description: 'Rapidly schedule permit deadline with automatic asset assignment',
    admin: true,
    manager: true,
    viewer: false,
  },
  {
    key: 'edit_reminder',
    label: 'Edit Reminder Details & Lead Times',
    description: 'Modify expiry dates, milestone alert triggers, and notes',
    admin: true,
    manager: true,
    viewer: false,
  },
  {
    key: 'delete_reminder',
    label: 'Delete Reminder or Permit Record',
    description: 'Permanently remove compliance item and its history from ledger',
    admin: true,
    manager: false,
    viewer: false,
  },
  {
    key: 'log_renewal',
    label: 'Log Completed Renewals & Upload Invoices',
    description: 'Upload renewed Mulkiya/Trade License documents and archive audit logs',
    admin: true,
    manager: true,
    viewer: false,
  },
  {
    key: 'manage_categories',
    label: 'Manage Categories & Dynamic Asset Groups',
    description: 'Create and configure permit classes, authorities, and asset schema',
    admin: true,
    manager: false,
    viewer: false,
  },
  {
    key: 'configure_smtp',
    label: 'Configure Production SMTP Server',
    description: 'Access SMTP credentials, TLS encryption, test email handshake',
    admin: true,
    manager: false,
    viewer: false,
  },
  {
    key: 'edit_email_templates',
    label: 'Customize Notification Email Templates',
    description: 'Modify HTML templates, dynamic tags, branding, and color schemes',
    admin: true,
    manager: true,
    viewer: false,
  },
  {
    key: 'export_compliance_ledger',
    label: 'Export Ledger & Audit Reports (CSV/Excel)',
    description: 'Download complete compliance records with historical costs',
    admin: true,
    manager: true,
    viewer: true,
  },
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Hassan Al-Maktoum',
    email: 'admin@remindifi.ae',
    role: 'admin',
    department: 'Fleet Operations Directorate',
    addedAt: '2024-01-15',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'tm-2',
    name: 'Rashid Khan',
    email: 'rashid.pro@remindifi.ae',
    role: 'manager',
    department: 'Government Relations (PRO)',
    addedAt: '2024-03-10',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'tm-3',
    name: 'Amina Al-Nuaimi',
    email: 'amina.legal@remindifi.ae',
    role: 'manager',
    department: 'Corporate Legal & Licensing',
    addedAt: '2024-06-01',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'tm-4',
    name: 'Sarah Jenkins',
    email: 'sarah.audit@deloitte-partner.com',
    role: 'viewer',
    department: 'Deloitte Compliance Audit',
    addedAt: '2025-01-20',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  },
];

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tmpl-urgent-expiry',
    name: 'Urgent Permit Expiry Alert (< 7 Days)',
    category: 'urgent_expiry',
    subject: '⚠️ CRITICAL: {{permit_name}} expires in {{days_remaining}} days [{{asset_identifier}}]',
    preheader: 'Immediate action required to avoid fines and operational impoundment.',
    headline: 'Urgent Compliance Expiry Warning',
    body: `Hello Team,

This is an automated priority alert from Remindifi. The **{{permit_name}}** (Permit #{{permit_number}}) bound to **{{asset_identifier}}** is set to expire on **{{expiry_date}}** (in **{{days_remaining}} days**).

Authority: **{{issuing_authority}}**
Estimated Cost: **{{cost_aed}} AED**
Officer in Charge: **{{assigned_officer}}**

Please proceed with immediate renewal submission to prevent statutory fines or vehicle/business license suspension.`,
    actionButtonText: 'Renew Permit in Remindifi',
    footerNote: 'Remindifi Automated Compliance Engine • UAE Fleet Operations',
    accentColor: '#EF4444',
    includeLogo: true,
    isHighPriority: true,
    lastUpdated: '2026-10-29 09:15',
  },
  {
    id: 'tmpl-lead-warning',
    name: '30-Day Expiry Advance Notice',
    category: 'lead_warning',
    subject: '📅 Reminder: {{permit_name}} renewal due in {{days_remaining}} days for {{asset_identifier}}',
    preheader: 'Upcoming scheduled compliance deadline. Inspection booking suggested.',
    headline: 'Upcoming Renewal Notification',
    body: `Dear Compliance Team,

Your **{{permit_name}}** for asset **{{asset_identifier}}** is due for renewal on **{{expiry_date}}** (approx. **{{days_remaining}} days remaining**).

Authority: **{{issuing_authority}}**
Estimated Budget: **{{cost_aed}} AED**

We recommend initiating required technical inspections, test lane certificates, and insurance quotes this week to ensure seamless continuity.`,
    actionButtonText: 'View Permit Details',
    footerNote: 'Automated 30-day milestone triggered via Remindifi Rule Engine.',
    accentColor: '#F59E0B',
    includeLogo: true,
    isHighPriority: false,
    lastUpdated: '2026-10-28 14:00',
  },
  {
    id: 'tmpl-weekly-digest',
    name: 'Weekly Fleet Compliance Digest',
    category: 'weekly_digest',
    subject: '📊 Remindifi Weekly Compliance Digest: {{critical_count}} Urgent, {{warning_count}} Approaching',
    preheader: 'Summary of all fleet and corporate permits requiring action this week.',
    headline: 'Weekly Fleet Health & Renewal Digest',
    body: `Hello Manager,

Here is your weekly compliance overview across all monitored corporate assets and fleet vehicles:

• Total Assets Monitored: **{{total_assets}}**
• Critical / Expiring Soon (&le; 7 days): **{{critical_count}}**
• In Renewal Process: **{{in_renewal_count}}**
• Total Approaching Renewal (&le; 30 days): **{{warning_count}}**

Please review all outstanding tasks in the Remindifi portal to ensure continuous compliance.`,
    actionButtonText: 'Open Compliance Portal',
    footerNote: 'Generated automatically by Remindifi Digest Cron every Monday at 08:00 GST.',
    accentColor: '#5E5CE6',
    includeLogo: true,
    isHighPriority: false,
    lastUpdated: '2026-10-27 10:00',
  },
  {
    id: 'tmpl-renewal-receipt',
    name: 'Renewal Logged & Receipt Confirmation',
    category: 'renewal_receipt',
    subject: '✅ Success: {{permit_name}} renewed for {{asset_identifier}} (Valid to {{expiry_date}})',
    preheader: 'Audit certificate recorded and archived in Remindifi ledger.',
    headline: 'Permit Renewal Successfully Logged',
    body: `Dear Team,

The compliance record for **{{permit_name}}** bound to **{{asset_identifier}}** has been successfully renewed.

New Validity Date: **{{expiry_date}}**
Renewal Cost Recorded: **{{cost_aed}} AED**
Renewed By: **{{renewed_by}}**
Audit File: **{{uploaded_document}}**

A digital copy of the updated document has been archived in the compliance vault for auditing and inspection.`,
    actionButtonText: 'Download Certificate',
    footerNote: 'Tamper-proof compliance log entry ID #{{renewal_id}} • Remindifi Audit Trail',
    accentColor: '#10B981',
    includeLogo: true,
    isHighPriority: false,
    lastUpdated: '2026-10-29 07:30',
  },
];
