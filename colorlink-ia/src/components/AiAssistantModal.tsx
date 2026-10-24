import React, { useState, useEffect } from 'react';
import { Sparkles, Paintbrush, ShieldCheck, ArrowRight, Layers, Key } from '../icons';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isAiGenerated?: boolean;
}

interface AiAssistantModalProps {
  onClose: () => void;
  onSelectRecommendation?: (surface: string, product: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  onClose,
  onSelectRecommendation,
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      localStorage.getItem('colorlink_gemini_api_key') ||
      ''
    );
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy tu Asistente Técnico Inteligente Pintuco ColorLink. ¿Qué tipo de proyecto o superficie necesitas evaluar hoy? Puedo recomendarte productos (Viniltex, Koraza, Pintulux, Epóxicos), preparación de superficie, diluciones y rendimientos.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sampleQuestions = [
    '¿Qué pintura usar en una pared interior con humedad y salitre?',
    '¿Cómo preparar un piso de concreto para aplicar epóxico Pintucoat?',
    '¿Cuántos galones necesito para una fachada de 300 m² con Koraza?',
    '¿Cuál es la dilución correcta de Viniltex BioCuidado?',
  ];

  const handleSaveApiKey = () => {
    const trimmed = tempKey.trim();
    setApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('colorlink_gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('colorlink_gemini_api_key');
    }
    setShowKeyInput(false);
  };

  const getLocalDiagnostic = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('humedad') || q.includes('salitre') || q.includes('moho')) {
      return `🔍 **Diagnóstico Técnico Pintuco para Humedad:**
1. **Preparación:** Raspar el área afectada eliminando pintura suelta. Lavar con solución de agua y cloro al 10% para matar esporas de hongos y dejar secar 24h.
2. **Fondo Sellador:** Aplicar 1 mano pura de **Sellomax® 7 en 1**. Esto neutraliza la alcalinidad y sella la capilaridad.
3. **Acabado:** Aplicar 2 a 3 manos de **Koraza® Máxima Protección** o **Viniltex® BioCuidado** con aditivo antihongos.
⏱️ Rendimiento estimado: ~40 m²/galón a 2 manos.`;
    } else if (q.includes('piso') || q.includes('epóxico') || q.includes('epoxico') || q.includes('concreto')) {
      return `🏭 **Sistema Epóxico de Alto Tráfico Pintuco:**
1. **Preparación del Concreto:** El piso debe tener mínimo 28 días de curado y menos de 4% de humedad. Realizar prueba de gota de agua y abrir poro mecánico (desbastado o ataque ácido neutralizado).
2. **Imprimación:** Aplicar Imprimante Epóxico Pintuco para máxima adherencia.
3. **Acabado:** Aplicar **Pintucoat® Epóxico Poliamida 500** (Relación de mezcla 1:1 en volumen).
⏱️ Secado al tacto: 4 horas. Tráfico liviano: 24 horas. Resistencia química total: 7 días.`;
    } else if (q.includes('fachada') || q.includes('exterior') || q.includes('koraza') || q.includes('300')) {
      return `🏢 **Cálculo Técnico para Fachadas Exteriores con Koraza®:**
• **Área:** ~300 m² a 2 manos requieren un área efectiva de 600 m².
• **Rendimiento Koraza:** ~40 m²/galón a 1 mano (~20 m²/gal a 2 manos en rendimiento práctico con absorción).
• **Cubicaje:** Se requieren **15 Galones** = **3 Cuñetes de 5 Galones**.
• **Fondo sugerido:** 1 Cuñete de Sellomax® 7 en 1 si el revoque es nuevo o polvoso.
🛡️ Garantía Pintuco: Hasta 7 años de resistencia a intemperie y rayos UV.`;
    } else if (q.includes('dilución') || q.includes('dilucion') || q.includes('viniltex') || q.includes('agua')) {
      return `🎨 **Instrucción de Dilución Oficial Pintuco:**
• **Viniltex® BioCuidado:** Diluir hasta un 25% con agua limpia para primera mano, y hasta un 15% para segunda mano.
• **Koraza® Exterior:** Diluir hasta un 20% con agua para aplicación con brocha/rodillo.
• **Pintulux® Esmalte:** Diluir con 10% de Ajustador Pintuco Ref. 21219 (No usar thinner corriente de mala calidad).
⚠️ *Consejo:* Mezclar siempre en círculos con una espátula plana limpia hasta obtener consistencia homogénea.`;
    } else {
      return `💡 **Recomendación Técnica Pintuco:**
Para tu requerimiento de "${query}", el protocolo estándar Pintuco contempla:
1. **Inspección de Sustrato:** Medir humedad (debe ser menor al 5%) y limpiar polvo o grasas.
2. **Sistema Integral:** Aplicar fondo sellador adecuado seguido de 2 manos de pintura certificada de la línea correspondiente (Hogar, Maderas, Metales o Industrial).
3. **Garantía:** Al registrar el lote en ColorLink, tu proyecto obtiene certificación de calidad y ficha técnica respaldada por Pintuco.`;
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    let reply = '';
    let isAi = false;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `Eres el Asesor Técnico Inteligente Oficial de Pintuco S.A. y ColorLink IA Colombia.
Eres un ingeniero químico especialista en pinturas arquitectónicas, recubrimientos industriales, preparación de sustratos y cálculo de materiales.
Tus recomendaciones se basan en el catálogo y normativas técnicas de Pintuco:
- Líneas arquitectónicas: Viniltex® (Avanzada, Baños y Cocinas, BioCuidado), Koraza® (Protección 3, 5 y Sol y Lluvia), Acriltex.
- Líneas preparación: Sellomax® 7 en 1, Imprimante Acrílico, Masilla Acrílica Pintuco.
- Líneas metales y maderas: Pintulux® 3 en 1, Barniz Poliuretano, Esmaltes Alquídicos.
- Líneas alto tráfico e industriales: Pintuepoxi® 500, Pintucoat®, Pintutráfico®.
- Presentaciones: Cuñete (5 galones = 18.9 L), Galón (3.785 L), Cuarto (0.946 L).
- Diluciones oficiales: Agua limpia para vinilos (10-25%), Ajustador Pintuco para esmaltes (10%).

Responde siempre en español de forma profesional, concisa, estructurada con viñetas y emojis técnicos. Brinda rendimientos aproximados (m²/galón) y pasos claros de preparación y aplicación.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nConsulta del usuario:\n${query}`,
        });

        if (response.text) {
          reply = response.text;
          isAi = true;
        }
      } catch (err: any) {
        console.warn('Fallo en llamada a Gemini API, usando motor de diagnóstico local:', err);
        reply = getLocalDiagnostic(query);
      }
    } else {
      // Sin API Key configurada, usar el motor experto local
      reply = getLocalDiagnostic(query);
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated: isAi,
      },
    ]);
    setIsTyping(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-400/20 border border-sky-300/40 flex items-center justify-center text-sky-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm font-['Space_Grotesk']">
                  Asesor Inteligente ColorLink IA
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    apiKey
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-sky-400 text-slate-950'
                  }`}
                >
                  {apiKey ? '✨ Gemini AI Conectado' : '⚡ Asistente Técnico Local'}
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80">
                Asesoría técnica en recubrimientos, rendimientos y preparación de sustratos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 flex items-center gap-1 transition-colors border border-white/10"
              title="Configurar Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API Key</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Panel de configuración de API Key */}
        {showKeyInput && (
          <div className="p-3 bg-blue-50/90 border-b border-blue-200 flex flex-col sm:flex-row items-center gap-2 text-xs">
            <span className="font-semibold text-blue-950 shrink-0">Gemini API Key:</span>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Pega tu clave de https://aistudio.google.com/app/apikey"
              className="flex-1 w-full bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-600 font-mono"
            />
            <button
              type="button"
              onClick={handleSaveApiKey}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
            >
              Guardar
            </button>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 min-h-[280px] max-h-[400px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs whitespace-pre-line'
                }`}
              >
                {m.content}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 px-1 flex items-center gap-1">
                {m.timestamp}
                {m.isAiGenerated && (
                  <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">
                    Gemini 2.5
                  </span>
                )}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200 w-24">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Sugerencias Rápidas */}
        <div className="p-3 bg-white border-t border-slate-100">
          <p className="text-[10.5px] font-mono text-slate-400 uppercase font-semibold mb-1.5">
            Preguntas frecuentes rápidas:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(sq)}
                className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 transition-colors text-left cursor-pointer"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta sobre recubrimientos, dilución, m² o formulación ColorLink..."
            className="flex-1 text-xs p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="btn-primary !py-2.5 !px-4 text-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            Consultar
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
