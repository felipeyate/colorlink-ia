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

/* Categorías por ambiente (Inspiración Pintuco / Shop by Room) */
const ROOM_CATEGORIES = [
  {
    id: "living",
    name: "Sala & Comedor",
    iconName: "Sofa",
    desc: "Espacios de alto tráfico que requieren máxima lavabilidad y elegancia.",
    pintucoLine: "Viniltex Avanzado Lavable",
    finish: "Satinado o Mate",
    badge: "Alta Lavabilidad",
    suggestedColor: "#27cbd2",
  },
  {
    id: "bedroom",
    name: "Dormitorio & Estudio",
    iconName: "Bed",
    desc: "Zonas de descanso y concentración. Aire puro sin vapores molestos.",
    pintucoLine: "Viniltex Cero Olor",
    finish: "Mate Aterciopelado",
    badge: "Bajo Olor & VOC",
    suggestedColor: "#86deb8",
  },
  {
    id: "kitchen_bath",
    name: "Baños & Cocinas",
    iconName: "Bath",
    desc: "Protección antibacteriana contra el vapor, la humedad y formación de hongos.",
    pintucoLine: "Viniltex Baños & Cocinas",
    finish: "Semi-Brillante",
    badge: "Antihongos & Humedad",
    suggestedColor: "#fdf0b5",
  },
  {
    id: "facade",
    name: "Fachadas & Exteriores",
    iconName: "HomeIcon",
    desc: "Escudo protector contra lluvia torrencial, rayos UV y polución exterior.",
    pintucoLine: "Koraza 5 / Siliconada",
    finish: "Mate Exterior",
    badge: "Garantía 5+ Años",
    suggestedColor: "#526c86",
  },
  {
    id: "metal_wood",
    name: "Maderas & Metales",
    iconName: "Layers",
    desc: "Puertas, rejas, marcos y muebles con acabado anticorrosivo duradero.",
    pintucoLine: "Pintulux Esmalte Sintético",
    finish: "Brillante / Satinado",
    badge: "Anticorrosivo",
    suggestedColor: "#3d4b58",
  },
];

/* Familias de color amigables */
const COLOR_FAMILIES = [
  { id: "all", label: "Todos los tonos" },
  { id: "coastal", label: "Brisa Marina & Azules" },
  { id: "warm", label: "Luz de Arena & Cálidos" },
  { id: "neutrals", label: "Blancos & Neutros" },
  { id: "nature", label: "Verdes & Botánicos" },
  { id: "accents", label: "Acentos & Carácter" },
];

/* Catálogo de tonos Pintuco intuitivo */
const COLOR_SWATCHES = [
  {
    id: "c1",
    name: "Brisa Marina",
    hex: "#27cbd2",
    family: "coastal",
    code: "PNT-B01",
    desc: "Tono cian equilibrado que evoca frescura costera y luminosidad.",
  },
  {
    id: "c2",
    name: "Azul Pizarra",
    hex: "#526c86",
    family: "coastal",
    code: "PNT-B02",
    desc: "Gris azulado profundo, sereno e ideal para muros de acento.",
  },
  {
    id: "c3",
    name: "Marea Menta",
    hex: "#86deb8",
    family: "coastal",
    code: "PNT-B03",
    desc: "Verde menta suave, revitalizante y óptimo para dormitorios luminosos.",
  },
  {
    id: "c4",
    name: "Luz de Arena",
    hex: "#fdf0b5",
    family: "warm",
    code: "PNT-W01",
    desc: "Crema cálido con matiz solar que amplifica la luz natural.",
  },
  {
    id: "c5",
    name: "Terracota Costera",
    hex: "#e89f81",
    family: "warm",
    code: "PNT-W02",
    desc: "Arcilla tostada sutil para generar calidez y textura visual.",
  },
  {
    id: "c6",
    name: "Blanco Ostra",
    hex: "#f7f9fb",
    family: "neutrals",
    code: "PNT-N01",
    desc: "Blanco puro atenuado con toque fresco, ideal para cielos y muros.",
  },
  {
    id: "c7",
    name: "Gris Niebla",
    hex: "#cbd5e1",
    family: "neutrals",
    code: "PNT-N02",
    desc: "Neutralidad refinada para ambientes minimalistas o contemporáneos.",
  },
  {
    id: "c8",
    name: "Lino Natural",
    hex: "#ebe5d8",
    family: "neutrals",
    code: "PNT-N03",
    desc: "Arena neutro muy suave que combina con maderas claras.",
  },
  {
    id: "c9",
    name: "Salvia Serena",
    hex: "#8ca179",
    family: "nature",
    code: "PNT-G01",
    desc: "Verde herbal con tono grisáceo, perfecto para salas de estar.",
  },
  {
    id: "c10",
    name: "Eucalipto Suave",
    hex: "#5b8a72",
    family: "nature",
    code: "PNT-G02",
    desc: "Tono botánico de bosque húmedo con sensación de calma y limpieza.",
  },
  {
    id: "c11",
    name: "Grafito Marino",
    hex: "#3d4b58",
    family: "accents",
    code: "PNT-A01",
    desc: "Carbón azulado oscuro para puertas, carpintería o muros guía.",
  },
  {
    id: "c12",
    name: "Ámbar Mostaza",
    hex: "#d9a74a",
    family: "accents",
    code: "PNT-A02",
    desc: "Dorado tostado para resaltar nichos, bibliotecas y detalles de autor.",
  },
];

/* Proyectos reales de clientes */
const CUSTOMER_PROJECTS = [
  {
    id: 1,
    title: "Apartamento Modelo en Chapinero",
    room: "Sala & Comedor",
    pintucoProduct: "Viniltex Avanzado Lavable",
    colorName: "Brisa Marina & Lino Natural",
    colorHex: "#27cbd2",
    city: "Bogotá D.C.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    review: "Excelente cubrimiento a dos manos. El tono da una sensación de amplitud y luz increíble en el día.",
    client: "Camila R. · Propietaria",
  },
  {
    id: 2,
    title: "Casa Campestre La Calera",
    room: "Fachada & Terraza",
    pintucoProduct: "Koraza 5 Siliconada",
    colorName: "Grafito Marino & Blanco Ostra",
    colorHex: "#3d4b58",
    city: "Cundinamarca",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    review: "Lleva 8 meses resistiendo lluvias fuertes y el color sigue intacto como el primer día.",
    client: "Arq. Mauricio T.",
  },
  {
    id: 3,
    title: "Dormitorio Principal & Home Office",
    room: "Dormitorio & Estudio",
    pintucoProduct: "Viniltex Cero Olor",
    colorName: "Marea Menta & Luz de Arena",
    colorHex: "#86deb8",
    city: "Medellín",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    review: "Pudimos dormir en la habitación esa misma noche porque realmente no deja olor a solvente.",
    client: "Sebastián M.",
  },
  {
    id: 4,
    title: "Remodelación Cocina Abierta",
    room: "Baños & Cocinas",
    pintucoProduct: "Viniltex Baños & Cocinas",
    colorName: "Luz de Arena",
    colorHex: "#fdf0b5",
    city: "Envigado",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    review: "Fácil de limpiar cuando salpica aceite o vapor de cocción. 100% recomendado.",
    client: "Valeria G.",
  },
];

/* Diapositivas para el Infinite Marquee */
const MARQUEE_SLIDES = [
  {
    id: 1,
    title: "Viniltex Cero Olor",
    tag: "Tecnología Saludable",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    title: "Más de 1.400 Colores",
    tag: "Colorimetría Pintuco",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    title: "Fachadas Koraza 5",
    tag: "Resistencia Extrema",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    title: "Esmaltes Pintulux",
    tag: "Acabado Automotriz y Metal",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    title: "Acabados Satinados",
    tag: "Tendencia de Interiores",
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    title: "Antihongos & Humedad",
    tag: "Solución Técnica",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
  },
];

