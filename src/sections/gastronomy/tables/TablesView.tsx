import React, { useState } from 'react';
import { Users, Calendar, Clock, User, Phone, Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import type { Tenant } from '../../../types';
import { apiClient } from '../../../api/client';

interface TablesViewProps {
  tenant: Tenant;
}

const SHIFTS = [
  { label: 'Almuerzo (12:30)', time: '12:30' },
  { label: 'Almuerzo (13:30)', time: '13:30' },
  { label: 'Cena Temprana (20:30)', time: '20:30' },
  { label: 'Cena Central (21:30)', time: '21:30' },
  { label: 'Cena Tardía (22:30)', time: '22:30' },
];

export const TablesView: React.FC<TablesViewProps> = ({ tenant }) => {
  const [partySize, setPartySize] = useState<number>(2);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>('21:30');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationSuccess, setReservationSuccess] = useState<any | null>(null);

  const primaryColor = tenant.settings?.branding?.primaryColor || '#7c3aed';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Por favor ingresá tu nombre completo.');
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
        partySize,
        date,
        time,
        notes: notes.trim() || undefined,
      };

      const res = await apiClient.post(`/public/${tenant.slug}/tables/bookings`, payload);
      setReservationSuccess(res.data);
    } catch (err: any) {
      console.error('Error booking table:', err);
      setError(err.response?.data?.message || 'No fue posible confirmar la reserva de mesa en este horario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (reservationSuccess) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#0e1019] border border-white/10 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">¡Mesa Reservada!</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Los esperamos en <strong className="text-white">{tenant.name}</strong>. Guardaremos su mesa con una tolerancia de 15 minutos.
        </p>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-3 mb-6 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-zinc-400">Comensales</span>
            <span className="font-semibold text-white">{partySize} personas</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-zinc-400">Fecha y Turno</span>
            <span className="font-semibold text-purple-300">{date} a las {time} hs</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Titular</span>
            <span className="font-semibold text-white">{customerName}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setReservationSuccess(null);
            setCustomerName('');
            setCustomerPhone('');
            setNotes('');
          }}
          className="w-full py-3.5 rounded-xl text-white font-semibold transition shadow-lg"
          style={{ background: primaryColor }}
        >
          Hacer Otra Reserva
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      {/* 1. Comensales */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <span>1. Cantidad de Personas</span>
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 8].map((size) => (
            <button
              type="button"
              key={size}
              onClick={() => setPartySize(size)}
              className={`py-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                partySize === size
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                  : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:border-white/20'
              }`}
            >
              <Users className="w-4 h-4 opacity-70" />
              <span className="text-xs font-bold">{size}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Día y Turno */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <span>2. Fecha y Turno de Salón</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Fecha</span>
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Turno</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SHIFTS.map((shift) => (
                <button
                  type="button"
                  key={shift.time}
                  onClick={() => setTime(shift.time)}
                  className={`p-2 rounded-xl text-xs font-medium border text-left transition ${
                    time === shift.time
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {shift.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Datos */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <span>3. Datos de la Reserva</span>
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
                placeholder="Ej. Martín Soler"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">WhatsApp / Celular *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ej. +54 9 11 4444-9876"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Email</label>
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
          <label className="block text-xs text-zinc-400 mb-1">Notas especiales (mesa exterior, silla alta para niños, alergias)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aclaraciones sobre ubicación de mesa o preferencias..."
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
            'Reservando mesa...'
          ) : (
            <>
              <span>Confirmar Reserva de Mesa</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
