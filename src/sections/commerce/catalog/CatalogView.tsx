import React, { useState, useMemo } from 'react';
import { Search, Plus, ShoppingBag, Check, Sparkles } from 'lucide-react';
import type { CatalogItem, Tenant } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { useCartStore } from '../../../store/cartStore';

interface CatalogViewProps {
  tenant: Tenant;
  items: CatalogItem[];
}

export const CatalogView: React.FC<CatalogViewProps> = ({ tenant, items }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const { addItem, getItemCount, setIsOpen } = useCartStore();
  const primaryColor = tenant.settings?.branding?.primaryColor || '#7c3aed';

  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [items, search, selectedCategory]);

  const handleAdd = (item: CatalogItem) => {
    addItem(item, 1);
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const cartCount = getItemCount();

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en la carta o catálogo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Floating / Top cart trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition shrink-0"
        >
          <ShoppingBag className="w-4 h-4 text-purple-400" />
          <span>Ver Carrito</span>
          {cartCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-purple-600 text-[11px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            Todos ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
        </div>
      )}

      {/* Item Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-base font-medium text-zinc-400">No se encontraron artículos</p>
          <p className="text-xs text-zinc-500 mt-1">Probá con otro término de búsqueda o categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isAdded = addedItemIds[item.id];
            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-200 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition">
                      {item.title}
                    </h3>
                    {item.isService && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold shrink-0">
                        {item.durationMin ? `${item.durationMin} min` : 'Servicio'}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                  <span className="text-lg font-bold text-white tracking-tight">
                    {formatCurrency(item.priceCents)}
                  </span>

                  <button
                    onClick={() => handleAdd(item)}
                    disabled={isAdded}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white hover:border-white/20 border border-white/10'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Agregado</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-purple-400" />
                        <span>Agregar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
