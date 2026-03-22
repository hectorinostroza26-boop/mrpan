import React, { useState, useEffect } from 'react';
import { ArrowLeft, Scale, PlayCircle, ListChecks, Utensils, Clock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function RecipeDetailView({ recipe, onBack }) {
  const [view, setView] = useState('overview'); // overview, calculator, video
  const [unitWeight, setUnitWeight] = useState(60);
  const [quantity, setQuantity] = useState(1);
  const [calculatedIngredients, setCalculatedIngredients] = useState([]);

  // Calculate ingredients on weight/quantity change
  useEffect(() => {
    if (view === 'calculator') {
      const totalDoughWeight = unitWeight * quantity;
      const totalPercentage = Object.values(recipe.percentages).reduce((a, b) => a + b, 0);
      const flourWeight = (totalDoughWeight / totalPercentage) * 100;

      const ingredients = Object.entries(recipe.percentages).map(([name, pct]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        grams: Math.round((flourWeight * pct) / 100),
        percentage: pct,
      }));

      setCalculatedIngredients(ingredients);
    }
  }, [unitWeight, quantity, recipe, view]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6 pb-20"
    >
      {/* Navigation */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-bakery-50/80 backdrop-blur-md py-4 -mx-4 px-4">
        <button 
          onClick={view === 'overview' ? onBack : () => setView('overview')}
          className="flex items-center gap-2 text-bakery-800 font-bold text-xs tracking-widest uppercase hover:text-bakery-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 
          {view === 'overview' ? 'Volver' : 'Atrás'}
        </button>
        
        {view !== 'overview' && (
           <span className="font-display text-xl text-bakery-900 tracking-tight">{recipe.name}</span>
        )}
      </div>

      <AnimatePresence mode='wait'>
        {view === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Responsive Grid Layout for Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Left Column: Image & Actions */}
              <div className="space-y-6 sticky top-24">
                {/* Hero Card */}
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] md:aspect-square group">
                  <img 
                    src={recipe.image} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bakery-950/90 via-bakery-950/20 to-transparent flex flex-col justify-end p-8">
                    <motion.h2 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-5xl md:text-6xl font-display text-white mb-2 leading-none uppercase"
                    >
                      {recipe.name}
                    </motion.h2>
                    <div className="flex items-center gap-4 text-bakery-100/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-bakery-400" /> {recipe.time}</span>
                       <span className="flex items-center gap-1"><Utensils className="w-3 h-3 text-bakery-400" /> {recipe.difficulty}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons (Desktop Sidebar style) */}
                <div className="grid grid-cols-1 gap-4 pt-4">
                  <button 
                    onClick={() => setView('calculator')}
                    className="w-full bg-bakery-900 text-white py-6 rounded-[2.5rem] font-bold text-xl flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95"
                  >
                    <Scale className="w-6 h-6" />
                    Calculadora
                  </button>
                  <button 
                    onClick={() => setView('video')}
                    className="w-full bg-white border-4 border-bakery-100 text-bakery-900 py-6 rounded-[2.5rem] font-bold text-xl flex items-center justify-center gap-3 hover:bg-bakery-50 transition-all active:scale-95"
                  >
                    <PlayCircle className="w-6 h-6 text-bakery-600" />
                    Ver Video Clase
                  </button>
                </div>
              </div>

              {/* Right Column: Ingredients & Prep */}
              <div className="space-y-6">
                 <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 shadow-xl">
                    <h3 className="text-2xl font-display text-bakery-900 mb-6 flex items-center gap-3 uppercase">
                      <ListChecks className="w-6 h-6 text-bakery-600" />
                      Ingredientes / Materiales
                    </h3>
                    <ul className="space-y-4">
                      {recipe.ingredients.map((ing, i) => {
                        const isGroup = ing.startsWith('[G]');
                        if (isGroup) {
                          return (
                            <li key={i} className="pt-8 pb-3 border-b-2 border-bakery-200/50 mb-4 first:pt-0 list-none">
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-bakery-400 block mb-1">Sección</span>
                              <span className="text-3xl font-display text-bakery-900 uppercase leading-none">{ing.replace('[G]', '').trim()}</span>
                            </li>
                          );
                        }
                        return (
                          <li key={i} className="flex gap-4 text-bakery-800 leading-relaxed group px-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-bakery-400 mt-2.5 shrink-0 group-hover:scale-150 transition-transform"></span>
                            <span className="text-lg font-medium">{ing}</span>
                          </li>
                        );
                      })}
                    </ul>
                 </div>

                 <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 shadow-xl">
                    <h3 className="text-2xl font-display text-bakery-900 mb-6 flex items-center gap-3 uppercase">
                      <Flame className="w-6 h-6 text-bakery-600" />
                      Preparación
                    </h3>
                    <div className="space-y-8">
                      {recipe.preparation.map((step, index) => {
                        const isGroup = step.startsWith('[G]');
                        if (isGroup) {
                          return (
                            <div key={index} className="pt-8 pb-4 border-b-2 border-bakery-200/30 mb-2 first:pt-0">
                               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-bakery-400 block mb-2">Proceso</span>
                               <h4 className="text-2xl font-display text-bakery-900 uppercase leading-none">{step.replace('[G]', '').trim()}</h4>
                            </div>
                          );
                        }
                        return (
                          <div key={index} className="flex gap-6 group">
                            <span className="font-display text-5xl text-bakery-200/80 group-hover:text-bakery-400 transition-colors tabular-nums shrink-0 leading-none">
                              {(index + 1).toString().padStart(2, '0')}
                            </span>
                            <p className="text-bakery-800 leading-relaxed font-medium pt-1">
                              {step}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                 </div>
              </div>

            </div>
          </motion.div>
        )}

        {view === 'calculator' && (
          <motion.div
            key="calculator"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-xl p-8 border border-white/60 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Scale className="w-24 h-24 text-bakery-900" />
              </div>

              <h3 className="text-3xl font-display text-bakery-900 mb-8 flex items-center gap-3">
                Ajustar Cantidades
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-bakery-400 uppercase tracking-widest pl-2">Peso p/u (gr)</label>
                  <input 
                      type="number" 
                      value={unitWeight}
                      onChange={(e) => setUnitWeight(Number(e.target.value))}
                      className="w-full bg-white/50 border-2 border-bakery-100 rounded-3xl py-6 px-4 text-center font-bold text-4xl text-bakery-900 focus:border-bakery-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-bakery-400 uppercase tracking-widest pl-2">Unidades</label>
                  <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-white/50 border-2 border-bakery-100 rounded-3xl py-6 px-4 text-center font-bold text-4xl text-bakery-900 focus:border-bakery-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden divide-y divide-bakery-100">
              <div className="bg-bakery-900 px-8 py-6 text-white flex justify-between items-center">
                  <h4 className="font-display text-2xl tracking-wide">Receta Personalizada</h4>
                  <div className="bg-white/20 px-4 py-2 rounded-2xl text-sm font-bold backdrop-blur-md">
                    Total: {unitWeight * quantity}g
                  </div>
              </div>
              <div className="divide-y divide-bakery-100">
                {calculatedIngredients.map((ing, i) => (
                  <motion.div 
                    key={ing.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-8 py-6 flex items-center justify-between hover:bg-white/40 transition-colors group"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-bakery-900 text-xl">{ing.name}</span>
                      <span className="text-[10px] uppercase font-bold text-bakery-400 tracking-[0.2em]">{ing.percentage}% panadero</span>
                    </div>
                    <span className="font-mono text-4xl font-black text-bakery-700 bg-bakery-50 px-6 py-3 rounded-3xl group-hover:bg-bakery-900 group-hover:text-white transition-all duration-300">
                        {ing.grams}g
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center justify-center relative group">
               {recipe.video_url ? (
                 <iframe 
                   src={recipe.video_url.replace('watch?v=', 'embed/').split('&')[0]} 
                   className="w-full h-full"
                   title="Video Clase"
                   frameBorder="0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                 />
               ) : (
                 <>
                   <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
                      <img src={recipe.image} className="w-full h-full object-cover blur-sm" />
                   </div>
                   <div className="relative z-10 flex flex-col items-center gap-6 text-white text-center p-8">
                      <div className="w-24 h-24 bg-bakery-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                         <PlayCircle className="w-12 h-12" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-display mb-2">Clase en Video</h3>
                        <p className="text-bakery-200 font-bold uppercase tracking-widest text-xs">Próximamente Disponible</p>
                      </div>
                   </div>
                 </>
               )}
            </div>
            
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40">
               <p className="text-bakery-800 text-center font-medium leading-relaxed">
                 {recipe.video_url 
                   ? "Disfruta de la clase magistral del Chef. Recuerda que puedes pausar y volver atrás las veces que necesites."
                   : "Estamos preparando el material audiovisual para que aprendas de la mano del Chef. Mientras tanto, puedes usar nuestra calculadora panadera para tus pesajes."
                 }
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default RecipeDetailView;
