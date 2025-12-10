import Foundation
import NitroModules
import StoreKit

class HybridNitroSkanReferrer: HybridNitroSkanReferrerSpec {

    // MARK: - Android only
    func getInstallReferrer() -> Promise<ReferrerResult> {
        return .resolved(withResult: ReferrerResult(
            success: false,
            data: nil,
            error: "unavailable",
            errorMessage: "Install Referrer is only available on Android"
        ))
    }

    // MARK: - iOS: SKAdNetwork
    func registerAppForAdNetworkAttribution() -> Promise<SKANConversionResult> {
        if #available(iOS 11.3, *) {
            SKAdNetwork.registerAppForAdNetworkAttribution()
            return .resolved(withResult: SKANConversionResult(success: true, error: nil))
        }
        return .resolved(withResult: SKANConversionResult(
            success: false,
            error: "SKAdNetwork requires iOS 11.3+"
        ))
    }

    func updateConversionValue(fineValue: Double) -> Promise<SKANConversionResult> {
        let value = Int(fineValue)

        guard (0...63).contains(value) else {
            return .resolved(withResult: SKANConversionResult(
                success: false,
                error: "Conversion value must be between 0 and 63"
            ))
        }

        if #available(iOS 15.4, *) {
            return Promise.async {
                return await withCheckedContinuation { continuation in
                    SKAdNetwork.updatePostbackConversionValue(value) { error in
                        if let error = error {
                            continuation.resume(returning: SKANConversionResult(
                                success: false,
                                error: error.localizedDescription
                            ))
                        } else {
                            continuation.resume(returning: SKANConversionResult(
                                success: true,
                                error: nil
                            ))
                        }
                    }
                }
            }
        }

        if #available(iOS 14.0, *) {
            SKAdNetwork.updateConversionValue(value)
            return .resolved(withResult: SKANConversionResult(success: true, error: nil))
        }

        return .resolved(withResult: SKANConversionResult(
            success: false,
            error: "updateConversionValue requires iOS 14.0+"
        ))
    }

    func updatePostbackConversionValue(
        fineValue: Double,
        coarseValue: CoarseValue,
        lockWindow: Bool
    ) -> Promise<SKANConversionResult> {

        let fine = Int(fineValue)

        guard (0...63).contains(fine) else {
            return .resolved(withResult: SKANConversionResult(
                success: false,
                error: "Fine value must be between 0 and 63"
            ))
        }

        guard #available(iOS 16.1, *) else {
            return .resolved(withResult: SKANConversionResult(
                success: false,
                error: "updatePostbackConversionValue requires iOS 16.1+"
            ))
        }

        let coarse: SKAdNetwork.CoarseConversionValue
        switch coarseValue {
        case .high: coarse = .high
        case .medium: coarse = .medium
        case .low: coarse = .low
        }

        return Promise.async {
            return await withCheckedContinuation { continuation in
                SKAdNetwork.updatePostbackConversionValue(fine, coarseValue: coarse, lockWindow: lockWindow) { error in
                    if let error = error {
                        continuation.resume(returning: SKANConversionResult(
                            success: false,
                            error: error.localizedDescription
                        ))
                    } else {
                        continuation.resume(returning: SKANConversionResult(
                            success: true,
                            error: nil
                        ))
                    }
                }
            }
        }
    }
}
