package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.localization.TranslationKey
import com.example.localization.Translations
import com.example.model.CurrencyType
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldPrimary
import com.example.util.NumberFormatter
import com.example.viewmodel.CalculatorUiState
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExchangeRateModal(
    state: CalculatorUiState,
    onDismiss: () -> Unit,
    onRefreshRate: () -> Unit,
    onApplyCustomRate: (Double) -> Unit,
    onResetToLiveRate: () -> Unit
) {
    var customRateInput by remember { mutableStateOf(state.exchangeRate.toString()) }
    var selectedTab by remember { mutableStateOf(0) } // 0: INR to USD, 1: USD to INR

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = Translations.get(TranslationKey.CUSTOM_RATE_TITLE, state.language),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                IconButton(onClick = onDismiss) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Main Rate Card
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Rate Status Badge (Live vs Estimated)
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (state.isLiveRate) EmeraldPrimary else Color(0xFFF59E0B)
                                    )
                            )
                            Text(
                                text = if (state.isLiveRate) {
                                    Translations.get(TranslationKey.LIVE_RATE, state.language)
                                } else if (state.isCustomRate) {
                                    Translations.get(TranslationKey.OFFLINE_RATE, state.language)
                                } else {
                                    Translations.get(TranslationKey.ESTIMATED_RATE, state.language)
                                },
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = if (state.isLiveRate) EmeraldPrimary else Color(0xFFF59E0B)
                            )
                        }

                        // Refresh Button
                        FilledTonalButton(
                            onClick = onRefreshRate,
                            enabled = !state.isFetchingRate,
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            if (state.isFetchingRate) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    Translations.get(TranslationKey.REFRESHING, state.language),
                                    fontSize = 12.sp
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = "Refresh",
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    Translations.get(TranslationKey.REFRESH_RATE, state.language),
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Primary Rate Equation
                    Text(
                        text = "1 USD = ₹${String.format(Locale.US, "%.4f", state.exchangeRate)}",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    val inverseRate = if (state.exchangeRate > 0) 1.0 / state.exchangeRate else 0.0
                    Text(
                        text = "1 INR = $${String.format(Locale.US, "%.6f", inverseRate)}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "${Translations.get(TranslationKey.LAST_UPDATED, state.language)}: ${state.lastUpdatedText}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Custom Rate Input Section
            Text(
                text = Translations.get(TranslationKey.CUSTOM_RATE_LABEL, state.language),
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = customRateInput,
                    onValueChange = { customRateInput = it },
                    placeholder = { Text("e.g. 86.85") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    prefix = { Text("₹ ") }
                )

                Button(
                    onClick = {
                        val parsed = customRateInput.toDoubleOrNull()
                        if (parsed != null && parsed > 0) {
                            onApplyCustomRate(parsed)
                        }
                    },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                ) {
                    Text(
                        Translations.get(TranslationKey.SAVE, state.language),
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            if (state.isCustomRate) {
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedButton(
                    onClick = onResetToLiveRate,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(Translations.get(TranslationKey.RESET_TO_LIVE, state.language))
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Quick Conversion Table Tabs
            Text(
                text = Translations.get(TranslationKey.QUICK_CONVERSION_TABLE, state.language),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))

            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.Transparent,
                divider = {}
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = {
                        Text(
                            Translations.get(TranslationKey.INR_TO_USD, state.language),
                            fontSize = 13.sp,
                            fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = {
                        Text(
                            Translations.get(TranslationKey.USD_TO_INR, state.language),
                            fontSize = 13.sp,
                            fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Conversion Table Rows
            val inrSamples = listOf(100.0, 500.0, 1000.0, 5000.0, 10000.0, 50000.0, 100000.0, 1000000.0)
            val usdSamples = listOf(1.0, 5.0, 10.0, 20.0, 50.0, 100.0, 500.0, 1000.0)

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 220.dp)
            ) {
                if (selectedTab == 0) {
                    inrSamples.forEach { inrVal ->
                        val usdVal = if (state.exchangeRate > 0) inrVal / state.exchangeRate else 0.0
                        ConversionRow(
                            from = NumberFormatter.formatCurrency(inrVal, CurrencyType.INR, 0),
                            to = NumberFormatter.formatCurrency(usdVal, CurrencyType.USD, 2)
                        )
                    }
                } else {
                    usdSamples.forEach { usdVal ->
                        val inrVal = usdVal * state.exchangeRate
                        ConversionRow(
                            from = NumberFormatter.formatCurrency(usdVal, CurrencyType.USD, 0),
                            to = NumberFormatter.formatCurrency(inrVal, CurrencyType.INR, 2)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ConversionRow(from: String, to: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = from,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium
        )
        Text(
            text = "→",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = to,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Bold,
            color = EmeraldPrimary
        )
    }
    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f), thickness = 0.5.dp)
}
