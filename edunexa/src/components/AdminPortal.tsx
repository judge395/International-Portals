import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import type {
  CountryPortal,
  EdunexaDatabase,
  Language,
  StoreCategory,
  StoreProduct,
  University,
  WorkPermitJob,
} from '../types';
import { uiCopy } from '../i18n/translations';

interface AdminPortalProps {
  lang: Language;
  db: EdunexaDatabase;
  onRefresh: () => Promise<void>;
  onBackHome: () => void;
}

type AdminTab = 'international' | 'store' | 'jobs' | 'submissions';

const IMAGE_PRESETS = [
  { label: 'Country: Generic Globe', value: '/images/country-generic.svg' },
  { label: 'Country: South Korea', value: '/images/country-korea.svg' },
  { label: 'Country: Malaysia', value: '/images/country-malaysia.svg' },
  { label: 'Country: China', value: '/images/country-china.svg' },
  { label: 'Store: Electronics', value: '/images/store-electronics.svg' },
  { label: 'Store: Fashion', value: '/images/store-fashion.svg' },
  { label: 'Store: Lifestyle', value: '/images/store-lifestyle.svg' },
  { label: 'Store: Travel', value: '/images/store-travel.svg' },
  { label: 'Store: Live Shopping', value: '/images/store-live.svg' },
  { label: 'Job: Belarus', value: '/images/job-belarus.svg' },
  { label: 'Job: China', value: '/images/job-china.svg' },
  { label: 'Job: Mongolia', value: '/images/job-mongolia.svg' },
];

export function AdminPortal({ lang, db, onRefresh, onBackHome }: AdminPortalProps) {
  const t = uiCopy[lang];
  const [tab, setTab] = useState<AdminTab>('international');
  const [busy, setBusy] = useState(false);

  // Country form
  const [editingCountryId, setEditingCountryId] = useState<string | null>(null);
  const [countryNameEn, setCountryNameEn] = useState('');
  const [countryNameBn, setCountryNameBn] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [countryTaglineEn, setCountryTaglineEn] = useState('');
  const [countryTaglineBn, setCountryTaglineBn] = useState('');
  const [countryOverviewEn, setCountryOverviewEn] = useState('');
  const [countryOverviewBn, setCountryOverviewBn] = useState('');
  const [countryImage, setCountryImage] = useState('/images/country-generic.svg');

  // University form
  const [uniCountryId, setUniCountryId] = useState(db.countries[0]?.id || '');
  const [uniNameEn, setUniNameEn] = useState('');
  const [uniNameBn, setUniNameBn] = useState('');
  const [uniCityEn, setUniCityEn] = useState('');
  const [uniProgramsEn, setUniProgramsEn] = useState('');
  const [uniTuitionEn, setUniTuitionEn] = useState('');
  const [uniScholarshipEn, setUniScholarshipEn] = useState('');

  // Store Category form
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameBn, setCatNameBn] = useState('');
  const [catDescEn, setCatDescEn] = useState('');
  const [catImage, setCatImage] = useState('/images/store-lifestyle.svg');

  // Product form
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodCategoryId, setProdCategoryId] = useState(db.categories[0]?.id || '');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodNameBn, setProdNameBn] = useState('');
  const [prodPrice, setProdPrice] = useState('2500');
  const [prodStock, setProdStock] = useState('20');
  const [prodSku, setProdSku] = useState('');
  const [prodDescEn, setProdDescEn] = useState('');
  const [prodImage, setProdImage] = useState('/images/store-electronics.svg');
  const [prodIsLive, setProdIsLive] = useState(false);

  // Job form
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobCountryEn, setJobCountryEn] = useState('');
  const [jobCountryBn, setJobCountryBn] = useState('');
  const [jobTitleEn, setJobTitleEn] = useState('');
  const [jobTitleBn, setJobTitleBn] = useState('');
  const [jobSectorEn, setJobSectorEn] = useState('');
  const [jobSalaryEn, setJobSalaryEn] = useState('');
  const [jobProcessingEn, setJobProcessingEn] = useState('45 – 60 Working Days');
  const [jobOpenings, setJobOpenings] = useState('25');
  const [jobDescEn, setJobDescEn] = useState('');
  const [jobImage, setJobImage] = useState('/images/job-belarus.svg');

  function resetCountryForm() {
    setEditingCountryId(null);
    setCountryNameEn('');
    setCountryNameBn('');
    setCountryCode('');
    setCountryTaglineEn('');
    setCountryTaglineBn('');
    setCountryOverviewEn('');
    setCountryOverviewBn('');
    setCountryImage('/images/country-generic.svg');
  }

  function startEditCountry(c: CountryPortal) {
    setEditingCountryId(c.id);
    setCountryNameEn(c.name.en);
    setCountryNameBn(c.name.bn);
    setCountryCode(c.code);
    setCountryTaglineEn(c.tagline.en);
    setCountryTaglineBn(c.tagline.bn);
    setCountryOverviewEn(c.overview.en);
    setCountryOverviewBn(c.overview.bn);
    setCountryImage(c.image);
  }

  async function handleSaveCountry(e: FormEvent) {
    e.preventDefault();
    if (!countryNameEn.trim()) return;
    setBusy(true);
    try {
      const payload = {
        code: countryCode || countryNameEn.slice(0, 2).toUpperCase(),
        name: { en: countryNameEn.trim(), bn: countryNameBn.trim() || countryNameEn.trim() },
        tagline: {
          en: countryTaglineEn.trim() || 'Student Visa & University Admissions',
          bn: countryTaglineBn.trim() || countryTaglineEn.trim() || 'স্টুডেন্ট ভিসা ও ইউনিভার্সিটি অ্যাডমিশন',
        },
        overview: {
          en: countryOverviewEn.trim() || 'Direct admission support and scholarship guidance.',
          bn: countryOverviewBn.trim() || countryOverviewEn.trim() || 'সরাসরি অ্যাডমিশন ও স্কলারশিপ সহায়তা।',
        },
        image: countryImage,
      };
      const url = editingCountryId ? `/api/countries/${editingCountryId}` : '/api/countries';
      await fetch(url, {
        method: editingCountryId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      resetCountryForm();
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCountry(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/countries/${id}`, { method: 'DELETE' });
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleAddUniversity(e: FormEvent) {
    e.preventDefault();
    if (!uniCountryId || !uniNameEn.trim()) return;
    setBusy(true);
    try {
      await fetch('/api/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryId: uniCountryId,
          name: { en: uniNameEn.trim(), bn: uniNameBn.trim() || uniNameEn.trim() },
          city: { en: uniCityEn.trim() || 'Main City', bn: uniCityEn.trim() || 'প্রধান শহর' },
          programs: {
            en: uniProgramsEn.trim() || 'Bachelor & Master Programs',
            bn: uniProgramsEn.trim() || 'ব্যাচেলর ও মাস্টার্স প্রোগ্রাম',
          },
          tuitionRange: {
            en: uniTuitionEn.trim() || 'USD 3,500 / year',
            bn: uniTuitionEn.trim() || '৩,৫০০ ডলার / বছর',
          },
          scholarship: {
            en: uniScholarshipEn.trim() || 'Up to 50% Merit Waiver',
            bn: uniScholarshipEn.trim() || 'সর্বোচ্চ ৫০% স্কলারশিপ',
          },
        }),
      });
      setUniNameEn('');
      setUniNameBn('');
      setUniCityEn('');
      setUniProgramsEn('');
      setUniTuitionEn('');
      setUniScholarshipEn('');
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteUniversity(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/universities/${id}`, { method: 'DELETE' });
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    if (!catNameEn.trim()) return;
    setBusy(true);
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: { en: catNameEn.trim(), bn: catNameBn.trim() || catNameEn.trim() },
          description: { en: catDescEn.trim() || 'Curated products', bn: catDescEn.trim() || 'বাছাইকৃত পণ্য' },
          image: catImage,
        }),
      });
      setCatNameEn('');
      setCatNameBn('');
      setCatDescEn('');
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProdNameEn('');
    setProdNameBn('');
    setProdPrice('2500');
    setProdStock('20');
    setProdSku('');
    setProdDescEn('');
    setProdImage('/images/store-electronics.svg');
    setProdIsLive(false);
  }

  function startEditProduct(p: StoreProduct) {
    setEditingProductId(p.id);
    setProdCategoryId(p.categoryId);
    setProdNameEn(p.name.en);
    setProdNameBn(p.name.bn);
    setProdPrice(String(p.price));
    setProdStock(String(p.stock));
    setProdSku(p.sku);
    setProdDescEn(p.description.en);
    setProdImage(p.image);
    setProdIsLive(Boolean(p.isLiveFeatured));
  }

  async function handleSaveProduct(e: FormEvent) {
    e.preventDefault();
    if (!prodCategoryId || !prodNameEn.trim()) return;
    setBusy(true);
    try {
      const payload = {
        categoryId: prodCategoryId,
        sku: prodSku.trim() || undefined,
        name: { en: prodNameEn.trim(), bn: prodNameBn.trim() || prodNameEn.trim() },
        description: {
          en: prodDescEn.trim() || 'Verified item from Edunexa Store.',
          bn: prodDescEn.trim() || 'এডুনেক্সা স্টোরের মানসম্মত পণ্য।',
        },
        price: Number(prodPrice) || 1000,
        stock: Number(prodStock) || 10,
        image: prodImage,
        isLiveFeatured: prodIsLive,
      };
      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      await fetch(url, {
        method: editingProductId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      resetProductForm();
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  function resetJobForm() {
    setEditingJobId(null);
    setJobCountryEn('');
    setJobCountryBn('');
    setJobTitleEn('');
    setJobTitleBn('');
    setJobSectorEn('');
    setJobSalaryEn('');
    setJobProcessingEn('45 – 60 Working Days');
    setJobOpenings('25');
    setJobDescEn('');
    setJobImage('/images/job-belarus.svg');
  }

  function startEditJob(j: WorkPermitJob) {
    setEditingJobId(j.id);
    setJobCountryEn(j.country.en);
    setJobCountryBn(j.country.bn);
    setJobTitleEn(j.title.en);
    setJobTitleBn(j.title.bn);
    setJobSectorEn(j.sector.en);
    setJobSalaryEn(j.salaryRange.en);
    setJobProcessingEn(j.processingTime.en);
    setJobOpenings(String(j.openings));
    setJobDescEn(j.description.en);
    setJobImage(j.image);
  }

  async function handleSaveJob(e: FormEvent) {
    e.preventDefault();
    if (!jobTitleEn.trim() || !jobCountryEn.trim()) return;
    setBusy(true);
    try {
      const payload = {
        country: { en: jobCountryEn.trim(), bn: jobCountryBn.trim() || jobCountryEn.trim() },
        title: { en: jobTitleEn.trim(), bn: jobTitleBn.trim() || jobTitleEn.trim() },
        sector: { en: jobSectorEn.trim() || 'Skilled Industry', bn: jobSectorEn.trim() || 'দক্ষ খাত' },
        salaryRange: {
          en: jobSalaryEn.trim() || 'USD 850 – 1,200 / month',
          bn: jobSalaryEn.trim() || '৮৫০ – ১,২০০ ডলার / মাস',
        },
        processingTime: { en: jobProcessingEn.trim(), bn: jobProcessingEn.trim() },
        openings: Number(jobOpenings) || 20,
        description: {
          en: jobDescEn.trim() || 'Verified overseas work permit placement.',
          bn: jobDescEn.trim() || 'যাচাইকৃত বিদেশি ওয়ার্ক পারমিট প্রোগ্রাম।',
        },
        image: jobImage,
      };
      const url = editingJobId ? `/api/jobs/${editingJobId}` : '/api/jobs';
      await fetch(url, {
        method: editingJobId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      resetJobForm();
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteJob(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function updateInquiryStatus(id: string, status: string) {
    await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await onRefresh();
  }

  async function updateOrderStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await onRefresh();
  }

  return (
    <motion.section
      key="admin-portal"
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t.admin.heading}</h1>
        <p className="text-sm text-slate-600 mt-1.5">{t.admin.subheading}</p>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
        {(
          [
            { id: 'international', label: t.admin.tabs.international },
            { id: 'store', label: t.admin.tabs.store },
            { id: 'jobs', label: t.admin.tabs.jobs },
            {
              id: 'submissions',
              label: `${t.admin.tabs.submissions} (${db.inquiries.length + db.orders.length})`,
            },
          ] as { id: AdminTab; label: string }[]
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              tab === item.id
                ? 'bg-[#081B4B] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* TAB 1: COUNTRIES & UNIVERSITIES */}
      {tab === 'international' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Country Form */}
            <form
              onSubmit={handleSaveCountry}
              className="bg-white rounded-xl border border-slate-200 p-6 space-y-3.5"
            >
              <h2 className="text-base font-bold text-slate-900">{t.admin.addCountry}</h2>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Country Name (EN) *"
                  value={countryNameEn}
                  onChange={(e) => setCountryNameEn(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="দেশের নাম (বাংলা)"
                  value={countryNameBn}
                  onChange={(e) => setCountryNameBn(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Code (e.g. JP)"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <select
                  value={countryImage}
                  onChange={(e) => setCountryImage(e.target.value)}
                  className="col-span-2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {IMAGE_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Tagline (EN)"
                value={countryTaglineEn}
                onChange={(e) => setCountryTaglineEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="ট্যাগলাইন (বাংলা)"
                value={countryTaglineBn}
                onChange={(e) => setCountryTaglineBn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              <textarea
                rows={2}
                placeholder="Overview (EN)"
                value={countryOverviewEn}
                onChange={(e) => setCountryOverviewEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingCountryId ? t.admin.save : t.admin.addCountry}</span>
                </button>
                {editingCountryId && (
                  <button
                    type="button"
                    onClick={resetCountryForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                  >
                    {t.admin.cancel}
                  </button>
                )}
              </div>
            </form>

            {/* University Form */}
            <form
              onSubmit={handleAddUniversity}
              className="bg-white rounded-xl border border-slate-200 p-6 space-y-3.5"
            >
              <h2 className="text-base font-bold text-slate-900">{t.admin.addUniversity}</h2>
              <select
                value={uniCountryId}
                onChange={(e) => setUniCountryId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                {db.countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name[lang]} ({c.code})
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="University Name (EN) *"
                  value={uniNameEn}
                  onChange={(e) => setUniNameEn(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ইউনিভার্সিটির নাম (বাংলা)"
                  value={uniNameBn}
                  onChange={(e) => setUniNameBn(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City (e.g. Seoul)"
                  value={uniCityEn}
                  onChange={(e) => setUniCityEn(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Tuition (e.g. USD 4,000 / yr)"
                  value={uniTuitionEn}
                  onChange={(e) => setUniTuitionEn(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <input
                type="text"
                placeholder="Programs (e.g. Computer Science, MBA)"
                value={uniProgramsEn}
                onChange={(e) => setUniProgramsEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Scholarship (e.g. Up to 70% Waiver)"
                value={uniScholarshipEn}
                onChange={(e) => setUniScholarshipEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.admin.addUniversity}</span>
              </button>
            </form>
          </div>

          {/* Existing Countries & Universities Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 font-bold text-sm text-slate-900">
              {db.countries.length} Countries · {db.universities.length} Universities
            </div>
            <div className="divide-y divide-slate-100">
              {db.countries.map((c) => {
                const unis = db.universities.filter((u) => u.countryId === c.id);
                return (
                  <div key={c.id} className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs text-amber-700 font-semibold mr-2">
                          {c.code}
                        </span>
                        <span className="font-bold text-slate-900">{c.name[lang]}</span>
                        <span className="text-xs text-slate-500 ml-2">({unis.length} universities)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditCountry(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>{t.admin.edit}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCountry(c.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.admin.delete}</span>
                        </button>
                      </div>
                    </div>

                    {unis.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 border-l border-slate-200">
                        {unis.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between gap-2 text-xs bg-slate-50 px-3 py-2 rounded-lg"
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 truncate">{u.name[lang]}</div>
                              <div className="text-slate-500 truncate">{u.city[lang]}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteUniversity(u.id)}
                              className="p-1 text-slate-400 hover:text-red-600 shrink-0"
                              aria-label="Delete university"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORE CATEGORIES & PRODUCTS */}
      {tab === 'store' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Category */}
            <form
              onSubmit={handleAddCategory}
              className="bg-white rounded-xl border border-slate-200 p-6 space-y-3.5"
            >
              <h2 className="text-base font-bold text-slate-900">{t.admin.addCategory}</h2>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Category Name (EN) *"
                  value={catNameEn}
                  onChange={(e) => setCatNameEn(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ক্যাটাগরি নাম (বাংলা)"
                  value={catNameBn}
                  onChange={(e) => setCatNameBn(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <input
                type="text"
                placeholder="Description (EN)"
                value={catDescEn}
                onChange={(e) => setCatDescEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              <select
                value={catImage}
                onChange={(e) => setCatImage(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                {IMAGE_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.admin.addCategory}</span>
              </button>
            </form>

            {/* Add / Edit Product */}
            <form
              onSubmit={handleSaveProduct}
              className="bg-white rounded-xl border border-slate-200 p-6 space-y-3.5"
            >
              <h2 className="text-base font-bold text-slate-900">{t.admin.addProduct}</h2>
              <select
                value={prodCategoryId}
                onChange={(e) => setProdCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                {db.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name[lang]}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Product Title (EN) *"
                  value={prodNameEn}
                  onChange={(e) => setProdNameEn(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="পণ্যের নাম (বাংলা)"
                  value={prodNameBn}
                  onChange={(e) => setProdNameBn(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  required
                  placeholder="Price (BDT)"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                />
                <input
                  type="text"
                  placeholder="SKU"
                  value={prodSku}
                  onChange={(e) => setProdSku(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <select
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {IMAGE_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsLive}
                    onChange={(e) => setProdIsLive(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span>Live Shopping Featured</span>
                </label>
              </div>
              <input
                type="text"
                placeholder="Short Description (EN)"
                value={prodDescEn}
                onChange={(e) => setProdDescEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingProductId ? t.admin.save : t.admin.addProduct}</span>
                </button>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                  >
                    {t.admin.cancel}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Categories & Products Lists */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-sm text-slate-900 mb-3">
              Categories ({db.categories.length})
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {db.categories.map((cat: StoreCategory) => (
                <div
                  key={cat.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <span className="font-semibold text-slate-800">{cat.name[lang]}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <h3 className="font-bold text-sm text-slate-900 mb-3">
              Products ({db.products.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {db.products.map((p) => (
                <div key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{p.name[lang]}</div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums">
                      {p.sku} · ৳{p.price.toLocaleString()} · Stock: {p.stock}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEditProduct(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>{t.admin.edit}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t.admin.delete}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORK PERMITS */}
      {tab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveJob}
            className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 space-y-3.5"
          >
            <h2 className="text-base font-bold text-slate-900">{t.admin.addJob}</h2>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Country (EN) *"
                value={jobCountryEn}
                onChange={(e) => setJobCountryEn(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="দেশ (বাংলা)"
                value={jobCountryBn}
                onChange={(e) => setJobCountryBn(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Permit Title (EN) *"
                value={jobTitleEn}
                onChange={(e) => setJobTitleEn(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="শিরোনাম (বাংলা)"
                value={jobTitleBn}
                onChange={(e) => setJobTitleBn(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <input
              type="text"
              placeholder="Industry Sector (EN)"
              value={jobSectorEn}
              onChange={(e) => setJobSectorEn(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Salary (e.g. USD 900/mo)"
                value={jobSalaryEn}
                onChange={(e) => setJobSalaryEn(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              <input
                type="number"
                placeholder="Openings"
                value={jobOpenings}
                onChange={(e) => setJobOpenings(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Processing Time"
                value={jobProcessingEn}
                onChange={(e) => setJobProcessingEn(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              <select
                value={jobImage}
                onChange={(e) => setJobImage(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                {IMAGE_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              rows={2}
              placeholder="Role Description (EN)"
              value={jobDescEn}
              onChange={(e) => setJobDescEn(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingJobId ? t.admin.save : t.admin.addJob}</span>
              </button>
              {editingJobId && (
                <button
                  type="button"
                  onClick={resetJobForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                >
                  {t.admin.cancel}
                </button>
              )}
            </div>
          </form>

          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {db.jobs.map((job) => (
              <div key={job.id} className="p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{job.title[lang]}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {job.country[lang]} · {job.salaryRange[lang]} · {job.openings} slots
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEditJob(job)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>{t.admin.edit}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteJob(job.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t.admin.delete}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INQUIRIES & ORDERS */}
      {tab === 'submissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {t.admin.inquiriesTitle} ({db.inquiries.length})
            </h2>
            {db.inquiries.length === 0 ? (
              <p className="text-xs text-slate-500">{t.admin.noData}</p>
            ) : (
              <div className="space-y-3">
                {db.inquiries.map((inq) => (
                  <div key={inq.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-[#081B4B]">{inq.id}</span>
                      <select
                        value={inq.status}
                        onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                        className="px-2 py-1 rounded border border-slate-300 bg-white text-xs font-medium"
                      >
                        <option value="new">New</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="contacted">Contacted</option>
                      </select>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{inq.fullName}</div>
                    <div className="text-slate-600">
                      {inq.referenceTitle} · {inq.phone}
                    </div>
                    {inq.message && <p className="text-slate-600 pt-1">{inq.message}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {t.admin.ordersTitle} ({db.orders.length})
            </h2>
            {db.orders.length === 0 ? (
              <p className="text-xs text-slate-500">{t.admin.noData}</p>
            ) : (
              <div className="space-y-3">
                {db.orders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-[#081B4B]">{ord.id}</span>
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                        className="px-2 py-1 rounded border border-slate-300 bg-white text-xs font-medium"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                      </select>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{ord.customerName}</div>
                    <div className="text-slate-600">
                      {ord.phone} · {ord.city} · {ord.paymentMethod.toUpperCase()}
                    </div>
                    <div className="font-mono font-bold text-slate-900 tabular-nums pt-1">
                      ৳{ord.total.toLocaleString()} ({ord.items.length} items)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}
