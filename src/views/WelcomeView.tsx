import { useState, useMemo } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { COUNTRIES, COUNTRY_REGIONS, LANGUAGES, type LanguageCode, type CountryInfo } from '@/data/countries';
import { Globe, ChevronRight, Check, Search, Languages } from 'lucide-react';

const WELCOME_KEY = 'et_welcome_done';

export function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1';
  } catch {
    return false;
  }
}

export function markWelcomeDone() {
  try {
    localStorage.setItem(WELCOME_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function resetWelcome() {
  try {
    localStorage.removeItem(WELCOME_KEY);
  } catch {
    /* ignore */
  }
}

export function WelcomeView({ onDone }: { onDone: () => void }) {
  const { setCountry, setLanguage, country, language } = useLocale();
  const [selectedCountry, setSelectedCountry] = useState<string>(country.code);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);
  const [search, setSearch] = useState('');
  const [step, setStep] = useState<'country' | 'language'>('country');

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.currencyCode.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [search]);

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    const c = COUNTRIES.find((co) => co.code === code);
    if (c) {
      // Pre-select the country's primary language
      setSelectedLang(c.primaryLanguage);
    }
  };

  const handleContinue = () => {
    if (step === 'country') {
      setStep('language');
      return;
    }
    // Apply selections
    setCountry(selectedCountry);
    setLanguage(selectedLang);
    markWelcomeDone();
    onDone();
  };

  const selectedCountryInfo = COUNTRIES.find((c) => c.code === selectedCountry);
  const availableLanguages = selectedCountryInfo
    ? [selectedCountryInfo.primaryLanguage, ...(selectedCountryInfo.secondaryLanguage ? [selectedCountryInfo.secondaryLanguage] : []), 'EN' as LanguageCode]
        .filter((v, i, arr) => arr.indexOf(v) === i)
    : ['EN' as LanguageCode];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50">
      {/* Header */}
      <div className="flex flex-col items-center px-6 pt-12 pb-6">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          <img
            src="/assets/images/97428.png"
            alt="ET Work logo"
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          {step === 'country' ? 'Welcome to ET Work' : 'Select Your Language'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {step === 'country'
            ? 'Choose your country to get started'
            : 'You can change this anytime in settings'}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 pb-4">
        <div className={`h-1.5 w-12 rounded-full ${step === 'country' ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
        <div className={`h-1.5 w-12 rounded-full ${step === 'language' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-6">
        {step === 'country' && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Country list grouped by region */}
            <div className="flex-1 space-y-4 overflow-y-auto pb-4">
              {COUNTRY_REGIONS.map((region) => {
                const regionCountries = filteredCountries.filter((c) => c.region === region);
                if (regionCountries.length === 0) return null;
                return (
                  <div key={region}>
                    <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                      {region}
                    </p>
                    <div className="space-y-1.5">
                      {regionCountries.map((c) => (
                        <CountryRow
                          key={c.code}
                          country={c}
                          selected={selectedCountry === c.code}
                          onClick={() => handleCountrySelect(c.code)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredCountries.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">No countries found</p>
              )}
            </div>
          </>
        )}

        {step === 'language' && (
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            <p className="px-1 text-sm font-semibold text-slate-600">
              {selectedCountryInfo?.flag} {selectedCountryInfo?.name}
            </p>
            <div className="space-y-2">
              {/* Show recommended languages for the country first, then all others */}
              {getOrderedLanguages(selectedLang, availableLanguages).map((langCode) => {
                const lang = LANGUAGES[langCode];
                return (
                  <button
                    key={langCode}
                    onClick={() => setSelectedLang(langCode)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-4 transition ${
                      selectedLang === langCode
                        ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <Languages size={22} className="text-slate-500" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-slate-800">{lang.nativeName}</p>
                      <p className="text-xs text-slate-500">{lang.name}</p>
                    </div>
                    {selectedLang === langCode && (
                      <Check size={20} className="text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex items-center gap-3 py-5">
          {step === 'language' && (
            <button
              onClick={() => setStep('country')}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition active:scale-95"
            >
              Back
            </button>
          )}
          <button
            onClick={handleContinue}
            disabled={step === 'country' && !selectedCountry}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition active:scale-[0.98] disabled:opacity-60"
          >
            {step === 'country' ? 'Continue' : 'Get Started'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CountryRow({
  country,
  selected,
  onClick,
}: {
  country: CountryInfo;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 transition ${
        selected
          ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
          : 'border-slate-200 bg-white'
      }`}
    >
      <span className="text-2xl">{country.flag}</span>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold text-slate-800">{country.name}</p>
        <p className="text-xs text-slate-500">
          {country.currencyCode} · {LANGUAGES[country.primaryLanguage].nativeName}
        </p>
      </div>
      <div className={`flex items-center gap-2 ${selected ? 'text-emerald-600' : 'text-slate-300'}`}>
        <span className="text-xs font-bold">{country.currencySymbol}</span>
        {selected && <Check size={18} />}
      </div>
    </button>
  );
}

function getOrderedLanguages(selected: LanguageCode, recommended: LanguageCode[]): LanguageCode[] {
  const all: LanguageCode[] = ['BN', 'EN', 'HI', 'UR', 'NE', 'ID', 'MS', 'AR', 'SW', 'PT', 'ES', 'FIL'];
  const ordered = [...recommended];
  for (const l of all) {
    if (!ordered.includes(l)) ordered.push(l);
  }
  return ordered;
}
