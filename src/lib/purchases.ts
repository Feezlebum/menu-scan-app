import Purchases, {
  type PurchasesOffering,
  type PurchasesPackage,
  type CustomerInfo,
} from 'react-native-purchases';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
const CONFIGURED_ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID;
const FALLBACK_ENTITLEMENT_IDS = ['Michi: Menu Helper Pro', 'pro'];

let configured = false;

function getActiveEntitlement(customerInfo: CustomerInfo) {
  const activeEntitlements = customerInfo.entitlements.active;

  if (CONFIGURED_ENTITLEMENT_ID && activeEntitlements[CONFIGURED_ENTITLEMENT_ID]) {
    return activeEntitlements[CONFIGURED_ENTITLEMENT_ID];
  }

  for (const id of FALLBACK_ENTITLEMENT_IDS) {
    if (activeEntitlements[id]) return activeEntitlements[id];
  }

  const activeIds = Object.keys(activeEntitlements);
  if (activeIds.length === 1) {
    return activeEntitlements[activeIds[0]];
  }

  return null;
}

function hasActiveProEntitlement(customerInfo: CustomerInfo): boolean {
  return !!getActiveEntitlement(customerInfo);
}

function inferSubscriptionType(customerInfo: CustomerInfo): 'none' | 'monthly' | 'annual' | 'trial' {
  const active = getActiveEntitlement(customerInfo);
  if (!active) return 'none';

  const product = (active.productIdentifier || '').toLowerCase();
  if (active.periodType === 'trial' || active.periodType === 'intro') return 'trial';
  if (product.includes('annual') || product.includes('year')) return 'annual';
  if (product.includes('month')) return 'monthly';

  return 'monthly';
}

function getTrialEndDate(customerInfo: CustomerInfo): string | null {
  const active = getActiveEntitlement(customerInfo);
  if (!active) return null;

  if (active.periodType !== 'trial' && active.periodType !== 'intro') return null;
  return active.expirationDate ?? null;
}

function pickPackage(offering: PurchasesOffering | null, type: 'monthly' | 'annual'): PurchasesPackage | null {
  if (!offering) return null;
  if (type === 'annual') return offering.annual ?? offering.availablePackages.find((p) => p.packageType === 'ANNUAL') ?? null;
  return offering.monthly ?? offering.availablePackages.find((p) => p.packageType === 'MONTHLY') ?? null;
}

export async function initializePurchases(): Promise<boolean> {
  if (configured) return true;

  if (!API_KEY) {
    console.warn('RevenueCat API key missing (EXPO_PUBLIC_REVENUECAT_API_KEY).');
    return false;
  }

  try {
    Purchases.configure({
      apiKey: API_KEY,
      appUserID: null,
    });

    configured = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    return false;
  }
}

export async function checkSubscriptionStatus() {
  const ready = await initializePurchases();
  if (!ready) {
    return { isProUser: false, subscriptionType: 'none' as const, isTrialActive: false, trialEndDate: null as string | null };
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const subscriptionType = inferSubscriptionType(customerInfo);
    const isProUser = hasActiveProEntitlement(customerInfo);
    const trialEndDate = getTrialEndDate(customerInfo);

    return {
      isProUser,
      subscriptionType,
      isTrialActive: subscriptionType === 'trial',
      trialEndDate,
    };
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return { isProUser: false, subscriptionType: 'none' as const, isTrialActive: false, trialEndDate: null as string | null };
  }
}

export async function purchasePackage(type: 'monthly' | 'annual') {
  const ready = await initializePurchases();
  if (!ready) return { success: false, error: 'RevenueCat is not configured yet.' };

  try {
    const offerings = await Purchases.getOfferings();
    const pkg = pickPackage(offerings.current ?? null, type);

    if (!pkg) {
      return { success: false, error: `No ${type} package found in current RevenueCat offering.` };
    }

    const purchaseResult = await Purchases.purchasePackage(pkg);
    const customerInfo = purchaseResult.customerInfo;

    return {
      success: hasActiveProEntitlement(customerInfo),
      status: {
        isProUser: hasActiveProEntitlement(customerInfo),
        subscriptionType: inferSubscriptionType(customerInfo),
        isTrialActive: inferSubscriptionType(customerInfo) === 'trial',
        trialEndDate: getTrialEndDate(customerInfo),
      },
    };
  } catch (error: any) {
    if (error?.userCancelled) {
      return { success: false, cancelled: true, error: 'Purchase cancelled.' };
    }

    return {
      success: false,
      error: error?.message ?? 'Unable to complete purchase right now.',
    };
  }
}

export async function startTrialPurchase() {
  // Trial eligibility is configured in App Store / Play Console and RevenueCat products.
  // We attempt annual first (best value), then monthly fallback.
  const annual = await purchasePackage('annual');
  if (annual.success || annual.cancelled) return annual;
  return purchasePackage('monthly');
}

export async function restorePurchases() {
  const ready = await initializePurchases();
  if (!ready) return { success: false, error: 'RevenueCat is not configured yet.' };

  try {
    const customerInfo = await Purchases.restorePurchases();
    return {
      success: hasActiveProEntitlement(customerInfo),
      status: {
        isProUser: hasActiveProEntitlement(customerInfo),
        subscriptionType: inferSubscriptionType(customerInfo),
        isTrialActive: inferSubscriptionType(customerInfo) === 'trial',
        trialEndDate: getTrialEndDate(customerInfo),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message ?? 'Unable to restore purchases right now.',
    };
  }
}
