import { Platform } from "react-native";
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage } from "react-native-purchases";
import { api } from "./api";
import { PREMIUM_ENTITLEMENT, REVENUECAT_KEYS } from "./config";

let configured = false;

const apiKey = () => (Platform.OS === "ios" ? REVENUECAT_KEYS.ios : REVENUECAT_KEYS.android);

export const purchasesAvailable = () => Platform.OS !== "web" && !!apiKey();

export function hasPremium(info: CustomerInfo | null | undefined) {
  return !!info?.entitlements.active[PREMIUM_ENTITLEMENT];
}

/** Configure once and identify the RevenueCat customer as the Better Auth user. */
export async function identifyPurchaser(userId: string, onChange: (info: CustomerInfo) => void) {
  if (!purchasesAvailable()) return null;
  if (!configured) {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey: apiKey(), appUserID: userId });
    Purchases.addCustomerInfoUpdateListener(onChange);
    configured = true;
    return Purchases.getCustomerInfo();
  }
  const { customerInfo } = await Purchases.logIn(userId);
  return customerInfo;
}

export async function resetPurchaser() {
  if (!configured) return;
  try {
    if (!(await Purchases.isAnonymous())) await Purchases.logOut();
  } catch {
    // Already anonymous.
  }
}

export async function getPackages(): Promise<PurchasesPackage[]> {
  if (!purchasesAvailable()) return [];
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

/** Returns true when the purchase unlocked premium, false when the user cancelled. */
export async function buy(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    await syncWithServer();
    return hasPremium(customerInfo);
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restore(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  await syncWithServer();
  return hasPremium(info);
}

/** Ask the API to re-read the entitlement from RevenueCat (the webhook may lag behind). */
export async function syncWithServer(): Promise<boolean | null> {
  try {
    const { isPremium } = await api<{ isPremium: boolean }>("/billing/refresh", { method: "POST" });
    return isPremium;
  } catch {
    return null;
  }
}
