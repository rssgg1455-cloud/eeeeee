// Re-export from LocaleContext for backward compatibility.
// All components import useLanguage from here; it resolves to the
// same hook backed by LocaleProvider in main.tsx.
export { useLanguage } from '@/lib/LocaleContext';
