import type { HybridObject } from 'react-native-nitro-modules';

export interface InstallReferrerDetails {
  installReferrer: string;
  referrerClickTimestampSeconds: number;
  installBeginTimestampSeconds: number;
  referrerClickTimestampServerSeconds: number;
  installBeginTimestampServerSeconds: number;
  googlePlayInstantParam: boolean;
  installVersion?: string;
}

export interface ReferrerResult {
  success: boolean;
  data?: InstallReferrerDetails;
  error: string;
  errorMessage?: string;
}

export interface SKANConversionResult {
  success: boolean;
  error?: string;
}

export type CoarseValue = 'high' | 'medium' | 'low';



export interface NitroSkanReferrer
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  
  getInstallReferrer(): Promise<ReferrerResult>;

  registerAppForAdNetworkAttribution(): Promise<SKANConversionResult>;

  updateConversionValue(
    fineValue: number
  ): Promise<SKANConversionResult>;

  updatePostbackConversionValue(
    fineValue: number,
    coarseValue: CoarseValue,
    lockWindow: boolean
  ): Promise<SKANConversionResult>;
}
