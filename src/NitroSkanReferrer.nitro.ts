import type { HybridObject } from "react-native-nitro-modules";

/**
 * Install Referrer details (Android only)
 */
export interface InstallReferrerDetails {
  installReferrer: string;
  referrerClickTimestampSeconds: number;
  installBeginTimestampSeconds: number;
  referrerClickTimestampServerSeconds: number;
  installBeginTimestampServerSeconds: number;
  googlePlayInstantParam: boolean;
  installVersion: string;
}

/**
 * Result of Install Referrer API (Android) or stub (iOS)
 */
export interface ReferrerResult {
  success: boolean;
  data: InstallReferrerDetails;
  error: string;
  errorMessage: string;
}

/**
 * Result of SKAN API (iOS) or stub (Android)
 */
export interface SKANConversionResult {
  success: boolean;
  error: string;
}

/**
 * Nitro Module Interface
 */
export interface NitroSkanReferrer
  extends HybridObject<{ ios: "swift"; android: "kotlin" }> {
  // Android: real implementation, iOS: dummy result
  getInstallReferrer(): Promise<ReferrerResult>;

  // iOS: real implementation, Android: dummy result
  registerAppForAdNetworkAttribution(): Promise<SKANConversionResult>;

  // iOS: real implementation, Android: dummy result
  updateConversionValue(fineValue: number): Promise<SKANConversionResult>;

  // iOS: real implementation, Android: dummy result
  updatePostbackConversionValue(
    fineValue: number,
    coarseValue: string, // MUST be string, NOT enum
    lockWindow: boolean
  ): Promise<SKANConversionResult>;
}
