package com.example.util

import java.math.BigDecimal
import java.math.MathContext
import java.math.RoundingMode
import java.util.Stack

object CalculatorEngine {

    sealed class EvalResult {
        data class Success(val value: Double, val formattedDisplay: String) : EvalResult()
        data class Error(val message: String) : EvalResult()
    }

    /**
     * Evaluates a mathematical expression string.
     * Supports operators +, -, *, /, % and decimal numbers.
     */
    fun evaluate(expression: String): EvalResult {
        val cleanExpr = expression.trim()
        if (cleanExpr.isEmpty()) {
            return EvalResult.Success(0.0, "0")
        }

        try {
            val tokens = tokenize(cleanExpr)
            if (tokens.isEmpty()) return EvalResult.Success(0.0, "0")

            val value = evaluateTokens(tokens)
            if (value.isNaN() || value.isInfinite()) {
                return EvalResult.Error("Cannot divide by zero")
            }

            // Format for display
            val bd = BigDecimal.valueOf(value).setScale(8, RoundingMode.HALF_UP).stripTrailingZeros()
            val display = bd.toPlainString()

            return EvalResult.Success(value, display)
        } catch (e: ArithmeticException) {
            return EvalResult.Error(e.message ?: "Math error")
        } catch (e: Exception) {
            return EvalResult.Error("Invalid expression")
        }
    }

    private sealed class Token {
        data class Number(val value: Double) : Token()
        data class Operator(val op: Char) : Token()
        object Percent : Token()
    }

    private fun tokenize(expr: String): List<Token> {
        val tokens = mutableListOf<Token>()
        var i = 0
        val n = expr.length

        while (i < n) {
            val ch = expr[i]

            if (ch.isWhitespace()) {
                i++
                continue
            }

            if (ch.isDigit() || ch == '.') {
                val sb = StringBuilder()
                while (i < n && (expr[i].isDigit() || expr[i] == '.')) {
                    sb.append(expr[i])
                    i++
                }
                val num = sb.toString().toDoubleOrNull() ?: 0.0
                tokens.add(Token.Number(num))
                continue
            }

            if (ch == '%') {
                tokens.add(Token.Percent)
                i++
                continue
            }

            if (ch in "+-*/") {
                // Check if this '-' is a unary minus at start or after an operator
                if (ch == '-' && (tokens.isEmpty() || tokens.last() is Token.Operator)) {
                    // Unary minus for following number
                    i++
                    val sb = StringBuilder("-")
                    while (i < n && (expr[i].isDigit() || expr[i] == '.')) {
                        sb.append(expr[i])
                        i++
                    }
                    val num = sb.toString().toDoubleOrNull() ?: 0.0
                    tokens.add(Token.Number(num))
                    continue
                }
                tokens.add(Token.Operator(ch))
                i++
                continue
            }

            // Skip unknown
            i++
        }

        return tokens
    }

    private fun evaluateTokens(tokens: List<Token>): Double {
        // Step 1: Resolve percentage tokens
        // e.g. A + B% => A + (A * B / 100)
        // e.g. A - B% => A - (A * B / 100)
        // e.g. A * B% => A * (B / 100)
        // e.g. A / B% => A / (B / 100)
        // e.g. B% standalone => B / 100
        val step1Tokens = mutableListOf<Token>()
        var idx = 0
        while (idx < tokens.size) {
            val current = tokens[idx]
            if (current is Token.Percent) {
                if (step1Tokens.isNotEmpty() && step1Tokens.last() is Token.Number) {
                    val prevNumToken = step1Tokens.removeAt(step1Tokens.size - 1) as Token.Number
                    val bVal = prevNumToken.value

                    if (step1Tokens.isNotEmpty() && step1Tokens.last() is Token.Operator) {
                        val opToken = step1Tokens.last() as Token.Operator
                        if (step1Tokens.size >= 2 && step1Tokens[step1Tokens.size - 2] is Token.Number) {
                            val aVal = (step1Tokens[step1Tokens.size - 2] as Token.Number).value
                            val resolvedPercent = when (opToken.op) {
                                '+', '-' -> (aVal * bVal) / 100.0
                                '*', '/' -> bVal / 100.0
                                else -> bVal / 100.0
                            }
                            step1Tokens.add(Token.Number(resolvedPercent))
                        } else {
                            step1Tokens.add(Token.Number(bVal / 100.0))
                        }
                    } else {
                        step1Tokens.add(Token.Number(bVal / 100.0))
                    }
                }
            } else {
                step1Tokens.add(current)
            }
            idx++
        }

        if (step1Tokens.isEmpty()) return 0.0

        // Step 2: Handle * and / (higher precedence)
        val step2Tokens = mutableListOf<Token>()
        var j = 0
        while (j < step1Tokens.size) {
            val token = step1Tokens[j]
            if (token is Token.Operator && (token.op == '*' || token.op == '/')) {
                val left = (step2Tokens.removeAt(step2Tokens.size - 1) as? Token.Number)?.value ?: 0.0
                j++
                val right = if (j < step1Tokens.size) {
                    (step1Tokens[j] as? Token.Number)?.value ?: 0.0
                } else {
                    0.0
                }

                val res = if (token.op == '*') {
                    left * right
                } else {
                    if (right == 0.0) throw ArithmeticException("Cannot divide by zero")
                    left / right
                }
                step2Tokens.add(Token.Number(res))
            } else {
                step2Tokens.add(token)
            }
            j++
        }

        // Step 3: Handle + and -
        if (step2Tokens.isEmpty()) return 0.0
        var result = (step2Tokens[0] as? Token.Number)?.value ?: 0.0
        var k = 1
        while (k < step2Tokens.size) {
            val opToken = step2Tokens[k] as? Token.Operator
            val nextNum = (step2Tokens.getOrNull(k + 1) as? Token.Number)?.value ?: 0.0
            if (opToken != null) {
                when (opToken.op) {
                    '+' -> result += nextNum
                    '-' -> result -= nextNum
                }
            }
            k += 2
        }

        return result
    }
}
