package com.margelo.nitro.nitroskanreferrer

import android.content.Context
import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener
import com.android.installreferrer.api.ReferrerDetails
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

@DoNotStrip
class NitroSkanReferrer(private val appContext: Context) : HybridNitroSkanReferrerSpec() {

    private var referrerClient: InstallReferrerClient? = null

    // -------------------------------------------------------
    // ANDROID: Install Referrer
    // -------------------------------------------------------
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
                                        val response: ReferrerDetails = client.installReferrer
                                        val details = InstallReferrerDetails(
                                            installReferrer = response.installReferrer ?: "",
                                            referrerClickTimestampSeconds = response.referrerClickTimestampSeconds.toDouble(),
                                            installBeginTimestampSeconds = response.installBeginTimestampSeconds.toDouble(),
                                            referrerClickTimestampServerSeconds = response.referrerClickTimestampServerSeconds.toDouble(),
                                            installBeginTimestampServerSeconds = response.installBeginTimestampServerSeconds.toDouble(),
                                            googlePlayInstantParam = response.googlePlayInstantParam,
                                            installVersion = response.installVersion
                                        )

                                        safeResume(
                                            ReferrerResult(
                                                success = true,
                                                data = details,
                                                error = "ok",
                                                errorMessage = null
                                            )
                                        )
                                    } catch (e: Exception) {
                                        safeResume(
                                            ReferrerResult(
                                                success = false,
                                                data = null,
                                                error = "exception",
                                                errorMessage = e.message
                                            )
                                        )
                                    } finally {
                                        client.endConnection()
                                    }
                                }

                                InstallReferrerClient.InstallReferrerResponse.FEATURE_NOT_SUPPORTED -> {
                                    safeResume(
                                        ReferrerResult(
                                            success = false,
                                            data = null,
                                            error = "featureNotSupported",
                                            errorMessage = "Install Referrer API not supported"
                                        )
                                    )
                                    client.endConnection()
                                }

                                InstallReferrerClient.InstallReferrerResponse.SERVICE_UNAVAILABLE -> {
                                    safeResume(
                                        ReferrerResult(
                                            success = false,
                                            data = null,
                                            error = "serviceUnavailable",
                                            errorMessage = "Play Store service unavailable"
                                        )
                                    )
                                    client.endConnection()
                                }

                                else -> {
                                    safeResume(
                                        ReferrerResult(
                                            success = false,
                                            data = null,
                                            error = "unknown",
                                            errorMessage = "Unknown response code: $responseCode"
                                        )
                                    )
                                    client.endConnection()
                                }
                            }
                        }

                        override fun onInstallReferrerServiceDisconnected() {
                            safeResume(
                                ReferrerResult(
                                    success = false,
                                    data = null,
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
                            data = null,
                            error = "exception",
                            errorMessage = e.message
                        )
                    )
                    client.endConnection()
                }

                continuation.invokeOnCancellation {
                    client.endConnection()
                }
            }
        }
    }

    // -------------------------------------------------------
    // iOS ONLY — Stub implementations for Android
    // -------------------------------------------------------

    override fun registerAppForAdNetworkAttribution(): Promise<SKANConversionResult> {
        return Promise.resolved(
            SKANConversionResult(
                success = false,
                error = "SKAdNetwork is only available on iOS"
            )
        )
    }

    override fun updateConversionValue(fineValue: Double): Promise<SKANConversionResult> {
        return Promise.resolved(
            SKANConversionResult(
                success = false,
                error = "SKAdNetwork is only available on iOS"
            )
        )
    }

    override fun updatePostbackConversionValue(
        fineValue: Double,
        coarseValue: CoarseValue,
        lockWindow: Boolean
    ): Promise<SKANConversionResult> {
        return Promise.resolved(
            SKANConversionResult(
                success = false,
                error = "SKAdNetwork is only available on iOS"
            )
        )
    }
}
