import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import type { CatalogItem, Tenant } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { apiClient } from '../../../api/client';

interface BookingsViewProps {
  tenant: Tenant;
  services: CatalogItem[];
}

const DEFAULT_TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export const BookingsView: React.FC<BookingsViewProps> = ({ tenant, services }) => {
  const [selectedService, setSelectedService] = useState<CatalogItem | null>(services[0] || null);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState<string>('16:00');
  const [availableSlots, setAvailableSlots] = useState<string[]>(DEFAULT_TIME_SLOTS);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Sync services if list updates
  useEffect(() => {
    if (!selectedService && services.length > 0) {
      setSelectedService(services[0]);
    }
  }, [services, selectedService]);

  // Query availability when service or date changes
  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedService || !selectedDate) return;
      try {
        const res = await apiClient.get<{ availableSlots?: string[]; slots?: string[] }>(
          `/public/${tenant.slug}/bookings/availability`,
          {
            params: {
              date: selectedDate,
              catalogItemId: selectedService.id,
            },
          }
        );
        const slots = res.data.availableSlots || res.data.slots;
        if (slots && slots.length > 0) {
          setAvailableSlots(slots);
          if (!slots.includes(selectedTime)) {
            setSelectedTime(slots[0]);
          }
        } else {
          setAvailableSlots(DEFAULT_TIME_SLOTS);
        }
      } catch (err) {
        // Fallback to default slots if endpoint not yet answering custom slots
        setAvailableSlots(DEFAULT_TIME_SLOTS);
      }
    }
    fetchAvailability();
  }, [tenant.slug, selectedService, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      setError('Por favor seleccioná un servicio.');
      return;
    }
    if (!customerName.trim()) {
      setError('Por favor ingresá tu nombre.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Por favor ingresá tu WhatsApp / teléfono para confirmar el turno.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        catalogItemId: selectedService.id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim(),
        date: selectedDate,
        startTime: selectedTime,
        durationMin: selectedService.durationMin || 45,
        notes: notes.trim() || undefined,
      };

      const res = await apiClient.post(`/public/${tenant.slug}/bookings`, payload);
      setBookingSuccess(res.data);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'No fue posible agendar el turno en este momento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryColor = tenant.settings?.branding?.primaryColor || '#7c3aed';

  if (bookingSuccess) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#0e1019] border border-white/10 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">¡Turno Confirmado!</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Te esperamos en <strong className="text-white">{tenant.name}</strong>. Hemos reservado tu lugar en la agenda del profesional.
        </p>

        {/* Voucher summary card */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-3 mb-6 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-zinc-400">Servicio</span>
            <span className="font-semibold text-white">{selectedService?.title}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-zinc-400">Fecha y Hora</span>
            <span className="font-semibold text-purple-300">{selectedDate} a las {selectedTime} hs</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-zinc-400">Cliente</span>
            <span className="font-semibold text-white">{customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Importe estimado</span>
            <span className="font-bold text-emerald-400">{selectedService && formatCurrency(selectedService.priceCents)}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setBookingSuccess(null);
            setCustomerName('');
            setCustomerPhone('');
            setCustomerEmail('');
            setNotes('');
          }}
          className="w-full py-3.5 rounded-xl text-white font-semibold transition shadow-lg"
          style={{ background: primaryColor }}
        >
          Reservar Otro Turno
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      {/* 1. Seleccionar Servicio */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <span>1. Elegí tu Servicio</span>
        </h3>

        {services.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay servicios disponibles para reserva.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((svc) => {
              const isSelected = selectedService?.id === svc.id;
              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm">{svc.title}</h4>
                    {svc.durationMin && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                        {svc.durationMin} min
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 mb-2">{svc.description || 'Atención personalizada'}</p>
                  <span className="text-sm font-bold text-white">{formatCurrency(svc.priceCents)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Seleccionar Fecha y Hora */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <span>2. Fecha y Horario</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Día deseado</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Horario disponible</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((time) => (
                <button
                  type="button"
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    selectedTime === time
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Datos del Cliente */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <span>3. Tus Datos de Contacto</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Nombre y Apellido *</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej. Camila Navarro"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">WhatsApp / Teléfono *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ej. +54 9 11 5555-1234"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Email (para comprobante)</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Comentarios o pedidos especiales (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aclaraciones sobre corte, diseño previo o estudio médico..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-xl"
          style={{ background: primaryColor }}
        >
          {isSubmitting ? (
            'Agendando turno...'
          ) : (
            <>
              <span>Confirmar Turno</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
