import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Sparkles } from 'lucide-react';
import { TenantHomePage } from './sections/core/TenantHomePage';

function IndexLanding() {
  const [slugInput, setSlugInput] = useState('');
  const navigate = useNavigate();

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugInput.trim()) {
      navigate(`/${encodeURIComponent(slugInput.trim().toLowerCase())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#090a0f] text-zinc-100 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-purple-300 border border-white/10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Áurea Client PWA</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Experiencia Digital para Clientes
        </h1>
        <p className="text-sm text-zinc-400">
          Ingresá el identificador del comercio o escaneá el código QR del local para ver su menú, agendar turnos o pedir online.
        </p>

        <form onSubmit={handleGo} className="space-y-3">
          <div className="relative">
            <Store className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              placeholder="Ej. grand-bistro o de-santas"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-xl"
          >
            <span>Ingresar al Comercio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <span>Comercios de prueba:</span>
          <button
            onClick={() => navigate('/grand-bistro')}
            className="underline hover:text-purple-400 transition"
          >
            grand-bistro
          </button>
          <span>·</span>
          <button
            onClick={() => navigate('/de-santas')}
            className="underline hover:text-purple-400 transition"
          >
            de-santas
          </button>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexLanding />} />
      <Route path="/:slug/services/bookings" element={<TenantHomePage initialTab="bookings" />} />
      <Route path="/:slug/commerce/catalog" element={<TenantHomePage initialTab="catalog" />} />
      <Route path="/:slug/commerce/orders" element={<TenantHomePage initialTab="catalog" />} />
      <Route path="/:slug/gastronomy/tables" element={<TenantHomePage initialTab="tables" />} />
      <Route path="/:slug" element={<TenantHomePage />} />
      <Route path="/:slug/*" element={<TenantHomePage />} />
      <Route path="*" element={<IndexLanding />} />
    </Routes>
  );
}

export default App;
