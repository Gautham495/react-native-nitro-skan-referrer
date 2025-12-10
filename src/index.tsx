import { NitroModules } from 'react-native-nitro-modules';
import type {
  NitroSkanReferrer,
  InstallReferrerDetails,
  ReferrerResult,
  SKANConversionResult,
} from './NitroSkanReferrer.nitro';

const NitroSkanReferrerModule =
  NitroModules.createHybridObject<NitroSkanReferrer>('NitroSkanReferrer');

// -------------------------------------------------------
// ANDROID: Install Referrer
// -------------------------------------------------------

/**
 * Get Google Play Install Referrer details (Android only)
 * iOS: Returns error result
 */
export async function getInstallReferrer(): Promise<ReferrerResult> {
  return NitroSkanReferrerModule.getInstallReferrer();
}

/**
 * Helper to check if install referrer was successful
 */
export function isReferrerSuccess(
  result: ReferrerResult
): result is ReferrerResult & { data: InstallReferrerDetails } {
  return result.success && result.data !== null;
}

/**
 * Parse install referrer URL parameters
 */
export function parseReferrerParams(
  installReferrer: string
): Record<string, string> {
  try {
    const params = new URLSearchParams(installReferrer);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  } catch {
    return {};
  }
}

// -------------------------------------------------------
// iOS: SKAdNetwork
// -------------------------------------------------------

/**
 * Register for SKAdNetwork attribution (iOS only)
 * Android: Returns error result
 */
export async function registerAppForAdNetworkAttribution(): Promise<SKANConversionResult> {
  return NitroSkanReferrerModule.registerAppForAdNetworkAttribution();
}

/**
 * Update SKAdNetwork conversion value (iOS only)
 * Android: Returns error result
 *
 * @param fineValue - Conversion value (0-63)
 */
export async function updateConversionValue(
  fineValue: number
): Promise<SKANConversionResult> {
  return NitroSkanReferrerModule.updateConversionValue(fineValue);
}

/**
 * Update postback conversion value with coarse value (iOS 16.1+ only)
 * Android: Returns error result
 *
 * @param fineValue - Fine conversion value (0-63)
 * @param coarseValue - Coarse value ("low" | "medium" | "high")
 * @param lockWindow - Whether to lock the conversion window
 */
export async function updatePostbackConversionValue(
  fineValue: number,
  coarseValue: string,
  lockWindow: boolean = false
): Promise<SKANConversionResult> {
  return NitroSkanReferrerModule.updatePostbackConversionValue(
    fineValue,
    coarseValue,
    lockWindow
  );
}

/**
 * Helper to check if SKAN operation was successful
 */
export function isSKANSuccess(result: SKANConversionResult): boolean {
  return result.success;
}

// Re-export types
export type {
  NitroSkanReferrer,
  InstallReferrerDetails,
  ReferrerResult,
  SKANConversionResult,
};
