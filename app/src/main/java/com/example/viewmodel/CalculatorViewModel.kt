package com.example.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.localization.TranslationKey
import com.example.localization.Translations
import com.example.model.AppLanguage
import com.example.model.AppThemeMode
import com.example.model.CalculationHistoryItem
import com.example.model.CurrencyType
import com.example.network.ExchangeRateService
import com.example.util.CalculatorEngine
import com.example.util.NumberFormatter
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class CalculatorUiState(
    val expression: String = "",
    val evaluatedValue: Double = 0.0,
    val evaluatedDisplay: String = "0",
    val errorMessage: String? = null,
    val currencyMode: Boolean = true,
    val baseCurrency: CurrencyType = CurrencyType.INR,
    val exchangeRate: Double = ExchangeRateService.DEFAULT_FALLBACK_RATE,
    val isLiveRate: Boolean = false,
    val isCustomRate: Boolean = false,
    val lastUpdatedText: String = "Default rate",
    val isFetchingRate: Boolean = false,
    val language: AppLanguage = AppLanguage.ENGLISH,
    val themeMode: AppThemeMode = AppThemeMode.SYSTEM,
    val hapticEnabled: Boolean = true,
    val decimalPlaces: Int = 2,
    val history: List<CalculationHistoryItem> = emptyList(),
    val toastMessage: String? = null
) {
    /**
     * Calculates the converted amount based on evaluatedValue and baseCurrency.
     * When base is INR: 1000 INR -> USD = 1000 / exchangeRate
     * When base is USD: 100 USD -> INR = 100 * exchangeRate
     */
    val convertedValue: Double
        get() {
            if (exchangeRate <= 0) return 0.0
            return when (baseCurrency) {
                CurrencyType.INR -> evaluatedValue / exchangeRate
                CurrencyType.USD -> evaluatedValue * exchangeRate
            }
        }

    val convertedDisplay: String
        get() {
            return NumberFormatter.formatCurrency(
                value = convertedValue,
                currency = baseCurrency.opposite(),
                decimalPlaces = decimalPlaces,
                includeSymbol = true
            )
        }

    val baseDisplay: String
        get() {
            return NumberFormatter.formatCurrency(
                value = evaluatedValue,
                currency = baseCurrency,
                decimalPlaces = decimalPlaces,
                includeSymbol = currencyMode
            )
        }
}

class CalculatorViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(CalculatorUiState())
    val uiState: StateFlow<CalculatorUiState> = _uiState.asStateFlow()

    init {
        // Fetch live exchange rate on startup
        refreshExchangeRate()
    }

    fun onDigit(digit: String) {
        _uiState.update { state ->
            val newExpr = if (state.expression == "0" && digit != "00") {
                digit
            } else if (state.expression.isEmpty() && digit == "00") {
                "0"
            } else {
                state.expression + digit
            }
            evaluateExpression(state.copy(expression = newExpr, errorMessage = null))
        }
    }

    fun onDecimal() {
        _uiState.update { state ->
            val expr = state.expression
            if (expr.isEmpty()) {
                evaluateExpression(state.copy(expression = "0."))
            } else {
                // Find current number segment
                val lastNum = expr.split(Regex("[+\\-*/]")).lastOrNull() ?: ""
                if (!lastNum.contains('.')) {
                    val lastChar = expr.lastOrNull()
                    val newExpr = if (lastChar != null && lastChar in "+-*/") "${expr}0." else "$expr."
                    evaluateExpression(state.copy(expression = newExpr, errorMessage = null))
                } else {
                    state
                }
            }
        }
    }

    fun onOperator(opChar: Char) {
        _uiState.update { state ->
            val expr = state.expression
            val op = when (opChar) {
                '×' -> '*'
                '÷' -> '/'
                '−' -> '-'
                else -> opChar
            }

            if (expr.isEmpty()) {
                if (op == '-') {
                    state.copy(expression = "-")
                } else {
                    state.copy(expression = "0$op")
                }
            } else {
                val last = expr.last()
                if (last in "+-*/") {
                    // Replace operator
                    state.copy(expression = expr.dropLast(1) + op)
                } else {
                    state.copy(expression = expr + op)
                }
            }
        }
    }

    fun onPercentage() {
        _uiState.update { state ->
            val expr = state.expression
            if (expr.isNotEmpty() && expr.last() !in "+-*/%") {
                evaluateExpression(state.copy(expression = "$expr%", errorMessage = null))
            } else {
                state
            }
        }
    }

    fun onClear() {
        _uiState.update { state ->
            state.copy(
                expression = "",
                evaluatedValue = 0.0,
                evaluatedDisplay = "0",
                errorMessage = null
            )
        }
    }

    fun onBackspace() {
        _uiState.update { state ->
            val expr = state.expression
            if (expr.isNotEmpty()) {
                val newExpr = expr.dropLast(1)
                evaluateExpression(state.copy(expression = newExpr, errorMessage = null))
            } else {
                state.copy(evaluatedValue = 0.0, evaluatedDisplay = "0")
            }
        }
    }

    fun onEquals() {
        val state = _uiState.value
        if (state.expression.isEmpty()) return

        when (val eval = CalculatorEngine.evaluate(state.expression)) {
            is CalculatorEngine.EvalResult.Success -> {
                val finalVal = eval.value
                val formattedDisplay = eval.formattedDisplay

                val convertedStr = if (state.currencyMode) {
                    val convVal = if (state.baseCurrency == CurrencyType.INR) {
                        finalVal / state.exchangeRate
                    } else {
                        finalVal * state.exchangeRate
                    }
                    NumberFormatter.formatCurrency(
                        value = convVal,
                        currency = state.baseCurrency.opposite(),
                        decimalPlaces = state.decimalPlaces,
                        includeSymbol = true
                    )
                } else ""

                val historyItem = CalculationHistoryItem(
                    expression = state.expression,
                    result = formattedDisplay,
                    isCurrencyMode = state.currencyMode,
                    baseCurrency = state.baseCurrency,
                    convertedResult = convertedStr,
                    exchangeRateUsed = state.exchangeRate
                )

                _uiState.update { current ->
                    current.copy(
                        expression = formattedDisplay,
                        evaluatedValue = finalVal,
                        evaluatedDisplay = formattedDisplay,
                        errorMessage = null,
                        history = listOf(historyItem) + current.history.take(49)
                    )
                }
            }
            is CalculatorEngine.EvalResult.Error -> {
                _uiState.update { current ->
                    current.copy(errorMessage = eval.message)
                }
            }
        }
    }

    fun toggleCurrencyMode() {
        _uiState.update { it.copy(currencyMode = !it.currencyMode) }
    }

    fun swapBaseCurrency() {
        _uiState.update { state ->
            // Keep the entered expression/value intact as requested
            state.copy(baseCurrency = state.baseCurrency.opposite())
        }
    }

    fun refreshExchangeRate() {
        viewModelScope.launch {
            _uiState.update { it.copy(isFetchingRate = true) }
            val currentRate = _uiState.value.exchangeRate
            val result = ExchangeRateService.fetchLatestRate(currentRate)
            _uiState.update { state ->
                val newRate = if (state.isCustomRate) state.exchangeRate else result.rate
                state.copy(
                    exchangeRate = newRate,
                    isLiveRate = result.isLive && !state.isCustomRate,
                    lastUpdatedText = if (state.isCustomRate) "Custom rate" else result.lastUpdatedText,
                    isFetchingRate = false,
                    toastMessage = if (result.isLive) {
                        Translations.get(TranslationKey.RATE_UPDATED_SUCCESS, state.language)
                    } else {
                        Translations.get(TranslationKey.RATE_UPDATE_FAILED, state.language)
                    }
                )
            }
        }
    }

    fun applyCustomRate(newRate: Double) {
        if (newRate <= 0) return
        _uiState.update { state ->
            state.copy(
                exchangeRate = newRate,
                isCustomRate = true,
                isLiveRate = false,
                lastUpdatedText = "Custom (Manual)",
                toastMessage = Translations.get(TranslationKey.CUSTOM_RATE_APPLIED, state.language)
            )
        }
    }

    fun resetToLiveRate() {
        _uiState.update { state ->
            state.copy(isCustomRate = false)
        }
        refreshExchangeRate()
    }

    fun setLanguage(language: AppLanguage) {
        _uiState.update { it.copy(language = language) }
    }

    fun setThemeMode(themeMode: AppThemeMode) {
        _uiState.update { it.copy(themeMode = themeMode) }
    }

    fun setHaptic(enabled: Boolean) {
        _uiState.update { it.copy(hapticEnabled = enabled) }
    }

    fun setDecimalPlaces(places: Int) {
        _uiState.update { it.copy(decimalPlaces = places) }
    }

    fun clearHistory() {
        _uiState.update { state ->
            state.copy(
                history = emptyList(),
                toastMessage = Translations.get(TranslationKey.HISTORY_CLEARED, state.language)
            )
        }
    }

    fun deleteHistoryItem(id: String) {
        _uiState.update { state ->
            state.copy(history = state.history.filter { it.id != id })
        }
    }

    fun restoreFromHistory(item: CalculationHistoryItem) {
        _uiState.update { state ->
            val expr = item.result
            val newState = state.copy(
                expression = expr,
                currencyMode = item.isCurrencyMode,
                baseCurrency = item.baseCurrency
            )
            evaluateExpression(newState)
        }
    }

    fun setToast(message: String) {
        _uiState.update { it.copy(toastMessage = message) }
    }

    fun clearToast() {
        _uiState.update { it.copy(toastMessage = null) }
    }

    private fun evaluateExpression(state: CalculatorUiState): CalculatorUiState {
        val expr = state.expression
        if (expr.isEmpty()) {
            return state.copy(evaluatedValue = 0.0, evaluatedDisplay = "0")
        }

        // Remove trailing operator for preview
        val lastChar = expr.lastOrNull()
        val cleanForEval = if (lastChar != null && lastChar in "+-*/") expr.dropLast(1) else expr
        if (cleanForEval.isEmpty()) {
            return state.copy(evaluatedValue = 0.0, evaluatedDisplay = "0")
        }

        return when (val eval = CalculatorEngine.evaluate(cleanForEval)) {
            is CalculatorEngine.EvalResult.Success -> {
                state.copy(
                    evaluatedValue = eval.value,
                    evaluatedDisplay = eval.formattedDisplay,
                    errorMessage = null
                )
            }
            is CalculatorEngine.EvalResult.Error -> {
                state
            }
        }
    }
}
