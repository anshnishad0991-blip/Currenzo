import React from 'react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onDecimal: () => void;
  onPercentage: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onEquals: () => void;
  hapticEnabled: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onOperator,
  onDecimal,
  onPercentage,
  onClear,
  onBackspace,
  onEquals,
  hapticEnabled,
}) => {
  const triggerHaptic = () => {
    if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Ignore vibration errors
      }
    }
  };

  const handlePress = (action: () => void) => {
    triggerHaptic();
    action();
  };

  return (
    <div className="grid grid-cols-4 gap-2.5 p-3 select-none">
      {/* Row 1 */}
      <button
        onClick={() => handlePress(onClear)}
        className="h-16 flex items-center justify-center rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-500 font-bold text-xl transition-all shadow-sm"
        aria-label="All Clear"
      >
        AC
      </button>
      <button
        onClick={() => handlePress(onBackspace)}
        className="h-16 flex items-center justify-center rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
        aria-label="Delete"
      >
        <Delete className="w-6 h-6" />
      </button>
      <button
        onClick={() => handlePress(onPercentage)}
        className="h-16 flex items-center justify-center rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 text-emerald-600 dark:text-emerald-400 font-bold text-2xl transition-all shadow-sm"
        aria-label="Percent"
      >
        %
      </button>
      <button
        onClick={() => handlePress(() => onOperator('/'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-emerald-600/15 dark:bg-emerald-500/20 hover:bg-emerald-600/25 active:scale-95 text-emerald-600 dark:text-emerald-400 font-bold text-2xl transition-all shadow-sm"
        aria-label="Divide"
      >
        ÷
      </button>

      {/* Row 2 */}
      <button
        onClick={() => handlePress(() => onDigit('7'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-2xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        7
      </button>
      <button
        onClick={() => handlePress(() => onDigit('8'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-2xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        8
      </button>
      <button
        onClick={() => handlePress(() => onDigit('9'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-2xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        9
      </button>
      <button
        onClick={() => handlePress(() => onOperator('*'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-emerald-600/15 dark:bg-emerald-500/20 hover:bg-emerald-600/25 active:scale-95 text-emerald-600 dark:text-emerald-400 font-bold text-2xl transition-all shadow-sm"
        aria-label="Multiply"
      >
        ×
      </button>

      {/* Row 3 */}
      <button
        onClick={() => handlePress(() => onDigit('4'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-2xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        4
      </button>
      <button
        onClick={() => handlePress(() => onDigit('5'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-2xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        5
      </button>
      <button
        onClick={() => handlePress(() => onDigit('6'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-2xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        6
      </button>
      <button
        onClick={() => handlePress(() => onOperator('-'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-emerald-600/15 dark:bg-emerald-500/20 hover:bg-emerald-600/25 active:scale-95 text-emerald-600 dark:text-emerald-400 font-bold text-2xl transition-all shadow-sm"
        aria-label="Subtract"
      >
        −
      </button>

      {/* Row 4 */}
      <button
        onClick={() => handlePress(() => onDigit('1'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-2xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        1
      </button>
      <button
        onClick={() => handlePress(() => onDigit('2'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-2xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        2
      </button>
      <button
        onClick={() => handlePress(() => onDigit('3'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-2xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        3
      </button>
      <button
        onClick={() => handlePress(() => onOperator('+'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-emerald-600/15 dark:bg-emerald-500/20 hover:bg-emerald-600/25 active:scale-95 text-emerald-600 dark:text-emerald-400 font-bold text-2xl transition-all shadow-sm"
        aria-label="Add"
      >
        +
      </button>

      {/* Row 5 */}
      <button
        onClick={() => handlePress(() => onDigit('00'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        00
      </button>
      <button
        onClick={() => handlePress(() => onDigit('0'))}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-2xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        0
      </button>
      <button
        onClick={() => handlePress(onDecimal)}
        className="h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 text-slate-800 dark:text-slate-100 font-bold text-2xl transition-all shadow-sm border border-slate-200/40 dark:border-slate-700/40"
      >
        .
      </button>
      <button
        onClick={() => handlePress(onEquals)}
        className="h-16 flex items-center justify-center rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-2xl transition-all shadow-md shadow-emerald-500/25"
        aria-label="Equals"
      >
        =
      </button>
    </div>
  );
};
