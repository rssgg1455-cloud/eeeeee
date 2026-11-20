import { useState } from 'react';
import { Bitcoin, Check, Copy } from 'lucide-react';
import { copyText } from '@/components/ui';
import { UploadBox } from '@/views/CreateView';
import { useLanguage } from '@/lib/LanguageContext';
import { bdt, usdtToBdt } from '@/lib/format';
import { BINANCE_PAY_ID } from '@/lib/paymentRates';
import { cn } from '@/lib/cn';

export function BinanceLogo({ className }: { className?: string }) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center bg-amber-100 text-amber-600', className)}>
      <Bitcoin size={20} strokeWidth={2} />
    </span>
  );
}

export function BinanceDepositFields({
  usdAmount,
  onUsdAmountChange,
  payerId,
  onPayerIdChange,
  screenshot,
  onScreenshotChange,
  onToast,
}: {
  usdAmount: string;
  onUsdAmountChange: (v: string) => void;
  payerId: string;
  onPayerIdChange: (v: string) => void;
  screenshot: string;
  onScreenshotChange: (dataUrl: string) => void;
  onToast: (msg: string) => void;
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const usd = parseFloat(usdAmount) || 0;
  const creditBdt = usdtToBdt(usd);

  const copyId = async () => {
    const ok = await copyText(BINANCE_PAY_ID);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      onToast(t('কপি করা যায়নি। ম্যানুয়ালি কপি করুন।', 'Could not copy. Please copy manually.'));
    }
  };

  const handleFile = (f: File | undefined) => {
    if (!f) return onScreenshotChange('');
    const reader = new FileReader();
    reader.onload = () => onScreenshotChange(reader.result as string);
    reader.readAsDataURL(f);
  };

  return (
    <div className="space-y-4">
      <div className="card space-y-4">
        <p className="text-sm font-bold text-slate-800">{t('Binance Pay বিবরণ', 'Binance Pay Details')}</p>

        <div>
          <label className="label">{t('আমাদের Binance Pay ID (UID)', 'Our Binance Pay ID (UID)')}</label>
          <button
            type="button"
            onClick={copyId}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-3 transition active:scale-[0.99]',
              copied ? 'bg-emerald-50 ring-1 ring-emerald-300' : 'bg-slate-100 hover:bg-slate-200/80'
            )}
            aria-label={t('Binance Pay ID কপি করুন', 'Copy Binance Pay ID')}
          >
            <span className="flex items-center gap-2">
              <BinanceLogo className="h-6 w-6 rounded-md" />
              <span className="font-mono text-sm font-semibold text-slate-800 select-none">{BINANCE_PAY_ID}</span>
            </span>
            <span className={cn('flex items-center gap-1 text-xs font-bold', copied ? 'text-emerald-700' : 'text-amber-700')}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t('কপি হয়েছে', 'Copied!') : t('কপি', 'Copy')}
            </span>
          </button>
          <p className="mt-1.5 text-xs text-slate-500">
            {t('এই UID-তে Binance Pay থেকে ডলার পাঠান।', 'Send your USD payment to this Binance Pay UID.')}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3.5 py-2.5 ring-1 ring-amber-200">
          <span className="text-xs font-semibold text-amber-800">{t('রেট', 'Exchange rate')}</span>
          <span className="text-sm font-extrabold text-amber-900">1 USDT = $1.00</span>
        </div>

        <div>
          <label className="label">{t('পাঠানো ডলারের পরিমাণ (USD)', 'Amount Sent (USD)')}</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
            <input
              className="input pl-9 text-lg font-bold"
              type="number"
              min="0"
              step="0.01"
              value={usdAmount}
              onChange={(e) => onUsdAmountChange(e.target.value)}
              placeholder="0.00"
            />
          </div>
          {usd > 0 && (
            <p className="mt-2 text-xs font-semibold text-emerald-700">
              {t(`ওয়ালেটে ক্রেডিট হবে: ${bdt(creditBdt)}`, `Will be credited to your wallet: ${bdt(creditBdt)}`)}
            </p>
          )}
        </div>

        <div>
          <label className="label">{t('আপনার Binance Pay ID / Gmail / ফোন নম্বর', 'Your Binance Pay ID / Gmail / Phone Number')}</label>
          <input
            className="input"
            value={payerId}
            onChange={(e) => onPayerIdChange(e.target.value)}
            placeholder={t('যেমন: name@gmail.com', 'e.g. name@gmail.com')}
          />
        </div>

        <div>
          <label className="label">{t('পেমেন্টের স্ক্রিনশট (ঐচ্ছিক)', 'Payment Screenshot (optional)')}</label>
          <UploadBox
            value={screenshot}
            onChange={handleFile}
            onClear={() => onScreenshotChange('')}
            label={t('পেমেন্টের স্ক্রিনশট আপলোড করুন', 'Upload Payment Screenshot')}
          />
        </div>
      </div>
    </div>
  );
}
