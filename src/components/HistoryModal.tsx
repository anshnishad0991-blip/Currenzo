import React from 'react';
import { X, Trash2, Copy, History, ArrowRight } from 'lucide-react';
import { AppLanguage, CalculationHistoryItem } from '../types';
import { t } from '../localization/translations';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onRestoreItem: (item: CalculationHistoryItem) => void;
  onShowToast: (msg: string) => void;
  language: AppLanguage;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onDeleteHistoryItem,
  onRestoreItem,
  onShowToast,
  language,
}) => {
  if (!isOpen) return null;

  const handleCopy = (item: CalculationHistoryItem) => {
    const text = item.isCurrencyMode && item.convertedResult
      ? `${item.baseCurrency === 'INR' ? '₹' : '$'}${item.result} = ${item.convertedResult}`
      : `${item.expression} = ${item.result}`;
    navigator.clipboard.writeText(text);
    onShowToast(t('copied', language));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('historyTitle', language)}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition-all"
              >
                {t('clearHistory', language)}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <History className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-medium">{t('noHistory', language)}</p>
            </div>
          ) : (
            history.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{dateStr}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(item)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        title={t('copy', language)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                    {item.expression}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      = {item.result}
                    </div>
                    <button
                      onClick={() => {
                        onRestoreItem(item);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all"
                    >
                      {t('useResult', language)}
                    </button>
                  </div>

                  {item.isCurrencyMode && item.convertedResult && (
                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ⇄ {item.convertedResult}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        @ ₹{item.exchangeRateUsed.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
