package com.example.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

data class RateFetchResult(
    val rate: Double,
    val isLive: Boolean,
    val lastUpdatedText: String,
    val timestampMillis: Long,
    val source: String,
    val errorMessage: String? = null
)

object ExchangeRateService {

    // Conservative default fallback rate when offline or before first fetch
    const val DEFAULT_FALLBACK_RATE = 86.85

    private val client by lazy {
        OkHttpClient.Builder()
            .connectTimeout(8, TimeUnit.SECONDS)
            .readTimeout(8, TimeUnit.SECONDS)
            .build()
    }

    private val endpoints = listOf(
        "https://open.er-api.com/v6/latest/USD",
        "https://api.exchangerate-api.com/v4/latest/USD"
    )

    suspend fun fetchLatestRate(currentRate: Double = DEFAULT_FALLBACK_RATE): RateFetchResult = withContext(Dispatchers.IO) {
        for (url in endpoints) {
            try {
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", "Currenzo/1.0")
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body?.string()
                        if (!body.isNullOrBlank()) {
                            val json = JSONObject(body)
                            if (json.has("rates")) {
                                val rates = json.getJSONObject("rates")
                                if (rates.has("INR")) {
                                    val inrRate = rates.getDouble("INR")
                                    val formattedTime = SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault()).format(Date())
                                    return@withContext RateFetchResult(
                                        rate = inrRate,
                                        isLive = true,
                                        lastUpdatedText = formattedTime,
                                        timestampMillis = System.currentTimeMillis(),
                                        source = "Live API (${if (url.contains("open.er-api")) "OpenER" else "ExchangeRate"})",
                                        errorMessage = null
                                    )
                                }
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                // Try next endpoint
            }
        }

        // Both endpoints failed or offline
        return@withContext RateFetchResult(
            rate = currentRate,
            isLive = false,
            lastUpdatedText = "Estimated (Offline)",
            timestampMillis = System.currentTimeMillis(),
            source = "Estimated Fallback",
            errorMessage = "Unable to reach live rates service"
        )
    }
}
