
import React, { useState, useEffect } from 'react';
import { LiquorCalculator } from './components/LiquorCalculator';
import { AIImageEditor } from './components/AIImageEditor';
import { FileDown, Sparkles, Calculator as CalcIcon } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'ai-editor'>('calculator');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-2 rounded-lg text-white">
              <CalcIcon size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
              LiquorHub
            </h1>
          </div>

          <nav className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'calculator' 
                  ? 'bg-white text-amber-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalcIcon size={18} />
              <span>Calculadora</span>
            </button>
            <button
              onClick={() => setActiveTab('ai-editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ai-editor' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles size={18} />
              <span>Editor AI</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-xl mx-auto">
          {activeTab === 'calculator' ? (
            <LiquorCalculator />
          ) : (
            <AIImageEditor />
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
        <p>Desarrollado para entornos operativos de bar y restaurante.</p>
        <p className="mt-1">Constante usada: 31.25 g ≈ 1 oz</p>
      </footer>
    </div>
  );
};

export default App;
