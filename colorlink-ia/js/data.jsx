/* Datos de referencia compartidos por toda la app */

const STEPS = [
  {
    label: "Necesidad del cliente",
    desc: "Nos cuentas qué necesitas y dónde.",
    icon: HelpCircle,
  },
  {
    label: "Solución técnica",
    desc: "Evaluamos y proponemos la mejor solución.",
    icon: ClipboardCheck,
  },
  {
    label: "Abastecimiento",
    desc: "Confirmamos materiales y disponibilidad.",
    icon: PackageSearch,
  },
  {
    label: "Servicio",
    desc: "Coordinamos entrega o aplicación.",
    icon: Truck,
  },
  {
    label: "Calidad",
    desc: "Verificamos que todo cumpla el estándar.",
    icon: ShieldCheck,
  },
];

const TIPOS_PROYECTO = [
  "Residencial",
  "Comercial",
  "Industrial",
  "Institucional",
  "No estoy seguro / necesito asesoría",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()\s-]{7,15}$/;
