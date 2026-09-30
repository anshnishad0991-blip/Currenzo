import React from 'react';
import {
  X,
  Globe,
  Moon,
  Sun,
  Monitor,
  Sliders,
  Coins,
  ArrowRightLeft,
  Check,
} from 'lucide-react';
import { AppLanguage, AppTheme, CurrencyType, CURRENCIES } from '../types';
import { t } from '../localization/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  theme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  decimals: number;
  onSelectDecimals: (d: number) => void;
  hapticEnabled: boolean;
  onToggleHaptic: (enabled: boolean) => void;
  baseCurrency: CurrencyType;
  targetCurrency: CurrencyType;
  onSelectCurrencies: (base: CurrencyType, target: CurrencyType) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  theme,
  onSelectTheme,
  decimals,
  onSelectDecimals,
  hapticEnabled,
  onToggleHaptic,
  baseCurrency,
  targetCurrency,
  onSelectCurrencies,
}) => {
  if (!isOpen) return null;

  const languages: { id: AppLanguage; label: string; sub: string }[] = [
    { id: 'en', label: 'English', sub: 'Default' },
    { id: 'hi', label: 'हिन्दी', sub: 'Hindi' },
    { id: 'hinglish', label: 'Hinglish', sub: 'Hindi + English' },
  ];

  const themes: { id: AppTheme; labelKey: 'themeSystem' | 'themeLight' | 'themeDark'; icon: any }[] = [
    { id: 'system', labelKey: 'themeSystem', icon: Monitor },
    { id: 'light', labelKey: 'themeLight', icon: Sun },
    { id: 'dark', labelKey: 'themeDark', icon: Moon },
  ];

  const allCurrencies: CurrencyType[] = [
    'USD',
    'EUR',
    'GBP',
    'INR',
    'JPY',
    'CNY',
    'PKR',
    'AUD',
    'RUB',
    'IRR',
  ];

  const popularPairs: [CurrencyType, CurrencyType][] = [
    ['EUR', 'USD'],
    ['GBP', 'USD'],
    ['INR', 'USD'],
    ['INR', 'EUR'],
    ['JPY', 'USD'],
    ['CNY', 'USD'],
    ['INR', 'PKR'],
    ['AUD', 'USD'],
    ['INR', 'AUD'],
    ['RUB', 'INR'],
    ['IRR', 'USD'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header with Currenzo Branding */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <img
              src="/currenzo-logo.png"
              alt="Currenzo"
              className="w-7 h-7 rounded-lg object-contain shadow-xs"
            />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('settingsTitle', language)}
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
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Currency Selection Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-500 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4" />
                <span>{t('currencySelection', language)}</span>
              </label>

              {/* Quick Swap inside Settings */}
              <button
                type="button"
                onClick={() => onSelectCurrencies(targetCurrency, baseCurrency)}
                className="text-xs font-semibold text-slate-500 hover:text-cyan-500 flex items-center gap-1 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Swap</span>
              </button>
            </div>

            {/* Base Currency (Input) */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t('baseCurrency', language)}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {allCurrencies.map((code) => {
                  const meta = CURRENCIES[code];
                  const selected = baseCurrency === code;
                  return (
                    <button
                      key={`base-${code}`}
                      type="button"
                      onClick={() =>
                        onSelectCurrencies(
                          code,
                          targetCurrency === code ? baseCurrency : targetCurrency
                        )
                      }
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        selected
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{meta.flag}</span>
                        <span className="font-extrabold text-sm">{meta.symbol}</span>
                      </div>
                      <div className="font-bold text-xs mt-1 leading-tight">{code}</div>
                      <div
                        className={`text-[10px] truncate leading-tight ${
                          selected ? 'text-cyan-100' : 'text-slate-400'
                        }`}
                      >
                        {meta.name[language]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Currency (Output) */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t('targetCurrency', language)}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {allCurrencies.map((code) => {
                  const meta = CURRENCIES[code];
                  const selected = targetCurrency === code;
                  return (
                    <button
                      key={`target-${code}`}
                      type="button"
                      onClick={() =>
                        onSelectCurrencies(
                          baseCurrency === code ? targetCurrency : baseCurrency,
                          code
                        )
                      }
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        selected
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{meta.flag}</span>
                        <span className="font-extrabold text-sm">{meta.symbol}</span>
                      </div>
                      <div className="font-bold text-xs mt-1 leading-tight">{code}</div>
                      <div
                        className={`text-[10px] truncate leading-tight ${
                          selected ? 'text-purple-100' : 'text-slate-400'
                        }`}
                      >
                        {meta.name[language]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popular Presets */}
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                {t('popularPairs', language)}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularPairs.map(([b, tPair]) => {
                  const isCurrent = baseCurrency === b && targetCurrency === tPair;
                  return (
                    <button
                      key={`${b}-${tPair}`}
                      type="button"
                      onClick={() => onSelectCurrencies(b, tPair)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span>
                        {CURRENCIES[b].flag} {b} ⇄ {CURRENCIES[tPair].flag} {tPair}
                      </span>
                      {isCurrent && <Check className="w-3 h-3 text-cyan-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200/80 dark:bg-slate-800" />

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>{t('language', language)}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((l) => {
                const selected = language === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => onSelectLanguage(l.id)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selected
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-sm leading-tight">{l.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 leading-tight ${
                        selected ? 'text-cyan-100' : 'text-slate-400'
                      }`}
                    >
                      {l.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>{t('theme', language)}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((th) => {
                const selected = theme === th.id;
                const Icon = th.icon;
                return (
                  <button
                    key={th.id}
                    onClick={() => onSelectTheme(th.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                      selected
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{t(th.labelKey, language)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Decimal Precision */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('decimals', language)}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((d) => {
                const selected = decimals === d;
                return (
                  <button
                    key={d}
                    onClick={() => onSelectDecimals(d)}
                    className={`py-2.5 rounded-xl border text-center font-bold text-sm transition-all ${
                      selected
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {d} Decimals
                  </button>
                );
              })}
            </div>
          </div>

          {/* Haptic Vibration */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {t('vibration', language)}
              </div>
              <div className="text-xs text-slate-400">
                Tactile touch feedback on button tap
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hapticEnabled}
                onChange={(e) => onToggleHaptic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>

          {/* App Branding Card with Creator Attribution */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900 border border-cyan-800/30 flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3">
              <img
                src="/currenzo-logo.png"
                alt="Currenzo Logo"
                className="w-12 h-12 rounded-xl object-contain shadow-md shrink-0"
              />
              <div className="space-y-0.5">
                <div className="font-extrabold text-sm text-white tracking-wide flex items-center gap-1">
                  <span>Currenzo</span>
                  <span className="text-purple-400 text-xs">♥</span>
                </div>
                <div className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
                  GLOBAL CURRENCY CONVERTER
                </div>
                <div className="text-[10px] text-slate-400">
                  Real-time conversion across 10 major global currencies
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 border-l border-slate-700/60 pl-3">
              <div className="text-[10px] text-slate-400">Invented by</div>
              <div className="text-xs font-bold text-white tracking-wide">Ansh</div>
              <div className="text-[9px] text-cyan-400 font-medium">All Currency Converter</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
