
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Upload, Image as ImageIcon, Send, RefreshCw, AlertTriangle } from 'lucide-react';

export const AIImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image || !prompt) return;
    setIsProcessing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/png',
              },
            },
            {
              text: `Transform this image based on the following instruction: ${prompt}. Return ONLY the generated image.`,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content.parts || []) {
        if (part.inlineData) {
          setResultImage(`data:image/png;base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("No se pudo generar una nueva imagen. Intenta con un prompt diferente.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al procesar la imagen con AI.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Creative Mixer AI</h2>
            <p className="text-xs text-gray-500">Edita fotos de tus licores o cócteles con IA.</p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="space-y-4">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <Upload className="text-gray-400 group-hover:text-purple-500 mb-2 transition-colors" size={32} />
              <p className="text-sm font-medium text-gray-500 group-hover:text-purple-600">Cargar foto de referencia</p>
              <p className="text-[10px] text-gray-400">JPG, PNG hasta 5MB</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
              <img src={resultImage || image} alt="Preview" className="w-full h-auto max-h-64 object-contain mx-auto" />
              <button 
                onClick={() => { setImage(null); setResultImage(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          )}
          
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">¿Qué quieres cambiar?</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: Añade un filtro retro, cambia el fondo a un bar de lujo..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={!image || isProcessing}
                className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
              />
              <button
                onClick={processImage}
                disabled={!image || !prompt || isProcessing}
                className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:bg-gray-300 transition-all"
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="text-[11px] font-bold text-purple-700 uppercase mb-2">Sugerencias:</h4>
            <div className="flex flex-wrap gap-2">
              {['Añade hielo', 'Fondo vintage', 'Estilo neón', 'Efecto revista'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setPrompt(s)}
                  className="text-[10px] bg-white border border-purple-100 text-purple-600 px-2 py-1 rounded-md hover:bg-purple-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
