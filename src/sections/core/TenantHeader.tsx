import React from 'react';
import { MapPin, Phone, Instagram, Clock, Sparkles, MessageCircle } from 'lucide-react';
import type { Tenant } from '../../types';

interface TenantHeaderProps {
  tenant: Tenant;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({ tenant }) => {
  const settings = tenant.settings || {};
  const branding = settings.branding || {};
  const contact = settings.contact || {};
  const primaryColor = branding.primaryColor || '#7c3aed';
  const address = contact.address || settings.address;
  const phone = contact.phone || settings.phone;
  const whatsapp = contact.whatsapp || settings.whatsapp || phone;
  const instagram = contact.instagram || settings.instagram;
  const tagline = branding.tagline || branding.slogan;

  const verticalLabels: Record<string, string> = {
    gastronomy: 'Gastronomía & Salón',
    beauty: 'Estética & Cuidado Personal',
    retail: 'Comercio & Retail',
    services: 'Servicios Profesionales',
  };

  return (
    <header className="relative w-full border-b border-white/10 bg-[#0c0d14]/80 backdrop-blur-xl">
      {/* Decorative gradient blur */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 opacity-20 blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Logo / Avatar */}
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl border border-white/15 shrink-0"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #3b0764)`,
            }}
          >
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={tenant.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              tenant.name.slice(0, 2).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {tenant.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-purple-300 border border-white/10">
                <Sparkles className="w-3 h-3" />
                {verticalLabels[tenant.vertical] || tenant.vertical}
              </span>
            </div>

            {tagline && (
              <p className="text-sm text-zinc-400 mb-3 italic">"{tagline}"</p>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-300">
              {address && (
                <span className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {address}
                </span>
              )}
              {settings.businessHours && (
                <span className="inline-flex items-center gap-1 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  {settings.businessHours.days || 'Lun - Sáb'}: {settings.businessHours.open || '09:00'} - {settings.businessHours.close || '20:00'}
                </span>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition"
                >
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  {phone}
                </a>
              )}
            </div>
          </div>

          {/* Social / WhatsApp direct action */}
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition shadow-sm"
                title="Contactar por WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {instagram && (
              <a
                href={`https://instagram.com/${instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 transition shadow-sm"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
