import { CurrencyType, ExchangeRateInfo } from '../types';

export const DEFAULT_RATES_VS_USD: Record<CurrencyType, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.77,
  JPY: 152.8,
  CNY: 7.15,
  INR: 86.85,
  PKR: 278.5,
  AUD: 1.55,
  RUB: 96.5,
  IRR: 42105.0,
};

export function calculatePairRate(
  base: CurrencyType,
  target: CurrencyType,
  ratesVsUSD: Record<CurrencyType, number> = DEFAULT_RATES_VS_USD
): number {
  if (base === target) return 1.0;
  const baseVsUSD = ratesVsUSD[base] || 1.0;
  const targetVsUSD = ratesVsUSD[target] || 1.0;
  if (baseVsUSD <= 0) return 1.0;
  return targetVsUSD / baseVsUSD;
}

export async function fetchLiveExchangeRates(
  currentRates: Record<CurrencyType, number> = DEFAULT_RATES_VS_USD
): Promise<{
  ratesVsUSD: Record<CurrencyType, number>;
  isLive: boolean;
  lastUpdated: string;
  source: string;
}> {
  const endpoints = [
    'https://open.er-api.com/v6/latest/USD',
    'https://api.exchangerate-api.com/v4/latest/USD',
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const apiRates = data?.rates;
        if (apiRates && typeof apiRates === 'object') {
          const updatedRates: Record<CurrencyType, number> = {
            USD: 1.0,
            EUR: typeof apiRates.EUR === 'number' ? apiRates.EUR : currentRates.EUR,
            GBP: typeof apiRates.GBP === 'number' ? apiRates.GBP : currentRates.GBP,
            JPY: typeof apiRates.JPY === 'number' ? apiRates.JPY : currentRates.JPY,
            CNY: typeof apiRates.CNY === 'number' ? apiRates.CNY : currentRates.CNY,
            INR: typeof apiRates.INR === 'number' ? apiRates.INR : currentRates.INR,
            PKR: typeof apiRates.PKR === 'number' ? apiRates.PKR : currentRates.PKR,
            AUD: typeof apiRates.AUD === 'number' ? apiRates.AUD : currentRates.AUD,
            RUB: typeof apiRates.RUB === 'number' ? apiRates.RUB : currentRates.RUB,
            IRR: typeof apiRates.IRR === 'number' ? apiRates.IRR : currentRates.IRR,
          };

          const now = new Date();
          const timeStr =
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
            ', ' +
            now.toLocaleDateString([], { month: 'short', day: 'numeric' });

          return {
            ratesVsUSD: updatedRates,
            isLive: true,
            lastUpdated: timeStr,
            source: url.includes('open.er-api') ? 'OpenER API' : 'ExchangeRate API',
          };
        }
      }
    } catch {
      // Continue to next endpoint
    }
  }

  // Fallback when network is offline or blocked
  return {
    ratesVsUSD: currentRates,
    isLive: false,
    lastUpdated: 'Default Estimated (Offline)',
    source: 'Estimated Fallback',
  };
}
