import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { formatCurrency } from '../../../utils/formatters';
import { apiClient } from '../../../api/client';
import type { Tenant } from '../../../types';

interface CartDrawerProps {
  tenant: Tenant;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ tenant }) => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, getTotalCents } = useCartStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [channel, setChannel] = useState<'takeaway' | 'delivery'>('takeaway');
  const [addressNotes, setAddressNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  if (!isOpen) return null;

  const totalCents = getTotalCents();
  const primaryColor = tenant.settings?.branding?.primaryColor || '#7c3aed';

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Por favor ingresá tu nombre.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Por favor ingresá un teléfono de contacto.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        channel,
        lines: items.map((ci) => ({
          catalogItemId: ci.item.id,
          quantity: ci.quantity,
          notes: ci.notes,
        })),
        notes: channel === 'delivery' ? `Dirección de entrega: ${addressNotes}` : `Retiro presencial takeaway`,
      };

      const res = await apiClient.post(`/public/${tenant.slug}/orders`, payload);
      setOrderSuccess(res.data);
      clearCart();
    } catch (err: any) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Ocurrió un error al procesar tu pedido. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0e1019] border-l border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Tu Pedido</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-medium">
                {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {orderSuccess ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Pedido Recibido!</h3>
              <p className="text-sm text-zinc-400 mb-6">
                Gracias <strong className="text-white">{customerName}</strong>. Tu pedido ha sido enviado directamente a la cocina/mostrador del local.
              </p>
              {orderSuccess.orderId && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-zinc-300 font-mono mb-6">
                  Código de orden: #{orderSuccess.orderId.slice(-6).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setIsOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-12">
                    <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-3 opacity-30" />
                    <p className="text-base font-medium text-zinc-400">Tu carrito está vacío</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                      Explorá la carta o catálogo y agregá los productos que desees disfrutar.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Item list */}
                    <div className="space-y-3">
                      {items.map((ci) => (
                        <div
                          key={ci.item.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{ci.item.title}</h4>
                            <p className="text-xs text-zinc-400">
                              {formatCurrency(ci.item.priceCents)} c/u
                            </p>
                          </div>

                          {/* Quantity control */}
                          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                            <button
                              onClick={() => updateQuantity(ci.item.id, -1)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-zinc-300 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold text-white w-4 text-center">
                              {ci.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(ci.item.id, 1)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-zinc-300 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(ci.item.id)}
                            className="p-1 rounded text-zinc-500 hover:text-red-400 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Checkout Form */}
                    <div className="pt-4 border-t border-white/10 space-y-3.5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Modalidad y Datos
                      </h3>

                      {/* Channel selector */}
                      <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => setChannel('takeaway')}
                          className={`py-2 text-xs font-semibold rounded-lg transition ${
                            channel === 'takeaway'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Retiro en Local
                        </button>
                        <button
                          type="button"
                          onClick={() => setChannel('delivery')}
                          className={`py-2 text-xs font-semibold rounded-lg transition ${
                            channel === 'delivery'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Envío / Delivery
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-zinc-400 mb-1">Nombre completo *</label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Ej. Lucas García"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 mb-1">WhatsApp / Teléfono *</label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Ej. +54 11 1234-5678"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                            required
                          />
                        </div>

                        {channel === 'delivery' && (
                          <div>
                            <label className="block text-zinc-400 mb-1">Dirección y aclaraciones *</label>
                            <textarea
                              value={addressNotes}
                              onChange={(e) => setAddressNotes(e.target.value)}
                              placeholder="Calle, número, piso/depto, entre calles..."
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                              required
                            />
                          </div>
                        )}
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-5 border-t border-white/10 bg-[#0a0c13] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Total a pagar:</span>
                    <span className="text-xl font-bold text-white">{formatCurrency(totalCents)}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg"
                    style={{ background: primaryColor }}
                  >
                    {isSubmitting ? (
                      'Procesando pedido...'
                    ) : (
                      <>
                        <span>Confirmar Pedido</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
