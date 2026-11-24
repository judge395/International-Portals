import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Clock,
  Globe,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from 'lucide-react';
import type { EdunexaDatabase, Language, StoreProduct } from './types';
import { initialSeedData } from './data/seedData';
import { uiCopy } from './i18n/translations';
import { LanguageModal } from './components/LanguageModal';
import { SafeImage } from './components/SafeImage';
import { InternationalPortal } from './components/InternationalPortal';
import { StorePortal, type CartEntry } from './components/StorePortal';
import { JobsPortal } from './components/JobsPortal';
import { AdminPortal } from './components/AdminPortal';
import { InquiryForm } from './components/InquiryForm';

type PortalView = 'home' | 'international' | 'store' | 'jobs' | 'admin';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('edunexa_lang');
    return saved === 'bn' || saved === 'en' ? saved : 'en';
  });
  const [showLangPopup, setShowLangPopup] = useState<boolean>(() => {
    return !localStorage.getItem('edunexa_lang');
  });

  const [view, setView] = useState<PortalView>('home');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [db, setDb] = useState<EdunexaDatabase>(initialSeedData);
  const [cart, setCart] = useState<CartEntry[]>([]);

  const t = uiCopy[lang];

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data: EdunexaDatabase = await res.json();
        setDb(data);
      }
    } catch {
      // Keep seed data fallback if offline
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleSelectLanguage(chosen: Language) {
    setLang(chosen);
    localStorage.setItem('edunexa_lang', chosen);
    setShowLangPopup(false);
  }

  function navigateTo(nextView: PortalView) {
    setView(nextView);
    if (nextView !== 'international') setSelectedCountryId(null);
    if (nextView !== 'jobs') setSelectedJobId(null);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleContactNav() {
    setMobileMenuOpen(false);
    if (view !== 'home') {
      setView('home');
      setTimeout(() => {
        document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleAddToCart(product: StoreProduct) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function handleUpdateCartQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function handleRemoveFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }

  const totalOpenings = db.jobs.reduce((acc, j) => acc + j.openings, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <LanguageModal isOpen={showLangPopup} onSelectLanguage={handleSelectLanguage} />

      {/* Slim Utility Bar */}
      <div className="bg-[#081B4B] text-slate-200 text-xs border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-8 flex items-center justify-between gap-4">
          <span className="truncate">{t.topStripLeft}</span>
          <a
            href={`mailto:${t.topStripEmail}`}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            {t.topStripEmail}
          </a>
        </div>
      </div>

      {/* 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-[#081B4B] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#081B4B] rounded"
          >
            <span className="w-1 h-5 bg-amber-500 rounded-full" aria-hidden="true" />
            <span>{t.brand}</span>
          </button>

          {/* Zone 2: Concise Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => navigateTo('international')}
              className={`hover:text-[#081B4B] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                view === 'international'
                  ? 'text-[#081B4B] border-amber-500 font-semibold'
                  : 'border-transparent'
              }`}
            >
              {t.nav.international}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('store')}
              className={`hover:text-[#081B4B] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                view === 'store'
                  ? 'text-[#081B4B] border-amber-500 font-semibold'
                  : 'border-transparent'
              }`}
            >
              {t.nav.store}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('jobs')}
              className={`hover:text-[#081B4B] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                view === 'jobs'
                  ? 'text-[#081B4B] border-amber-500 font-semibold'
                  : 'border-transparent'
              }`}
            >
              {t.nav.jobs}
            </button>
            <button
              type="button"
              onClick={handleContactNav}
              className="hover:text-[#081B4B] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent"
            >
              {t.nav.contact}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('admin')}
              className={`hover:text-[#081B4B] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                view === 'admin'
                  ? 'text-[#081B4B] border-amber-500 font-semibold'
                  : 'border-transparent'
              }`}
            >
              {t.nav.admin}
            </button>
          </nav>

          {/* Zone 3: Language Switcher + Mobile Menu Trigger */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200"
              role="group"
              aria-label="Language switch"
            >
              <button
                type="button"
                onClick={() => handleSelectLanguage('bn')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  lang === 'bn'
                    ? 'bg-[#081B4B] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  lang === 'en'
                    ? 'bg-[#081B4B] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => navigateTo('international')}
                  className="text-left px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
                >
                  {t.nav.international}
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('store')}
                  className="text-left px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
                >
                  {t.nav.store}
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('jobs')}
                  className="text-left px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
                >
                  {t.nav.jobs}
                </button>
                <button
                  type="button"
                  onClick={handleContactNav}
                  className="text-left px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
                >
                  {t.nav.contact}
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('admin')}
                  className="text-left px-3 py-2.5 text-sm font-medium text-[#081B4B] hover:bg-slate-50 rounded-lg"
                >
                  {t.nav.admin}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home-gateway"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Navy Hero Banner */}
              <section className="bg-[#081B4B] text-white pt-14 pb-28 sm:pt-20 sm:pb-36">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                  <div className="max-w-3xl">
                    <h1
                      className="font-bold tracking-tight text-white leading-[1.15]"
                      style={{
                        fontSize: 'clamp(2rem, 3.8vw, 3.25rem)',
                        textWrap: 'balance',
                      }}
                    >
                      {t.hero.title}
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                      {t.hero.subtitle}
                    </p>
                  </div>
                </div>
              </section>

              {/* 3 Large Interactive Gateway Cards */}
              <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 sm:-mt-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Edunexa International */}
                  <button
                    type="button"
                    onClick={() => navigateTo('international')}
                    className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#081B4B] transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] bg-[#081B4B] overflow-hidden">
                        <SafeImage
                          src="/images/gateway-international.svg"
                          alt={t.gateway.cards.internationalTitle}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <div className="text-xs text-slate-500 font-medium tabular-nums mb-1.5">
                          {db.countries.length} {t.gateway.destinationsLabel} · {db.universities.length}{' '}
                          {t.gateway.universitiesLabel}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {t.gateway.cards.internationalTitle}
                        </h2>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                          {t.gateway.cards.internationalDesc}
                        </p>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#081B4B]">
                      <span>{t.gateway.cards.internationalCta}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Card 2: Edunexa Store */}
                  <button
                    type="button"
                    onClick={() => navigateTo('store')}
                    className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#081B4B] transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                        <SafeImage
                          src="/images/gateway-store.svg"
                          alt={t.gateway.cards.storeTitle}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <div className="text-xs text-slate-500 font-medium tabular-nums mb-1.5">
                          {db.categories.length} {t.gateway.categoriesLabel} · {db.products.length}{' '}
                          {t.gateway.productsLabel}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {t.gateway.cards.storeTitle}
                        </h2>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                          {t.gateway.cards.storeDesc}
                        </p>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#081B4B]">
                      <span>{t.gateway.cards.storeCta}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Card 3: Edunexa Global Jobs */}
                  <button
                    type="button"
                    onClick={() => navigateTo('jobs')}
                    className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#081B4B] transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] bg-[#081B4B] overflow-hidden">
                        <SafeImage
                          src="/images/gateway-jobs.svg"
                          alt={t.gateway.cards.jobsTitle}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <div className="text-xs text-slate-500 font-medium tabular-nums mb-1.5">
                          {db.jobs.length} {t.gateway.permitsLabel} · {totalOpenings}{' '}
                          {t.gateway.openingsLabel}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {t.gateway.cards.jobsTitle}
                        </h2>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                          {t.gateway.cards.jobsDesc}
                        </p>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#081B4B]">
                      <span>{t.gateway.cards.jobsCta}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </section>

              {/* Editorial Service Pillars */}
              <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
                <div className="max-w-2xl mb-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    {t.gateway.whyTitle}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
                    {t.gateway.whySubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {t.gateway.pillars.map((pillar) => (
                    <div
                      key={pillar.num}
                      className="bg-white rounded-xl border border-slate-200 p-6"
                    >
                      <div className="font-mono text-sm font-bold text-amber-700 mb-3">
                        {pillar.num}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{pillar.title}</h3>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{pillar.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Contact & Consultation Section */}
              <section
                id="contact-section"
                className="bg-white border-t border-slate-200 py-16 sm:py-20"
              >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                  <div className="lg:col-span-5 space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        {t.contact.title}
                      </h2>
                      <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                        {t.contact.subtitle}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-slate-100 text-sm">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[#081B4B] shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-slate-900">{t.contact.officeLabel}</div>
                          <div className="text-slate-600">{t.contact.officeAddress}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-[#081B4B] shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-slate-900">{t.contact.hoursLabel}</div>
                          <div className="text-slate-600">{t.contact.hoursValue}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-[#081B4B] shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-slate-900">{t.contact.phoneLabel}</div>
                          <div className="font-mono text-slate-600">{t.contact.phoneValue}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-[#081B4B] shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-slate-900">{t.contact.emailLabel}</div>
                          <div className="text-slate-600">{t.contact.emailValue}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <InquiryForm
                      lang={lang}
                      type="contact"
                      referenceTitle="General Consultation"
                      onSubmitted={fetchData}
                    />
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {view === 'international' && (
            <InternationalPortal
              lang={lang}
              countries={db.countries}
              universities={db.universities}
              selectedCountryId={selectedCountryId}
              onSelectCountry={setSelectedCountryId}
              onBackHome={() => navigateTo('home')}
              onInquirySaved={fetchData}
            />
          )}

          {view === 'store' && (
            <StorePortal
              lang={lang}
              categories={db.categories}
              products={db.products}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateCartQty={handleUpdateCartQty}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={() => setCart([])}
              onOrderPlaced={fetchData}
              onBackHome={() => navigateTo('home')}
            />
          )}

          {view === 'jobs' && (
            <JobsPortal
              lang={lang}
              jobs={db.jobs}
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
              onBackHome={() => navigateTo('home')}
              onInquirySaved={fetchData}
            />
          )}

          {view === 'admin' && (
            <AdminPortal
              lang={lang}
              db={db}
              onRefresh={fetchData}
              onBackHome={() => navigateTo('home')}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Professional Footer */}
      <footer className="bg-[#081B4B] text-slate-300 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="inline-flex items-center gap-2 text-lg font-extrabold text-white tracking-tight">
              <span className="w-1 h-5 bg-amber-400 rounded-full" aria-hidden="true" />
              <span>{t.brand}</span>
            </div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">{t.footer.about}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white tracking-wide mb-3.5">
              {t.footer.portalsTitle}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('international')}
                  className="hover:text-amber-300 transition-colors"
                >
                  {t.gateway.cards.internationalTitle}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('store')}
                  className="hover:text-amber-300 transition-colors"
                >
                  {t.gateway.cards.storeTitle}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('jobs')}
                  className="hover:text-amber-300 transition-colors"
                >
                  {t.gateway.cards.jobsTitle}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white tracking-wide mb-3.5">
              {t.footer.companyTitle}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('admin')}
                  className="hover:text-amber-300 transition-colors"
                >
                  {t.breadcrumbs.admin}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowLangPopup(true)}
                  className="inline-flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>English / বাংলা</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleContactNav}
                  className="hover:text-amber-300 transition-colors"
                >
                  {t.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white tracking-wide mb-3.5">
              {t.footer.contactTitle}
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p>{t.contact.officeAddress}</p>
              <p className="font-mono">{t.contact.phoneValue}</p>
              <p>{t.contact.emailValue}</p>
              <div className="pt-2 flex items-center gap-4 text-xs font-medium text-amber-300">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:underline">
                  Facebook
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:underline">
                  LinkedIn
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:underline">
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span>{t.footer.rights}</span>
            <span>{t.footer.privacy}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
