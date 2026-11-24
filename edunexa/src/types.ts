export type Language = 'en' | 'bn';

export interface BilingualText {
  en: string;
  bn: string;
}

export interface CountryPortal {
  id: string;
  slug: string;
  code: string;
  name: BilingualText;
  tagline: BilingualText;
  overview: BilingualText;
  visaTimeline: BilingualText;
  intakes: BilingualText;
  languageRequirement: BilingualText;
  image: string;
  highlights: {
    en: string[];
    bn: string[];
  };
}

export interface University {
  id: string;
  countryId: string;
  name: BilingualText;
  city: BilingualText;
  programs: BilingualText;
  tuitionRange: BilingualText;
  scholarship: BilingualText;
  intake: BilingualText;
  rankingNote: BilingualText;
}

export interface StoreCategory {
  id: string;
  slug: string;
  name: BilingualText;
  description: BilingualText;
  image: string;
  isLive?: boolean;
}

export interface StoreProduct {
  id: string;
  categoryId: string;
  sku: string;
  name: BilingualText;
  description: BilingualText;
  specs: BilingualText;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  isLiveFeatured?: boolean;
  liveSchedule?: BilingualText;
}

export interface WorkPermitJob {
  id: string;
  slug: string;
  country: BilingualText;
  title: BilingualText;
  sector: BilingualText;
  salaryRange: BilingualText;
  contractDuration: BilingualText;
  processingTime: BilingualText;
  openings: number;
  image: string;
  description: BilingualText;
  requirements: {
    en: string[];
    bn: string[];
  };
  benefits: {
    en: string[];
    bn: string[];
  };
}

export interface InquiryRecord {
  id: string;
  type: 'admission' | 'job' | 'contact';
  referenceTitle: string;
  fullName: string;
  phone: string;
  email: string;
  passportOrEducation: string;
  message: string;
  status: 'new' | 'reviewing' | 'contacted';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface StoreOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'confirmed' | 'processing' | 'shipped';
  createdAt: string;
}

export interface EdunexaDatabase {
  countries: CountryPortal[];
  universities: University[];
  categories: StoreCategory[];
  products: StoreProduct[];
  jobs: WorkPermitJob[];
  inquiries: InquiryRecord[];
  orders: StoreOrder[];
}
