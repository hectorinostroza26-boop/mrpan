import React, { useState, useEffect } from 'react';
import { recipes } from './data/recipes';
import CatalogView from './components/CatalogView';
import RecipeDetailView from './components/RecipeDetailView';
import ActivationView from './components/ActivationView';
import { LogOut } from 'lucide-react';
import AdminView from './components/AdminView';
import logoBrown from './assets/logo_brown.svg';
import logoWhite from './assets/logo_white.svg';
import logoFinal from './assets/logo_final.svg';

import { supabase } from './lib/supabaseClient';

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [role, setRole] = useState('user'); // 'user' or 'admin'
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [view, setView] = useState('activation');
  const [recipesList, setRecipesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch recipes from Supabase
  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecipesList(data || []);
      } catch (error) {
        console.error('Error fetching recipes:', error.message);
        setRecipesList([]); // Clear on error too
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  // Check if already authorized in local storage
  useEffect(() => {
    const auth = localStorage.getItem('mrpan_auth');
    const storedRole = localStorage.getItem('mrpan_role');
    if (auth === 'activated') {
      setIsAuthorized(true);
      setRole(storedRole || 'user');
      // Only set view if not already in a specific deep view
      if (view === 'activation') {
        setView(storedRole === 'admin' ? 'admin' : 'catalog');
      }
    }
  }, []);

  const handleActivate = async (code = '') => {
    const inputCode = code.toUpperCase().trim();
    
    // Generar un ID único para este aparato si no existe
    let deviceId = localStorage.getItem('mrpan_device_id');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('mrpan_device_id', deviceId);
    }

    // Admin Override
    if (inputCode === 'ADMIN-MRPAN') {
      localStorage.setItem('mrpan_auth', 'activated');
      localStorage.setItem('mrpan_role', 'admin');
      setIsAuthorized(true);
      setRole('admin');
      setView('admin');
      return true;
    }
    
    // Supabase Validation
    try {
      const { data, error } = await supabase
        .from('activation_codes')
        .select('*')
        .eq('code', inputCode)
        .single();

      if (error || !data) {
        alert('El código ingresado no es válido o no existe.');
        return false;
      }

      // Analizar dispositivos autorizados en el campo status
      // El formato de status será: "activado|ID1|ID2"
      const statusParts = data.status ? data.status.split('|') : ['disponible'];
      const currentStatus = statusParts[0];
      const authorizedIds = statusParts.slice(1);

      if (currentStatus === 'activado' || currentStatus === 'activo') {
        // ¿Ya estamos autorizados en este aparato?
        if (authorizedIds.includes(deviceId)) {
           // Si ya está registrado este ID, entramos directo (re-login)
        } else {
           // Es un aparato NUEVO. Pedimos correo para verificar identidad
           const verifyEmail = prompt('Esta clave ya fue activada en otro dispositivo. Para reactivarla en este nuevo equipo, por favor ingresa el correo registrado del alumno:');
           
           if (!verifyEmail || verifyEmail.toLowerCase().trim() !== data.email.toLowerCase().trim()) {
             alert('El correo no coincide con el registro original de este código.');
             return false;
           }

           // ¿Tenemos hueco para un segundo dispositivo?
           if (authorizedIds.length >= 2) {
             alert('Límite de dispositivos alcanzado (Máximo 2 equipos por alumno). Por favor contacta a soporte para liberar un cupo.');
             return false;
           }

           // Registramos el nuevo ID de dispositivo
           const newStatus = `${data.status}|${deviceId}`;
           const { error: updateError } = await supabase
             .from('activation_codes')
             .update({ status: newStatus })
             .match({ id: data.id });
           
           if (updateError) throw updateError;
        }
      } else {
        // Primera activación total (Dispositivo 1)
        const { error: updateError } = await supabase
          .from('activation_codes')
          .update({ 
            status: `activado|${deviceId}`,
            activated_at: new Date().toISOString()
          })
          .match({ id: data.id });

        if (updateError) throw updateError;
      }

      // Proceso de entrada exitoso
      localStorage.setItem('mrpan_auth', 'activated');
      localStorage.setItem('mrpan_role', 'user');
      setIsAuthorized(true);
      setRole('user');
      setView('catalog');
      return true;

    } catch (err) {
      console.error('Activation error:', err);
      alert('Error de conexión o validación. Intenta nuevamente.');
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mrpan_auth');
    localStorage.removeItem('mrpan_role');
    setIsAuthorized(false);
    setRole('user');
    setView('activation');
    setSelectedRecipe(null);
  };

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setView('recipe');
  };

  return (
    <div className="min-h-screen bg-bakery-950 text-bakery-950 flex flex-col items-center relative overflow-x-hidden p-0 sm:p-4">
      <div className={`relative z-10 w-full ${view === 'activation' ? 'max-w-[450px]' : view === 'recipe' ? 'max-w-4xl' : 'max-w-6xl'} bg-bakery-50 min-h-screen flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.4)] transition-all duration-500 overflow-hidden`}>
        
        {/* Fixed Watermark Backdrop */}
        <div className={`fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden w-full ${view === 'activation' ? 'max-w-[450px]' : view === 'recipe' ? 'max-w-4xl' : 'max-w-6xl'} left-1/2 -translate-x-1/2`}>
           <img 
             src={logoWhite} 
             alt="" 
             className="w-[120%] h-auto opacity-[0.15] select-none" 
           />
        </div>

        <div className="relative z-20 flex flex-col flex-1 bg-transparent">
          {isAuthorized && view !== 'activation' && (
            <header className="sticky top-0 left-0 right-0 z-50 bg-bakery-50/90 backdrop-blur-md border-b border-bakery-100">
              <div className="px-6 py-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={logoFinal} alt="MR. PAN" className="h-20 w-auto" />
                  <div className="flex flex-col">
                    <h1 className="font-display text-5xl leading-none text-bakery-900 tracking-tighter uppercase">
                      Mr. Pan
                    </h1>
                    <p className="font-black text-[9px] uppercase tracking-[0.4em] text-bakery-400 mt-[-4px]">
                      ACADEMIA DE PANADERÍA
                    </p>
                  </div>
                </div>
              
              <button 
                onClick={handleLogout}
                className="p-2 text-bakery-400 hover:text-bakery-900 transition-colors"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={`${isAuthorized && view !== 'activation' ? 'p-6 pb-20' : ''}`}>
          {view === 'activation' && <ActivationView onActivate={handleActivate} />}
          {view === 'catalog' && (
            <CatalogView recipes={recipesList} onSelectRecipe={handleSelectRecipe} />
          )}
          {view === 'admin' && (
            <AdminView recipes={recipesList} onLogout={handleLogout} />
          )}
          {view === 'recipe' && (
            <RecipeDetailView 
              recipe={selectedRecipe} 
              onBack={() => setView('catalog')} 
            />
          )}
        </main>
        </div>
      </div>
    </div>
  );
}

export default App;

