import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoWhite from '../assets/logo_white.svg';

function ActivationView({ onActivate }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsActivating(true);
    setError(false);

    // Simulate a network check
    setTimeout(() => {
      const success = onActivate(code);
      if (!success) {
        setError(true);
        setIsActivating(false);
        setCode('');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-bakery-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Background Blobs (Premium look) */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-bakery-600/20 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-bakery-900/40 blur-[100px] rounded-full"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-12 relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-block"
          >
            <img src={logoWhite} alt="Mr. Pan" className="w-48 h-auto object-contain" />
          </motion.div>
          <div>
            <div className="flex flex-col items-center -space-y-1">
              <span className="text-5xl font-display text-white tracking-tight uppercase">Academia</span>
              <span className="text-7xl font-display text-white tracking-tighter uppercase leading-none">Mr. Pan</span>
            </div>
            <p className="text-bakery-400 font-black text-[10px] uppercase tracking-[0.4em] mt-4">Plataforma Educativa Exclusiva</p>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-8 text-bakery-300">
            <Lock className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Activa tu Acceso</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="Código del Alumno"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
                disabled={isActivating}
                className={`w-full bg-black/20 border-2 py-5 px-6 rounded-2xl text-center font-bold text-xl tracking-widest uppercase focus:outline-none transition-all placeholder:text-white/20 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal ${
                  error ? 'border-red-500/50 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10 focus:border-bakery-400 text-white'
                }`}
              />
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-1.5 text-red-400 text-[10px] font-bold uppercase tracking-wider"
                  >
                    <AlertCircle className="w-3 h-3" /> Código Inválido
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isActivating || !code}
              className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                isActivating ? 'bg-bakery-800 text-white/50 cursor-not-allowed' : 'bg-bakery-500 hover:bg-bakery-400 text-white shadow-lg active:scale-95'
              }`}
            >
              {isActivating ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Verificar Código
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="text-center">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Acceso Protegido por academia.mrpan.com
            </p>
        </div>
      </motion.div>
    </div>
  );
}

export default ActivationView;
