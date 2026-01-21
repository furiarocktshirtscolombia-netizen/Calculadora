
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Liquor, CalculationResult } from '../types';
import { OZ_TO_GRAMS, BEER_DENSITY, WINE_DENSITY, ML_PER_GLASS } from '../constants';
import { fetchDefaultExcel, parseExcel } from '../services/excelService';
import { Search, Info, AlertCircle, RefreshCw, Upload, CheckCircle2 } from 'lucide-react';

export const LiquorCalculator: React.FC = () => {
  const [liquors, setLiquors] = useState<Liquor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLiquorId, setSelectedLiquorId] = useState('');
  const [fullWeight, setFullWeight] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const resultCardRef = useRef<HTMLDivElement>(null);

  // Auto-load Excel on mount
  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchDefaultExcel();
        setLiquors(data);
      } catch (err) {
        console.warn('Auto-load failed, waiting for manual upload');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const filteredLiquors = useMemo(() => {
    if (!searchTerm) return liquors;
    const term = searchTerm.toLowerCase();
    return liquors.filter(l => l.name.toLowerCase().includes(term));
  }, [liquors, searchTerm]);

  const selectedLiquor = useMemo(() => 
    liquors.find(l => l.id === selectedLiquorId), 
    [liquors, selectedLiquorId]
  );

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (bstr instanceof ArrayBuffer) {
        try {
          const data = parseExcel(bstr);
          setLiquors(data);
          setError(null);
        } catch (err) {
          setError('Error al procesar el archivo Excel.');
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const isBeerOrBarrel = (name: string) => {
    const n = name.toLowerCase();
    return n.includes('barril') || n.includes('cerveza') || n.includes('heineken');
  };

  const isWineCopa = (name: string) => {
    const n = name.toLowerCase();
    // Check if it's a wine or includes keywords from the user list
    return n.includes('vino') || n.includes('copa') || n.includes('bilbao') || n.includes('moras') || n.includes('rosaleda') || n.includes('tarapaca');
  };

  const extractCapacityMl = (name: string) => {
    const up = name.toUpperCase().replace(',', '.');
    // Match "20L", "20 L", "8 LTS", "1.5 L", "750 ML", "75CL", "X1000"
    let m = up.match(/(\d+(?:\.\d+)?)\s*(ML|CC)\b/);
    if (m) return Math.round(parseFloat(m[1]));
    m = up.match(/(\d+(?:\.\d+)?)\s*(CL)\b/);
    if (m) return Math.round(parseFloat(m[1]) * 10);
    m = up.match(/(\d+(?:\.\d+)?)\s*(LTS|LITROS|LITRO|LT|L)\b/);
    if (m) return Math.round(parseFloat(m[1]) * 1000);
    m = up.match(/X\s*(\d+(?:\.\d+)?)/);
    if (m) return Math.round(parseFloat(m[1]));
    return null;
  };

  const calculate = () => {
    setError(null);

    if (!selectedLiquor) {
      setError('Por favor, selecciona un licor.');
      return;
    }

    if (!selectedLiquor.emptyWeight || selectedLiquor.emptyWeight <= 0) {
      setError('Esta referencia no tiene peso vacío cargado en la base.');
      return;
    }

    const weight = parseFloat(fullWeight);
    if (isNaN(weight) || weight <= 0) {
      setError('Revisa el peso lleno.');
      return;
    }

    if (weight < selectedLiquor.emptyWeight) {
      setError('El peso lleno es menor al peso vacío.');
      return;
    }

    const liquidWeight = weight - selectedLiquor.emptyWeight;
    const name = selectedLiquor.name;
    const capacity = extractCapacityMl(name);

    if (isBeerOrBarrel(name)) {
      const ml = liquidWeight / BEER_DENSITY;
      const percentage = capacity ? Math.min(100, (ml / capacity) * 100) : undefined;
      
      setResult({
        value: Math.round(ml),
        unit: 'ml',
        liquidWeight: parseFloat(liquidWeight.toFixed(2)),
        percentage: percentage ? parseFloat(percentage.toFixed(1)) : undefined,
        totalCapacity: capacity || undefined
      });
    } else if (isWineCopa(name)) {
      const ml = liquidWeight / WINE_DENSITY;
      const copas = ml / ML_PER_GLASS;
      const percentage = capacity ? Math.min(100, (ml / capacity) * 100) : undefined;

      setResult({
        value: parseFloat(copas.toFixed(1)),
        unit: 'copas',
        liquidWeight: parseFloat(liquidWeight.toFixed(2)),
        percentage: percentage ? parseFloat(percentage.toFixed(1)) : undefined,
        totalCapacity: capacity || undefined
      });
    } else {
      const ounces = liquidWeight / OZ_TO_GRAMS;
      setResult({
        value: parseFloat(ounces.toFixed(2)),
        unit: 'oz',
        liquidWeight: parseFloat(liquidWeight.toFixed(2))
      });
    }

    // 🔥 Activar animación de aparición
    setTimeout(() => {
      if (resultCardRef.current) {
        resultCardRef.current.classList.remove('animate-result');
        void resultCardRef.current.offsetWidth; // Hack para reiniciar animación
        resultCardRef.current.classList.add('animate-result');
      }
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-amber-500 mb-4" size={48} />
        <p className="text-gray-400">Cargando base de datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Excel Source Control */}
      {liquors.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <Upload className="mx-auto text-amber-500 mb-3" size={32} />
          <h3 className="font-semibold text-amber-900 mb-2">Base de datos no detectada</h3>
          <p className="text-sm text-amber-700 mb-4">
            No se encontró el archivo LICORES.xlsx automáticamente. Cárgalo manualmente para continuar.
          </p>
          <label className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg cursor-pointer hover:bg-amber-700 transition-colors shadow-sm font-medium">
            <span>Cargar Excel</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleManualUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl premium-shadow border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Search & Select Section */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar (Ron, Vino, Barril...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Licor Seleccionado</label>
              <select
                value={selectedLiquorId}
                onChange={(e) => {
                  setSelectedLiquorId(e.target.value);
                  setError(null);
                  setResult(null);
                }}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none outline-none cursor-pointer"
              >
                <option value="">Seleccione una referencia...</option>
                {filteredLiquors.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Peso Lleno (gramos)</label>
              <input
                type="number"
                placeholder="0.00"
                value={fullWeight}
                onChange={(e) => setFullWeight(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-lg font-semibold"
              />
            </div>
          </div>

          {/* Action Button - VERDE */}
          <button
            onClick={calculate}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
          >
            <CheckCircle2 size={22} />
            Calcular {selectedLiquor ? (isBeerOrBarrel(selectedLiquor.name) ? 'Mililitros' : isWineCopa(selectedLiquor.name) ? 'Copas' : 'Onzas') : 'Resultado'}
          </button>

          {/* Messages */}
          {error && (
            <div className="flex gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl">
              <AlertCircle className="shrink-0" size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Result Section - Cuadro de RESULTADO en verde profesional */}
          {result && (
            <div 
              ref={resultCardRef}
              className="rounded-2xl p-8 text-center animate-result"
              style={{ backgroundColor: '#eafaf1', border: '1px solid #86efac' }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#166534' }}>
                {result.unit === 'oz' ? 'Onzas Netas' : result.unit === 'ml' ? 'Mililitros Netos' : 'Copas'}
              </p>
              <p className="text-5xl font-black mb-3 tracking-tighter" style={{ color: '#15803d' }}>
                {result.value}<span className="text-2xl ml-1 font-medium" style={{ color: '#15803d' }}>{result.unit}</span>
              </p>
              
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="inline-block px-4 py-1.5 rounded-full shadow-sm" style={{ backgroundColor: '#d1fae5' }}>
                  <p className="text-xs font-bold" style={{ color: '#166534' }}>
                    Líquido: <span className="font-black">{result.liquidWeight.toFixed(0)} g</span>
                    {result.percentage !== undefined && (
                      <> · <span className="font-black">{result.percentage}%</span> de {result.totalCapacity}ml</>
                    )}
                    {result.unit === 'copas' && (
                      <> · <span className="font-black">{ML_PER_GLASS}ml/copa</span></>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 flex items-start gap-3">
          <Info className="text-gray-400 shrink-0 mt-0.5" size={16} />
          <p className="text-[11px] leading-relaxed text-gray-500">
            Asegúrese de que la báscula esté correctamente nivelada y en ceros (TARA) antes de colocar la botella.
            <br />
            <strong>Constantes:</strong> 1 oz ≈ {OZ_TO_GRAMS} g. 1 ml ≈ {BEER_DENSITY} g (Cerveza/Barril). 1 copa ≈ {ML_PER_GLASS} ml (Vino).
          </p>
        </div>
      </div>

      {/* Manual Refresh if needed */}
      {liquors.length > 0 && (
        <div className="text-center">
          <label className="text-xs text-gray-400 hover:text-amber-600 cursor-pointer transition-colors flex items-center justify-center gap-1">
            <RefreshCw size={12} />
            Actualizar base de datos Excel
            <input type="file" accept=".xlsx, .xls" onChange={handleManualUpload} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
};
