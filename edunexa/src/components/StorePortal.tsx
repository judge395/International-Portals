import { useMemo, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  Radio,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import type { Language, StoreCategory, StoreOrder, StoreProduct } from '../types';
import { uiCopy } from '../i18n/translations';
import { SafeImage } from './SafeImage';

export interface CartEntry {
  product: StoreProduct;
  quantity: number;
}

interface StorePortalProps {
  lang: Language;
  categories: StoreCategory[];
  products: StoreProduct[];
  cart: CartEntry[];
  onAddToCart: (product: StoreProduct) => void;
  onUpdateCartQty: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: () => void;
  onBackHome: () => void;
}

export function StorePortal({
  lang,
  categories,
  products,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  onOrderPlaced,
  onBackHome,
}: StorePortalProps) {
  const t = uiCopy[lang];
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');

  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('cod');
  const [checkoutError, setCheckoutError] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<StoreOrder | null>(null);

  const totalBagCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart]
  );

  const deliveryFee = cart.length === 0 ? 0 : city.toLowerCase().includes('dhaka') ? 80 : 140;
  const grandTotal = subtotal + deliveryFee;

  const liveFeaturedProducts = useMemo(
    () => products.filter((p) => p.isLiveFeatured),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const catMatch =
        selectedCategoryId === 'all'
          ? true
          : selectedCategoryId === 'cat-live'
            ? p.categoryId === 'cat-live' || Boolean(p.isLiveFeatured)
            : p.categoryId === selectedCategoryId;

      if (!catMatch) return false;
      if (!q) return true;
      return (
        p.name[lang].toLowerCase().includes(q) ||
        p.name.en.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, selectedCategoryId, searchQuery, lang]);

  function getCategoryName(categoryId: string): string {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name[lang] : '';
  }

  function handleAddAndOpen(product: StoreProduct) {
    onAddToCart(product);
    setCheckoutStep('bag');
    setIsBagOpen(true);
  }

  async function handleCheckoutSubmit(e: FormEvent) {
    e.preventDefault();
    setCheckoutError('');
    if (!customerName.trim() || phone.trim().length < 6 || !address.trim()) {
      setCheckoutError(t.forms.validationError);
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          city: city.trim() || 'Dhaka',
          address: address.trim(),
          paymentMethod,
          items: cart.map((entry) => ({
            productId: entry.product.id,
            name: entry.product.name.en,
            price: entry.product.price,
            quantity: entry.quantity,
            image: entry.product.image,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to place order');
      }
      const order: StoreOrder = await res.json();
      setConfirmedOrder(order);
      setCheckoutStep('confirmed');
      onClearCart();
      onOrderPlaced();
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Unable to place order');
    } finally {
      setSubmittingOrder(false);
    }
  }

  return (
    <motion.section
      key="store-portal"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
    >
      {/* Top Breadcrumb & Bag Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-[#081B4B] hover:text-[#081B4B] transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.breadcrumbs.backHome}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCheckoutStep('bag');
            setIsBagOpen(true);
          }}
          className="inline-flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] rounded-lg transition-colors whitespace-nowrap"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>{t.store.cartButton}</span>
          <span className="font-mono tabular-nums bg-white/15 px-2 py-0.5 rounded">
            {totalBagCount}
          </span>
        </button>
      </div>

      {/* Store Header */}
      <div className="max-w-2xl mb-8">
        <div className="text-xs font-semibold text-amber-700 tracking-wide mb-2">
          {t.breadcrumbs.store}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          {t.store.heading}
        </h1>
        <p className="text-base text-slate-600 mt-3 leading-relaxed">
          {t.store.subheading}
        </p>
      </div>

      {/* Category Cards Showcase */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {categories.map((cat) => {
          const isActive = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(isActive ? 'all' : cat.id)}
              className={`group text-left rounded-xl border overflow-hidden transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-[#081B4B] text-white border-[#081B4B] shadow-md'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-[#081B4B]'
              }`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <SafeImage
                  src={cat.image}
                  alt={cat.name[lang]}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="p-3.5">
                <div className="flex items-center gap-1.5">
                  {cat.isLive && (
                    <Radio className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-red-600'}`} />
                  )}
                  <h3 className="text-sm font-bold truncate">{cat.name[lang]}</h3>
                </div>
                <p
                  className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                    isActive ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {cat.description[lang]}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Shopping Featured Section */}
      {(selectedCategoryId === 'all' || selectedCategoryId === 'cat-live') &&
        liveFeaturedProducts.length > 0 && (
          <div className="mb-10 bg-[#081B4B] text-white rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1.5">
                  <Radio className="w-4 h-4" />
                  <span>LIVE SHOPPING</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{t.store.liveShowcaseTitle}</h2>
                <p className="text-sm text-slate-300 mt-1">{t.store.liveShowcaseDesc}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {liveFeaturedProducts.slice(0, 4).map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white/5 border border-white/15 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs text-amber-300 font-medium mb-1">
                      {prod.liveSchedule?.[lang] || prod.sku}
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-2">{prod.name[lang]}</h3>
                    <div className="mt-2 font-mono text-base font-bold text-amber-400 tabular-nums">
                      ৳{prod.price.toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={prod.stock <= 0}
                    onClick={() => handleAddAndOpen(prod)}
                    className="mt-4 w-full py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {prod.stock > 0 ? t.store.addToCart : t.store.outOfStock}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategoryId === 'all'
                ? 'bg-[#081B4B] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
            }`}
          >
            {t.store.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategoryId === cat.id
                  ? 'bg-[#081B4B] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.name[lang]}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.store.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#081B4B]"
          />
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          {t.store.emptyProducts}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  <SafeImage
                    src={product.image}
                    alt={product.name[lang]}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
                    <span>{getCategoryName(product.categoryId)}</span>
                    <span className="font-mono">{product.sku}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                    {product.name[lang]}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {product.description[lang]}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2">
                <div className="flex items-baseline justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                      ৳{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="font-mono text-xs text-slate-400 line-through tabular-nums">
                        ৳{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium tabular-nums ${
                      product.stock > 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {product.stock > 0 ? `${t.store.inStock} (${product.stock})` : t.store.outOfStock}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(product)}
                    className="py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {t.store.quickView}
                  </button>
                  <button
                    type="button"
                    disabled={product.stock <= 0}
                    onClick={() => handleAddAndOpen(product)}
                    className="py-2.5 px-3 text-xs font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {t.store.addToCart}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl grid grid-cols-1 sm:grid-cols-2"
            >
              <div className="aspect-[4/3] sm:aspect-auto bg-slate-100">
                <SafeImage
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name[lang]}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs text-slate-500">
                      {quickViewProduct.sku}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(null)}
                      aria-label="Close"
                      className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {quickViewProduct.name[lang]}
                  </h3>
                  <div className="mt-2 font-mono text-xl font-bold text-[#081B4B] tabular-nums">
                    ৳{quickViewProduct.price.toLocaleString()}
                  </div>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {quickViewProduct.description[lang]}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 mb-1">
                      {t.store.specs}
                    </div>
                    <div className="text-xs text-slate-800">{quickViewProduct.specs[lang]}</div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={quickViewProduct.stock <= 0}
                  onClick={() => {
                    const p = quickViewProduct;
                    setQuickViewProduct(null);
                    handleAddAndOpen(p);
                  }}
                  className="mt-6 w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] disabled:opacity-50 rounded-lg transition-colors"
                >
                  {quickViewProduct.stock > 0 ? t.store.addToCart : t.store.outOfStock}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-Over Shopping Bag & Checkout Drawer */}
      <AnimatePresence>
        {isBagOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setIsBagOpen(false)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  {checkoutStep === 'bag'
                    ? t.store.cartTitle
                    : checkoutStep === 'checkout'
                      ? t.store.checkoutTitle
                      : t.store.orderSuccessTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBagOpen(false)}
                  aria-label="Close"
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {checkoutStep === 'confirmed' && confirmedOrder ? (
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-base">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>{t.store.orderSuccessTitle}</span>
                      </div>
                      <p className="text-xs text-emerald-700 mt-2 leading-relaxed">
                        {t.store.orderSuccessDesc}
                      </p>
                      <div className="mt-3 font-mono text-xs font-semibold text-emerald-900">
                        {t.store.orderIdLabel}: {confirmedOrder.id}
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                      <div className="font-semibold text-slate-900">{confirmedOrder.customerName}</div>
                      <div className="text-slate-600">{confirmedOrder.phone}</div>
                      <div className="text-slate-600">
                        {confirmedOrder.address}, {confirmedOrder.city}
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-sm tabular-nums">
                        <span>{t.store.total}</span>
                        <span>৳{confirmedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsBagOpen(false);
                        setCheckoutStep('bag');
                      }}
                      className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] rounded-lg"
                    >
                      {t.store.continueShopping}
                    </button>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="py-16 text-center text-sm text-slate-500">
                    {t.store.cartEmpty}
                  </div>
                ) : checkoutStep === 'bag' ? (
                  <div className="space-y-4">
                    {cart.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex gap-3.5 pb-4 border-b border-slate-100"
                      >
                        <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <SafeImage
                            src={product.image}
                            alt={product.name[lang]}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {product.name[lang]}
                          </div>
                          <div className="font-mono text-xs font-bold text-[#081B4B] mt-0.5 tabular-nums">
                            ৳{product.price.toLocaleString()}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="inline-flex items-center border border-slate-200 rounded-lg">
                              <button
                                type="button"
                                onClick={() => onUpdateCartQty(product.id, -1)}
                                className="p-1.5 text-slate-600 hover:text-slate-900"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 text-xs font-mono font-semibold tabular-nums">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateCartQty(product.id, 1)}
                                className="p-1.5 text-slate-600 hover:text-slate-900"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveFromCart(product.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('bag')}
                      className="text-xs font-semibold text-[#081B4B] hover:underline"
                    >
                      ← {t.store.backToBag}
                    </button>

                    {checkoutError && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                        {checkoutError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.store.customerName} *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#081B4B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.store.phone} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#081B4B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.store.city}
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#081B4B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.store.address} *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#081B4B] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t.store.paymentMethod}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'cod', label: t.store.paymentCod },
                          { id: 'bkash', label: t.store.paymentBkash },
                          { id: 'nagad', label: t.store.paymentNagad },
                          { id: 'card', label: t.store.paymentCard },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setPaymentMethod(opt.id as 'cod' | 'bkash' | 'nagad' | 'card')
                            }
                            className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-colors ${
                              paymentMethod === opt.id
                                ? 'bg-[#081B4B] text-white border-[#081B4B]'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {cart.length > 0 && checkoutStep !== 'confirmed' && (
                <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex justify-between text-xs text-slate-600 tabular-nums">
                    <span>{t.store.subtotal}</span>
                    <span className="font-mono">৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 tabular-nums">
                    <span>{t.store.delivery}</span>
                    <span className="font-mono">৳{deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200 tabular-nums">
                    <span>{t.store.total}</span>
                    <span className="font-mono">৳{grandTotal.toLocaleString()}</span>
                  </div>

                  {checkoutStep === 'bag' ? (
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('checkout')}
                      className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#081B4B] hover:bg-[#102A6B] rounded-lg transition-colors"
                    >
                      {t.store.checkoutBtn}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={submittingOrder}
                      className="w-full py-3 px-4 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-lg transition-colors"
                    >
                      {submittingOrder ? t.forms.submitting : t.store.placeOrder}
                    </button>
                  )}
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
