import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Check, ArrowRight } from 'lucide-react';
import { AppLanguage, CurrencyType, ExchangeRateInfo, CURRENCIES } from '../types';
import { t } from '../localization/translations';
import { formatCurrency } from '../utils/formatters';

interface ExchangeRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  rateInfo: ExchangeRateInfo;
  pairRate: number;
  baseCurrency: CurrencyType;
  targetCurrency: CurrencyType;
  onRefresh: () => void;
  onApplyCustomRate: (rate: number) => void;
  onResetToLive: () => void;
  isRefreshing: boolean;
  language: AppLanguage;
}

export const ExchangeRateModal: React.FC<ExchangeRateModalProps> = ({
  isOpen,
  onClose,
  rateInfo,
  pairRate,
  baseCurrency,
  targetCurrency,
  onRefresh,
  onApplyCustomRate,
  onResetToLive,
  isRefreshing,
  language,
}) => {
  const [customInput, setCustomInput] = useState(pairRate.toFixed(4));
  const [activeTab, setActiveTab] = useState<'forward' | 'reverse'>('forward');

  useEffect(() => {
    setCustomInput(pairRate > 100 ? pairRate.toFixed(2) : pairRate.toFixed(4));
  }, [pairRate, baseCurrency, targetCurrency]);

  if (!isOpen) return null;

  const baseMeta = CURRENCIES[baseCurrency];
  const targetMeta = CURRENCIES[targetCurrency];

  // Base samples: adapt if currency typically has high unit values (like IRR)
  const isHighValueBase = baseCurrency === 'IRR';
  const baseSamples = isHighValueBase
    ? [10000, 50000, 100000, 500000, 1000000, 5000000]
    : [10, 50, 100, 500, 1000, 5000, 10000, 100000];

  const isHighValueTarget = targetCurrency === 'IRR';
  const targetSamples = isHighValueTarget
    ? [10000, 50000, 100000, 500000, 1000000, 5000000]
    : [10, 50, 100, 500, 1000, 5000, 10000, 100000];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customInput);
    if (!isNaN(val) && val > 0) {
      onApplyCustomRate(val);
    }
  };

  const inverseRate = pairRate > 0 ? (1 / pairRate) : 0;
  const inverseStr = inverseRate > 100 ? inverseRate.toFixed(2) : inverseRate.toFixed(6);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">{baseMeta.flag}</span>
            <span className="text-xl">{targetMeta.flag}</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {baseCurrency} ⇄ {targetCurrency}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Main Rate Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    rateInfo.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span
                  className={`text-xs font-semibold ${
                    rateInfo.isLive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {rateInfo.isLive
                    ? t('liveRate', language)
                    : rateInfo.isCustom
                    ? t('manualRate', language)
                    : t('estimatedRate', language)}
                </span>
              </div>

              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? t('updating', language) : t('refreshRate', language)}</span>
              </button>
            </div>

            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              1 {baseCurrency} = {pairRate > 100 ? pairRate.toFixed(2) : pairRate.toFixed(4)} {targetCurrency}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              1 {targetCurrency} = {inverseStr} {baseCurrency}
            </div>

            <div className="text-xs text-slate-400 dark:text-slate-500 mt-2.5 flex items-center gap-1 flex-wrap">
              <span>{t('updatedAt', language)}:</span>
              <span className="font-medium">{rateInfo.lastUpdated}</span>
              <span className="mx-1">·</span>
              <span>{rateInfo.source}</span>
            </div>
          </div>

          {/* Custom Rate Form */}
          <form onSubmit={handleApply} className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('customRateLabel', language)}: 1 {baseCurrency} = ? {targetCurrency}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  {targetMeta.symbol}
                </span>
                <input
                  type="number"
                  step="any"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Rate"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>{t('save', language)}</span>
              </button>
            </div>

            {rateInfo.isCustom && (
              <button
                type="button"
                onClick={onResetToLive}
                className="w-full py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t('resetToLive', language)}
              </button>
            )}
          </form>

          {/* Quick Conversion Chart */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2.5">
              {t('quickTable', language)}
            </h3>

            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('forward')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'forward'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {baseMeta.flag} {baseCurrency} → {targetMeta.flag} {targetCurrency}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reverse')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'reverse'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {targetMeta.flag} {targetCurrency} → {baseMeta.flag} {baseCurrency}
              </button>
            </div>

            {/* Conversion List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeTab === 'forward'
                ? baseSamples.map((amt) => {
                    const conv = amt * pairRate;
                    return (
                      <div
                        key={amt}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs border-b border-slate-100 dark:border-slate-800/50"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(amt, baseCurrency, 0)}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(conv, targetCurrency, 2)}
                        </span>
                      </div>
                    );
                  })
                : targetSamples.map((amt) => {
                    const conv = inverseRate > 0 ? amt * inverseRate : 0;
                    return (
                      <div
                        key={amt}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs border-b border-slate-100 dark:border-slate-800/50"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(amt, targetCurrency, 0)}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(conv, baseCurrency, 2)}
                        </span>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
