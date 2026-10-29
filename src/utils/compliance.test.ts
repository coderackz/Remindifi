import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDaysRemaining,
  getPermitUrgency,
  getMilestoneStatuses,
  detectAssetDependencies,
  calculateFleetMetrics,
  formatAED,
} from './compliance';
import { Asset, Permit, PermitCategory } from '../types';

test('calculateDaysRemaining accurately counts days from reference date', () => {
  const base = '2026-10-29';
  assert.equal(calculateDaysRemaining('2026-11-03', base), 5);
  assert.equal(calculateDaysRemaining('2026-11-12', base), 14);
  assert.equal(calculateDaysRemaining('2026-10-29', base), 0);
  assert.equal(calculateDaysRemaining('2026-10-25', base), -4);
});

test('getPermitUrgency handles in_renewal status, critical, warning, expired, and healthy', () => {
  const base = '2026-10-29';

  const inRenewalPermit: Permit = {
    id: 'p1',
    assetId: 'a1',
    categoryId: 'c1',
    permitNumber: 'RN-1',
    issueDate: '2025-10-20',
    expiryDate: '2026-10-31', // 2 days, but in_renewal
    cost: 1500,
    status: 'in_renewal',
    leadDays: [30, 14, 7],
    assignedToEmail: 'test@example.com',
    ccEmails: [],
  };
  assert.equal(getPermitUrgency(inRenewalPermit, base), 'in_renewal');

  const criticalPermit: Permit = {
    ...inRenewalPermit,
    status: 'active',
    expiryDate: '2026-11-03', // 5 days -> critical
  };
  assert.equal(getPermitUrgency(criticalPermit, base), 'critical');

  const warningPermit: Permit = {
    ...inRenewalPermit,
    status: 'active',
    expiryDate: '2026-11-12', // 14 days -> warning
  };
  assert.equal(getPermitUrgency(warningPermit, base), 'warning');

  const healthyPermit: Permit = {
    ...inRenewalPermit,
    status: 'active',
    expiryDate: '2027-02-16', // 110 days -> healthy
  };
  assert.equal(getPermitUrgency(healthyPermit, base), 'healthy');

  const expiredPermit: Permit = {
    ...inRenewalPermit,
    status: 'active',
    expiryDate: '2026-10-20', // past -> expired
  };
  assert.equal(getPermitUrgency(expiredPermit, base), 'expired');
});

test('getMilestoneStatuses detects fired and pending alert milestones', () => {
  const leadDays = [60, 30, 14, 7, 1];
  const statuses = getMilestoneStatuses(leadDays, 10);
  // 10 days remaining: 60, 30, 14 have triggered, 7 and 1 not triggered
  const sixty = statuses.find((s) => s.days === 60);
  const thirty = statuses.find((s) => s.days === 30);
  const fourteen = statuses.find((s) => s.days === 14);
  const seven = statuses.find((s) => s.days === 7);
  const one = statuses.find((s) => s.days === 1);

  assert.equal(sixty?.triggered, true);
  assert.equal(thirty?.triggered, true);
  assert.equal(fourteen?.triggered, true);
  assert.equal(seven?.triggered, false);
  assert.equal(one?.triggered, false);
});

test('detectAssetDependencies detects Motor Insurance expiring before Mulkiya', () => {
  const base = '2026-10-29';
  const vehicle: Asset = {
    id: 'v1',
    assetGroupId: 'ag-vehicles',
    identifier: 'DXB CC 12345',
    name: 'Toyota Hilux - Mobile Unit 01',
    metadata: { 'Plate No': '12345' },
    status: 'active',
  };

  const categories: PermitCategory[] = [
    { id: 'cat-ins', name: 'Motor Insurance', assetGroupId: 'ag-vehicles', issuingAuthority: 'Insurer', defaultLeadDays: [30, 14, 7] },
    { id: 'cat-mul', name: 'RTA Mulkiya', assetGroupId: 'ag-vehicles', issuingAuthority: 'RTA', defaultLeadDays: [30, 14, 7] },
  ];

  const permits: Permit[] = [
    {
      id: 'p-ins',
      assetId: 'v1',
      categoryId: 'cat-ins',
      permitNumber: 'POL-99201',
      issueDate: '2025-11-03',
      expiryDate: '2026-11-03', // 5 days
      cost: 1800,
      status: 'active',
      leadDays: [30, 14, 7, 1],
      assignedToEmail: 'fleet@remindifi.ae',
      ccEmails: [],
    },
    {
      id: 'p-mul',
      assetId: 'v1',
      categoryId: 'cat-mul',
      permitNumber: 'RTA-MLK-48102',
      issueDate: '2025-11-12',
      expiryDate: '2026-11-12', // 14 days
      cost: 650,
      status: 'active',
      leadDays: [30, 14, 7, 1],
      assignedToEmail: 'fleet@remindifi.ae',
      ccEmails: [],
    },
  ];

  const alert = detectAssetDependencies(vehicle, permits, categories, base);
  assert.notEqual(alert, null);
  assert.equal(alert?.hasAlert, true);
  assert.match(alert?.message || '', /Motor Insurance/);
  assert.match(alert?.message || '', /Mulkiya/);
});

test('calculateFleetMetrics calculates totals and counts properly', () => {
  const base = '2026-10-29';
  const samplePermits: Permit[] = [
    { id: '1', assetId: 'a1', categoryId: 'c1', permitNumber: '1', issueDate: '2025-01-01', expiryDate: '2026-11-01', cost: 1000, status: 'active', leadDays: [], assignedToEmail: '', ccEmails: [] }, // 3 days -> critical
    { id: '2', assetId: 'a1', categoryId: 'c1', permitNumber: '2', issueDate: '2025-01-01', expiryDate: '2026-11-15', cost: 2000, status: 'active', leadDays: [], assignedToEmail: '', ccEmails: [] }, // 17 days -> warning
    { id: '3', assetId: 'a1', categoryId: 'c1', permitNumber: '3', issueDate: '2025-01-01', expiryDate: '2026-10-31', cost: 1500, status: 'in_renewal', leadDays: [], assignedToEmail: '', ccEmails: [] }, // in_renewal
    { id: '4', assetId: 'a1', categoryId: 'c1', permitNumber: '4', issueDate: '2025-01-01', expiryDate: '2027-05-01', cost: 3000, status: 'active', leadDays: [], assignedToEmail: '', ccEmails: [] }, // healthy
  ];

  const metrics = calculateFleetMetrics(samplePermits, base);
  assert.equal(metrics.totalPermits, 4);
  assert.equal(metrics.totalSpend, 7500);
  assert.equal(metrics.criticalCount, 1);
  assert.equal(metrics.warningCount, 1);
  assert.equal(metrics.inRenewalCount, 1);
  assert.equal(metrics.healthyCount, 1);
  assert.equal(metrics.expiredCount, 0);

  const formatted = formatAED(7500);
  assert.match(formatted, /7,500/);
});
