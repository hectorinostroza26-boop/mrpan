import React, { useState, useMemo } from 'react';
import { Search, Clock, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CatalogView({ recipes, onSelectRecipe }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categoriesOrder = ['Todos', 'Tradicionales', 'Masa Madre', 'Bollería', 'Especialidades', 'Internacionales', 'Pizzas', 'Saludables', 'Dulces', 'Sin Gluten'];
  
  const categories = useMemo(() => {
    const rawCats = ['Todos', ...new Set(recipes.map(r => r.category))];
    return rawCats.sort((a, b) => {
      let indexA = categoriesOrder.indexOf(a);
      let indexB = categoriesOrder.indexOf(b);
      if (indexA === -1) indexA = 99;
      if (indexB === -1) indexB = 99;
      return indexA - indexB;
    });
  }, [recipes]);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Todos' || recipe.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchTerm, activeCategory]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Search Bar - App Style */}
      <div className="relative group px-1">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-bakery-500 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Buscar receta..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-md border border-bakery-100 focus:outline-none transition-all placeholder:text-bakery-300 font-bold text-sm text-bakery-900"
        />
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="space-y-3">
        <div className="flex gap-3 overflow-x-auto pb-3 custom-scrollbar px-1">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-bakery-900 text-white shadow-lg' 
                  : 'bg-white text-bakery-800 border border-bakery-100 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Banner Cards - Smooth Animated Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px] px-1 relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <motion.div
                layout="position"
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                    opacity: { duration: 0.3 }
                }}
                onClick={() => onSelectRecipe(recipe)}
                className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden shadow-xl active:scale-[0.98] transition-shadow relative border border-white/20 h-fit"
              >
                {/* Image Container - Strictly Banner Style */}
                <div className="relative aspect-[21/9] overflow-hidden w-full">
                  <img 
                    src={recipe.image} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg text-[6px] font-black text-white uppercase tracking-widest z-10">
                    {recipe.category}
                  </div>

                  {/* Minimalist Glass Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/5 backdrop-blur-sm border-t border-white/5 p-3 pt-5">
                    <div className="flex items-center justify-between gap-4 px-1">
                      <h3 className="font-display text-3xl text-white leading-none tracking-tight uppercase drop-shadow-lg">
                        {recipe.name}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/95 drop-shadow-md">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-white/80"/> {recipe.time}</span>
                        <span className="flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5 text-white/80"/> {recipe.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-1 py-32 text-center"
            >
               <p className="text-bakery-400 font-black uppercase tracking-widest text-[10px]">Sin resultados</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default CatalogView;
