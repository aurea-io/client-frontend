export interface TenantBranding {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
  fontFamily?: string;
  slogan?: string;
  tagline?: string;
}

export interface TenantSettings {
  branding?: TenantBranding;
  address?: string;
  phone?: string;
  instagram?: string;
  whatsapp?: string;
  contact?: {
    address?: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
  };
  businessHours?: {
    days?: string;
    open?: string;
    close?: string;
  };
  currency?: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  vertical: 'gastronomy' | 'beauty' | 'retail' | 'services' | string;
  settings?: TenantSettings;
  capabilities?: string[];
  isActive: boolean;
}

export interface CatalogItem {
  id: string;
  title: string;
  name?: string;
  description?: string;
  priceCents: number;
  category?: string;
  isService?: boolean;
  durationMin?: number;
  imageUrl?: string;
  variants?: Array<{
    name: string;
    priceCentsDelta?: number;
  }>;
  isActive?: boolean;
  stock?: number;
}

export interface CartItem {
  item: CatalogItem;
  quantity: number;
  selectedVariant?: string;
  notes?: string;
}

export interface BookingPayload {
  catalogItemId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  date: string;
  startTime: string;
  durationMin?: number;
  notes?: string;
}

export interface TableBookingPayload {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  date: string;
  time: string;
  partySize: number;
  notes?: string;
}

export interface OrderPayload {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  channel: 'takeaway' | 'delivery' | 'dine_in';
  lines: Array<{
    catalogItemId: string;
    quantity: number;
    notes?: string;
  }>;
  notes?: string;
}
