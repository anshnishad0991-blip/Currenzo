export type CurrencyType =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'CNY'
  | 'PKR'
  | 'IRR'
  | 'RUB'
  | 'AUD';

export type AppLanguage = 'en' | 'hi' | 'hinglish';
export type AppTheme = 'system' | 'light' | 'dark';

export interface CurrencyMeta {
  code: CurrencyType;
  symbol: string;
  name: {
    en: string;
    hi: string;
    hinglish: string;
  };
  flag: string;
  country: string;
}

export const CURRENCIES: Record<CurrencyType, CurrencyMeta> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: {
      en: 'Indian Rupee',
      hi: 'भारतीय रुपया',
      hinglish: 'Indian Rupee (INR)',
    },
    flag: '🇮🇳',
    country: 'India',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: {
      en: 'US Dollar',
      hi: 'अमेरिकी डॉलर',
      hinglish: 'US Dollar (USD)',
    },
    flag: '🇺🇸',
    country: 'United States',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: {
      en: 'Euro',
      hi: 'यूरो',
      hinglish: 'Euro (EUR)',
    },
    flag: '🇪🇺',
    country: 'European Union',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: {
      en: 'British Pound',
      hi: 'ब्रिटिश पाउंड',
      hinglish: 'British Pound (GBP)',
    },
    flag: '🇬🇧',
    country: 'United Kingdom',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: {
      en: 'Japanese Yen',
      hi: 'जापानी येन',
      hinglish: 'Japanese Yen (JPY)',
    },
    flag: '🇯🇵',
    country: 'Japan',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: {
      en: 'Chinese Yuan',
      hi: 'चीनी युआन',
      hinglish: 'Chinese Yuan (CNY)',
    },
    flag: '🇨🇳',
    country: 'China',
  },
  PKR: {
    code: 'PKR',
    symbol: '₨',
    name: {
      en: 'Pakistani Rupee',
      hi: 'पाकिस्तानी रुपया',
      hinglish: 'Pakistani Rupee (PKR)',
    },
    flag: '🇵🇰',
    country: 'Pakistan',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: {
      en: 'Australian Dollar',
      hi: 'ऑस्ट्रेलियाई डॉलर',
      hinglish: 'Australian Dollar (AUD)',
    },
    flag: '🇦🇺',
    country: 'Australia',
  },
  RUB: {
    code: 'RUB',
    symbol: '₽',
    name: {
      en: 'Russian Ruble',
      hi: 'रूसी रूबल',
      hinglish: 'Russian Ruble (RUB)',
    },
    flag: '🇷🇺',
    country: 'Russia',
  },
  IRR: {
    code: 'IRR',
    symbol: '﷼',
    name: {
      en: 'Iranian Rial',
      hi: 'ईरानी रियाल',
      hinglish: 'Iranian Rial (IRR)',
    },
    flag: '🇮🇷',
    country: 'Iran',
  },
};

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  isCurrencyMode: boolean;
  baseCurrency: CurrencyType;
  targetCurrency: CurrencyType;
  convertedResult: string;
  exchangeRateUsed: number;
}

export interface ExchangeRateInfo {
  rate: number; // 1 Base Currency = rate Target Currency
  ratesVsUSD: Record<CurrencyType, number>;
  isLive: boolean;
  isCustom: boolean;
  lastUpdated: string;
  source: string;
}
