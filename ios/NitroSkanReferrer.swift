import Foundation
import StoreKit
import NitroModules

class NitroSkanReferrer: HybridNitroSkanReferrerSpec {

    required override init() {
        super.init()
    }

    // -------------------------------------------------------
    // iOS: SKAdNetwork
    // -------------------------------------------------------

    func registerAppForAdNetworkAttribution() -> Promise<SKANConversionResult> {
        return Promise.async {
            if #available(iOS 14.0, *) {
                SKAdNetwork.registerAppForAdNetworkAttribution()

                return SKANConversionResult(
                    success: true,
                    error: ""
                )
            } else {
                return SKANConversionResult(
                    success: false,
                    error: "SKAdNetwork requires iOS 14.0+"
                )
            }
        }
    }

    func updateConversionValue(fineValue: Double) -> Promise<SKANConversionResult> {
        return Promise.async {
            if #available(iOS 14.0, *) {
                let value = Int(fineValue)

                guard (0...63).contains(value) else {
                    return SKANConversionResult(
                        success: false,
                        error: "Conversion value must be between 0 and 63"
                    )
                }

                SKAdNetwork.updateConversionValue(value)
                return SKANConversionResult(success: true, error: "")
            }

            return SKANConversionResult(
                success: false,
                error: "SKAdNetwork requires iOS 14.0+"
            )
        }
    }

   func updatePostbackConversionValue(
      fineValue: Double,
      coarseValue: String,
      lockWindow: Bool
  ) -> Promise<SKANConversionResult> {

      return Promise.async {
          guard #available(iOS 16.1, *) else {
              return SKANConversionResult(success: false, error: "Requires iOS 16.1+")
          }

          let fine = Int(fineValue)
          guard (0...63).contains(fine) else {
              return SKANConversionResult(success: false, error: "Fine value must be between 0–63")
          }

          // Nitro gives: coarseValue.value as STRING
          let raw = coarseValue.lowercased()

          let coarse: SKAdNetwork.CoarseConversionValue?
          if raw == "low" {
              coarse = .low
          } else if raw == "medium" {
              coarse = .medium
          } else if raw == "high" {
              coarse = .high
          } else {
              return SKANConversionResult(success: false, error: "Invalid coarse value (low|medium|high)")
          }

          var callbackError: Error? = nil
          let semaphore = DispatchSemaphore(value: 0)

          SKAdNetwork.updatePostbackConversionValue(
              fine,
              coarseValue: coarse ?? .low,
              lockWindow: lockWindow
          ) { error in
              callbackError = error
              semaphore.signal()
          }

          semaphore.wait()

          if let callbackError = callbackError {
              return SKANConversionResult(success: false, error: callbackError.localizedDescription)
          }

          return SKANConversionResult(success: true, error: "")
      }
  }


    // -------------------------------------------------------
    // Android only — Stub on iOS
    // -------------------------------------------------------

   func getInstallReferrer() -> Promise<ReferrerResult> {
      // Dummy fallback object – all fields required by Nitro / TS types
      let dummy = InstallReferrerDetails(
          installReferrer: "",
          referrerClickTimestampSeconds: 0,
          installBeginTimestampSeconds: 0,
          referrerClickTimestampServerSeconds: 0,
          installBeginTimestampServerSeconds: 0,
          googlePlayInstantParam: false,
          installVersion: ""
      )

      return Promise.resolved(
          withResult: ReferrerResult(
              success: false,
              data: dummy,
              error: "Install Referrer is only available on Android",
              errorMessage: ""
          )
      )
  }

}
