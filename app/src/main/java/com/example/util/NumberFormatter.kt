package com.example.util

import com.example.model.CurrencyType
import java.math.BigDecimal
import java.math.RoundingMode
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.util.Locale

object NumberFormatter {

    /**
     * Formats a numeric value according to the currency convention.
     * INR uses the Indian grouping (1,00,000.00).
     * USD uses standard International grouping (100,000.00).
     */
    fun formatCurrency(
        value: Double,
        currency: CurrencyType,
        decimalPlaces: Int = 2,
        includeSymbol: Boolean = true
    ): String {
        if (value.isNaN() || value.isInfinite()) return if (includeSymbol) "${currency.symbol}0" else "0"

        val bd = BigDecimal.valueOf(value).setScale(decimalPlaces, RoundingMode.HALF_UP)
        val formattedNum = when (currency) {
            CurrencyType.INR -> formatIndianNumber(bd, decimalPlaces)
            CurrencyType.USD -> formatStandardNumber(bd, decimalPlaces)
        }

        return if (includeSymbol) {
            "${currency.symbol}$formattedNum"
        } else {
            formattedNum
        }
    }

    /**
     * Indian numbering system:
     * Last 3 digits grouped, then every 2 digits (e.g., 12,34,56,789.00)
     */
    fun formatIndianNumber(value: BigDecimal, decimalPlaces: Int = 2): String {
        val sign = if (value.signum() < 0) "-" else ""
        val absVal = value.abs()
        val plainStr = absVal.toPlainString()

        val parts = plainStr.split(".")
        val integerPart = parts[0]
        val fractionalPart = if (parts.size > 1) parts[1] else ""

        val formattedInt = if (integerPart.length <= 3) {
            integerPart
        } else {
            val lastThree = integerPart.takeLast(3)
            val remaining = integerPart.dropLast(3)
            val groups = mutableListOf<String>()

            var temp = remaining
            while (temp.isNotEmpty()) {
                val takeCount = if (temp.length >= 2) 2 else temp.length
                groups.add(0, temp.takeLast(takeCount))
                temp = temp.dropLast(takeCount)
            }

            groups.joinToString(",") + "," + lastThree
        }

        val paddedFraction = if (decimalPlaces > 0) {
            val frac = fractionalPart.padEnd(decimalPlaces, '0').take(decimalPlaces)
            if (frac.all { it == '0' } && decimalPlaces == 2) {
                ".$frac"
            } else if (frac.isNotEmpty()) {
                ".$frac"
            } else {
                ""
            }
        } else {
            ""
        }

        return "$sign$formattedInt$paddedFraction"
    }

    /**
     * Standard US/International grouping (e.g., 123,456,789.00)
     */
    fun formatStandardNumber(value: BigDecimal, decimalPlaces: Int = 2): String {
        val symbols = DecimalFormatSymbols(Locale.US)
        val pattern = if (decimalPlaces > 0) {
            "#,##0." + "0".repeat(decimalPlaces)
        } else {
            "#,##0"
        }
        val df = DecimalFormat(pattern, symbols)
        return df.format(value)
    }

    /**
     * Formats raw input number during typing.
     */
    fun formatDisplayExpression(raw: String): String {
        if (raw.isEmpty()) return "0"
        // Replace ASCII symbols with elegant typography symbols
        return raw.replace("*", " × ")
            .replace("/", " ÷ ")
            .replace("+", " + ")
            .replace("-", " − ")
    }

    /**
     * Compact spoken text for large numbers (e.g., "1.5 Lakh", "2 Crore", "100K", "$1.2M")
     */
    fun getCompactDescription(value: Double, currency: CurrencyType): String {
        val absVal = Math.abs(value)
        if (absVal < 1000) return ""

        return when (currency) {
            CurrencyType.INR -> {
                when {
                    absVal >= 10_000_000 -> {
                        val cr = value / 10_000_000.0
                        "≈ ${String.format(Locale.US, "%.2f", cr)} Crore"
                    }
                    absVal >= 100_000 -> {
                        val lakh = value / 100_000.0
                        "≈ ${String.format(Locale.US, "%.2f", lakh)} Lakh"
                    }
                    absVal >= 1_000 -> {
                        val thousand = value / 1_000.0
                        "≈ ${String.format(Locale.US, "%.1f", thousand)} Thousand"
                    }
                    else -> ""
                }
            }
            CurrencyType.USD -> {
                when {
                    absVal >= 1_000_000_000 -> {
                        val b = value / 1_000_000_000.0
                        "≈ $${String.format(Locale.US, "%.2f", b)}B"
                    }
                    absVal >= 1_000_000 -> {
                        val m = value / 1_000_000.0
                        "≈ $${String.format(Locale.US, "%.2f", m)}M"
                    }
                    absVal >= 1_000 -> {
                        val k = value / 1_000.0
                        "≈ $${String.format(Locale.US, "%.1f", k)}K"
                    }
                    else -> ""
                }
            }
        }
    }
}
