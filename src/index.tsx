import { NitroModules } from 'react-native-nitro-modules';
import type {
  NitroSkanReferrer,
  ReferrerResult,
  SKANConversionResult,
  CoarseValue,
} from './NitroSkanReferrer.nitro';

const NitroSkanReferrerModule =
  NitroModules.createHybridObject<NitroSkanReferrer>('NitroSkanReferrer');


export function getInstallReferrer(): Promise<ReferrerResult> {
  return NitroSkanReferrerModule.getInstallReferrer();
}

export function registerAppForAdNetworkAttribution(): Promise<SKANConversionResult> {
  return NitroSkanReferrerModule.registerAppForAdNetworkAttribution();
}

export function updateConversionValue(
  fineValue: number
): Promise<SKANConversionResult> {
  return NitroSkanReferrerModule.updateConversionValue(fineValue);
}

export function updatePostbackConversionValue(
  fineValue: number,
  coarseValue: CoarseValue,
  lockWindow: boolean
): Promise<SKANConversionResult> {
  return NitroSkanReferrerModule.updatePostbackConversionValue(
    fineValue,
    coarseValue,
    lockWindow
  );
}

export * from './NitroSkanReferrer.nitro';

export default NitroSkanReferrerModule;
