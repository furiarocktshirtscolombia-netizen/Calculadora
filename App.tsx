import React from 'react';
import { LiquorCalculator } from './components/LiquorCalculator';
import { Calculator as CalcIcon } from 'lucide-react';

const App: React.FC = () => {
  // ✅ Como tu imagen está en /public/avatar-maryluz.png
  // Esta ruta funciona bien en GitHub Pages y Vercel.
  const avatarSrc = `${import.meta.env.BASE_URL}avatar-maryluz.png`;

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      {/* Main Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-2 rounded-lg text-white">
              <CalcIcon size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
              Maryluz Liquor Calculator
            </h1>
          </div>

          <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-xl">
            Calculadora
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Layout: Calculadora + Avatar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-7 items-center">
            {/* Calculadora */}
            <div className="max-w-xl mx-auto lg:mx-0 w-full">
              <LiquorCalculator />
            </div>

            {/* Avatar grande */}
            <div className="flex items-center justify-center lg:justify-end">
              <img
                src={avatarSrc}
                alt="Avatar Maryluz"
                className="w-full max-w-[360px] rounded-[28px] shadow-lg"
                onError={(e) => {
                  // Si falla, deja una pista en consola para debug
                  console.error('No se pudo cargar el avatar en:', avatarSrc);
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-200 bg-white">
        <p>Desarrollado para entornos operativos de bar y restaurante.</p>
        <p className="mt-1 text-gray-500">Constante usada: 31.25 g ≈ 1 oz</p>
      </footer>
    </div>
  );
};

export default App;

