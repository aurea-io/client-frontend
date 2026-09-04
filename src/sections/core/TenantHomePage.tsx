import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Utensils, Calendar, Users, ShoppingBag, Loader2, Store, AlertCircle } from 'lucide-react';
import type { Tenant, CatalogItem } from '../../types';
import { apiClient } from '../../api/client';
import { TenantHeader } from './TenantHeader';
import { CartDrawer } from '../commerce/orders/CartDrawer';
import { CatalogView } from '../commerce/catalog/CatalogView';
import { BookingsView } from '../services/bookings/BookingsView';
import { TablesView } from '../gastronomy/tables/TablesView';

interface TenantHomePageProps {
  initialTab?: 'catalog' | 'bookings' | 'tables';
}

export const TenantHomePage: React.FC<TenantHomePageProps> = ({ initialTab }) => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveTabFromPath = (): 'catalog' | 'bookings' | 'tables' => {
    if (location.pathname.includes('/services/bookings')) return 'bookings';
    if (location.pathname.includes('/gastronomy/tables')) return 'tables';
    if (location.pathname.includes('/commerce/catalog')) return 'catalog';
    return initialTab || 'catalog';
  };

  const [activeTab, setActiveTab] = useState<'catalog' | 'bookings' | 'tables'>(resolveTabFromPath);

  useEffect(() => {
    setActiveTab(resolveTabFromPath());
  }, [location.pathname, initialTab]);

  useEffect(() => {
    async function loadTenantData() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);

      try {
        const [bootstrapRes, catalogRes] = await Promise.all([
          apiClient.get<{
            publicId: string;
            tenant: Pick<Tenant, 'name' | 'vertical' | 'settings'>;
            capabilities?: string[];
          }>(`/bootstrap/${encodeURIComponent(slug)}`),
          apiClient.get<{ items: CatalogItem[] }>(`/public/${encodeURIComponent(slug)}/catalog`),
        ]);

        const bootstrapData = bootstrapRes.data;
        const tenantObj: Tenant = {
          id: bootstrapData.publicId,
          slug: bootstrapData.publicId,
          name: bootstrapData.tenant.name,
          vertical: bootstrapData.tenant.vertical,
          settings: bootstrapData.tenant.settings,
          capabilities: bootstrapData.capabilities || [],
          isActive: true,
        };

        setTenant(tenantObj);
        setCatalogItems(catalogRes.data.items || []);

        // Choose initial tab based on vertical
        if (tenantObj.vertical === 'services' || tenantObj.vertical === 'beauty') {
          // If has services only, default can still be catalog or bookings
        }
      } catch (err: any) {
        console.error('Error fetching tenant:', err);
        setError('No se pudo encontrar el comercio o no se encuentra activo actualmente.');
      } finally {
        setIsLoading(false);
      }
    }

    loadTenantData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090a0f] text-zinc-300">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
        <p className="text-sm font-medium tracking-wide text-zinc-400">Cargando experiencia digital...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090a0f] text-zinc-300 p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Comercio no encontrado</h2>
        <p className="text-sm text-zinc-400 max-w-sm mb-6">
          {error || 'La URL ingresada no coincide con un local activo en la red Áurea.'}
        </p>
      </div>
    );
  }

  const isGastronomy = tenant.vertical === 'gastronomy';
  const hasBookings = tenant.capabilities?.includes('bookings') || tenant.vertical === 'beauty' || tenant.vertical === 'services' || catalogItems.some((i: CatalogItem) => i.isService);
  const hasTables = isGastronomy;

  const services = catalogItems.filter((i: CatalogItem) => i.isService);

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-zinc-100">
      {/* Header */}
      <TenantHeader tenant={tenant} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 max-w-lg mx-auto">
          <button
            onClick={() => {
              setActiveTab('catalog');
              navigate(`/${slug}/commerce/catalog`);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'catalog'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>{isGastronomy ? 'Carta & Menú' : 'Catálogo'}</span>
          </button>

          {hasBookings && (
            <button
              onClick={() => {
                setActiveTab('bookings');
                navigate(`/${slug}/services/bookings`);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'bookings'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Turnos Online</span>
            </button>
          )}

          {hasTables && (
            <button
              onClick={() => {
                setActiveTab('tables');
                navigate(`/${slug}/gastronomy/tables`);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'tables'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Reservar Mesa</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="pt-2">
          {activeTab === 'catalog' && (
            <CatalogView tenant={tenant} items={catalogItems} />
          )}

          {activeTab === 'bookings' && (
            <BookingsView tenant={tenant} services={services.length > 0 ? services : catalogItems} />
          )}

          {activeTab === 'tables' && (
            <TablesView tenant={tenant} />
          )}
        </div>
      </main>

      {/* Cart Drawer */}
      <CartDrawer tenant={tenant} />

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} {tenant.name} · Impulsado por la plataforma digital <strong className="text-zinc-400">Áurea</strong></p>
      </footer>
    </div>
  );
};
