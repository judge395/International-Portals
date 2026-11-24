import { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Briefcase, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import type { Language, WorkPermitJob } from '../types';
import { uiCopy } from '../i18n/translations';
import { SafeImage } from './SafeImage';
import { InquiryForm } from './InquiryForm';

interface JobsPortalProps {
  lang: Language;
  jobs: WorkPermitJob[];
  selectedJobId: string | null;
  onSelectJob: (id: string | null) => void;
  onBackHome: () => void;
  onInquirySaved: () => void;
}

export function JobsPortal({
  lang,
  jobs,
  selectedJobId,
  onSelectJob,
  onBackHome,
  onInquirySaved,
}: JobsPortalProps) {
  const t = uiCopy[lang];

  const activeJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) || null,
    [jobs, selectedJobId]
  );

  if (activeJob) {
    return (
      <motion.section
        key={activeJob.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => onSelectJob(null)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-[#081B4B] hover:text-[#081B4B] transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.breadcrumbs.backJobs}</span>
          </button>

          <button
            type="button"
            onClick={onBackHome}
            className="text-xs font-semibold text-slate-500 hover:text-[#081B4B] transition-colors whitespace-nowrap"
          >
            {t.breadcrumbs.backHome}
          </button>
        </div>

        {/* Work Permit Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 min-h-[240px] bg-[#081B4B]">
            <SafeImage
              src={activeJob.image}
              alt={activeJob.title[lang]}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-700 tracking-wide mb-2">
                {t.breadcrumbs.jobs} · {activeJob.country[lang]}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {activeJob.title[lang]}
              </h1>
              <p className="text-sm font-medium text-[#081B4B] mt-1">
                {activeJob.sector[lang]}
              </p>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                {activeJob.description[lang]}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div>
                <div className="text-xs text-slate-500">{t.jobs.salary}</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5 tabular-nums">
                  {activeJob.salaryRange[lang]}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">{t.jobs.contract}</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {activeJob.contractDuration[lang]}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">{t.jobs.processing}</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5 tabular-nums">
                  {activeJob.processingTime[lang]}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">{t.jobs.openings}</div>
                <div className="font-mono text-sm font-bold text-emerald-700 mt-0.5 tabular-nums">
                  {activeJob.openings}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements & Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7">
            <div className="flex items-center gap-2 text-[#081B4B] font-bold text-base mb-4">
              <ShieldCheck className="w-5 h-5" />
              <h2>{t.jobs.requirementsTitle}</h2>
            </div>
            <ul className="space-y-3">
              {activeJob.requirements[lang].map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#081B4B] shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-base mb-4">
              <Briefcase className="w-5 h-5" />
              <h2>{t.jobs.benefitsTitle}</h2>
            </div>
            <ul className="space-y-3">
              {activeJob.benefits[lang].map((ben, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{ben}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Application / Inquiry Form */}
        <div className="mt-10">
          <InquiryForm
            lang={lang}
            type="job"
            referenceTitle={activeJob.title.en}
            title={t.jobs.applyTitle}
            subtitle={t.jobs.applySubtitle}
            onSubmitted={onInquirySaved}
          />
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      key="jobs-list"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
    >
      <div className="mb-6">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-[#081B4B] hover:text-[#081B4B] transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.breadcrumbs.backHome}</span>
        </button>
      </div>

      <div className="max-w-2xl mb-10">
        <div className="text-xs font-semibold text-amber-700 tracking-wide mb-2">
          {t.breadcrumbs.jobs}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          {t.jobs.heading}
        </h1>
        <p className="text-base text-slate-600 mt-3 leading-relaxed">
          {t.jobs.subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() => onSelectJob(job.id)}
            className="group text-left bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#081B4B] hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/10] bg-[#081B4B] overflow-hidden">
                <SafeImage
                  src={job.image}
                  alt={job.title[lang]}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>{job.country[lang]}</span>
                  <span className="font-mono tabular-nums text-emerald-700 font-semibold">
                    {job.openings} {t.jobs.openings}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{job.title[lang]}</h2>
                <p className="text-xs font-medium text-[#081B4B] mt-1">{job.sector[lang]}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">{t.jobs.salary}</span>
                    <span className="font-semibold text-slate-900 tabular-nums text-right">
                      {job.salaryRange[lang]}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t.jobs.processing}
                    </span>
                    <span className="font-medium text-slate-700 tabular-nums">
                      {job.processingTime[lang]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#081B4B]">
              <span>{t.jobs.viewPermit}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
