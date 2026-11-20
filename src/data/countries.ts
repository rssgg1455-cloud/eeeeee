export type LanguageCode =
  | 'BN' | 'EN' | 'HI' | 'UR' | 'NE' | 'ID' | 'MS' | 'AR' | 'SW' | 'PT' | 'ES' | 'FIL';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  usdRate: number;
  primaryLanguage: LanguageCode;
  secondaryLanguage?: LanguageCode;
  region: string;
}

export const LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  BN: { code: 'BN', name: 'Bangla', nativeName: 'বাংলা' },
  EN: { code: 'EN', name: 'English', nativeName: 'English' },
  HI: { code: 'HI', name: 'Hindi', nativeName: 'हिन्दी' },
  UR: { code: 'UR', name: 'Urdu', nativeName: 'اردو', rtl: true },
  NE: { code: 'NE', name: 'Nepali', nativeName: 'नेपाली' },
  ID: { code: 'ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  MS: { code: 'MS', name: 'Malay', nativeName: 'Bahasa Melayu' },
  AR: { code: 'AR', name: 'Arabic', nativeName: 'العربية', rtl: true },
  SW: { code: 'SW', name: 'Swahili', nativeName: 'Kiswahili' },
  PT: { code: 'PT', name: 'Portuguese', nativeName: 'Português' },
  ES: { code: 'ES', name: 'Spanish', nativeName: 'Español' },
  FIL: { code: 'FIL', name: 'Filipino', nativeName: 'Filipino' },
};

export const COUNTRIES: CountryInfo[] = [
  // South & Southeast Asia
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', currencyCode: 'BDT', currencySymbol: '৳', usdRate: 110, primaryLanguage: 'BN', region: 'South & Southeast Asia' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currencyCode: 'INR', currencySymbol: '₹', usdRate: 83.5, primaryLanguage: 'HI', secondaryLanguage: 'EN', region: 'South & Southeast Asia' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currencyCode: 'PKR', currencySymbol: '₨', usdRate: 278, primaryLanguage: 'UR', secondaryLanguage: 'EN', region: 'South & Southeast Asia' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', currencyCode: 'NPR', currencySymbol: 'रू', usdRate: 133, primaryLanguage: 'NE', secondaryLanguage: 'EN', region: 'South & Southeast Asia' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currencyCode: 'IDR', currencySymbol: 'Rp', usdRate: 15500, primaryLanguage: 'ID', secondaryLanguage: 'EN', region: 'South & Southeast Asia' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currencyCode: 'PHP', currencySymbol: '₱', usdRate: 56, primaryLanguage: 'EN', secondaryLanguage: 'FIL', region: 'South & Southeast Asia' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currencyCode: 'MYR', currencySymbol: 'RM', usdRate: 4.5, primaryLanguage: 'MS', secondaryLanguage: 'EN', region: 'South & Southeast Asia' },
  // Middle East
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currencyCode: 'SAR', currencySymbol: 'ر.س', usdRate: 3.75, primaryLanguage: 'AR', secondaryLanguage: 'EN', region: 'Middle East' },
  { code: 'AE', name: 'UAE / Dubai', flag: '🇦🇪', currencyCode: 'AED', currencySymbol: 'د.إ', usdRate: 3.67, primaryLanguage: 'AR', secondaryLanguage: 'EN', region: 'Middle East' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', currencyCode: 'KWD', currencySymbol: 'د.ك', usdRate: 0.31, primaryLanguage: 'AR', secondaryLanguage: 'EN', region: 'Middle East' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', currencyCode: 'QAR', currencySymbol: 'ر.ق', usdRate: 3.64, primaryLanguage: 'AR', secondaryLanguage: 'EN', region: 'Middle East' },
  // Africa
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currencyCode: 'NGN', currencySymbol: '₦', usdRate: 1600, primaryLanguage: 'EN', region: 'Africa' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', currencyCode: 'EGP', currencySymbol: '£', usdRate: 48, primaryLanguage: 'AR', secondaryLanguage: 'EN', region: 'Africa' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currencyCode: 'ZAR', currencySymbol: 'R', usdRate: 18, primaryLanguage: 'EN', region: 'Africa' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currencyCode: 'KES', currencySymbol: 'KSh', usdRate: 129, primaryLanguage: 'SW', secondaryLanguage: 'EN', region: 'Africa' },
  // Americas
  { code: 'US', name: 'USA', flag: '🇺🇸', currencyCode: 'USD', currencySymbol: '$', usdRate: 1, primaryLanguage: 'EN', region: 'Americas' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currencyCode: 'BRL', currencySymbol: 'R$', usdRate: 5.4, primaryLanguage: 'PT', secondaryLanguage: 'EN', region: 'Americas' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currencyCode: 'MXN', currencySymbol: '$', usdRate: 18, primaryLanguage: 'ES', secondaryLanguage: 'EN', region: 'Americas' },
];

export const COUNTRY_MAP: Record<string, CountryInfo> = COUNTRIES.reduce(
  (map, c) => { map[c.code] = c; return map; },
  {} as Record<string, CountryInfo>,
);

export function getCountry(code: string): CountryInfo | undefined {
  return COUNTRY_MAP[code];
}

export function getLanguage(code: LanguageCode): LanguageInfo {
  return LANGUAGES[code] ?? LANGUAGES.EN;
}

// BDT per USD — used to convert internal BDT balances to local currency
export const BDT_PER_USD = 110;

/**
 * Convert an amount stored in BDT to the user's local currency.
 */
export function bdtToLocal(bdtAmount: number, country: CountryInfo): number {
  const usd = bdtAmount / BDT_PER_USD;
  return usd * country.usdRate;
}

/**
 * Convert a local currency amount back to BDT for storage.
 */
export function localToBdt(localAmount: number, country: CountryInfo): number {
  const usd = localAmount / country.usdRate;
  return usd * BDT_PER_USD;
}

export const COUNTRY_REGIONS = [
  'South & Southeast Asia',
  'Middle East',
  'Africa',
  'Americas',
];
