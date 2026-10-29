import { Asset, Permit, PermitCategory, DependencyAlert } from '../types';

/**
 * Calculates days remaining between today (or reference date) and expiry date.
 * Positive = future, 0 = today, negative = expired.
 */
export function calculateDaysRemaining(expiryDateStr: string, referenceDateStr?: string): number {
  if (!expiryDateStr) return 0;
  const target = new Date(expiryDateStr);
  const base = referenceDateStr ? new Date(referenceDateStr) : new Date();
  
  // Set both to midnight UTC for clean calendar day difference
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const baseUtc = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((targetUtc - baseUtc) / msPerDay);
}

export type UrgencyTier = 'critical' | 'warning' | 'in_renewal' | 'healthy' | 'expired';

/**
 * Determines urgency classification for a permit.
 */
export function getPermitUrgency(permit: Permit, referenceDateStr?: string): UrgencyTier {
  if (permit.status === 'in_renewal') {
    return 'in_renewal';
  }
  const days = calculateDaysRemaining(permit.expiryDate, referenceDateStr);
  if (days < 0 || permit.status === 'expired') {
    return 'expired';
  }
  if (days <= 7) {
    return 'critical';
  }
  if (days <= 30) {
    return 'warning';
  }
  return 'healthy';
}

/**
 * Checks milestone alert status.
 * e.g., leadDays: [60, 30, 14, 7, 1]
 * If daysRemaining <= milestone, it means milestone has fired/triggered.
 */
export function getMilestoneStatuses(leadDays: number[], daysRemaining: number) {
  const sorted = [...leadDays].sort((a, b) => b - a); // descending: 60, 30, 14, 7, 1
  return sorted.map((days) => ({
    days,
    triggered: daysRemaining <= days,
    isCurrent: daysRemaining <= days && daysRemaining > (sorted[sorted.indexOf(days) + 1] ?? -999),
  }));
}

/**
 * Detects operational compliance dependencies between permits bound to the same asset.
 * Example 1: In UAE RTA regulations, vehicle Mulkiya cannot be renewed without an active Motor Insurance policy.
 * Example 2: Civil Defense & Ejari require an active commercial Trade License.
 */
export function detectAssetDependencies(
  asset: Asset,
  permits: Permit[],
  categories: PermitCategory[],
  referenceDateStr?: string
): DependencyAlert | null {
  const assetPermits = permits.filter((p) => p.assetId === asset.id);
  if (assetPermits.length <= 1) return null;

  const categoryMap = new Map<string, PermitCategory>(categories.map((c) => [c.id, c]));

  // Check Vehicle Dependencies (Insurance vs Mulkiya)
  const insurancePermit = assetPermits.find((p) => {
    const cat = categoryMap.get(p.categoryId);
    return cat?.name.toLowerCase().includes('insurance');
  });

  const mulkiyaPermit = assetPermits.find((p) => {
    const cat = categoryMap.get(p.categoryId);
    return cat?.name.toLowerCase().includes('mulkiya') || cat?.name.toLowerCase().includes('registration');
  });

  if (insurancePermit && mulkiyaPermit) {
    const insDays = calculateDaysRemaining(insurancePermit.expiryDate, referenceDateStr);
    const mulkiyaDays = calculateDaysRemaining(mulkiyaPermit.expiryDate, referenceDateStr);

    // If insurance expires before or around the same time as Mulkiya, and Mulkiya is approaching renewal
    if (insDays <= mulkiyaDays && mulkiyaDays <= 45 && insurancePermit.status !== 'in_renewal') {
      return {
        hasAlert: true,
        title: 'RTA Traffic Dependency Alert',
        message: `Motor Insurance expires in ${insDays} days, before or alongside RTA Mulkiya (${mulkiyaDays} days). Renew Motor Insurance first so the RTA traffic system clears Mulkiya renewal.`,
        type: insDays <= 7 ? 'critical' : 'warning',
        relatedPermitIds: [insurancePermit.id, mulkiyaPermit.id],
      };
    }

    if (insDays < 0) {
      return {
        hasAlert: true,
        title: 'Vehicle Grounded Alert',
        message: 'Motor Insurance is expired. RTA Mulkiya is automatically invalidated on UAE roads until policy is uploaded.',
        type: 'critical',
        relatedPermitIds: [insurancePermit.id, mulkiyaPermit.id],
      };
    }
  }

  // Check Corporate Branch Dependencies (Trade License vs Ejari / Civil Defense)
  const tradeLicensePermit = assetPermits.find((p) => {
    const cat = categoryMap.get(p.categoryId);
    return cat?.name.toLowerCase().includes('trade license');
  });

  if (tradeLicensePermit) {
    const tlDays = calculateDaysRemaining(tradeLicensePermit.expiryDate, referenceDateStr);
    if (tlDays <= 30 && tradeLicensePermit.status !== 'in_renewal') {
      const otherPermits = assetPermits.filter((p) => p.id !== tradeLicensePermit.id);
      if (otherPermits.length > 0) {
        return {
          hasAlert: true,
          title: 'Commercial DED License Pre-requisite',
          message: `Main Trade License expires in ${tlDays} days. Branch permits (Civil Defense / Ejari) cannot be extended if the primary DED license lapses.`,
          type: tlDays <= 7 ? 'critical' : 'warning',
          relatedPermitIds: [tradeLicensePermit.id, ...otherPermits.map((p) => p.id)],
        };
      }
    }
  }

  return null;
}

/**
 * Fleet & Dashboard metrics calculation
 */
export function calculateFleetMetrics(permits: Permit[], referenceDateStr?: string) {
  let totalSpend = 0;
  let criticalCount = 0;
  let warningCount = 0;
  let inRenewalCount = 0;
  let healthyCount = 0;
  let expiredCount = 0;

  for (const permit of permits) {
    totalSpend += permit.cost || 0;
    const urgency = getPermitUrgency(permit, referenceDateStr);
    if (urgency === 'critical') criticalCount++;
    else if (urgency === 'warning') warningCount++;
    else if (urgency === 'in_renewal') inRenewalCount++;
    else if (urgency === 'expired') expiredCount++;
    else healthyCount++;
  }

  return {
    totalPermits: permits.length,
    totalSpend,
    criticalCount,
    warningCount,
    inRenewalCount,
    healthyCount,
    expiredCount,
  };
}

/**
 * Format currency in UAE Dirhams (AED)
 */
export function formatAED(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(amount);
}
