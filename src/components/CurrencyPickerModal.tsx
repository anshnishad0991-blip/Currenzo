import React, { useState, useMemo } from 'react';
import { X, Check, Search } from 'lucide-react';
import { AppLanguage, CurrencyType, CURRENCIES } from '../types';

interface CurrencyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  selectedCurrency: CurrencyType;
  onSelect: (currency: CurrencyType) => void;
  language: AppLanguage;
}

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  isOpen,
  onClose,
  title,
  selectedCurrency,
  onSelect,
  language,
}) => {
  const [search, setSearch] = useState('');

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

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return allCurrencies;
    const query = search.toLowerCase().trim();
    return allCurrencies.filter((code) => {
      const meta = CURRENCIES[code];
      return (
        code.toLowerCase().includes(query) ||
        meta.symbol.toLowerCase().includes(query) ||
        meta.country.toLowerCase().includes(query) ||
        meta.name[language]?.toLowerCase().includes(query)
      );
    });
  }, [allCurrencies, search, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <img
              src="/currenzo-logo.png"
              alt="Currenzo"
              className="w-6 h-6 rounded-md object-contain"
            />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, symbol, country (e.g. EUR, Yen, UK)"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Currency List */}
        <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
          {filteredCurrencies.map((code) => {
            const meta = CURRENCIES[code];
            const isSelected = selectedCurrency === code;

            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  onSelect(code);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meta.flag}</span>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {code}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold">
                        {meta.symbol}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {meta.name[language]} · {meta.country}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
