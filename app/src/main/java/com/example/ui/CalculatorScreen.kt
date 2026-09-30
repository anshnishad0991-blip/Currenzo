package com.example.ui

import android.content.Intent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.outlined.CurrencyExchange
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.localization.TranslationKey
import com.example.localization.Translations
import com.example.model.CurrencyType
import com.example.ui.components.CalculatorKeypad
import com.example.ui.components.ExchangeRateModal
import com.example.ui.components.HistoryModal
import com.example.ui.components.SettingsModal
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldPrimary
import com.example.util.NumberFormatter
import com.example.viewmodel.CalculatorUiState
import com.example.viewmodel.CalculatorViewModel
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalculatorScreen(
    viewModel: CalculatorViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val snackbarHostState = remember { SnackbarHostState() }

    var showRateModal by remember { mutableStateOf(false) }
    var showHistoryModal by remember { mutableStateOf(false) }
    var showSettingsModal by remember { mutableStateOf(false) }

    // Handle toast messages
    LaunchedEffect(state.toastMessage) {
        state.toastMessage?.let { msg ->
            snackbarHostState.showSnackbar(
                message = msg,
                duration = SnackbarDuration.Short
            )
            viewModel.clearToast()
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = Translations.get(TranslationKey.APP_NAME, state.language),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    }
                },
                actions = {
                    // Currency Mode Quick Switch
                    FilterChip(
                        selected = state.currencyMode,
                        onClick = { viewModel.toggleCurrencyMode() },
                        label = {
                            Text(
                                text = if (state.currencyMode) {
                                    Translations.get(TranslationKey.CURRENCY_MODE, state.language)
                                } else {
                                    Translations.get(TranslationKey.CURRENCY_MODE, state.language)
                                },
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        },
                        leadingIcon = {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(if (state.currencyMode) EmeraldPrimary else Color.Gray)
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = EmeraldPrimary.copy(alpha = 0.15f),
                            selectedLabelColor = EmeraldPrimary
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = state.currencyMode,
                            borderColor = if (state.currencyMode) EmeraldPrimary.copy(alpha = 0.5f) else Color.Transparent
                        )
                    )

                    // History Button with Badge
                    BadgedBox(
                        badge = {
                            if (state.history.isNotEmpty()) {
                                Badge(
                                    containerColor = EmeraldPrimary,
                                    contentColor = Color.White
                                ) {
                                    Text(state.history.size.toString())
                                }
                            }
                        }
                    ) {
                        IconButton(onClick = { showHistoryModal = true }) {
                            Icon(
                                imageVector = Icons.Outlined.History,
                                contentDescription = "History",
                                tint = MaterialTheme.colorScheme.onBackground
                            )
                        }
                    }

                    // Settings Button
                    IconButton(onClick = { showSettingsModal = true }) {
                        Icon(
                            imageVector = Icons.Outlined.Settings,
                            contentDescription = "Settings",
                            tint = MaterialTheme.colorScheme.onBackground
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .navigationBarsPadding(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Upper Display Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Rate Badge & Swap Trigger Row
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showRateModal = true }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(if (state.isLiveRate) EmeraldPrimary else Color(0xFFF59E0B))
                            )
                            Text(
                                text = "1 USD = ₹${String.format(Locale.US, "%.2f", state.exchangeRate)}",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = if (state.isLiveRate) "• Live" else "• Est",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (state.isLiveRate) EmeraldPrimary else Color(0xFFF59E0B)
                            )
                        }

                        Text(
                            text = "Rate Info →",
                            style = MaterialTheme.typography.labelSmall,
                            color = EmeraldPrimary,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Calculator Display Box
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = MaterialTheme.colorScheme.surface,
                    modifier = Modifier.fillMaxWidth(),
                    tonalElevation = 2.dp,
                    border = androidx.compose.foundation.BorderStroke(
                        width = 1.dp,
                        color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp),
                        horizontalAlignment = Alignment.End
                    ) {
                        // Expression line
                        val exprScrollState = rememberScrollState()
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(exprScrollState, reverseScrolling = true),
                            horizontalArrangement = Arrangement.End
                        ) {
                            Text(
                                text = NumberFormatter.formatDisplayExpression(state.expression),
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.End
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Primary Value (Large Display)
                        val primaryText = if (state.currencyMode) {
                            state.baseDisplay
                        } else {
                            state.evaluatedDisplay
                        }

                        // Responsive font size
                        val fontSize = when {
                            primaryText.length > 14 -> 28.sp
                            primaryText.length > 10 -> 34.sp
                            else -> 42.sp
                        }

                        Text(
                            text = primaryText,
                            fontSize = fontSize,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            textAlign = TextAlign.End,
                            maxLines = 1
                        )

                        // Secondary Converted Value (When Currency Mode is Active)
                        AnimatedVisibility(
                            visible = state.currencyMode,
                            enter = fadeIn(),
                            exit = fadeOut()
                        ) {
                            Column(
                                horizontalAlignment = Alignment.End,
                                modifier = Modifier.padding(top = 8.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = "⇄",
                                        style = MaterialTheme.typography.titleMedium,
                                        color = EmeraldPrimary,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "${state.convertedDisplay} ${state.baseCurrency.opposite().code}",
                                        style = MaterialTheme.typography.headlineSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = EmeraldPrimary
                                    )
                                }

                                // Spoken verbal text (e.g., "≈ 1.5 Lakh" or "$10K")
                                val spokenBase = NumberFormatter.getCompactDescription(state.evaluatedValue, state.baseCurrency)
                                val spokenConv = NumberFormatter.getCompactDescription(state.convertedValue, state.baseCurrency.opposite())
                                if (spokenBase.isNotEmpty() || spokenConv.isNotEmpty()) {
                                    Text(
                                        text = listOf(spokenBase, spokenConv).filter { it.isNotEmpty() }.joinToString(" • "),
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Bottom Quick Action Strip: Swap Currency, Copy, Share
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Currency Swap Button (INR ⇄ USD)
                    FilledTonalButton(
                        onClick = { viewModel.swapBaseCurrency() },
                        modifier = Modifier.weight(1.3f),
                        shape = RoundedCornerShape(14.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.SwapHoriz,
                            contentDescription = "Swap",
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "${state.baseCurrency.code} ⇄ ${state.baseCurrency.opposite().code}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }

                    // Copy Result Button
                    OutlinedButton(
                        onClick = {
                            val copyText = if (state.currencyMode) {
                                "${state.baseDisplay} = ${state.convertedDisplay}"
                            } else {
                                state.evaluatedDisplay
                            }
                            clipboardManager.setText(AnnotatedString(copyText))
                            viewModel.setToast(Translations.get(TranslationKey.COPIED_TO_CLIPBOARD, state.language))
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.ContentCopy,
                            contentDescription = "Copy",
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = Translations.get(TranslationKey.COPY_RESULT, state.language),
                            fontSize = 12.sp
                        )
                    }

                    // Share Result Button
                    OutlinedButton(
                        onClick = {
                            val shareText = if (state.currencyMode) {
                                "${state.baseDisplay} = ${state.convertedDisplay} (Exchange Rate: 1 USD = ₹${state.exchangeRate})"
                            } else {
                                "${state.expression} = ${state.evaluatedDisplay}"
                            }
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, shareText)
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "Share Result"))
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Share,
                            contentDescription = "Share",
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = Translations.get(TranslationKey.SHARE_RESULT, state.language),
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Lower Keypad Section (Thumb Zone)
            CalculatorKeypad(
                hapticEnabled = state.hapticEnabled,
                onDigit = viewModel::onDigit,
                onOperator = viewModel::onOperator,
                onDecimal = viewModel::onDecimal,
                onPercentage = viewModel::onPercentage,
                onClear = viewModel::onClear,
                onBackspace = viewModel::onBackspace,
                onEquals = viewModel::onEquals,
                modifier = Modifier.fillMaxWidth()
            )
        }

        // Modals
        if (showRateModal) {
            ExchangeRateModal(
                state = state,
                onDismiss = { showRateModal = false },
                onRefreshRate = { viewModel.refreshExchangeRate() },
                onApplyCustomRate = { rate ->
                    viewModel.applyCustomRate(rate)
                    showRateModal = false
                },
                onResetToLiveRate = {
                    viewModel.resetToLiveRate()
                    showRateModal = false
                }
            )
        }

        if (showHistoryModal) {
            HistoryModal(
                state = state,
                onDismiss = { showHistoryModal = false },
                onRestoreItem = viewModel::restoreFromHistory,
                onDeleteItem = viewModel::deleteHistoryItem,
                onClearHistory = viewModel::clearHistory,
                onShowToast = viewModel::setToast
            )
        }

        if (showSettingsModal) {
            SettingsModal(
                state = state,
                onDismiss = { showSettingsModal = false },
                onSelectLanguage = viewModel::setLanguage,
                onSelectTheme = viewModel::setThemeMode,
                onToggleHaptic = viewModel::setHaptic,
                onSelectDecimals = viewModel::setDecimalPlaces
            )
        }
    }
}
