import { useState, useMemo } from 'react';
import { supabase, applyReferralCode } from '@/lib/supabase';
import { Toast } from '@/components/ui';
import { useLocale } from '@/lib/LocaleContext';
import { COUNTRIES, COUNTRY_REGIONS, type LanguageCode } from '@/data/countries';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2, Gift, Globe, Check, ChevronDown, Search } from 'lucide-react';

type Mode = 'login' | 'signup';

const NETWORK_ERROR_MESSAGE = "Couldn't reach the server. Check your internet connection and try again.";
const REQUEST_TIMEOUT_MS = 20000;

function withTimeout<T>(request: PromiseLike<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('request timed out')), REQUEST_TIMEOUT_MS);
    Promise.resolve(request).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function friendlyAuthError(msg: string): string {
  if (/failed to fetch|networkerror|load failed|request timed out|aborted/i.test(msg)) {
    return NETWORK_ERROR_MESSAGE;
  }
  if (msg.includes('User already registered')) return 'An account with this email already exists. Please log in.';
  if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.';
  if (msg.includes('Password should be at least')) return 'Password must be at least 6 characters.';
  if (msg.includes('Unable to validate email address')) return 'Please enter a valid email address.';
  return msg;
}

export function AuthView() {
  const { setCountry: setCountryAuto, setLanguage, setCountryOnly, country: currentCountry, language: currentLang } = useLocale();
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Country & language selection for signup
  const [selectedCountry, setSelectedCountry] = useState<string>(currentCountry.code);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(currentLang);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const selectedCountryInfo = COUNTRIES.find((c) => c.code === selectedCountry);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.currencyCode.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [countrySearch]);

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    const c = COUNTRIES.find((co) => co.code === code);
    if (c) setSelectedLang(c.primaryLanguage);
    setCountryPickerOpen(false);
    setCountrySearch('');
  };

  const validate = (): string | null => {
    if (mode === 'signup' && name.trim().length < 2) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      setToast({ msg: err, ok: false });
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: name.trim(),
                preferred_country: selectedCountry,
                preferred_language: selectedLang,
              },
            },
          }),
        );
        if (error) {
          setToast({ msg: friendlyAuthError(error.message), ok: false });
          setBusy(false);
          return;
        }
        const uid = data.user?.id;
        if (uid && referralCode.trim()) {
          const referral = await withTimeout(applyReferralCode(referralCode.trim(), uid)).catch(() => null);
          if (!referral?.success) {
            console.warn('[signup] referral code was not applied:', referral?.message ?? 'request failed');
          }
        }
        // Save preferences to profiles table
        if (uid) {
          await supabase
            .from('profiles')
            .update({ preferred_country: selectedCountry, preferred_language: selectedLang })
            .eq('id', uid);
        }
        // Apply locale immediately so the app UI switches on login
        setCountryOnly(selectedCountry);
        setLanguage(selectedLang);

        if (!data.session) {
          setMode('login');
          setPassword('');
          setBusy(false);
          setToast({ msg: 'Account created. Please log in to continue.', ok: true });
        }
        // With a session, onAuthStateChange in useAuth takes over and unmounts this screen.
      } else {
        const { error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          }),
        );
        if (error) {
          setToast({ msg: friendlyAuthError(error.message), ok: false });
          setBusy(false);
          return;
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      setToast({ msg: friendlyAuthError(msg), ok: false });
      setBusy(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setToast(null);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50">
      <div className="flex min-h-screen flex-col px-6 py-10">
        {/* Brand */}
        <div className="flex flex-col items-center pt-6">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
            <img
              src="/assets/images/et_work_world.png"
              alt="ET Work World logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'signup'
              ? 'Sign up to start earning from micro tasks.'
              : 'Log in to continue to your dashboard.'}
          </p>
        </div>

        {/* Form */}
        <div className="mt-8 space-y-4">
          {mode === 'signup' && (
            <Field
              icon={<UserIcon size={18} className="text-slate-400" />}
              label="Full Name"
            >
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
            </Field>
          )}

          <Field icon={<Mail size={18} className="text-slate-400" />} label="Email Address">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />
          </Field>

          <Field icon={<Lock size={18} className="text-slate-400" />} label="Password">
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="text-slate-400 transition hover:text-slate-600"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </Field>

          {mode === 'signup' && (
            <>
              {/* Country selector */}
              <div>
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Country & Currency</span>
                <button
                  type="button"
                  onClick={() => setCountryPickerOpen((v) => !v)}
                  className="flex w-full items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
                >
                  <Globe size={18} className="text-slate-400" />
                  <span className="flex flex-1 items-center gap-2 text-left">
                    <span className="text-xl">{selectedCountryInfo?.flag}</span>
                    <span className="text-sm font-medium text-slate-800">{selectedCountryInfo?.name}</span>
                    <span className="text-xs text-slate-400">{selectedCountryInfo?.currencyCode}</span>
                  </span>
                  <ChevronDown size={16} className={`text-slate-400 transition ${countryPickerOpen ? 'rotate-180' : ''}`} />
                </button>
                {countryPickerOpen && (
                  <div className="mt-2 max-h-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <div className="relative border-b border-slate-100 p-2">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search country..."
                        className="w-full rounded-xl bg-slate-50 py-2 pl-8 pr-3 text-sm outline-none focus:bg-white"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1.5">
                      {COUNTRY_REGIONS.map((region) => {
                        const regionCountries = filteredCountries.filter((c) => c.region === region);
                        if (regionCountries.length === 0) return null;
                        return (
                          <div key={region} className="mb-1">
                            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{region}</p>
                            {regionCountries.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => handleCountrySelect(c.code)}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition ${selectedCountry === c.code ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                              >
                                <span className="text-lg">{c.flag}</span>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                                  <p className="text-xs text-slate-400">{c.currencyCode} · {c.currencySymbol}</p>
                                </div>
                                {selectedCountry === c.code && <Check size={16} className="text-emerald-600" />}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                      {filteredCountries.length === 0 && (
                        <p className="py-6 text-center text-sm text-slate-400">No countries found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Field
                icon={<Gift size={18} className="text-slate-400" />}
                label="Referral Code (optional)"
              >
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter a friend's code for 100 bonus coins"
                  className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                />
              </Field>
            </>
          )}

          <button
            onClick={submit}
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition active:scale-[0.98] disabled:opacity-70"
          >
            {busy ? (
              <Loader2 size={18} className="animate-spin" />
            ) : mode === 'signup' ? (
              'Sign Up'
            ) : (
              'Log In'
            )}
          </button>
        </div>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
            className="font-bold text-emerald-600 transition hover:text-emerald-700"
          >
            {mode === 'signup' ? 'Log In' : 'Sign Up'}
          </button>
        </p>

        <p className="mt-auto pt-8 text-center text-xs text-slate-400">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>

      {toast && (
        <Toast message={toast.msg} onClose={() => setToast(null)} tone={toast.ok ? 'success' : 'error'} />
      )}
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
        {icon}
        {children}
      </div>
    </label>
  );
}
