import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import type { Language } from '../types';
import { uiCopy } from '../i18n/translations';

interface InquiryFormProps {
  lang: Language;
  type: 'admission' | 'job' | 'contact';
  referenceTitle: string;
  prefilledMessage?: string;
  title?: string;
  subtitle?: string;
  onSubmitted?: () => void;
}

export function InquiryForm({
  lang,
  type,
  referenceTitle,
  prefilledMessage = '',
  title,
  subtitle,
  onSubmitted,
}: InquiryFormProps) {
  const t = uiCopy[lang].forms;
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [passportOrEducation, setPassportOrEducation] = useState('');
  const [message, setMessage] = useState(prefilledMessage);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledMessage) {
      setMessage(prefilledMessage);
    }
  }, [prefilledMessage]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || phone.trim().length < 6) {
      setError(t.validationError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          referenceTitle,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          passportOrEducation: passportOrEducation.trim(),
          message: message.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Submission failed');
      }
      const saved = await res.json();
      setSubmittedId(saved.id);
      setFullName('');
      setPhone('');
      setEmail('');
      setPassportOrEducation('');
      setMessage('');
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit request.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedId) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
        <div className="flex items-start gap-3.5">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-lg font-bold text-slate-900">{t.successTitle}</h4>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t.successDesc}</p>
            <div className="mt-3 font-mono text-xs text-slate-500">
              Ref: {submittedId} · {referenceTitle}
            </div>
            <button
              type="button"
              onClick={() => setSubmittedId(null)}
              className="mt-5 px-4 py-2 text-xs font-semibold text-[#081B4B] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              {t.submitAnother}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4">
      {title && (
        <div className="pb-2 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t.fullName} *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#081B4B] focus:bg-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t.phone} *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+880 1XXX-XXXXXX"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#081B4B] focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#081B4B] focus:bg-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t.educationOrPassport}
          </label>
          <input
            type="text"
            value={passportOrEducation}
            onChange={(e) => setPassportOrEducation(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#081B4B] focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          {t.message}
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#081B4B] focus:bg-white transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
      >
        <Send className="w-4 h-4" />
        <span>{submitting ? t.submitting : t.submit}</span>
      </button>
    </form>
  );
}
