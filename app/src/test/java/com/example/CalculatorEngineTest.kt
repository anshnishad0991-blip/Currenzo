package com.example

import com.example.model.CurrencyType
import com.example.util.CalculatorEngine
import com.example.util.NumberFormatter
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.math.BigDecimal

class CalculatorEngineTest {

    @Test
    fun testBasicArithmetic() {
        val addRes = CalculatorEngine.evaluate("100+250") as CalculatorEngine.EvalResult.Success
        assertEquals(350.0, addRes.value, 0.001)

        val subRes = CalculatorEngine.evaluate("500-125") as CalculatorEngine.EvalResult.Success
        assertEquals(375.0, subRes.value, 0.001)

        val mulRes = CalculatorEngine.evaluate("25*4") as CalculatorEngine.EvalResult.Success
        assertEquals(100.0, mulRes.value, 0.001)

        val divRes = CalculatorEngine.evaluate("100/4") as CalculatorEngine.EvalResult.Success
        assertEquals(25.0, divRes.value, 0.001)
    }

    @Test
    fun testOperatorPrecedence() {
        val result = CalculatorEngine.evaluate("10+5*2") as CalculatorEngine.EvalResult.Success
        assertEquals(20.0, result.value, 0.001)

        val result2 = CalculatorEngine.evaluate("50-20/2") as CalculatorEngine.EvalResult.Success
        assertEquals(40.0, result2.value, 0.001)
    }

    @Test
    fun testPercentageCalculations() {
        // 200 + 10% = 220
        val percentAdd = CalculatorEngine.evaluate("200+10%") as CalculatorEngine.EvalResult.Success
        assertEquals(220.0, percentAdd.value, 0.001)

        // 500 - 20% = 400
        val percentSub = CalculatorEngine.evaluate("500-20%") as CalculatorEngine.EvalResult.Success
        assertEquals(400.0, percentSub.value, 0.001)

        // 50% = 0.5
        val percentStandalone = CalculatorEngine.evaluate("50%") as CalculatorEngine.EvalResult.Success
        assertEquals(0.5, percentStandalone.value, 0.001)
    }

    @Test
    fun testIndianNumberFormatting() {
        val formattedLakh = NumberFormatter.formatIndianNumber(BigDecimal("100000"), 2)
        assertEquals("1,00,000.00", formattedLakh)

        val formattedCrore = NumberFormatter.formatIndianNumber(BigDecimal("12345678.50"), 2)
        assertEquals("1,23,45,678.50", formattedCrore)
    }

    @Test
    fun testStandardUSDFormatting() {
        val formattedUSD = NumberFormatter.formatStandardNumber(BigDecimal("1000000.00"), 2)
        assertEquals("1,000,000.00", formattedUSD)
    }

    @Test
    fun testDivideByZeroHandling() {
        val res = CalculatorEngine.evaluate("100/0")
        assertTrue(res is CalculatorEngine.EvalResult.Error)
    }
}
