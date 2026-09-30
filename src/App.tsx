import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  History,
  Settings,
  ArrowRightLeft,
  Copy,
  Share2,
  ChevronDown,
} from 'lucide-react';
import {
  CurrencyType,
  AppLanguage,
  AppTheme,
  CalculationHistoryItem,
  ExchangeRateInfo,
  CURRENCIES,
} from './types';
import { t } from './localization/translations';
import {
  formatCurrency,
  formatDisplayExpression,
  getCompactDescription,
} from './utils/formatters';
import { evaluateExpression } from './utils/calculator';
import {
  fetchLiveExchangeRates,
  DEFAULT_RATES_VS_USD,
  calculatePairRate,
} from './services/exchangeRate';
import { Keypad } from './components/Keypad';
import { ExchangeRateModal } from './components/ExchangeRateModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { CurrencyPickerModal } from './components/CurrencyPickerModal';

export default function App() {
  // Calculator Numerical State
  const [expression, setExpression] = useState<string>('');
  const [evaluatedValue, setEvaluatedValue] = useState<number>(0);
  const [evaluatedDisplay, setEvaluatedDisplay] = useState<string>('0');
  const [currencyMode, setCurrencyMode] = useState<boolean>(true);

  // Active Currencies (Configurable from Settings & Quick Pickers)
  // Supports USD, EUR, GBP, INR, JPY, CNY, PKR, AUD, RUB, IRR
  const [baseCurrency, setBaseCurrency] = useState<CurrencyType>('USD');
  const [targetCurrency, setTargetCurrency] = useState<CurrencyType>('EUR');

  // Rates State
  const [ratesVsUSD, setRatesVsUSD] = useState<Record<CurrencyType, number>>(DEFAULT_RATES_VS_USD);
  const [customPairRates, setCustomPairRates] = useState<Record<string, number>>({});
  const [isLiveRate, setIsLiveRate] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Default Estimated');
  const [rateSource, setRateSource] = useState<string>('Default');
  const [isRefreshingRate, setIsRefreshingRate] = useState<boolean>(false);

  // Settings & Preferences
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [theme, setTheme] = useState<AppTheme>('system');
  const [decimals, setDecimals] = useState<number>(2);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);

  // History & Toast
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showRateModal, setShowRateModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [pickingCurrencySlot, setPickingCurrencySlot] = useState<'base' | 'target' | null>(null);

  // Show toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Compute Current Pair Exchange Rate
  const pairKey = `${baseCurrency}-${targetCurrency}`;
  const isCustomForCurrentPair = customPairRates[pairKey] !== undefined;

  const currentPairRate = useMemo(() => {
    if (customPairRates[pairKey] !== undefined) {
      return customPairRates[pairKey];
    }
    return calculatePairRate(baseCurrency, targetCurrency, ratesVsUSD);
  }, [baseCurrency, targetCurrency, ratesVsUSD, customPairRates, pairKey]);

  // Fetch Live Rates
  const refreshRates = useCallback(async () => {
    setIsRefreshingRate(true);
    try {
      const result = await fetchLiveExchangeRates(ratesVsUSD);
      setRatesVsUSD(result.ratesVsUSD);
      setIsLiveRate(result.isLive);
      setLastUpdated(result.lastUpdated);
      setRateSource(result.source);
      if (result.isLive) {
        showToast(t('rateUpdatedSuccess', language));
      } else {
        showToast(t('rateUpdateFailed', language));
      }
    } finally {
      setIsRefreshingRate(false);
    }
  }, [ratesVsUSD, language, showToast]);

  useEffect(() => {
    refreshRates();
  }, []);

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Live evaluation of expression
  const updateEvaluation = useCallback((expr: string) => {
    if (!expr) {
      setEvaluatedValue(0);
      setEvaluatedDisplay('0');
      return;
    }

    // Strip trailing operator for live preview
    const clean = /[+\-*/%]$/.test(expr) ? expr.slice(0, -1) : expr;
    if (!clean) {
      setEvaluatedValue(0);
      setEvaluatedDisplay('0');
      return;
    }

    const res = evaluateExpression(clean);
    if (res.success) {
      setEvaluatedValue(res.value);
      setEvaluatedDisplay(res.display);
    }
  }, []);

  // Calculator Keypad Actions
  const handleDigit = useCallback(
    (digit: string) => {
      setExpression((prev) => {
        let next: string;
        if (prev === '0' && digit !== '00') {
          next = digit;
        } else if (!prev && digit === '00') {
          next = '0';
        } else {
          next = prev + digit;
        }
        updateEvaluation(next);
        return next;
      });
    },
    [updateEvaluation]
  );

  const handleDecimal = useCallback(() => {
    setExpression((prev) => {
      if (!prev) {
        const next = '0.';
        updateEvaluation(next);
        return next;
      }
      const lastNum = prev.split(/[+\-*/]/).pop() || '';
      if (!lastNum.includes('.')) {
        const next = /[+\-*/]$/.test(prev) ? `${prev}0.` : `${prev}.`;
        updateEvaluation(next);
        return next;
      }
      return prev;
    });
  }, [updateEvaluation]);

  const handleOperator = useCallback((opChar: string) => {
    setExpression((prev) => {
      if (!prev) {
        return opChar === '-' ? '-' : `0${opChar}`;
      }
      if (/[+\-*/]$/.test(prev)) {
        return prev.slice(0, -1) + opChar;
      }
      return prev + opChar;
    });
  }, []);

  const handlePercentage = useCallback(() => {
    setExpression((prev) => {
      if (prev && !/[+\-*/%]$/.test(prev)) {
        const next = `${prev}%`;
        updateEvaluation(next);
        return next;
      }
      return prev;
    });
  }, [updateEvaluation]);

  const handleClear = useCallback(() => {
    setExpression('');
    setEvaluatedValue(0);
    setEvaluatedDisplay('0');
  }, []);

  const handleBackspace = useCallback(() => {
    setExpression((prev) => {
      if (!prev) return '';
      const next = prev.slice(0, -1);
      updateEvaluation(next);
      return next;
    });
  }, [updateEvaluation]);

  const handleEquals = useCallback(() => {
    if (!expression) return;

    const res = evaluateExpression(expression);
    if (res.success) {
      const finalVal = res.value;
      const finalDisplay = res.display;

      const convVal = finalVal * currentPairRate;
      const convertedStr = currencyMode
        ? formatCurrency(convVal, targetCurrency, decimals, true)
        : '';

      const newItem: CalculationHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        expression,
        result: finalDisplay,
        timestamp: Date.now(),
        isCurrencyMode: currencyMode,
        baseCurrency,
        targetCurrency,
        convertedResult: convertedStr,
        exchangeRateUsed: currentPairRate,
      };

      setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
      setExpression(finalDisplay);
      setEvaluatedValue(finalVal);
      setEvaluatedDisplay(finalDisplay);
    } else {
      showToast(res.error || t('invalidExpr', language));
    }
  }, [
    expression,
    currentPairRate,
    currencyMode,
    baseCurrency,
    targetCurrency,
    decimals,
    language,
    showToast,
  ]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('*');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('/');
      } else if (e.key === '%') {
        handlePercentage();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDecimal, handleOperator, handlePercentage, handleEquals, handleBackspace, handleClear]);

  // Currency Calculations
  const convertedValue = useMemo(() => {
    return evaluatedValue * currentPairRate;
  }, [evaluatedValue, currentPairRate]);

  const baseDisplayFormatted = useMemo(() => {
    return formatCurrency(evaluatedValue, baseCurrency, decimals, currencyMode);
  }, [evaluatedValue, baseCurrency, decimals, currencyMode]);

  const convertedDisplayFormatted = useMemo(() => {
    return formatCurrency(convertedValue, targetCurrency, decimals, true);
  }, [convertedValue, targetCurrency, decimals]);

  // Quick Swap
  const handleSwapCurrencies = () => {
    setBaseCurrency(targetCurrency);
    setTargetCurrency(baseCurrency);
  };

  // Copy result
  const handleCopyResult = () => {
    const text = currencyMode
      ? `${baseDisplayFormatted} = ${convertedDisplayFormatted}`
      : evaluatedDisplay;
    navigator.clipboard.writeText(text);
    showToast(t('copied', language));
  };

  // Share result
  const handleShareResult = async () => {
    const rateFormatted =
      currentPairRate > 100 ? currentPairRate.toFixed(2) : currentPairRate.toFixed(4);
    const text = currencyMode
      ? `${baseDisplayFormatted} = ${convertedDisplayFormatted} (Rate: 1 ${baseCurrency} = ${rateFormatted} ${targetCurrency})`
      : `${expression || evaluatedDisplay} = ${evaluatedDisplay}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('appName', language),
          text,
        });
      } catch {
        // Cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
      showToast(t('copied', language));
    }
  };

  const baseMeta = CURRENCIES[baseCurrency];
  const targetMeta = CURRENCIES[targetCurrency];

  const rateInfoObj: ExchangeRateInfo = {
    rate: currentPairRate,
    ratesVsUSD,
    isLive: isLiveRate && !isCustomForCurrentPair,
    isCustom: isCustomForCurrentPair,
    lastUpdated: isCustomForCurrentPair ? 'Custom Manual' : lastUpdated,
    source: isCustomForCurrentPair ? 'User Custom Rate' : rateSource,
  };

  // Dynamic font sizing for long numbers
  const displayLength = baseDisplayFormatted.length;
  const displayFontSize =
    displayLength > 15 ? 'text-3xl' : displayLength > 11 ? 'text-4xl' : 'text-5xl';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between sm:items-center sm:py-6 selection:bg-cyan-500 selection:text-white">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md h-full sm:h-[94vh] flex flex-col justify-between bg-slate-950 sm:rounded-3xl sm:border sm:border-slate-800 shadow-2xl overflow-hidden relative">
        {/* Top App Bar with Currenzo Branding */}
        <header className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <img
              src="/currenzo-logo.png"
              alt="Currenzo"
              className="w-8 h-8 rounded-xl object-contain shadow-md shadow-cyan-500/20"
            />
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 leading-none">
                <span>Currenzo</span>
              </h1>
              <span className="text-[9px] font-bold tracking-wider text-cyan-400 uppercase leading-none block mt-0.5">
                {t('appSubtitle', language)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Mode Quick Toggle */}
            <button
              onClick={() => setCurrencyMode((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                currencyMode
                  ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border-cyan-500/50 text-cyan-400 shadow-xs'
                  : 'bg-slate-800/70 border-slate-700/60 text-slate-400'
              }`}
              title={currencyMode ? t('currencyModeOn', language) : t('currencyModeOff', language)}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currencyMode ? 'bg-cyan-400 shadow-xs shadow-cyan-400' : 'bg-slate-500'
                }`}
              />
              <span className="text-[11px] whitespace-nowrap">
                {t('currencyMode', language)}
              </span>
            </button>

            {/* History Button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
              aria-label="History"
            >
              <History className="w-5 h-5" />
              {history.length > 0 && (
                <span className="absolute 1.5 top-1.5 -right-0.5 w-4 h-4 rounded-full bg-cyan-500 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Display Section */}
        <div className="px-4 py-2 flex-1 flex flex-col justify-between overflow-y-auto">
          {/* Rate Strip */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRateModal(true)}
              className="flex-1 py-2 px-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 active:scale-[0.99] transition-all flex items-center justify-between text-xs group"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    rateInfoObj.isLive ? 'bg-cyan-400' : 'bg-amber-400'
                  }`}
                />
                <span className="font-semibold text-slate-200 truncate">
                  1 {baseCurrency} ={' '}
                  {currentPairRate > 100
                    ? currentPairRate.toFixed(2)
                    : currentPairRate.toFixed(3)}{' '}
                  {targetCurrency}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                    rateInfoObj.isLive
                      ? 'bg-cyan-500/15 text-cyan-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  {rateInfoObj.isLive ? 'Live' : 'Est'}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
                Rates →
              </span>
            </button>
          </div>

          {/* Currency Pill Ribbon: Quick Choose Currencies */}
          <div className="flex items-center justify-between px-1 my-1 text-xs">
            {/* Base Currency Pill */}
            <button
              type="button"
              onClick={() => setPickingCurrencySlot('base')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 font-bold active:scale-95 transition-all shadow-xs"
            >
              <span className="text-base leading-none">{baseMeta.flag}</span>
              <span>{baseCurrency}</span>
              <span className="text-slate-500 text-[10px] font-mono">({baseMeta.symbol})</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {/* Swap Icon */}
            <button
              type="button"
              onClick={handleSwapCurrencies}
              className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-cyan-400 active:rotate-180 transition-transform shadow-xs"
              title={t('swapCurrencies', language)}
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            {/* Target Currency Pill */}
            <button
              type="button"
              onClick={() => setPickingCurrencySlot('target')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 font-bold active:scale-95 transition-all shadow-xs"
            >
              <span className="text-base leading-none">{targetMeta.flag}</span>
              <span>{targetCurrency}</span>
              <span className="text-slate-500 text-[10px] font-mono">({targetMeta.symbol})</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>

          {/* Main Calculation Display Card */}
          <div className="my-1.5 p-4 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800 shadow-inner flex flex-col justify-end min-h-[140px] text-right">
            {/* Expression */}
            <div className="text-slate-400 text-sm font-mono overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
              {formatDisplayExpression(expression) || ' '}
            </div>

            {/* Main Result */}
            <div
              className={`font-black text-white tracking-tight ${displayFontSize} transition-all font-mono py-1`}
            >
              {baseDisplayFormatted}
            </div>

            {/* Converted Equivalent (when Currency Mode ON) */}
            {currencyMode && (
              <div className="mt-1 pt-2 border-t border-slate-800/80 flex flex-col items-end animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="text-sm font-bold opacity-75">⇄</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {convertedDisplayFormatted}{' '}
                    <span className="text-xs font-semibold text-purple-300">
                      {targetCurrency}
                    </span>
                  </span>
                </div>

                {/* Spoken verbal annotation */}
                {(() => {
                  const baseSpoken = getCompactDescription(evaluatedValue, baseCurrency);
                  const convSpoken = getCompactDescription(convertedValue, targetCurrency);
                  const parts = [baseSpoken, convSpoken].filter(Boolean);
                  if (parts.length === 0) return null;
                  return (
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {parts.join('  ·  ')}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Quick Action Ribbon */}
          <div className="grid grid-cols-3 gap-2">
            {/* Swap Button */}
            <button
              onClick={handleSwapCurrencies}
              className="py-2 px-3 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700/60 shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {baseCurrency} ⇄ {targetCurrency}
              </span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopyResult}
              className="py-2 px-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 active:scale-95 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{t('copy', language)}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShareResult}
              className="py-2 px-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 active:scale-95 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t('share', language)}</span>
            </button>
          </div>
        </div>

        {/* Keypad in ergonomic Thumb Zone */}
        <div className="bg-slate-950 border-t border-slate-800/70 pt-1 pb-1">
          <Keypad
            onDigit={handleDigit}
            onOperator={handleOperator}
            onDecimal={handleDecimal}
            onPercentage={handlePercentage}
            onClear={handleClear}
            onBackspace={handleBackspace}
            onEquals={handleEquals}
            hapticEnabled={hapticEnabled}
          />

          {/* Discreet Footer Attribution as shown in the brand logo */}
          <div className="px-4 py-1.5 flex items-center justify-center gap-2 text-[10px] text-slate-500 border-t border-slate-900">
            <span>Invented by <strong className="text-slate-300 font-semibold">Ansh</strong></span>
            <span>•</span>
            <span className="text-cyan-400/90 font-medium">All Currency Converter</span>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-2xl shadow-lg text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200">
            {toastMessage}
          </div>
        )}

        {/* Modals */}
        <ExchangeRateModal
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
          rateInfo={rateInfoObj}
          pairRate={currentPairRate}
          baseCurrency={baseCurrency}
          targetCurrency={targetCurrency}
          onRefresh={refreshRates}
          onApplyCustomRate={(rate) => {
            setCustomPairRates((prev) => ({
              ...prev,
              [pairKey]: rate,
            }));
            showToast(t('customRateApplied', language));
            setShowRateModal(false);
          }}
          onResetToLive={() => {
            setCustomPairRates((prev) => {
              const next = { ...prev };
              delete next[pairKey];
              return next;
            });
            refreshRates();
            setShowRateModal(false);
          }}
          isRefreshing={isRefreshingRate}
          language={language}
        />

        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          history={history}
          onClearHistory={() => {
            setHistory([]);
            showToast(t('historyCleared', language));
          }}
          onDeleteHistoryItem={(id) => {
            setHistory((prev) => prev.filter((item) => item.id !== id));
          }}
          onRestoreItem={(item) => {
            setExpression(item.result);
            setEvaluatedValue(parseFloat(item.result) || 0);
            setEvaluatedDisplay(item.result);
            setCurrencyMode(item.isCurrencyMode);
            setBaseCurrency(item.baseCurrency);
            setTargetCurrency(item.targetCurrency || 'USD');
          }}
          onShowToast={showToast}
          language={language}
        />

        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          language={language}
          onSelectLanguage={setLanguage}
          theme={theme}
          onSelectTheme={setTheme}
          decimals={decimals}
          onSelectDecimals={setDecimals}
          hapticEnabled={hapticEnabled}
          onToggleHaptic={setHapticEnabled}
          baseCurrency={baseCurrency}
          targetCurrency={targetCurrency}
          onSelectCurrencies={(base, target) => {
            setBaseCurrency(base);
            setTargetCurrency(target);
          }}
        />

        {/* Quick Currency Picker Bottom Sheet */}
        <CurrencyPickerModal
          isOpen={pickingCurrencySlot !== null}
          onClose={() => setPickingCurrencySlot(null)}
          title={
            pickingCurrencySlot === 'base'
              ? t('baseCurrency', language)
              : t('targetCurrency', language)
          }
          selectedCurrency={pickingCurrencySlot === 'base' ? baseCurrency : targetCurrency}
          onSelect={(code) => {
            if (pickingCurrencySlot === 'base') {
              if (code === targetCurrency) {
                setTargetCurrency(baseCurrency);
              }
              setBaseCurrency(code);
            } else if (pickingCurrencySlot === 'target') {
              if (code === baseCurrency) {
                setBaseCurrency(targetCurrency);
              }
              setTargetCurrency(code);
            }
          }}
          language={language}
        />
      </div>
    </div>
  );
}
