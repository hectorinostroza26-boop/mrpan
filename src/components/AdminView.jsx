import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  BookOpen, 
  Settings, 
  ChevronRight, 
  X, 
  Save, 
  Trash2, 
  Grid, 
  List, 
  MoreVertical,
  Key,
  Loader2,
  Edit2,
  UserCheck,
  Mail,
  LockOpen,
  Copy,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { recipes as mockRecipes } from '../data/recipes';

function AdminView({ recipes, onLogout }) {
  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' or 'users'
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  
  // Access Management State
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    category: 'Tradicionales',
    difficulty: 'Fácil',
    time: '2 hrs',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800',
    percentages: { harina: 100 },
    ingredients: [],
    preparation: []
  };
  const [formData, setFormData] = useState(initialForm);

  // Fetch codes when tab is 'users'
  useEffect(() => {
    async function fetchCodes() {
      const { data, error } = await supabase
        .from('activation_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setGeneratedCodes(data);
    }
    if (activeTab === 'users') fetchCodes();
  }, [activeTab]);

  const generateNewCode = async () => {
    const email = prompt('Introduce el correo del alumno para este código:');
    if (!email || !email.includes('@')) {
      alert('Debes ingresar un correo válido para vincular el código.');
      return;
    }

    try {
      setIsGenerating(true);
      const newCode = `MR-PAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { error } = await supabase
        .from('activation_codes')
        .insert([{
          code: newCode,
          email: email,
          status: 'disponible'
        }]);

      if (error) throw error;
      
      // Refresh list
      const { data } = await supabase.from('activation_codes').select('*').order('created_at', { ascending: false });
      if (data) setGeneratedCodes(data);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportAll = async () => {
    if (!confirm('¿Seguro que quieres importar todas las recetas base?')) return;
    try {
      setIsImporting(true);
      const toImport = mockRecipes.map(r => ({
        name: r.name,
        category: r.category,
        difficulty: r.difficulty,
        time: r.time,
        image: r.image,
        ingredients: r.ingredients,
        preparation: r.preparation,
        percentages: r.percentages || { harina: 100 }
      }));

      const { error } = await supabase.from('recipes').upsert(toImport, { onConflict: 'name' });
      if (error) throw error;
      alert('¡Importación exitosa!');
      window.location.reload();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Borrar "${name}"?`)) return;
    try {
      const { error } = await supabase.from('recipes').delete().match({ id });
      if (error) throw error;
      window.location.reload();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (recipe) => {
    setFormData(recipe);
    setEditingRecipe(recipe.id);
    setIsAddingRecipe(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let error;
      if (editingRecipe) {
        ({ error } = await supabase.from('recipes').update(formData).match({ id: editingRecipe }));
      } else {
        ({ error } = await supabase.from('recipes').insert([formData]));
      }
      if (error) throw error;
      setIsAddingRecipe(false);
      window.location.reload();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Dynamic Handlers
  const addIngredient = () => setFormData({...formData, ingredients: [...formData.ingredients, '']});
  const addIngredientGroup = () => setFormData({...formData, ingredients: [...formData.ingredients, '[G] ']});
  const updateIngredient = (index, value) => {
    const newIngs = [...formData.ingredients];
    newIngs[index] = value;
    setFormData({...formData, ingredients: newIngs});
  };
  const removeIngredient = (index) => setFormData({...formData, ingredients: formData.ingredients.filter((_, i) => i !== index)});

  const addStep = () => setFormData({...formData, preparation: [...formData.preparation, '']});
  const addStepGroup = () => setFormData({...formData, preparation: [...formData.preparation, '[G] ']});
  const updateStep = (index, value) => {
    const newSteps = [...formData.preparation];
    newSteps[index] = value;
    setFormData({...formData, preparation: newSteps});
  };
  const removeStep = (index) => setFormData({...formData, preparation: formData.preparation.filter((_, i) => i !== index)});

  const updatePercentage = (key, value) => setFormData({...formData, percentages: {...formData.percentages, [key]: Number(value)}});
  const removePercentage = (key) => {
     const newPct = {...formData.percentages};
     delete newPct[key];
     setFormData({...formData, percentages: newPct});
  };

  const handleResetAccess = async (id) => {
    if (!confirm('¿Seguro quieres liberar este código? El alumno podrá activarlo de nuevo en otro dispositivo.')) return;
    try {
      const { error } = await supabase
        .from('activation_codes')
        .update({ status: 'disponible', activated_at: null })
        .match({ id });
      
      if (error) throw error;
      
      // Update local state without full reload
      const { data } = await supabase
        .from('activation_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setGeneratedCodes(data);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Clave ' + code + ' copiada al portapapeles');
  };

  const handleShareWhatsApp = (item) => {
    // Generar emojis en ejecución para evadir problemas de codificación ()
    const e_pan = String.fromCodePoint(0x1F956);
    const e_chef = String.fromCodePoint(0x1F468, 0x200D, 0x1F373);
    const e_dedo = String.fromCodePoint(0x1F449);
    const e_link = String.fromCodePoint(0x1F517);
    const e_cel = String.fromCodePoint(0x1F4F1);

    const message = `¡Hola! Bienvenido a la Academia Mr. Pan ${e_pan}${e_chef}.
    
Aquí tienes tu clave de acceso exclusiva para Mr. Pan App:
${e_dedo} *${item.code}*

Puedes ver todo el catálogo en versión Web aquí:
${e_link} https://mrpan-admin.onrender.com/

Si prefieres usar la App en tu celular Android, descarga el archivo instalador (.apk) directamente desde aquí:
${e_cel} https://mrpan-admin.onrender.com/Academia-MRPAN.apk

_*(Nota de seguridad: Al instalarla, tu teléfono puede mostrar un aviso diciendo 'archivo peligroso' o 'desarrollador no reconocido'; ignóralo marcando 'Instalar de todas formas'. Es solo porque aún no la hemos publicado en Google Play, pero la App es 100% segura y privada)*_.

¡Nos vemos en el taller!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl text-bakery-900 tracking-tight flex items-center gap-2 uppercase">
            <Settings className="w-6 h-6 text-bakery-500" />
            Panel Maestro
          </h2>
          <p className="text-[10px] font-bold text-bakery-400 uppercase tracking-widest">Gestión de la Academia</p>
        </div>
        
        <div className="flex gap-2">
           <button onClick={() => setActiveTab('recipes')} className={`p-4 rounded-3xl transition-all shadow-sm ${activeTab === 'recipes' ? 'bg-bakery-900 text-white' : 'bg-white text-bakery-400'}`}><BookOpen className="w-6 h-6" /></button>
           <button onClick={() => setActiveTab('users')} className={`p-4 rounded-3xl transition-all shadow-sm ${activeTab === 'users' ? 'bg-bakery-900 text-white' : 'bg-white text-bakery-400'}`}><Key className="w-6 h-6" /></button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'recipes' ? (
          <motion.div key="recipes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
             <div className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-bakery-100 shadow-sm">
                  <div className="flex flex-col pl-2">
                      <span className="text-3xl font-display text-bakery-900 leading-none">{recipes.length}</span>
                      <span className="text-[8px] font-black text-bakery-400 uppercase tracking-widest mt-1">Recetas</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleImportAll} className="bg-bakery-50 text-bakery-900 px-5 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest border border-bakery-100">
                      {isImporting ? <Loader2 className="w-3 h-3 animate-spin"/> : 'Migrar BASE'}
                    </button>
                    <button onClick={() => { setFormData(initialForm); setEditingRecipe(null); setIsAddingRecipe(true); }} className="bg-bakery-900 text-white px-5 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                      <Plus className="w-3 h-3" /> Nueva
                    </button>
                  </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes.map(recipe => (
                  <div key={recipe.id} className="bg-white p-4 rounded-3xl border border-bakery-100 shadow-sm flex items-center justify-between group hover:border-bakery-900 transition-colors">
                     <div className="flex items-center gap-4">
                        <img src={recipe.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                        <div>
                           <h3 className="font-display text-xl text-bakery-900 leading-none uppercase">{recipe.name}</h3>
                           <span className="text-[8px] font-bold text-bakery-400 uppercase tracking-widest mt-1 inline-block">{recipe.category}</span>
                        </div>
                     </div>
                     <div className="flex gap-1">
                        <button onClick={() => handleEdit(recipe)} className="p-3 text-bakery-300 hover:text-bakery-900"><Edit2 className="w-5 h-5" /></button>
                        <button onClick={() => handleDelete(recipe.id, recipe.name)} className="p-3 text-red-200 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                     </div>
                  </div>
                ))}
             </div>
          </motion.div>
        ) : (
          <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
             <div className="bg-bakery-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="font-display text-4xl leading-none mb-2">CLAVES MAESTRAS</h3>
                   <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em] mb-8">Víncula el acceso al correo del alumno</p>
                   <button onClick={generateNewCode} disabled={isGenerating} className="w-full bg-white text-bakery-900 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2">
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Generar Nueva Clave
                   </button>
                </div>
                <Users className="absolute bottom-[-10%] right-[-5%] w-40 h-40 text-white/5" />
             </div>

             <div className="space-y-3">
                <h4 className="text-[10px] font-black text-bakery-400 uppercase tracking-widest px-4">Historial de Activación</h4>
                {generatedCodes.length === 0 ? (
                  <div className="text-center py-12 text-bakery-300">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No hay códigos generados</p>
                  </div>
                ) : (
                  generatedCodes.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-bakery-100 shadow-sm flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="font-mono font-black text-bakery-900 text-lg tracking-wider">{item.code}</span>
                          <span className="text-[8px] font-bold text-bakery-400 mt-1 flex items-center gap-1">
                             <Mail className="w-2.5 h-2.5" /> {item.email}
                          </span>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleCopyCode(item.code)}
                            className="p-3 rounded-2xl bg-bakery-50 text-bakery-400 hover:text-bakery-900 transition-colors"
                            title="Copiar Clave"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => handleShareWhatsApp(item)}
                            className="p-3 rounded-2xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            title="Enviar por WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {item.status === 'activado' ? (
                            <div className="flex items-center gap-2">
                              <div className="px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
                                Activado
                              </div>
                              <button 
                                onClick={() => handleResetAccess(item.id)}
                                className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-colors"
                                title="Liberar Acceso"
                              >
                                <LockOpen className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                               {item.status}
                            </div>
                          )}
                       </div>
                    </div>
                  ))
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingRecipe && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-6 pb-0">
            <div className="absolute inset-0 bg-bakery-950/60 backdrop-blur-md" onClick={() => setIsAddingRecipe(false)}></div>
            <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} className="w-full max-w-[1000px] bg-white rounded-t-[3rem] md:rounded-[3rem] shadow-2xl relative z-20 flex flex-col max-h-[92vh]">
              <div className="px-6 md:px-10 pt-10 pb-6 flex items-center justify-between border-b border-bakery-50">
                <h3 className="font-display text-3xl md:text-4xl text-bakery-900 uppercase">
                  {editingRecipe ? 'Editar Receta' : 'Nueva Receta'}
                </h3>
                <button onClick={() => setIsAddingRecipe(false)} className="p-3 bg-bakery-50 rounded-full"><X className="w-6 h-6 text-bakery-400" /></button>
              </div>

              <div className="px-10 py-8 overflow-y-auto space-y-8">
                 <div>
                   <label className="text-[10px] font-black text-bakery-400 uppercase tracking-widest block mb-3">Nombre del Producto</label>
                   <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-5 rounded-[1.5rem] bg-bakery-50 border border-bakery-100 font-bold text-lg focus:outline-none focus:border-bakery-900 transition-colors" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-bakery-400 uppercase tracking-widest block mb-3">Categoría</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-5 rounded-[1.5rem] bg-bakery-50 border border-bakery-100 font-bold text-xs uppercase appearance-none">
                        <option>Tradicionales</option><option>Especialidades</option><option>Saludables</option><option>Internacionales</option><option>Masa Madre</option><option>Dulces</option><option>Pizzas</option><option>Sin Gluten</option><option>Bollería</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-bakery-400 uppercase tracking-widest block mb-3">Tiempo (Aprox)</label>
                      <input type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-6 py-5 rounded-[1.5rem] bg-bakery-50 border border-bakery-100 font-bold text-xs" />
                    </div>
                 </div>

                 <div>
                   <label className="text-[10px] font-black text-bakery-400 uppercase tracking-widest block mb-3">Link de la Imagen (URL)</label>
                   <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="w-full px-6 py-5 rounded-[1.5rem] bg-bakery-50 border border-bakery-100 font-bold text-xs" />
                 </div>

                 <div>
                   <label className="text-[10px] font-black text-bakery-400 uppercase tracking-widest block mb-3">Link del Video (YouTube)</label>
                   <input type="text" value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} placeholder="https://youtube.com/..." className="w-full px-6 py-5 rounded-[1.5rem] bg-bakery-50 border border-bakery-100 font-bold text-xs" />
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-bakery-400 uppercase tracking-widest block mb-4 flex justify-between items-center pr-2">
                       <span>Cálculo Panadero (%)</span>
                       <button onClick={() => { const k = prompt('Nombre (ej: Harina):'); if(k) updatePercentage(k.toLowerCase(), 0); }} className="text-bakery-900 border-b-2 border-bakery-900 text-[9px]">+ Añadir</button>
                    </label>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       {Object.entries(formData.percentages).map(([name, pct]) => (
                         <div key={name} className="flex gap-2 items-center bg-bakery-50 p-2 rounded-2xl border border-bakery-100">
                            <input type="text" value={name} disabled className="flex-1 bg-transparent text-bakery-400 font-black text-[9px] uppercase tracking-wider pl-2" />
                            <input type="number" value={pct} onChange={e => updatePercentage(name, e.target.value)} className="w-[60px] px-2 py-3 rounded-xl bg-white border border-bakery-100 font-bold text-center text-sm" />
                            {name !== 'harina' && (
                              <button onClick={() => removePercentage(name)} className="p-2 text-red-200 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-bakery-400 uppercase tracking-widest block mb-4 flex justify-between items-center pr-2">
                       <span>Materiales / Pesaje</span>
                        <div className="flex gap-3">
                           <button onClick={addIngredientGroup} className="text-bakery-500 border-b-2 border-bakery-200 text-[9px] hover:text-bakery-900 transition-colors uppercase font-black">+ Grupo</button>
                           <button onClick={addIngredient} className="text-bakery-900 border-b-2 border-bakery-900 text-[9px] hover:bg-bakery-50 transition-colors uppercase font-black">+ Material</button>
                        </div>
                    </label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {formData.ingredients.map((ing, i) => {
                         const isGroup = ing.startsWith('[G]');
                         return (
                           <div key={i} className="flex gap-2">
                              <input 
                                type="text" 
                                value={ing} 
                                onChange={e => updateIngredient(i, e.target.value)} 
                                placeholder={isGroup ? "[G] NOMBRE SECCION" : "Ej: 1kg Harina Blanca"} 
                                className={`flex-1 px-5 py-4 rounded-2xl border transition-all ${
                                  isGroup 
                                    ? 'bg-bakery-900 text-white font-black text-[10px] uppercase tracking-widest border-bakery-900' 
                                    : 'bg-bakery-50 border-bakery-100 font-medium text-sm text-bakery-900'
                                }`} 
                              />
                              <button onClick={() => removeIngredient(i)} className={`p-2 transition-colors ${isGroup ? 'text-white/40 hover:text-white' : 'text-red-100 hover:text-red-500'}`}><Trash2 className="w-4 h-4" /></button>
                           </div>
                         );
                       })}
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-bakery-400 uppercase tracking-widest block mb-4 flex justify-between items-center pr-2">
                       <span>Preparación (Pasos)</span>
                        <div className="flex gap-3">
                           <button onClick={addStepGroup} className="text-bakery-500 border-b-2 border-bakery-200 text-[9px] hover:text-bakery-900 transition-colors uppercase font-black">+ Grupo</button>
                           <button onClick={addStep} className="text-bakery-900 border-b-2 border-bakery-900 text-[9px] hover:bg-bakery-50 transition-colors uppercase font-black">+ Paso</button>
                        </div>
                    </label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                       {formData.preparation.map((step, i) => {
                         const isGroup = step.startsWith('[G]');
                         return (
                           <div key={i} className={`flex gap-3 items-start relative p-4 rounded-3xl border transition-all ${
                             isGroup ? 'bg-bakery-950 border-bakery-950 col-span-full' : 'bg-bakery-50/50 border-bakery-50'
                           }`}>
                              {!isGroup && <span className="w-7 h-7 rounded-full bg-bakery-900 text-white text-[9px] flex items-center justify-center shrink-0 font-black shadow-lg">{i+1}</span>}
                              <textarea 
                                value={step} 
                                onChange={e => updateStep(i, e.target.value)} 
                                placeholder={isGroup ? "[G] PASOS PARA..." : "Escribe el paso..."}
                                className={`flex-1 bg-transparent border-none focus:ring-0 font-medium text-xs min-h-[40px] resize-none ${
                                  isGroup ? 'text-white font-black uppercase tracking-widest pt-1' : 'text-bakery-900'
                                }`} 
                              />
                              <button onClick={() => removeStep(i)} className={`p-2 transition-colors ${isGroup ? 'text-white/40 hover:text-white' : 'text-red-100 hover:text-red-400'}`}><Trash2 className="w-4 h-4" /></button>
                           </div>
                         );
                       })}
                    </div>
                 </div>

                 <div className="sticky bottom-0 bg-white pt-4 pb-4">
                   <button onClick={handleSave} disabled={isSaving || !formData.name} className="w-full bg-bakery-900 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                      {isSaving ? <Loader2 className="animate-spin" /> : editingRecipe ? 'Guardar Cambios' : 'Publicar Receta'}
                   </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminView;
