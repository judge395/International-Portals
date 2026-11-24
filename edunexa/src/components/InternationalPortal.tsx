import { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, MapPin, Search } from 'lucide-react';
import type { CountryPortal, Language, University } from '../types';
import { uiCopy } from '../i18n/translations';
import { SafeImage } from './SafeImage';
import { InquiryForm } from './InquiryForm';

interface InternationalPortalProps {
  lang: Language;
  countries: CountryPortal[];
  universities: University[];
  selectedCountryId: string | null;
  onSelectCountry: (id: string | null) => void;
  onBackHome: () => void;
  onInquirySaved: () => void;
}

export function InternationalPortal({
  lang,
  countries,
  universities,
  selectedCountryId,
  onSelectCountry,
  onBackHome,
  onInquirySaved,
}: InternationalPortalProps) {
  const t = uiCopy[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [prefilledNote, setPrefilledNote] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const activeCountry = useMemo(
    () => countries.find((c) => c.id === selectedCountryId) || null,
    [countries, selectedCountryId]
  );

  const countryUniversities = useMemo(() => {
    if (!activeCountry) return [];
    const list = universities.filter((u) => u.countryId === activeCountry.id);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        u.name[lang].toLowerCase().includes(q) ||
        u.name.en.toLowerCase().includes(q) ||
        u.city[lang].toLowerCase().includes(q) ||
        u.programs[lang].toLowerCase().includes(q)
    );
  }, [activeCountry, universities, searchQuery, lang]);

  function handleUniversityInquire(uni: University) {
    setPrefilledNote(
      lang === 'bn'
        ? `${uni.name.bn} (${activeCountry?.name.bn}) — প্রোগ্রাম: ${uni.programs.bn}`
        : `${uni.name.en} (${activeCountry?.name.en}) — Preferred Program: ${uni.programs.en}`
    );
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (activeCountry) {
    return (
      <motion.section
        key={activeCountry.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setPrefilledNote('');
              onSelectCountry(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-[#081B4B] hover:text-[#081B4B] transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.breadcrumbs.backCountries}</span>
          </button>

          <button
            type="button"
            onClick={onBackHome}
            className="text-xs font-semibold text-slate-500 hover:text-[#081B4B] transition-colors whitespace-nowrap"
          >
            {t.breadcrumbs.backHome}
          </button>
        </div>

        {/* Country Hero Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 min-h-[240px] bg-[#081B4B]">
            <SafeImage
              src={activeCountry.image}
              alt={activeCountry.name[lang]}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-700 tracking-wide mb-2">
                {t.breadcrumbs.international} · {activeCountry.code}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {activeCountry.name[lang]}
              </h1>
              <p className="text-sm font-medium text-[#081B4B] mt-1">
                {activeCountry.tagline[lang]}
              </p>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                {activeCountry.overview[lang]}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div>
                <div className="text-xs text-slate-500">{t.international.visaTimeline}</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {activeCountry.visaTimeline[lang]}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">{t.international.intake}</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {activeCountry.intakes[lang]}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">{t.international.languageReq}</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {activeCountry.languageRequirement[lang]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Country Highlights */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {t.international.highlightsTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {activeCountry.highlights[lang].map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#081B4B] shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Universities List */}
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {t.international.partnerUniversitiesTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                {countryUniversities.length} {t.international.universitiesCount}
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.international.searchUniversities}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#081B4B]"
              />
            </div>
          </div>

          {countryUniversities.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
              {t.international.noUniversities}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {countryUniversities.map((uni) => (
                <div
                  key={uni.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                      <span className="inline-flex items-center gap-1 font-medium text-[#081B4B]">
                        <MapPin className="w-3.5 h-3.5" />
                        {uni.city[lang]}
                      </span>
                      <span>{uni.rankingNote[lang]}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{uni.name[lang]}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      <span className="font-semibold text-slate-800">{t.international.programs}: </span>
                      {uni.programs[lang]}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-500 block">{t.international.tuition}</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {uni.tuitionRange[lang]}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">{t.international.scholarship}</span>
                        <span className="font-semibold text-emerald-700">
                          {uni.scholarship[lang]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      {t.international.intake}: <strong className="text-slate-800">{uni.intake[lang]}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUniversityInquire(uni)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] rounded-lg transition-colors whitespace-nowrap"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{t.international.applyUniversityBtn}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Counseling Form */}
        <div ref={formRef} className="mt-12">
          <InquiryForm
            lang={lang}
            type="admission"
            referenceTitle={`${activeCountry.name.en} Admission`}
            prefilledMessage={prefilledNote}
            title={t.international.counselingTitle}
            subtitle={t.international.counselingSubtitle}
            onSubmitted={onInquirySaved}
          />
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      key="international-list"
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
          {t.breadcrumbs.international}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          {t.international.heading}
        </h1>
        <p className="text-base text-slate-600 mt-3 leading-relaxed">
          {t.international.subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {countries.map((country) => {
          const uniCount = universities.filter((u) => u.countryId === country.id).length;
          return (
            <button
              key={country.id}
              type="button"
              onClick={() => onSelectCountry(country.id)}
              className="group text-left bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#081B4B] hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] bg-[#081B4B] overflow-hidden">
                  <SafeImage
                    src={country.image}
                    alt={country.name[lang]}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs text-slate-500 font-medium tabular-nums mb-1.5">
                    {country.code} · {uniCount} {t.international.universitiesCount}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{country.name[lang]}</h2>
                  <p className="text-xs font-medium text-[#081B4B] mt-1">
                    {country.tagline[lang]}
                  </p>
                  <p className="text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {country.overview[lang]}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#081B4B]">
                <span>{t.international.exploreCountry}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
