package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Backspace
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.RoseAccent

enum class KeyType {
    NUMBER,
    OPERATOR,
    ACTION,
    EQUALS
}

@Composable
fun CalculatorKeypad(
    hapticEnabled: Boolean,
    onDigit: (String) -> Unit,
    onOperator: (Char) -> Unit,
    onDecimal: () -> Unit,
    onPercentage: () -> Unit,
    onClear: () -> Unit,
    onBackspace: () -> Unit,
    onEquals: () -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current

    fun performHaptic() {
        if (hapticEnabled) {
            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
        }
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Row 1: AC, ⌫, %, ÷
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            CalculatorButton(
                text = "AC",
                keyType = KeyType.ACTION,
                textColor = RoseAccent,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onClear()
                }
            )
            CalculatorIconButton(
                icon = {
                    Icon(
                        imageVector = Icons.Outlined.Backspace,
                        contentDescription = "Backspace",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(24.dp)
                    )
                },
                keyType = KeyType.ACTION,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onBackspace()
                }
            )
            CalculatorButton(
                text = "%",
                keyType = KeyType.OPERATOR,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onPercentage()
                }
            )
            CalculatorButton(
                text = "÷",
                keyType = KeyType.OPERATOR,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onOperator('÷')
                }
            )
        }

        // Row 2: 7, 8, 9, ×
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            CalculatorButton(
                text = "7",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDigit("7")
                }
            )
            CalculatorButton(
                text = "8",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDigit("8")
                }
            )
            CalculatorButton(
                text = "9",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDigit("9")
                }
            )
            CalculatorButton(
                text = "×",
                keyType = KeyType.OPERATOR,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onOperator('×')
                }
            )
        }

        // Row 3: 4, 5, 6, −
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            CalculatorButton(
                text = "4",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDigit("4")
                }
            )
            CalculatorButton(
                text = "5",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDigit("5")
                }
            )
            CalculatorButton(
                text = "6",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDigit("6")
                }
            )
            CalculatorButton(
                text = "−",
                keyType = KeyType.OPERATOR,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onOperator('−')
                }
            )
        }

        // Row 4: 1, 2, 3, +
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            CalculatorButton(
                text = "1",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDigit("1")
                }
            )
            CalculatorButton(
                text = "2",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDigit("2")
                }
            )
            CalculatorButton(
                text = "3",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDigit("3")
                }
            )
            CalculatorButton(
                text = "+",
                keyType = KeyType.OPERATOR,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onOperator('+')
                }
            )
        }

        // Row 5: 00, 0, ., =
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            CalculatorButton(
                text = "00",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDigit("00")
                }
            )
            CalculatorButton(
                text = "0",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDigit("0")
                }
            )
            CalculatorButton(
                text = ".",
                keyType = KeyType.NUMBER,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onDecimal()
                }
            )
            CalculatorButton(
                text = "=",
                keyType = KeyType.EQUALS,
                modifier = Modifier.weight(1f),
                onClick = {
                    performHaptic()
                    onEquals()
                }
            )
        }
    }
}

@Composable
private fun CalculatorButton(
    text: String,
    keyType: KeyType,
    modifier: Modifier = Modifier,
    textColor: Color? = null,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(targetValue = if (isPressed) 0.94f else 1.0f, label = "buttonScale")

    val (bgColor, defaultTextColor) = when (keyType) {
        KeyType.NUMBER -> MaterialTheme.colorScheme.surface to MaterialTheme.colorScheme.onSurface
        KeyType.OPERATOR -> MaterialTheme.colorScheme.surfaceVariant to EmeraldPrimary
        KeyType.ACTION -> MaterialTheme.colorScheme.surfaceVariant to MaterialTheme.colorScheme.onSurfaceVariant
        KeyType.EQUALS -> EmeraldPrimary to Color.White
    }

    Box(
        modifier = modifier
            .scale(scale)
            .height(64.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(bgColor)
            .clickable(interactionSource = interactionSource, indication = null, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            fontSize = if (text.length > 2) 20.sp else 24.sp,
            fontWeight = if (keyType == KeyType.EQUALS || keyType == KeyType.OPERATOR) FontWeight.Bold else FontWeight.Medium,
            color = textColor ?: defaultTextColor
        )
    }
}

@Composable
private fun CalculatorIconButton(
    icon: @Composable () -> Unit,
    keyType: KeyType,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(targetValue = if (isPressed) 0.94f else 1.0f, label = "buttonScale")

    val bgColor = MaterialTheme.colorScheme.surfaceVariant

    Box(
        modifier = modifier
            .scale(scale)
            .height(64.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(bgColor)
            .clickable(interactionSource = interactionSource, indication = null, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        icon()
    }
}
