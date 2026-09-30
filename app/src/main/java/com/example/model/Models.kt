package com.example.model

enum class CurrencyType(val code: String, val symbol: String, val displayNameEn: String) {
    INR("INR", "₹", "Indian Rupee"),
    USD("USD", "$", "US Dollar");

    fun opposite(): CurrencyType = if (this == INR) USD else INR
}

enum class AppLanguage(val code: String, val displayName: String, val nativeName: String) {
    ENGLISH("en", "English", "English"),
    HINDI("hi", "Hindi", "हिन्दी"),
    HINGLISH("hinglish", "Hinglish", "Hinglish")
}

enum class AppThemeMode(val titleEn: String) {
    SYSTEM("System Default"),
    LIGHT("Light Mode"),
    DARK("Dark Mode")
}

data class CalculationHistoryItem(
    val id: String = java.util.UUID.randomUUID().toString(),
    val expression: String,
    val result: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isCurrencyMode: Boolean = false,
    val baseCurrency: CurrencyType = CurrencyType.INR,
    val convertedResult: String = "",
    val exchangeRateUsed: Double = 0.0
)
