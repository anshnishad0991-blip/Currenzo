import { CurrencyType, CURRENCIES } from '../types';

export function formatIndianNumber(value: number, decimalPlaces: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0';

  const sign = value < 0 ? '-' : '';
  const absVal = Math.abs(value);
  const fixed = absVal.toFixed(decimalPlaces);
  const [integerPart, decimalPart] = fixed.split('.');

  if (integerPart.length <= 3) {
    return `${sign}${integerPart}${decimalPart ? `.${decimalPart}` : ''}`;
  }

  const lastThree = integerPart.slice(-3);
  const remaining = integerPart.slice(0, -3);

  // Group by 2 digits for South Asian numbering system
  const groups: string[] = [];
  let temp = remaining;
  while (temp.length > 0) {
    const take = temp.length >= 2 ? 2 : temp.length;
    groups.unshift(temp.slice(-take));
    temp = temp.slice(0, -take);
  }

  const formattedInt = `${groups.join(',')},${lastThree}`;
  return `${sign}${formattedInt}${decimalPart ? `.${decimalPart}` : ''}`;
}

export function formatStandardNumber(value: number, decimalPlaces: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

export function formatCurrency(
  value: number,
  currency: CurrencyType,
  decimalPlaces: number = 2,
  includeSymbol: boolean = true
): string {
  // INR and PKR use the South Asian numbering system (Lakhs/Crores)
  const useSouthAsian = currency === 'INR' || currency === 'PKR';
  // IRR numbers are typically very large integers; JPY typically has 0 decimals
  const effectiveDecimals =
    (currency === 'IRR' || currency === 'JPY') && Math.abs(value) >= 100
      ? 0
      : decimalPlaces;

  const formatted = useSouthAsian
    ? formatIndianNumber(value, effectiveDecimals)
    : formatStandardNumber(value, effectiveDecimals);

  const symbol = CURRENCIES[currency]?.symbol || currency;
  if (!includeSymbol) return formatted;

  // Placement: for Ruble (₽), usually placed after; for others before
  if (currency === 'RUB') {
    return `${formatted} ₽`;
  }
  return `${symbol}${formatted}`;
}

export function formatDisplayExpression(raw: string): string {
  if (!raw) return '0';
  return raw
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/-/g, ' − ');
}

export function getCompactDescription(value: number, currency: CurrencyType): string {
  const abs = Math.abs(value);
  if (abs < 1000) return '';

  if (currency === 'INR' || currency === 'PKR') {
    if (abs >= 10000000) {
      return `≈ ${(value / 10000000).toFixed(2)} Crore`;
    }
    if (abs >= 100000) {
      return `≈ ${(value / 100000).toFixed(2)} Lakh`;
    }
    if (abs >= 1000) {
      return `≈ ${(value / 1000).toFixed(1)} Thousand`;
    }
  } else if (currency === 'IRR') {
    if (abs >= 1000000000) {
      return `≈ ${(value / 1000000000).toFixed(2)}B ﷼`;
    }
    if (abs >= 1000000) {
      return `≈ ${(value / 1000000).toFixed(2)}M ﷼`;
    }
    if (abs >= 1000) {
      return `≈ ${(value / 1000).toFixed(0)}K ﷼`;
    }
  } else {
    const symbol = CURRENCIES[currency]?.symbol || '';
    if (abs >= 1000000000) {
      return `≈ ${symbol}${(value / 1000000000).toFixed(2)}B`;
    }
    if (abs >= 1000000) {
      return `≈ ${symbol}${(value / 1000000).toFixed(2)}M`;
    }
    if (abs >= 1000) {
      return `≈ ${symbol}${(value / 1000).toFixed(1)}K`;
    }
  }
  return '';
}
