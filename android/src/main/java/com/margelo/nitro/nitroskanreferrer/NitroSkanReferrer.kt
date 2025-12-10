package com.margelo.nitro.nitroskanreferrer

import android.content.Context
import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.margelo.nitro.core.Promise
import com.margelo.nitro.NitroModules
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume


@DoNotStrip
class NitroSkanReferrer : HybridNitroSkanReferrerSpec() {

    // Get context from NitroModules instead of constructor injection
    private val appContext: Context
        get() = NitroModules.applicationContext 
            ?: throw IllegalStateException("Application context not available")

    private var referrerClient: InstallReferrerClient? = null

    // Dummy details (Nitro-safe)
    private fun dummyDetails() = InstallReferrerDetails(
        installReferrer = "",
        referrerClickTimestampSeconds = 0.0,
        installBeginTimestampSeconds = 0.0,
        referrerClickTimestampServerSeconds = 0.0,
        installBeginTimestampServerSeconds = 0.0,
        googlePlayInstantParam = false,
        installVersion = ""
    )

    // ---------------------------------------------------------------------
    // ANDROID: Install Referrer
    // ---------------------------------------------------------------------
    override fun getInstallReferrer(): Promise<ReferrerResult> {
        return Promise.async {
            suspendCancellableCoroutine { continuation ->

                val client = InstallReferrerClient.newBuilder(appContext).build()
                referrerClient = client

                fun safeResume(result: ReferrerResult) {
                    if (continuation.isActive) continuation.resume(result)
                }

                try {
                    client.startConnection(object : InstallReferrerStateListener {

                        override fun onInstallReferrerSetupFinished(responseCode: Int) {
                            when (responseCode) {

                                InstallReferrerClient.InstallReferrerResponse.OK -> {
                                    try {
                                        val response = client.installReferrer

                                        val details = InstallReferrerDetails(
                                            installReferrer = response.installReferrer ?: "",
                                            referrerClickTimestampSeconds =
                                                response.referrerClickTimestampSeconds.toDouble(),
                                            installBeginTimestampSeconds =
                                                response.installBeginTimestampSeconds.toDouble(),
                                            referrerClickTimestampServerSeconds =
                                                response.referrerClickTimestampServerSeconds.toDouble(),
                                            installBeginTimestampServerSeconds =
                                                response.installBeginTimestampServerSeconds.toDouble(),
                                            googlePlayInstantParam = response.googlePlayInstantParam,
                                            installVersion = response.installVersion ?: ""
                                        )

                                        safeResume(
                                            ReferrerResult(
                                                success = true,
                                                data = details,
                                                error = "ok",
                                                errorMessage = ""
                                            )
                                        )
                                    } catch (e: Exception) {
                                        safeResume(
                                            ReferrerResult(
                                                success = false,
                                                data = dummyDetails(),
                                                error = "exception",
                                                errorMessage = e.message ?: ""
                                            )
                                        )
                                    } finally {
                                        client.endConnection()
                                    }
                                }

                                InstallReferrerClient.InstallReferrerResponse.FEATURE_NOT_SUPPORTED ->
                                    safeResume(
                                        ReferrerResult(
                                            success = false,
                                            data = dummyDetails(),
                                            error = "featureNotSupported",
                                            errorMessage = "Install Referrer API not supported"
                                        )
                                    )

                                InstallReferrerClient.InstallReferrerResponse.SERVICE_UNAVAILABLE ->
                                    safeResume(
                                        ReferrerResult(
                                            success = false,
                                            data = dummyDetails(),
                                            error = "serviceUnavailable",
                                            errorMessage = "Play Store service unavailable"
                                        )
                                    )

                                else ->
                                    safeResume(
                                        ReferrerResult(
                                            success = false,
                                            data = dummyDetails(),
                                            error = "unknown",
                                            errorMessage = "Unknown response code: $responseCode"
                                        )
                                    )
                            }
                        }

                        override fun onInstallReferrerServiceDisconnected() {
                            safeResume(
                                ReferrerResult(
                                    success = false,
                                    data = dummyDetails(),
                                    error = "serviceDisconnected",
                                    errorMessage = "Service disconnected"
                                )
                            )
                            client.endConnection()
                        }
                    })
                } catch (e: Exception) {
                    safeResume(
                        ReferrerResult(
                            success = false,
                            data = dummyDetails(),
                            error = "exception",
                            errorMessage = e.message ?: ""
                        )
                    )
                    client.endConnection()
                }

                continuation.invokeOnCancellation { client.endConnection() }
            }
        }
    }

    // ---------------------------------------------------------------------
    // iOS ONLY — Stub implementations (Nitro-safe)
    // ---------------------------------------------------------------------
    override fun registerAppForAdNetworkAttribution() = Promise.resolved(
        SKANConversionResult(false, "SKAdNetwork is only available on iOS")
    )

    override fun updateConversionValue(fineValue: Double) = Promise.resolved(
        SKANConversionResult(false, "SKAdNetwork is only available on iOS")
    )

    override fun updatePostbackConversionValue(
        fineValue: Double,
        coarseValue: String,
        lockWindow: Boolean
    ) = Promise.resolved(
        SKANConversionResult(false, "SKAdNetwork is only available on iOS")
    )
}
