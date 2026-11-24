import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initialSeedData } from './src/data/seedData.ts';
import type {
  CountryPortal,
  EdunexaDatabase,
  InquiryRecord,
  StoreCategory,
  StoreOrder,
  StoreProduct,
  University,
  WorkPermitJob,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'edunexa-db.json');

function ensureDb(): EdunexaDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialSeedData, null, 2), 'utf-8');
    return structuredClone(initialSeedData);
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<EdunexaDatabase>;
    return {
      countries: parsed.countries ?? initialSeedData.countries,
      universities: parsed.universities ?? initialSeedData.universities,
      categories: parsed.categories ?? initialSeedData.categories,
      products: parsed.products ?? initialSeedData.products,
      jobs: parsed.jobs ?? initialSeedData.jobs,
      inquiries: parsed.inquiries ?? [],
      orders: parsed.orders ?? [],
    };
  } catch {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialSeedData, null, 2), 'utf-8');
    return structuredClone(initialSeedData);
  }
}

function saveDb(db: EdunexaDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Read full portal dataset
  app.get('/api/data', (_req, res) => {
    const db = ensureDb();
    res.json(db);
  });

  // --- Countries CRUD ---
  app.post('/api/countries', (req, res) => {
    const db = ensureDb();
    const body = req.body as Partial<CountryPortal>;
    if (!body.name?.en?.trim()) {
      res.status(400).json({ error: 'Country English name is required.' });
      return;
    }
    const id = makeId('country');
    const slug = (body.slug || body.name.en)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const record: CountryPortal = {
      id,
      slug: slug || id,
      code: (body.code || body.name.en.slice(0, 2)).toUpperCase(),
      name: { en: body.name.en.trim(), bn: body.name.bn?.trim() || body.name.en.trim() },
      tagline: {
        en: body.tagline?.en?.trim() || 'Student Visa & University Admissions',
        bn: body.tagline?.bn?.trim() || 'স্টুডেন্ট ভিসা ও ইউনিভার্সিটি অ্যাডমিশন',
      },
      overview: {
        en: body.overview?.en?.trim() || 'Explore partner universities and direct admission guidance.',
        bn: body.overview?.bn?.trim() || 'পার্টনার ইউনিভার্সিটি ও সরাসরি অ্যাডমিশন গাইডলাইন দেখুন।',
      },
      visaTimeline: {
        en: body.visaTimeline?.en?.trim() || '4 – 8 Weeks',
        bn: body.visaTimeline?.bn?.trim() || '৪ – ৮ সপ্তাহ',
      },
      intakes: {
        en: body.intakes?.en?.trim() || 'March & September',
        bn: body.intakes?.bn?.trim() || 'মার্চ ও সেপ্টেম্বর',
      },
      languageRequirement: {
        en: body.languageRequirement?.en?.trim() || 'IELTS / University Placement',
        bn: body.languageRequirement?.bn?.trim() || 'IELTS / ইউনিভার্সিটি প্লেসমেন্ট',
      },
      image: body.image?.trim() || '/images/country-generic.svg',
      highlights: {
        en: body.highlights?.en?.length ? body.highlights.en : ['Direct university admission support', 'Document & visa review'],
        bn: body.highlights?.bn?.length ? body.highlights.bn : ['সরাসরি ইউনিভার্সিটি অ্যাডমিশন সহায়তা', 'ডকুমেন্ট ও ভিসা রিভিউ'],
      },
    };
    db.countries.push(record);
    saveDb(db);
    res.status(201).json(record);
  });

  app.put('/api/countries/:id', (req, res) => {
    const db = ensureDb();
    const idx = db.countries.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Country not found' });
      return;
    }
    const current = db.countries[idx];
    const body = req.body as Partial<CountryPortal>;
    db.countries[idx] = {
      ...current,
      ...body,
      id: current.id,
      name: body.name ?? current.name,
      tagline: body.tagline ?? current.tagline,
      overview: body.overview ?? current.overview,
      visaTimeline: body.visaTimeline ?? current.visaTimeline,
      intakes: body.intakes ?? current.intakes,
      languageRequirement: body.languageRequirement ?? current.languageRequirement,
      highlights: body.highlights ?? current.highlights,
    };
    saveDb(db);
    res.json(db.countries[idx]);
  });

  app.delete('/api/countries/:id', (req, res) => {
    const db = ensureDb();
    db.countries = db.countries.filter((c) => c.id !== req.params.id);
    db.universities = db.universities.filter((u) => u.countryId !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  // --- Universities CRUD ---
  app.post('/api/universities', (req, res) => {
    const db = ensureDb();
    const body = req.body as Partial<University>;
    if (!body.countryId || !body.name?.en?.trim()) {
      res.status(400).json({ error: 'countryId and English university name are required.' });
      return;
    }
    const uni: University = {
      id: makeId('uni'),
      countryId: body.countryId,
      name: { en: body.name.en.trim(), bn: body.name.bn?.trim() || body.name.en.trim() },
      city: { en: body.city?.en?.trim() || 'Main Campus', bn: body.city?.bn?.trim() || 'প্রধান ক্যাম্পাস' },
      programs: {
        en: body.programs?.en?.trim() || 'Undergraduate & Graduate Programs',
        bn: body.programs?.bn?.trim() || 'আন্ডারগ্রাজুয়েট ও মাস্টার্স প্রোগ্রাম',
      },
      tuitionRange: { en: body.tuitionRange?.en?.trim() || 'USD 3,500 / year', bn: body.tuitionRange?.bn?.trim() || '৩,৫০০ ডলার / বছর' },
      scholarship: { en: body.scholarship?.en?.trim() || 'Merit Waiver Available', bn: body.scholarship?.bn?.trim() || 'মেরিট স্কলারশিপ সুবিধা' },
      intake: { en: body.intake?.en?.trim() || 'March & September', bn: body.intake?.bn?.trim() || 'মার্চ ও সেপ্টেম্বর' },
      rankingNote: { en: body.rankingNote?.en?.trim() || 'Partner Institution', bn: body.rankingNote?.bn?.trim() || 'পার্টনার প্রতিষ্ঠান' },
    };
    db.universities.push(uni);
    saveDb(db);
    res.status(201).json(uni);
  });

  app.put('/api/universities/:id', (req, res) => {
    const db = ensureDb();
    const idx = db.universities.findIndex((u) => u.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'University not found' });
      return;
    }
    const current = db.universities[idx];
    db.universities[idx] = { ...current, ...req.body, id: current.id };
    saveDb(db);
    res.json(db.universities[idx]);
  });

  app.delete('/api/universities/:id', (req, res) => {
    const db = ensureDb();
    db.universities = db.universities.filter((u) => u.id !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  // --- Store Categories CRUD ---
  app.post('/api/categories', (req, res) => {
    const db = ensureDb();
    const body = req.body as Partial<StoreCategory>;
    if (!body.name?.en?.trim()) {
      res.status(400).json({ error: 'Category English name is required.' });
      return;
    }
    const id = makeId('cat');
    const slug = (body.slug || body.name.en).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category: StoreCategory = {
      id,
      slug,
      name: { en: body.name.en.trim(), bn: body.name.bn?.trim() || body.name.en.trim() },
      description: {
        en: body.description?.en?.trim() || 'Curated collection',
        bn: body.description?.bn?.trim() || 'বাছাইকৃত পণ্যের সংগ্রহ',
      },
      image: body.image?.trim() || '/images/store-lifestyle.svg',
      isLive: Boolean(body.isLive),
    };
    db.categories.push(category);
    saveDb(db);
    res.status(201).json(category);
  });

  app.delete('/api/categories/:id', (req, res) => {
    const db = ensureDb();
    db.categories = db.categories.filter((c) => c.id !== req.params.id);
    db.products = db.products.filter((p) => p.categoryId !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  // --- Store Products CRUD ---
  app.post('/api/products', (req, res) => {
    const db = ensureDb();
    const body = req.body as Partial<StoreProduct>;
    if (!body.categoryId || !body.name?.en?.trim() || typeof body.price !== 'number') {
      res.status(400).json({ error: 'categoryId, name, and numeric price are required.' });
      return;
    }
    const prod: StoreProduct = {
      id: makeId('prod'),
      categoryId: body.categoryId,
      sku: body.sku?.trim() || `EDX-${Math.floor(1000 + Math.random() * 9000)}`,
      name: { en: body.name.en.trim(), bn: body.name.bn?.trim() || body.name.en.trim() },
      description: {
        en: body.description?.en?.trim() || 'Quality verified item from Edunexa Store.',
        bn: body.description?.bn?.trim() || 'এডুনেক্সা স্টোরের মানসম্মত পণ্য।',
      },
      specs: {
        en: body.specs?.en?.trim() || 'Standard Edition',
        bn: body.specs?.bn?.trim() || 'স্ট্যান্ডার্ড সংস্করণ',
      },
      price: Math.max(0, body.price),
      originalPrice: body.originalPrice,
      stock: typeof body.stock === 'number' ? Math.max(0, body.stock) : 10,
      image: body.image?.trim() || '/images/store-electronics.svg',
      isLiveFeatured: Boolean(body.isLiveFeatured),
      liveSchedule: body.liveSchedule,
    };
    db.products.unshift(prod);
    saveDb(db);
    res.status(201).json(prod);
  });

  app.put('/api/products/:id', (req, res) => {
    const db = ensureDb();
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const current = db.products[idx];
    db.products[idx] = { ...current, ...req.body, id: current.id };
    saveDb(db);
    res.json(db.products[idx]);
  });

  app.delete('/api/products/:id', (req, res) => {
    const db = ensureDb();
    db.products = db.products.filter((p) => p.id !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  // --- Work Permit Jobs CRUD ---
  app.post('/api/jobs', (req, res) => {
    const db = ensureDb();
    const body = req.body as Partial<WorkPermitJob>;
    if (!body.title?.en?.trim() || !body.country?.en?.trim()) {
      res.status(400).json({ error: 'Job title and country are required.' });
      return;
    }
    const id = makeId('job');
    const slug = (body.slug || body.title.en).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const job: WorkPermitJob = {
      id,
      slug,
      country: { en: body.country.en.trim(), bn: body.country.bn?.trim() || body.country.en.trim() },
      title: { en: body.title.en.trim(), bn: body.title.bn?.trim() || body.title.en.trim() },
      sector: { en: body.sector?.en?.trim() || 'Skilled Operations', bn: body.sector?.bn?.trim() || 'দক্ষ অপারেশনস' },
      salaryRange: { en: body.salaryRange?.en?.trim() || 'USD 800 – 1,200 / month', bn: body.salaryRange?.bn?.trim() || '৮০০ – ১,২০০ ডলার / মাস' },
      contractDuration: { en: body.contractDuration?.en?.trim() || '2 Years', bn: body.contractDuration?.bn?.trim() || '২ বছর' },
      processingTime: { en: body.processingTime?.en?.trim() || '45 – 60 Days', bn: body.processingTime?.bn?.trim() || '৪৫ – ৬০ দিন' },
      openings: typeof body.openings === 'number' ? Math.max(1, body.openings) : 20,
      image: body.image?.trim() || '/images/job-belarus.svg',
      description: {
        en: body.description?.en?.trim() || 'Official employer-sponsored work permit opportunity.',
        bn: body.description?.bn?.trim() || 'এমপ্লয়ার-স্পন্সরড অফিশিয়াল ওয়ার্ক পারমিট সুযোগ।',
      },
      requirements: {
        en: body.requirements?.en?.length ? body.requirements.en : ['Valid Passport', 'Police Clearance', 'Medical Fitness'],
        bn: body.requirements?.bn?.length ? body.requirements.bn : ['বৈধ পাসপোর্ট', 'পুলিশ ক্লিয়ারেন্স', 'মেডিকেল ফিটনেস'],
      },
      benefits: {
        en: body.benefits?.en?.length ? body.benefits.en : ['Accommodation support', 'Contract protection'],
        bn: body.benefits?.bn?.length ? body.benefits.bn : ['আবাসন সহায়তা', 'কন্ট্রাক্ট সুরক্ষা'],
      },
    };
    db.jobs.push(job);
    saveDb(db);
    res.status(201).json(job);
  });

  app.put('/api/jobs/:id', (req, res) => {
    const db = ensureDb();
    const idx = db.jobs.findIndex((j) => j.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Job permit not found' });
      return;
    }
    const current = db.jobs[idx];
    db.jobs[idx] = { ...current, ...req.body, id: current.id };
    saveDb(db);
    res.json(db.jobs[idx]);
  });

  app.delete('/api/jobs/:id', (req, res) => {
    const db = ensureDb();
    db.jobs = db.jobs.filter((j) => j.id !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  // --- Inquiries (Counseling, Work Permit Applications, Contact) ---
  app.post('/api/inquiries', (req, res) => {
    const db = ensureDb();
    const body = req.body as Partial<InquiryRecord>;
    if (!body.fullName?.trim() || !body.phone?.trim()) {
      res.status(400).json({ error: 'Name and phone number are required.' });
      return;
    }
    const record: InquiryRecord = {
      id: makeId('INQ').toUpperCase(),
      type: body.type || 'contact',
      referenceTitle: body.referenceTitle?.trim() || 'General Inquiry',
      fullName: body.fullName.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || '',
      passportOrEducation: body.passportOrEducation?.trim() || '',
      message: body.message?.trim() || '',
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    db.inquiries.unshift(record);
    saveDb(db);
    res.status(201).json(record);
  });

  app.patch('/api/inquiries/:id', (req, res) => {
    const db = ensureDb();
    const item = db.inquiries.find((i) => i.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }
    if (req.body.status) {
      item.status = req.body.status;
    }
    saveDb(db);
    res.json(item);
  });

  // --- Store Orders ---
  app.post('/api/orders', (req, res) => {
    const db = ensureDb();
    const body = req.body as Partial<StoreOrder>;
    if (!body.customerName?.trim() || !body.phone?.trim() || !body.address?.trim() || !body.items?.length) {
      res.status(400).json({ error: 'Customer details and at least one item are required.' });
      return;
    }

    let subtotal = 0;
    const verifiedItems = body.items.map((item) => {
      const prod = db.products.find((p) => p.id === item.productId);
      const unitPrice = prod ? prod.price : item.price;
      const qty = Math.max(1, Number(item.quantity) || 1);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - qty);
      }
      subtotal += unitPrice * qty;
      return {
        productId: item.productId,
        name: item.name,
        price: unitPrice,
        quantity: qty,
        image: prod?.image || item.image,
      };
    });

    const deliveryFee = body.city?.toLowerCase().includes('dhaka') ? 80 : 140;
    const order: StoreOrder = {
      id: `EDX-${Math.floor(100000 + Math.random() * 899999)}`,
      customerName: body.customerName.trim(),
      phone: body.phone.trim(),
      address: body.address.trim(),
      city: body.city?.trim() || 'Dhaka',
      paymentMethod: body.paymentMethod || 'cod',
      items: verifiedItems,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(order);
    saveDb(db);
    res.status(201).json(order);
  });

  app.patch('/api/orders/:id', (req, res) => {
    const db = ensureDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (req.body.status) {
      order.status = req.body.status;
    }
    saveDb(db);
    res.json(order);
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Edunexa server listening on http://localhost:${PORT}`);
  });
}

startServer();
