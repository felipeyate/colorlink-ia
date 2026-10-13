import React, { useState } from 'react';
import { Sparkles, Paintbrush, ShieldCheck, ArrowRight, Layers } from '../icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiAssistantModalProps {
  onClose: () => void;
  onSelectRecommendation?: (surface: string, product: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  onClose,
  onSelectRecommendation,
}) => {
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

  const handleSend = (textToSend?: string) => {
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

    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();

      if (q.includes('humedad') || q.includes('salitre') || q.includes('moho')) {
        reply = `🔍 **Diagnóstico Técnico Pintuco para Humedad:**
1. **Preparación:** Raspar el área afectada eliminando pintura suelta. Lavar con solución de agua y cloro al 10% para matar esporas de hongos y dejar secar 24h.
2. **Fondo Sellador:** Aplicar 1 mano pura de **Sellomax® 7 en 1**. Esto neutraliza la alcalinidad y sella la capilaridad.
3. **Acabado:** Aplicar 2 a 3 manos de **Koraza® Máxima Protección** o **Viniltex® BioCuidado** con aditivo antihongos.
⏱️ Rendimiento estimado: ~40 m²/galón a 2 manos.`;
      } else if (q.includes('piso') || q.includes('epóxico') || q.includes('epoxico') || q.includes('concreto')) {
        reply = `🏭 **Sistema Epóxico de Alto Tráfico Pintuco:**
1. **Preparación del Concreto:** El piso debe tener mínimo 28 días de curado y menos de 4% de humedad. Realizar prueba de gota de agua y abrir poro mecánico (desbastado o ataque ácido neutralizado).
2. **Imprimación:** Aplicar Imprimante Epóxico Pintuco para máxima adherencia.
3. **Acabado:** Aplicar **Pintucoat® Epóxico Poliamida 500** (Relación de mezcla 1:1 en volumen).
⏱️ Secado al tacto: 4 horas. Tráfico liviano: 24 horas. Resistencia química total: 7 días.`;
      } else if (q.includes('fachada') || q.includes('exterior') || q.includes('koraza') || q.includes('300')) {
        reply = `🏢 **Cálculo Técnico para Fachadas Exteriores con Koraza®:**
• **Área:** ~300 m² a 2 manos requieren un área efectiva de 600 m².
• **Rendimiento Koraza:** ~40 m²/galón a 1 mano (~20 m²/gal a 2 manos en rendimiento práctico con absorción).
• **Cubicaje:** Se requieren **15 Galones** = **3 Cuñetes de 5 Galones**.
• **Fondo sugerido:** 1 Cuñete de Sellomax® 7 en 1 si el revoque es nuevo o polvoso.
🛡️ Garantía Pintuco: Hasta 7 años de resistencia a intemperie y rayos UV.`;
      } else if (q.includes('dilución') || q.includes('dilucion') || q.includes('viniltex') || q.includes('agua')) {
        reply = `🎨 **Instrucción de Dilución Oficial Pintuco:**
• **Viniltex® BioCuidado:** Diluir hasta un 25% con agua limpia para primera mano, y hasta un 15% para segunda mano.
• **Koraza® Exterior:** Diluir hasta un 20% con agua para aplicación con brocha/rodillo.
• **Pintulux® Esmalte:** Diluir con 10% de Ajustador Pintuco Ref. 21219 (No usar thinner corriente de mala calidad).
⚠️ *Consejo:* Mezclar siempre en círculos con una espátula plana limpia hasta obtener consistencia homogénea.`;
      } else {
        reply = `💡 **Recomendación Técnica Pintuco:**
Para tu requerimiento de "${query}", el protocolo estándar Pintuco contempla:
1. **Inspección de Sustrato:** Medir humedad (debe ser menor al 5%) y limpiar polvo o grasas.
2. **Sistema Integral:** Aplicar fondo sellador adecuado seguido de 2 manos de pintura certificada de la línea correspondiente (Hogar, Maderas, Metales o Industrial).
3. **Garantía:** Al registrar el lote en ColorLink, tu proyecto obtiene certificación de calidad y ficha técnica respaldada por Pintuco.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 600);
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
              <h3 className="font-bold text-sm font-['Space_Grotesk'] flex items-center gap-2">
                Asesor Inteligente ColorLink IA
                <span className="text-[10px] font-mono bg-sky-400 text-slate-950 px-1.5 py-0.2 rounded font-bold">
                  Online
                </span>
              </h3>
              <p className="text-[11px] text-blue-200/80">
                Asesoría técnica en recubrimientos, rendimientos y preparación de sustratos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ×
          </button>
        </div>

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
              <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">{m.timestamp}</span>
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
                className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 transition-colors text-left"
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
            className="btn-primary !py-2.5 !px-4 text-xs disabled:opacity-50"
          >
            Consultar
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
